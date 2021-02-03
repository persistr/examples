// Demonstrates how to write events into an event stream and
// read them back from the stream.

const { persistr } = require('@persistr/js')

async function main() {
  // Open a database connection without connecting to Persistr Server.
  // This will make the client operate in-memory only. As soon as the
  // connection is closed, any data saved will be lost. While this is
  // not recommended for production use, it's appropriate for testing
  // or simple development tasks.
  const { db } = await persistr.connect()

  // Write several events to a new event stream.
  const stream = db.stream()
  await stream.event('open account', { credit: 5000 }).append()
  await stream.event('deposit', { credit: 50000 }).append()
  await stream.event('pay bill', { payee: 'AT&T', debit: 10000 }).append()
  await stream.event('ABM cash withdrawal', { debit: 2000 }).append()
  await stream.event('service charge', { debit: 200 }).append()

  // Read some events from the database and display them on screen.
  db.events({ until: 'caught-up' }).each(event => console.log(event))

  // Close database when we're done.
  await db.close()
}

// Run main() and catch any errors.
async function run(f) { try { await f() } catch (error) { console.log(error.message) }}
run(main)
