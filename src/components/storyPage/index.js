'use strict'

nx.component()
  .use(nx.middlewares.params({
    id: {type: 'number', readOnly: true, required: true}
  }))
  .use(setup)
  .use(nx.middlewares.render({
    template: require('./view.html'),
    style: require('./style.less')
  }))
  .register('story-page')

function setup (elem, state) {
  store.fetchItem(state.id)
    .then(story => state.story = story)
}
