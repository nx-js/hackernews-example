'use strict'

nx.component()
  .use(setup)
  .register('dynamic-html')

function setup (elem, state) {
  elem.$attribute('content', content => elem.innerHTML = content || '')
}
