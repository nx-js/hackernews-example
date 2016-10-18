'use strict'

const urlParser = document.createElement('a')

nx.components.app()
  .use(nx.middlewares.render({
    template: require('./view.html'),
    style: require('./style.less')
  }))
  .useOnContent(nx.middlewares.filter('host', hostFilter))
  .useOnContent(nx.middlewares.filter('timeAgo', timeAgoFilter))
  .register('hacker-news')

function hostFilter (url) {
  urlParser.href = url
  return urlParser.host
}

function timeAgoFilter (timestamp) {
  const diffInSeconds = Math.round(Date.now() / 1000) - timestamp
  if (diffInSeconds < 3600) {
    return nx.filters.unit(Math.round(diffInSeconds / 60), 'minute')
  }
  if (diffInSeconds < 86400) {
    return nx.filters.unit(Math.round(diffInSeconds / 3600), 'hour')
  }
  return nx.filters.unit(Math.round(diffInSeconds / 86400), 'day')
}
