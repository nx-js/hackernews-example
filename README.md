# NX Hacker News clone

[Live demo](https://nx-hacker-news.github.io)

A Hacker News clone built with [NX](http://nx-framework.com).
It features client-side routing, real-time updates and animations.

## Browser support

NX is a next generation framework, supported only by the latest browsers. It works in the
latest Chrome, Firefox Opera and Edge versions, Safari 10 and iOS 10. It doesn't work in any
version of IE yet. The reason is the heavy usage of unpolyfillabe ES6 Proxies, which
makes the NX data binding and reactivity system really simple with no surprise edge cases.

## Project structure

You can find a readMe in every directory of this project, that explains the code inside it.
The project is structured in the following way.
  - The [src](/src) folder includes the API and the NX components of the app.
  - The source is bundled with [Webpack](https://webpack.github.io/). You can find the simple
    bundling  config in [src](/webpack.config.js).
  - [bundle.js](/bundle.js) is the source code and NX bundled together by Webpack
    and minified by UglifyJS.
  - [index.html](/index.html) imports the bundled source script and has a single
    `<hacker-news>` component in its body, that is an NX component defined in the src folder.
    The bundled source is imported as an async script for faster loading.
  - [server.js](/server.js) is not used, as the page is hosted on Github Pages.
    It is used for local testing and serves as a simple server example for other applications.
