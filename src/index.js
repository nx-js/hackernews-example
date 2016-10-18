'use strict'

// this exposes the global nx object, which is the entry point of the NX framework
require('@risingstack/nx-framework')

// this exposes a global store object, that can be used to access Hacker News data
require('./store')

// this registers the NX components to be used in HTML by their name
require('./components')
