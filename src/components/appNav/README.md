# The app-nav component

This component renders the view and style found in view.html and style.less inside itself,
using the `nx.middlewares.render` middleware.
It also defines a parameter named `type` that will be automatically kept in sync with
the URL and the browser history by the `nx.middlewares.params` middleware.

In the view.html file it has internal references (iref) for the client-side routed
states.
