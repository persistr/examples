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
  //
  // If default 'database' is not provided in the connection string then
  // we can't access 'connection.db'
  const SERVER = process.env.PERSISTR_SERVER || 'http://demo:demo@localhost:3010'

  // Open a connection to a Persistr Server. Get the 'connection' object.
  const connection = await persistr.connect(process.env.PERSISTR_SERVER)

  // Because the default database was not provided in the connection string,
  // trying to access 'connection.db' would result in an exception.
  try {
    const db = connection.db
  }
  catch (error) {
    // Error: No default database
  }

  // Access a database by name.
  const db = connection.use('demo')

  // Accessing a database that doesn't exist results in an exception.
  try {
    const db2 = connection.use('otherdb')
  }
  catch (error) {
    // Error: Database not found
  }

  // Read some events from the database and display them on screen.
  db.events({ until: 'caught-up', limit: 5 }).each(event => console.log(event))

  // Close database when we're done.
  await db.close()
}

// Run main() and catch any errors.
async function run(f) { try { await f() } catch (error) { console.log(error.message) }}
run(main)
