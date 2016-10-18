'use strict'

// create a Web Component that inherits routing functionality (middlewares) from nx.components.router
// register the component as 'app-router', from now on it can be used as <app-router></app-router>
nx.components.router()
  .register('app-router')
