'use strict'

// bundle things together into /bundle.js with raw HTML and less loaders
module.exports = {
  entry: './src/index.js',
  output: {
    path: __dirname,
    filename: '/bundle.js'
  },
  module: {
    loaders: [
      {test: /\.html$/, loader: 'raw'},
      {test: /\.css$/, loader: 'raw'}
    ]
  }
}
