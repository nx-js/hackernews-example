'use strict'

nx.component()
  .use(nx.middlewares.params({
    type: {type: 'string', readOnly: true, default: 'top'},
    page: {type: 'number', history: true, default: 0}
  }))
  .use(setup)
  .use(nx.middlewares.render({
    template: require('./view.html'),
    style: require('./style.less')
  }))
  .register('story-list')

function setup (elem, state) {
  store.on('stories-updated', loadStories)
  elem.$cleanup(() => store.removeListener('stories-updated', loadStories))
  elem.$observe(loadStories)

  function loadStories () {
    store.fetchIdsByType(state.type, state.page)
      .then(ids => state.ids = ids)
  }
}
