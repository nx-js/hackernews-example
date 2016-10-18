'use strict'

// create a Web Component
// add a render middleware, that renders the content from view.html and style.less into the component
// add a custom middleware
// register the component as 'story-item', from now on it can be used as <story-item></story-item>
nx.component()
  .use(nx.middlewares.render({
    template: require('./view.html'),
    style: require('./style.less')
  }))
  .use(setup)
  .register('story-item')

// this is a custom middleware, that registers the story and story-id attributes on the component
// these attributes can fetch/inject a story into the component
function setup (elem, state) {
  elem.$attribute('story', story => state.story = story)
  elem.$attribute('story-id', id => {
    store.fetchItem(id)
      .then(story => state.story = story)
  })
}
