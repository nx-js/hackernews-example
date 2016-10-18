'use strict'

nx.component({element: 'li'})
  .use(setup)
  .use(nx.middlewares.render({
    template: require('./view.html'),
    style: require('./style.less')
  }))
  .register('comment-item')

function setup (elem, state) {
  elem.$attribute('comment-id', id => {
    store.fetchItem(id)
      .then(comment => state.comment = comment)
  })
}
