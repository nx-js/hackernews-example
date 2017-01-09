# Hacker News example

[Live demo](https://nx-js.github.io/hackernews-example/)

A Hacker News clone built with [NX](http://nx-framework.com), which
features client-side routing, real-time updates and animations.

## Usage

Clone the repo and run `npm i` and `npm start`. The `npm start` command bundles
the source and starts a local server. The demo is exposed on `localhost:3000`.

## Project structure

The project is structured in the following way.

  - The [src](/src) folder includes the API and the components of the app.
  - The source is bundled with [Webpack](https://webpack.github.io/). You can find the
    webpack config in [src](/webpack.config.js).
  - [bundle.js](/bundle.js) is the app's source and NX - bundled together by webpack.
  - [index.html](/index.html) imports the bundled source script and has a single
    `<hacker-news>` component in its body, which is the root component.
  - [server.js](/server.js) is only used for local testing, as the page is hosted on
    Github Pages. It serves as a simple server example for single page applications.
