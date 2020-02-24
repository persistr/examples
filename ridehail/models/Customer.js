const context = {
  balance: 0,
  rides: 0
}

const workflow = {
  initial: 'new',
  states: {
    'new': {
      on: {
        verified: 'ready'
      }
    },
    ready: {
      on: {
        'ride booked': {
          target: 'on trip',
          actions: 'inc'
        }
      }
    },
    'on trip': {
      on: {
        'ride completed': 'payment due'
      }
    },
    'payment due': {
      invoke: 'charge customer',
      on: {
        'paid': 'ready',
        'declined': {
          target: 'past due',
          actions: 'debit'
        }
      }
    },
    'past due': {
      on: {
        'paid': {
          target: 'ready',
          actions: 'credit'
        }
      }
    }
  }
}

const actions = {
  inc: (context, event) => {
    context.rides = context.rides + 1
  },
  debit: (context, event) => {
    context.balance = context.balance + event.data.amount
  },
  credit: (context, event) => {
    context.balance = context.balance - event.data.amount
  }
}

const invocations = {
  'charge customer': (registry, context, event, emit) => registry.fn('stripe.charge', { amount: event.data.total })
    .then(result => emit({ meta: { type: 'paid' }, data: { amount: event.data.total }}))
    .catch(error => emit({ meta: { type: 'declined' }, data: { amount: event.data.total }}))
}

const mutations = {
  verify: context => ({ meta: { type: 'verified' }}),
  bookRide: context => ({ meta: { type: 'ride booked' }}),
  completeRide: (context, { total }) => ({ meta: { type: 'ride completed' }, data: { total }}),
  payPastDueBalance: context => ({ meta: { type: 'paid' }, data: { amount: context.balance }})
}

module.exports = {
  name: 'Customer',
  context,
  workflow,
  actions,
  mutations,
  invocations
}
