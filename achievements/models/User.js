const context = {
  distance: 0,
  achievements: []
}

const workflow = {
  initial: 'default',
  states: {
    default: {
      on: {
        moved: [{
          target: 'default',
          cond: (context, event) => context.distance < 25000 && context.distance + event.data.distance >= 25000,
          actions: 'award25K'
        },{
          target: 'default',
          cond: (context, event) => context.distance < 50000 && context.distance + event.data.distance >= 50000,
          actions: 'award50K'
        },{
          target: 'default',
          actions: 'moved'
        }]
      }
    }
  }
}

const actions = {
  'moved': (context, event) => {
    context.distance += event.data.distance
  },
  'award25K': (context, event) => {
    context.distance += event.data.distance
    context.achievements.push('25K')
  },
  'award50K': (context, event) => {
    context.distance += event.data.distance
    context.achievements.push('50K')
  }
}

const mutations = {
  move: (context, { distance }) => ({ meta: { type: 'moved' }, data: { distance: distance }}),
  achieve: (context, { achievement }) => ({ meta: { type: 'achieved' }, data: { achievement: achievement }})
}

module.exports = {
  name: 'User',
  context,
  workflow,
  actions,
  mutations
}
