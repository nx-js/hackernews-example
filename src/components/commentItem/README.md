# The comment-item component

This component renders the view and style found in view.html and style.less inside itself,
using the `nx.middlewares.render` middleware.
It also uses a custom middleware, that registers the `comment-id` attribute on the element.
Whenever this attribute is found or changes value, the element fetches the matching comment.
