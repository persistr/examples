// Demonstrates how to use event selectors to filter and
// iterate over events in an event stream.

const { persistr } = require('@persistr/js')

async function main() {
  // Set an environment variable PERSISTR_SERVER to point to your local
  // Persistr Server instance. If env var is not set, initialize server
  // URL to a sensible default.
  //
  // The connection string should follow this format:
  // http(s)://username:password@hostname:port/database
  const SERVER = process.env.PERSISTR_SERVER || 'persistr://demo:demo@localhost:3010/demo?tls=false'

  // Open a database connection to Persistr Server.
  const { db } = await persistr.connect(SERVER)

  // Append several events to a new event stream.
  const stream = db.stream()
  await stream.event('open account', { credit: 5000 }).append()
  await stream.event('deposit', { credit: 50000 }).append()

  // A successful "append()" call returns the event ID.
  const id = await stream.event('pay bill', { payee: 'AT&T', debit: 10000 }).append()

  // Append a few more events to the same stream.
  await stream.event('ABM cash withdrawal', { debit: 2000 }).append()
  await stream.event('service charge', { debit: 200 }).append()

  // Read events from the beginning of the stream up until the selected event.
  // Use 'until' selector.
  await stream.events({ until: id }).each(event => console.log(event))

  // Alternatively, read events up to and including selected event.
  // Use 'to' selector.
  //stream.events({ to: id }).each(event => console.log(event))

  // Read events from the selected event up until the end of the stream.
  // Use 'from' selector.
  await stream.events({ from: id, until: 'caught-up' }).each(event => console.log(event))

  // Alternatively, read events after the selected event to the end of the stream.
  // Use 'after' selector.
  //stream.events({ after: id, until: 'caught-up' }).each(event => console.log(event))

  // Close database when we're done.
  await db.close()
}

// Run main() and catch any errors.
async function run(f) { try { await f() } catch (error) { console.log(error.message) }}
run(main)
