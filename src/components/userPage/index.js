'use strict'

// create a Web Component
// add a params middleware, that keeps the 'id' parameter in sync with the URL and history
// add a render middleware, that renders the content from view.html and style.less into the component
// add a custom middleware
// register the component as 'user-page', from now on it can be used as <user-page></user-page>
nx.component()
  .use(nx.middlewares.params({
    id: {type: 'string', readOnly: true, required: true}
  }))
  .use(nx.middlewares.render({
    template: require('./view.html'),
    style: require('./style.css')
  }))
  .use(setup)
  .register('user-page')

// this is a custom middleware, that fetches a user by its id
function setup (elem, state) {
  store.fetchUser(state.id)
    .then(user => state.user = user)
}
