// Demonstrates how to write events into an event stream and
// read them back from the stream.

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

  // Read some events from the database and display them on screen.
  await db.events({ until: 'caught-up', limit: 5 }).each(event => console.log(event))

  // Close database when we're done.
  await db.close()
}

// Run main() and catch any errors.
async function run(f) { try { await f() } catch (error) { console.log('ERROR:', error.message) }}
run(main)
