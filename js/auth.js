// Demonstrates how to connect to Persistr Server using a
// Persistr connection string.

const { persistr } = require('@persistr/js')

async function main() {
  // Connect using username and password.
  const { db } = await persistr.connect('persistr://demo:demo@localhost:3010/demo?tls=false')

  // Alternativey, connect using an API key. Replace "APIKEYHERE" with
  // the contents of your API key.
  //const { db } = await persistr.connect('persistr://localhost:3010/demo?tls=false&apikey=APIKEYHERE')

  // Close database.
  await db.close()
}

// Run main() and catch any errors.
async function run(f) { try { await f() } catch (error) { console.log(error.message) }}
run(main)
