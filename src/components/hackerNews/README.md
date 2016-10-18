# The hacker-news component

This is the top level component. It is registered from `nx.components.app()` instead
of `nx.component()`. The NX app component adds a lot of core NX
middlewares to its descendants, so you don't have add them every single time.
It renders the view and style found in view.html and style.less inside itself,
using the `nx.middlewares.render` middleware.
It also uses the `nx.middleware.filter` middleware to add filters to itself and its descendants, by
using the `useOnContent` method.

In the view.html, it renders the app-nav and the app-router component.
The router component renders and destroys its children, based on the value of their `route`
attribute. When it matches with the current URL path, the view is rendered.
