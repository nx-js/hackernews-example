# The story-page component

This component renders the view and style found in view.html and style.css inside itself,
using the `nx.middlewares.render` middleware. Styles are scoped to the component by default.
It also uses the `nx.middlewares.params` middleware to synchronize its `id` parameter with
the URL and browser history.
Finally it uses a custom middleware, that fetches the story by its id.
