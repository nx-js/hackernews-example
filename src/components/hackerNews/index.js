'use strict'

const urlParser = document.createElement('a')

// create a Web Component that inherits functionality (middlewares) from nx.components.app
// add a render middleware, that renders the content from view.html and style.less into the component
// add filters to the component and its descendants by using the filter middleware on its content (useOnContent)
// register the component as 'hacker-news', from now on it can be used as <hacker-news></hacker-news>
nx.components.app()
  .use(nx.middlewares.render({
    template: require('./view.html'),
    style: require('./style.less')
  }))
  .useOnContent(nx.middlewares.filter('host', hostFilter))
  .useOnContent(nx.middlewares.filter('timeAgo', timeAgoFilter))
  .register('hacker-news')

// this is a custom filter, that can be used in the view as 'value | host'
function hostFilter (url) {
  urlParser.href = url
  return urlParser.host
}

// this is a custom filter, that can be used in the view as 'value | timeAgo'
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
