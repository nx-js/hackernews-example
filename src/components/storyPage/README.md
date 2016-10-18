# The story-page component

This component renders the view and style found in view.html and style.less inside itself,
using the `nx.middlewares.render` middleware.
It also uses the `nx.middlewares.params` middleware to synchronize its `id` parameter with
the URL and browser history.
Finally it uses a custom middleware, that fetches the story by its id.
