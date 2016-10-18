# NX Hacker News clone

A Hacker News clone built with [NX](http://nx-framework.com).
It features client-side routing, real-time updates and animations.

## Project structure

You can find a readme in every directory of this project, that explains the code inside it.
The project is structured in the following way.
  - The [src](/src) folder includes the API and the NX components of the app.
  - The source is bundled with [Webpack](https://webpack.github.io/). You can find the simple
    bundling  config in [src](/webpack.config.js).
  - The [static](/src) folder includes static assets, like the bundled source code.
  - [index.html](/index.html) imports the bundled source script and has a single
    `<hacker-news>` component in its body, that is an NX component defined in the src folder.
    The bundled source is imported as an async script for faster loading.
  - [server.js](/server.js) has a very light server logic. It tries to serve from the
    static directory first, then serves the index.html file if no static asset is found.
    It also uses the [nx-seo](https://github.com/RisingStack/nx-seo) Express middleware, that
    prerenders the page for web crawlers.

## Browser support

NX is a next generation framework, supported only by the latest browsers. It works in the
latest Chrome, Firefox Opera and Edge versions, Safari 10 and iOS 10. It doesn't work in any
version of IE yet. The reason is the heavy usage of unpolyfillabe ES6 Proxies, which
makes the NX data binding and reactivity system really simple with no surprise edge cases.
