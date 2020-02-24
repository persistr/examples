// Dependencies
const { persistr } = require('@persistr/js')
const path = require('path')
const uuidv4 = require('uuid/v4')

async function main() {
  const account = await persistr.local()
  const repository = account.db('examples').ns('ridehail')

  // Define the domain model.
  await repository.types().define('Todo', path.resolve(__dirname, 'models', 'Todo.js'))
  await repository.types().define('Report', path.resolve(__dirname, 'models', 'Report.js'))

  // Set up a data pipeline to copy all Todo completion events into a single stream.
  // This is a materialized query stream.
  const filteredStreamID = uuidv4()
  repository.pipeline()
    .events({ types: [ 'completed' ]})   // Select event sources
    //.transform({ fn: event => event }) // Add transformations, if any
    .write({ stream: filteredStreamID }) // Output to destinations
    .activate()

  // Create a report object.
  const report = await repository.stream(filteredStreamID).as('Report').instance()

  // Create a couple Todo domain objects.
  const todo1 = await repository.stream().as('Todo').instance()
  todo1.on('mutating', ({ mutation, params }) => console.log('Todo', todo1.id, mutation, params || '', '->'))
  todo1.on('mutated', event => console.log(' ', event.meta.type, event.data, "->\n", '  ', todo1.data()))

  const todo2 = await repository.stream().as('Todo').instance()
  todo2.on('mutating', ({ mutation, params }) => console.log('Todo', todo2.id, mutation, params || '', '->'))
  todo2.on('mutated', event => console.log(' ', event.meta.type, event.data, "->\n", '  ', todo2.data()))

  // Execute some commands on the Todo objects.
  await todo1.rename({ title: 'Give a talk' })
  await todo1.rename({ title: 'Show an example' })
  await todo1.complete()

  await todo2.rename({ title: 'Hold a workshop' })
  await todo2.complete()

  // Display the state of the two Todo objects.
  console.log("\n", 'Todo1 state:', todo1.data())
  console.log("", 'Todo2 state:', todo2.data())

  // Let's examine the event stream for the todo's.
  console.log("\n", 'Todo1 event stream:')
  await repository.stream(todo1.id).events({ until: 'caught-up' }).each(event => console.log(event))
  console.log("\n", 'Todo2 event stream:')
  await repository.stream(todo2.id).events({ until: 'caught-up' }).each(event => console.log(event))

  // We can look at the global event stream as well.
  console.log("\n", 'Unified event stream:')
  await repository.events({ until: 'caught-up' }).each(event => console.log(event))

  // Let's look at what the reporting stream looks like.
  console.log("\n", `Report event stream ${filteredStreamID}:`)
  await repository.stream(filteredStreamID).events({ until: 'caught-up' }).each(event => console.log(event))

  // Display the report.
  console.log(`There are ${report.count} completed to-do's`)

  // Done.
  process.exit(0)
}

// Run main() and catch any errors.
async function run(f) { try { await f() } catch (error) { console.log(error.message, error) }}
run(main)
