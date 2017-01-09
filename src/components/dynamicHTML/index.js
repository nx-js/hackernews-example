'use strict'

nx.component()
  .use(setup)
  .register('dynamic-html')

// this is a custom middleware
// it registers an attribute named 'content' on the component, which sets its innerHTML
function setup (elem, state) {
  elem.$attribute('content', content => elem.innerHTML = content || '')
}
