'use strict'

// create a Web Component
// add a params middleware, that keeps the 'id' parameter in sync with the URL and history
// add a render middleware, that renders the content from view.html and style.less into the component
// add a custom middleware
// register the component as 'story-page', from now on it can be used as <story-page></story-page>
nx.component()
  .use(nx.middlewares.params({
    id: {type: 'number', readOnly: true, required: true}
  }))
  .use(nx.middlewares.render({
    template: require('./view.html'),
    style: require('./style.less')
  }))
  .use(setup)
  .register('story-page')

// this is a custom middleware, that fetches a story by its id
function setup (elem, state) {
  store.fetchItem(state.id)
    .then(story => state.story = story)
}
