# The components

Each component has its own folder, named after the component for readability. Component folders may include an `index.js`, a `view.html` and `style.css` file, that
are linked together by the `nx.middlewares.render` middleware. Styles are scoped to the components by default.

None of the above structuring and naming pattern is mandatory for NX. I simply chose to follow these conventions for this project.

This is what each of the components is responsible for.

  - [hacker-news](/src/components/hackerNews): The top level component.
  Adds some global filters and renders the main view.
  - [app-nav](/src/components/appNav): Renders the navbar view.
  - [app-router](/src/components/appRouter): A very basic router component.
  Not very interesting, for the 'router config' see the `view.html` of the hacker-news component instead.
  - [dynamic-html](/src/components/dynamicHTML): A component that allows
  the interpolation of any HTML into the view.
  - [story-item](/src/components/storyItem): Renders a single story item view.
  - [story-list](/src/components/storyList): Fetches and renders a list of stories.
  - [user-page](/src/components/userPage): Fetches and renders a user.
  - [comment-item](/src/components/commentItem): Renders a single comment.
  - [story-page](/src/components/storyPage): Fetches and renders a single story and
  all of its comments.
