// Demonstrates how to connect to Persistr Server without
// specifying an initial database.

const { persistr } = require('@persistr/js')

async function main() {
  // Set an environment variable PERSISTR_SERVER to point to your local
  // Persistr Server instance. If env var is not set, initialize server
  // URL to a sensible default.
  //
  // The connection string should follow this format:
  // http(s)://username:password@hostname:port/database
  //
  // If default 'database' is not provided in the connection string then
  // we can't access 'connection.db'
  const SERVER = process.env.PERSISTR_SERVER || 'persistr://demo:demo@localhost:3010?tls=false'

  // Open a connection to Persistr Server.
  const connection = await persistr.connect(SERVER)

  // Because the default database was not provided in the connection string,
  // 'connection.db' will be undefined.
  if (!connection.db) console.log('No default database')

  // Access a database by name.
  const db = connection.use('demo')

  // Read some events from the database and display them on screen.
  db.events({ until: 'caught-up', limit: 5 }).each(event => console.log(event))

  // Close database when we're done.
  await db.close()
}

// Run main() and catch any errors.
async function run(f) { try { await f() } catch (error) { console.log(error.message) }}
run(main)
