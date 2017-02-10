'use strict'

nx.components.rendered({
  element: 'nav',
  template: require('./view.html'),
  style: require('./style.css')
}).register('app-nav')
