'use strict'

const seo = require('@risingstack/nx-seo')
const express = require('express')
const app = express()

app.use(express.static(`${__dirname}/static`))
app.use(seo())
app.use(serveSPA)

function serveSPA (req, res, next) {
  if (req.accepts('html')) {
    res.sendFile(`${__dirname}/index.html`)
  }
  else next()
}

app.listen(3000)
