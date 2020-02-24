// Dependencies
const { persistr } = require('@persistr/js')
const path = require('path')

async function main() {
  const account = await persistr.local()
  const repository = account.db('examples').ns('ridehail')

  // Define the domain model.
  await repository.types().define('Customer', path.resolve(__dirname, 'models', 'Customer.js'))
  await repository.types().define('Driver', path.resolve(__dirname, 'models', 'Driver.js'))

  // Define serverless Persistr Functions.
  account.functions().register('stripe.charge', path.resolve(__dirname, 'functions', 'stripe.charge.js'))

  // Create a new driver domain object.
  const driver = await repository.stream().as('Driver').instance()
  driver.on('mutating', ({ mutation, params }) => console.log('Driver', driver.id, mutation, params || '', '->'))
  driver.on('mutated', event => console.log(' ', event.meta.type, event.data, "->\n", '  ', driver.data()))

  // Create a new customer domain object.
  const customer = await repository.stream().as('Customer').instance()
  customer.on('mutating', ({ mutation, params }) => console.log('Customer', customer.id, mutation, params || '', '->'))
  customer.on('mutated', event => console.log(' ', event.meta.type, event.data, "->\n", '  ', customer.data()))

  // Execute some commands on the customer & driver objects.
  await customer.verify()
  await driver.approve()
  await customer.bookRide()
  await driver.offerRide()
  await driver.acceptOffer()
  await driver.completeRide()
  await customer.completeRide({ total: 100 })

  // Wait for a little bit. This is because 'ride completed' triggers invocation of
  // a serverless Persistr Function called stripe.charge'. Refer to models/Customer.js
  // to see how the invocation is made. It's asynchronous and we'll wait for it.
  await new Promise(r => setTimeout(r, 1000))

  // Display the state of both the customer and the driver objects.
  console.log("\n", 'Customer state:', customer.data())
  console.log("", 'Driver state:', driver.data())

  // Let's examine the event streams for each domain object.
  console.log("\n", 'Customer event stream:')
  await repository.stream(customer.id).events({ until: 'caught-up' }).each(event => console.log(event))
  console.log("\n", 'Driver event stream:')
  await repository.stream(driver.id).events({ until: 'caught-up' }).each(event => console.log(event))

  // We can look at the global event stream as well.
  console.log("\n", 'Unified event stream:')
  await repository.events({ until: 'caught-up' }).each(event => console.log(event))

  // Done.
  process.exit(0)
}

// Run main() and catch any errors.
async function run(f) { try { await f() } catch (error) { console.log(error.message) }}
run(main)
