'use strict'

nx.component()
  .use(nx.middlewares.render({
    template: require('./view.html'),
    style: require('./style.less')
  }))
  .use(setup)
  .register('story-item')

function setup (elem, state) {
  elem.$attribute('story', story => state.story = story)
  elem.$attribute('story-id', id => {
    store.fetchItem(id)
      .then(story => state.story = story)
  })
}
