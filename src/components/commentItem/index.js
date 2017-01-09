'use strict'

nx.components.rendered({
  element: 'li',
  template: require('./view.html'),
  style: require('./style.css')
}).use(setup).register('comment-item')

  // this is a custom middleware
  // it registers a comment-id attribute for the component, that fetches a comment by id
  function setup (elem, state) {
    elem.$attribute('comment-id', id => {
      store.fetchItem(id)
        .then(comment => state.comment = comment)
    })
  }
