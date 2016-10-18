'use strict'

module.exports = {
  entry: './src/index.js',
  output: {
    path: __dirname,
    filename: '/static/bundle.js'
  },
  module: {
    loaders: [
      {test: /\.html$/, loader: 'raw'},
      {test: /\.css$/, loader: 'raw'},
      {test: /\.less$/, loader: 'raw!less'}
    ]
  }
}
