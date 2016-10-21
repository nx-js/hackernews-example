'use strict'

const seo = require('@risingstack/nx-seo')
const express = require('express')
const compression = require('compression')
const app = express()

// compress everything
app.use(compression())

// serve the static assets of the page first
app.use(express.static(__dirname))

// this express middleware serves a pre-rendered version of the page to web crawlers
app.use(seo())

// finally serve the index.html file, the routing will take place on the client side
app.use(serveSPA)

function serveSPA (req, res) {
  if (req.accepts('html')) {
    res.sendFile(`${__dirname}/index.html`)
  }
}

app.listen(3000)
