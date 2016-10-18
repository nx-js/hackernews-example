'use strict'

// create a Web Component, extending the native 'nav' element
// add a params middleware, that keeps the 'type' parameter in sync with the URL and history
// add a render middleware, that renders the content from view.html and style.less into the component
// register the component as 'app-nav', from now on it can be used as <app-nav></app-nav>
nx.component({element: 'nav'})
  .use(nx.middlewares.params({
    type: {type: 'string', default: 'top'}
  }))
  .use(nx.middlewares.render({
    template: require('./view.html'),
    style: require('./style.less')
  }))
  .register('app-nav')
