'use strict'

// create a Web Component
// add a custom middleware
// register the component as 'dynamic-html', from now on it can be used as <dynamic-html></dynamic-html>
nx.component()
  .use(setup)
  .register('dynamic-html')

// this is a custom middleware
// it registers an attribute named 'content' on the component, which sets its innerHTML
function setup (elem, state) {
  elem.$attribute('content', content => elem.innerHTML = content || '')
}
