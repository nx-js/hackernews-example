'use strict'

// create a Web Component
// add a render middleware, that renders the content from view.html and style.less into the component
// add a custom middleware
// register the component as 'story-item', from now on it can be used as <story-item></story-item>
nx.component()
  .use(nx.middlewares.render({
    template: require('./view.html'),
    style: require('./style.css')
  }))
  .use(setup)
  .register('story-item')

// this is a custom middleware, that registers the story attribute on the component
// the attribute injects a story into the component state
function setup (elem, state) {
  elem.$attribute('story', story => state.story = story)
}
