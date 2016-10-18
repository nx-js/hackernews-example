'use strict'

// bundle things together into /static/bundle.js with raw HTML and less loaders
module.exports = {
  entry: './src/index.js',
  output: {
    path: __dirname,
    filename: '/bundle.js'
  },
  module: {
    loaders: [
      {test: /\.html$/, loader: 'raw'},
      {test: /\.css$/, loader: 'raw'},
      {test: /\.less$/, loader: 'raw!less'}
    ]
  }
}
