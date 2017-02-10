'use strict'

const urlParser = document.createElement('a')

// this is the root component
nx.components.app({
  template: require('./view.html'),
  style: require('./style.css')
}).register('hacker-news')

// register two custom filters, that can be used inside expressions
nx.utils.compiler.filter('host', hostFilter)
nx.utils.compiler.filter('timeAgo', timeAgoFilter)

// this is a custom filter, that can be used in the view as 'value | host'
function hostFilter (url) {
  urlParser.href = url
  return urlParser.host
}

// this is a custom filter, that can be used in the view as 'value | timeAgo'
function timeAgoFilter (timestamp) {
  const diffInSeconds = Math.round(Date.now() / 1000) - timestamp
  if (diffInSeconds < 3600) {
    return Math.round(diffInSeconds / 60) + 'minutes'
  }
  if (diffInSeconds < 86400) {
    return Math.round(diffInSeconds / 3600) + 'hours'
  }
  return Math.round(diffInSeconds / 86400) + 'days'
}
