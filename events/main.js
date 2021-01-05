// This example demonstrates how to write events into an event stream and later
// read them back from the stream. Events are arbitrary JSON objects.

// Dependencies
const { persistr } = require('@persistr/js')
const uuidv4 = require('uuid/v4')

async function main() {
  const account = await persistr.local()
  const repository = account.db('examples').ns('events')

  // Access demo account, space, and domain. If the space doesn't exist, it will be
  // created. Since we're generating a new UUID as the space name, we'll get a brand
  // new space and domain each time this example is run.
  const space = await account.space(uuidv4()).create()
  const domain = await space.domain('demo').create()

  // Create a new event stream.
  const streamID = uuidv4()
  const stream = await domain.stream(streamID)
  console.log(`Created new stream with ID: ${streamID}`)

  // Write several events to the stream we created. Each event represents a completed
  // bank account transaction.
  await stream.events().write([
    { data: { transaction: 'open account', credit: 5000 }},
    { data: { transaction: 'deposit', credit: 50000 }},
    { data: { transaction: 'pay bill', payee: 'AT&T', debit: 10000 }}
  ])

  // You can also write events one-at-a-time.
  await stream.events().write({ data: { transaction: 'ABM cash withdrawal', debit: 2000 }})
  await stream.events().write({ data: { transaction: 'service charge', debit: 200 }})
  console.log('Wrote 5 events into the stream')

  // Replay events and display them on command line.
  console.log('Replaying events from the stream')
  await stream.events({ until: 'caught-up' }).each(event => console.log(event))
  console.log('Caught up')

  // Clean up by deleting the space and all its content including domains, streams, and events.
  await space.destroy()
  console.log('Done cleaning up')
}

// Run main() and catch any errors.
async function run(f) { try { await f() } catch (error) { console.log(error.message) }}
run(main)
