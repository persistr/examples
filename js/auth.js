// Demonstrates how to write events into an event stream and
// read them back from the stream.

const { persistr } = require('@persistr/js')

async function main() {
  // Connect using username and password.
  const { db } = await persistr.connect('http://demo:demo@localhost:3010/demo')

  // Alternativey, connect using an API key. Replace "APIKEYHERE" with
  // the contents of your API key.
  //const { db } = await persistr.connect('http://APIKEYHERE@localhost:3010/demo')

  // Close database.
  await db.close()
}

// Run main() and catch any errors.
async function run(f) { try { await f() } catch (error) { console.log(error.message) }}
run(main)
