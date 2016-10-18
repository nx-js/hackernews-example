'use strict'

nx.component()
  .use(nx.middlewares.params({
    id: {type: 'string', readOnly: true, required: true}
  }))
  .use(setup)
  .use(nx.middlewares.render({
    template: require('./view.html'),
    style: require('./style.less')
  }))
  .register('user-page')

function setup (elem, state) {
  store.fetchUser(state.id)
    .then(user => state.user = user)
}
