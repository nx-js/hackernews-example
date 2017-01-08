'use strict'

// create a Web Component, extending the native 'li' element
// add a render middleware, that renders the content from view.html and style.less into the component
// add a custom middleware
// register the component as 'comment-item', from now on it can be used as <comment-item></comment-item>
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
