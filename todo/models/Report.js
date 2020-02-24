const context = {
  count: 0
}

const workflow = {
  initial: 'ready',
  states: {
    'ready': {
      on: {
        completed: {
          target: 'ready',
          actions: 'inc'
        }
      }
    }
  }
}

const actions = {
  'inc': (context, event) => {
    context.count++
  }
}

module.exports = {
  name: 'Report',
  context,
  workflow,
  actions
}
