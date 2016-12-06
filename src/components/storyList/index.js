'use strict'

// create a Web Component
// add a params middleware, that keeps the 'type' and 'page' parameters in sync with the URL and history
// add a render middleware, that renders the content from view.html and style.less into the component
// add a custom middleware
// register the component as 'story-list', from now on it can be used as <story-listy></story-list>
nx.component()
  .use(nx.middlewares.params({
    type: {type: 'string', readOnly: true, default: 'top'},
    page: {type: 'number', history: true, default: 0}
  }))
  .use(nx.middlewares.render({
    template: require('./view.html'),
    style: require('./style.css')
  }))
  .use(setup)
  .register('story-list')

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
