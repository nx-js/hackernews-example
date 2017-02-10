'use strict'

nx.components.display({
  template: require('./view.html'),
  style: require('./style.css'),
  props: ['story']
}).register('story-item')
