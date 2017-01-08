'use strict'

module.exports = {
  entry: './src/index.js',
  output: {
    path: __dirname,
    filename: '/bundle.js'
  },
  module: {
    loaders: [
      {test: /\.(html)|(css)$/, loader: 'raw'}
    ]
  }
}
