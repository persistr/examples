// Demonstrates how to use the `types` selector to
// filter events by type.

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
  await stream.event('pay bill', { payee: 'AT&T', debit: 10000 }).append()
  await stream.event('ABM cash withdrawal', { debit: 2000 }).append()
  await stream.event('service charge', { debit: 200 }).append()

  // Read events from the database but only if they match a specific type.
  await db.events({ types: [ 'open account', 'deposit' ], until: 'caught-up', limit: 5 })
    .each(event => console.log('credit', event))

  // Read more events from the database and filter them by event type.
  await db.events({ types: [ 'pay bill', 'ABM cash withdrawal', 'service charge' ], until: 'caught-up', limit: 5 })
    .each(event => console.log('debit', event))

  // Close database when we're done.
  await db.close()
}

// Run main() and catch any errors.
async function run(f) { try { await f() } catch (error) { console.log(error.message) }}
run(main)
