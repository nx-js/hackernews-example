# The comment-item component

This component renders the view and style found in view.html and style.css inside itself,
using the `nx.middlewares.render` middleware. Styles are scoped to the component by default.
It also uses a custom middleware, that registers the `comment-id` attribute on the element.
Whenever this attribute is found or changes value, the element fetches the matching comment.
