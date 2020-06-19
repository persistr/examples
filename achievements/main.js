// Dependencies
const { persistr } = require('@persistr/js')
const path = require('path')
const uuidv4 = require('uuid/v4')

async function main() {
  // Connect to Persistr.
  const account = await persistr.local()
  const repository = account.db('examples').ns('achievements')

  // Define the domain model.
  await repository.types().define('User', path.resolve(__dirname, 'models', 'User.js'))

  // Create a user.
  const user = await repository.stream().as('User').instance()

  // Log some activity for the user.
  await user.move({ distance: 10000 })
  await user.move({ distance: 5000 })
  await user.move({ distance: 15000 })
  await user.move({ distance: 6000 })
  await user.move({ distance: 9000 })
  await user.move({ distance: 12000 })
  await user.move({ distance: 3000 })

  // Display user's total distance.
  console.log("User's total distance:", user.distance)

  // List out all user's achievements.
  console.log("User's achievements:", user.achievements)

  // List out all user's activity.
  console.log("User's activity:")
  await repository.stream(user.id).events({ types: ['moved'], until: 'caught-up' }).each(event => console.log(event))

  // Done.
  process.exit(0)
}

// Run main() and catch any errors.
async function run(f) { try { await f() } catch (error) { console.log(error.message, error) }}
run(main)
