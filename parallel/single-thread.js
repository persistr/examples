// Dependencies
const { persistr } = require('@persistr/js')
const uuidv4 = require('uuid/v4')
const assert = require('assert')

async function main() {
  console.log('SINGLE-THREADED EXAMPLE\n')

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

  // Replay all events and create projections.
  const kMaxParallelStreams = 4
  console.log(`\nReplaying all event streams, ${kMaxParallelStreams} streams at a time`)
  console.time('completed in')

  // Iterate over every stream (aggregate).
  const promises = []
  await repository.streams().each(async stream => {
    // Replay all events for this stream in order.
    const promise = /*await*/ stream.events().each(event => {
      // Process the event.
      handle(event)
    })
    // Do not await the previous call. Awaiting will block
    // stream iteration from moving ahead to the next stream.
    promises.push(promise)

    // Apply a limit to how many streams can be processed in parallel.
    if (promises.length >= kMaxParallelStreams) {
      await Promise.all(promises)
      promises.length = 0
    }
  })

  // Wait for all the projections to complete.
  await Promise.all(promises)
  console.timeEnd('completed in')

  // Verify that all aggregates have the correct balance.
  console.log('\nVerifying aggregates')
  assert(Object.keys(aggregates).length === kStreamCount)
  Object.values(aggregates).forEach(aggregate => {
    assert(aggregate.balance === 42800)
  })
  console.log('done')

  // Replay all events, but sequentially this time.
  aggregates = {}
  console.log('\nReplaying all events sequentially')
  console.time('completed in')
  await repository.streams().each(async stream => {
    await stream.events().each(event => {
      handle(event)
    })
  })
  console.timeEnd('completed in')
  console.log()

  assert(Object.keys(aggregates).length === kStreamCount)
  Object.values(aggregates).forEach(aggregate => {
    assert(aggregate.balance === 42800)
  })
}

// Aggregates will be stored here, once the full replay is complete.
// (think of it as an in-memory database)
let aggregates = {}

// This is a projection. It will process events and apply them to aggregates.
// Aggregates are retrieved from the in-memory storage, updated, then saved back.
// If an aggregate doesn't exist, it is created.
const handle = (event) => {
  // Fetch aggregate from (in-memory) database.
  const aggregateID = event.meta.stream
  let aggregate = aggregates[aggregateID]
  if (!aggregate) {
    // Create and initialize a new aggregate.
    aggregate = {
      balance: 0
    }
  }

  // Update aggregate based on event payload.
  if (event.meta.type === 'open account')         aggregate.balance  = event.data.credit
  if (event.meta.type === 'deposit')              aggregate.balance += event.data.credit
  if (event.meta.type === 'pay bill')             aggregate.balance -= event.data.debit
  if (event.meta.type === 'ABM cash withdrawal')  aggregate.balance -= event.data.debit
  if (event.meta.type === 'service charge')       aggregate.balance -= event.data.debit

  // Save aggregate to (in-memory) database.
  aggregates[aggregateID] = aggregate
}

// Run main() and catch any errors.
async function run(f) { try { await f() } catch (error) { console.log(error.message) }}
run(main)
