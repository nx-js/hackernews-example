# The store

The store is a small abstraction over the [Hacker News API](https://github.com/HackerNews/API).
It uses [Firebase](https://firebase.google.com/) and an [EventEmitter](https://github.com/Gozala/events)
to support real-time updates. The real-time updates are chocked when the window is not visible.
Visibility is detected with the native [page visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API).
A simple Map is used for caching. The store is exposed globally, which in my opinion is
acceptable for a project of this scale.
