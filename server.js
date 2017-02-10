'use strict'

const express = require('express')
const compression = require('compression')
const app = express()

// compress everything
app.use(compression())

// serve the static assets of the page first
app.use(express.static(__dirname))

// finally serve the index.html file, the routing will take place on the client side
app.use((req, res) => res.sendFile(__dirname + '/index.html'))

app.listen(3002)
