'use strict'

nx.components.rendered({
  template: require('./view.html'),
  style: require('./style.css')
}).use(setup).register('story-item')

// this is a custom middleware, that registers the story attribute on the component
// the attribute injects a story into the component state
function setup (elem, state) {
  elem.$attribute('story', story => state.story = story)
}
