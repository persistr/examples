// Dependencies
const { persistr } = require('@persistr/js')
const uuidv4 = require('uuid/v4')
const assert = require('assert')

const cluster = require('cluster')
const http = require('http')
const numCPUs = require('os').cpus().length
const workers = []

let promise

async function main() {
  if (cluster.isMaster) {
    console.log('CLUSTER EXAMPLE\n')

    console.log(`Master ${process.pid} is running`)

    // Connect to Persistr.
    const account = await persistr.local()
    const repository = account.db('example')

    // Generate a bunch of event streams.
    const kStreamCount = 10000
    console.log(`Generating ${kStreamCount} event streams (aggregates)`)
    console.time('completed in')
    for (let i = 0; i < kStreamCount; i++) {
      await repository.stream(uuidv4()).events().write([
        { data: { credit: 5000 }, meta: { type: 'open account' }},
        { data: { credit: 50000 }, meta: { type: 'deposit' }},
        { data: { debit: 10000, payee: 'AT&T' }, meta: { type: 'pay bill' }},
        { data: { debit: 2000 }, meta: { type: 'ABM cash withdrawal' }},
        { data: { debit: 200 }, meta: { type: 'service charge' }}
      ])
    }
    console.timeEnd('completed in')

    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
      workers.push(cluster.fork())
    }

    cluster.on('exit', (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} died`)
    })

    cluster.on('message', (worker, message, handle) => {
      const aggregate = message.aggregate
      //console.log(`worker ${worker.process.pid} rebuilt aggregate`, aggregate)
      aggregates[message.streamID] = aggregate

      // If there are more streams left in the queue, continue processing them.
      if (streams.length > 0) {
        const stream = streams.pop()
        worker.send(stream.id)
      }
      
      // If all streams have been processed, we're done.
      if (Object.keys(aggregates).length === kStreamCount) {
        promise.resolve()
      }
    })

    // Replay all events and create projections.
    console.log('\nReplaying all streams')
    console.time('completed in')

    // Read all stream IDs into memory. Put them in a queue.
    const streams = []
    await repository.streams().each(stream => streams.push(stream))

    // Start the workers going. Each worker will process one stream at a time.
    // When a worker is done processing a stream, it will send the master a message.
    // Master will respond with another stream ID to process.
    workers.forEach(worker => {
      const stream = streams.pop()
      worker.send(stream.id)
    })

    // Wait for all streams to be processed by workers.
    await new Promise((resolve, reject) => {
      promise = { resolve, reject }
    })
    console.timeEnd('completed in')

    // Verify that all aggregates have the correct balance.
    console.log('\nVerifying aggregates')
    assert(Object.keys(aggregates).length === kStreamCount)
    Object.values(aggregates).forEach(aggregate => {
      assert(aggregate.balance === 42800)
    })
    console.log('done\n')

    // Kill workers.
    workers.forEach(worker => worker.kill())
  }
  else {
    console.log(`Worker ${process.pid} started`)

    // Connect to Persistr.
    const account = await persistr.local()
    const repository = account.db('example')

    process.on('message', async (msg) => {
      const streamID = msg
      //console.log(`Worker ${process.pid} replaying stream ${streamID}`)

      // You shouldn't have to do this - only doing it here because
      // persistr.local() is faking a server. It doesn't connect to
      // a real Persistr server. Because the worker is running in a
      // different process from the master, they don't share memory
      // and all the events we generated are not accessible.
      await repository.stream(streamID).events().write([
        { data: { credit: 5000 }, meta: { type: 'open account' }},
        { data: { credit: 50000 }, meta: { type: 'deposit' }},
        { data: { debit: 10000, payee: 'AT&T' }, meta: { type: 'pay bill' }},
        { data: { debit: 2000 }, meta: { type: 'ABM cash withdrawal' }},
        { data: { debit: 200 }, meta: { type: 'service charge' }}
      ])

      // Process events for a single aggregate.
      let aggregate = {}
      await repository.stream(streamID).events().each(event => {
        handle(aggregate, event)
      })

      // Save the aggregate to a database. This is where you would write
      // the aggregate to Mongo, Redis, or SQL database.

      // Here we're going to send it back to the master process instead of
      // saving to a real database.
      process.send({ streamID, aggregate })
    })
  }
}

// Aggregates will be stored here, once the full replay is complete.
// (think of it as an in-memory database)
let aggregates = {}

// This is a projection. It will process events and apply them to aggregates.
// Aggregates are retrieved from the in-memory storage, updated, then saved back.
// If an aggregate doesn't exist, it is created.
const handle = (aggregate, event) => {
  if (event.meta.type === 'open account')         aggregate.balance  = event.data.credit
  if (event.meta.type === 'deposit')              aggregate.balance += event.data.credit
  if (event.meta.type === 'pay bill')             aggregate.balance -= event.data.debit
  if (event.meta.type === 'ABM cash withdrawal')  aggregate.balance -= event.data.debit
  if (event.meta.type === 'service charge')       aggregate.balance -= event.data.debit
}

// Run main() and catch any errors.
async function run(f) { try { await f() } catch (error) { console.log(error.message) }}
run(main)
