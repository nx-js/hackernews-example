# The story-list component

This component renders the view and style found in view.html and style.less inside itself,
using the `nx.middlewares.render` middleware.
It also uses the `nx.middlewares.params` middleware to synchronize its `type` and `page`
parameters with the URL and browser history.
Finally it uses a custom middleware, that fetches the stories whenever the store
emits a `stories-updated` event or the `type` or `page` parameters change.
