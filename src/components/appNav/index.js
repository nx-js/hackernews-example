'use strict'

nx.component({element: 'nav'})
  .use(nx.middlewares.params({
    type: {type: 'string', default: 'top'}
  }))
  .use(nx.middlewares.render({
    template: require('./view.html'),
    style: require('./style.css')
  }))
  .register('app-nav')
