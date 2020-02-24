const context = {
  isOnRide: false
}

const workflow = {
  initial: 'new',
  states: {
    'new': {
      on: {
        approved: 'ready'
      }
    },
    ready: {
      on: {
        'ride offered': 'pending'
      }
    },
    'pending': {
      on: {
        'offer rejected': 'ready',
        'offer accepted': 'on ride'
      }
    },
    'on ride': {
      entry: 'ride started',
      exit: 'ride ended',
      on: {
        'ride completed': 'ready'
      }
    }
  }
}

const actions = {
  'ride started': (context, event) => {
    context.isOnRide = true
  },
  'ride ended': (context, event) => {
    context.isOnRide = false
  }
}

const mutations = {
  approve: context => ({ meta: { type: 'approved' }}),
  offerRide: context => ({ meta: { type: 'ride offered' }}),
  rejectOffer: context => ({ meta: { type: 'offer rejected' }}),
  acceptOffer: context => ({ meta: { type: 'offer accepted' }}),
  completeRide: context => ({ meta: { type: 'ride completed' }})
}

module.exports = {
  name: 'Driver',
  context,
  workflow,
  actions,
  mutations
}
