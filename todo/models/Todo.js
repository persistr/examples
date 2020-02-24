const context = {
  title: ''
}

const workflow = {
  initial: 'new',
  states: {
    'new': {
      on: {
        renamed: {
          target: 'new',
          actions: 'renamed'
        },
        completed: 'completed'
      }
    },
    completed: {
      type: 'final'
    }
  }
}

const actions = {
  'renamed': (context, event) => {
    context.title = event.data.title
  }
}

const mutations = {
  rename: (context, { title }) => ({ meta: { type: 'renamed' }, data: { title: title }}),
  complete: context => ({ meta: { type: 'completed' }})
}

module.exports = {
  name: 'Todo',
  context,
  workflow,
  actions,
  mutations
}
