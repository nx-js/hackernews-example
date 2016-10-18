'use strict'

const seo = require('@risingstack/nx-seo')
const express = require('express')
const app = express()

// try to serve static assets (like bundle.js) from /static first
app.use(express.static(`${__dirname}/static`))

// this middleware serves a prerendered verison if the client is a web crawler
app.use(seo())

// finally serve the index.html file, the app routing will take place on the client side
app.use(serveSPA)

function serveSPA (req, res) {
  if (req.accepts('html')) {
    res.sendFile(`${__dirname}/index.html`)
  }
}

app.listen(3000)
