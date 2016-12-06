# The hacker-news component

This is the top level component. It is registered from `nx.components.app()` instead
of `nx.component()`. The NX app component adds a lot of core NX
middlewares to its descendants, so you don't have add them every single time.
It renders the view and style found in view.html and style.css inside itself,
using the `nx.middlewares.render` middleware. Styles are scoped to the component by default.
It also add filters with the `nx.middlewares.expression.filter` function. These are processed
internally by the `nx.middlewares.expression` middleware (used by the app component).

In the view.html, it renders the app-nav and the app-router component.
The router component renders and destroys its children, based on the value of their `route`
attribute. When it matches with the current URL path, the view is rendered.
