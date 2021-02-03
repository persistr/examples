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
  const SERVER = process.env.PERSISTR_SERVER || 'http://demo:demo@localhost:3010/demo'

  // Open a connection to a Persistr Server. Use destructuring to access
  // the default database.
  const { db } = await persistr.connect(SERVER)

  // Accessing a database that doesn't exist results in an exception.
  try {
    // Both database and connection objects have a ".use()" method that
    // allows access to other databases on the same server.
    const db2 = db.use('otherdb')
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
