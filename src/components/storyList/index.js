'use strict'

nx.components.page({
  template: require('./view.html'),
  style: require('./style.css'),
  params: {
    type: {type: 'string', readOnly: true, default: 'top'},
    page: {type: 'number', history: true, default: 0}
  }
}).use(setup).register('story-list')

// this is a custom middleware
// it loads stories when the store broadcasts an update event or when the 'type' or 'page' parameters change
function setup (elem, state) {
  store.on('stories-updated', loadStories)
  elem.$cleanup(() => store.removeListener('stories-updated', loadStories))
  elem.$observe(loadStories)

  function loadStories () {
    store.fetchItemsByType(state.type, state.page)
      .then(items => state.stories = items)
  }
}
