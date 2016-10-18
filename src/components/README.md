# The NX components

Each component has its own folder. Every component folder has an index.js, which
adds the required logic and registers the component by name. These components are standard
[Web Components](http://webcomponents.org/) and can be used by their name inside any HTML.
Components can be extended with functionality by passing middleware functions to their
`use()` method. Middlewares can be one of the standard NX middlewares, or anything else you define
with the simple `function middleware (elem, state, next) {}` syntax.

I named the folders as the name of component for easier readability.
Component folders may also include a view.html and style.less file.
They are linked together by the `nx.middlewares.render` middleware and can define
external HTML and style.

None of the above structuring and naming pattern is mandatory for NX. I just chose to follow
these conventions for this project.

This is what each of the components is responsible for.

  - [hacker-news](/src/components/hackerNews): The top level component.
  Adds some global filters and renders the main view.
  - [app-nav](/src/components/appNav): Renders the navbar view.
  - [app-router](/src/components/appRouter): A very basic router component.
  Not very interesting, for the 'router config' see the view.html of the hacker-news component instead.
  - [dynamic-html](/src/components/dynamicHTML): A component that allows
  the interpolation of any HTML into the view (not just text).
  - [story-item](/src/components/storyItem): Renders a single story item view.
  - [story-list](/src/components/storyList): Fetches and renders a list of stories.
  - [user-page](/src/components/userPage): Fetches and renders a user.
  - [comment-item](/src/components/commentItem): Renders a single comment.
  - [story-page](/src/components/storyPage): Fetches and renders a single story and
  all of its comments.
