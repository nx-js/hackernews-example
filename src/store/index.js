'use strict'

// use Firebase and EventListener for simple real-time updates
const Firebase = require('firebase')
const EventListener = require('events')

const api = new Firebase('https://hacker-news.firebaseio.com/v0')
const store = new EventListener()
const cache = new Map()
const idsByType = new Map()
const ITEMS_PER_PAGE = 30

// fire an update event when the page becomes visible
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    setTimeout(() => store.emit('stories-updated'), 100)
  }
})

// keep the story ids real-time updated, broadcast an event when they change
for (let type of ['top', 'new', 'ask', 'show', 'job']) {
  api.child(`${type}stories`).on('value', snapshot => {
    idsByType.set(type, snapshot.val())
    // do not fire events if the page is hidden
    if (!document.hidden) {
      store.emit('stories-updated')
    }
  })
}

store.fetchIdsByType = fetchIdsByType
store.fetchItemsByType = fetchItemsByType
store.fetchItems = fetchItems
store.fetchItem = fetchItem
store.fetchUser = fetchUser
window.store = store

function fetch (child) {
  if (cache.has(child)) {
    return Promise.resolve(cache.get(child))
  } else {
    return new Promise((resolve, reject) => {
      api.child(child).once('value', snapshot => {
        const val = snapshot.val()
        cache.set(child, val)
        resolve(val)
      }, reject)
    })
  }
}

function fetchIdsByType (type, page) {
  if (idsByType.has(type)) {
    const ids = idsByType.get(type)
    return Promise.resolve(ids.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE))
  }
  return fetch(`${type}stories`)
    .then(ids => ids.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE))
}

function fetchItemsByType (type, page) {
  return fetchIdsByType(type, page)
    .then(fetchItems)
}

function fetchItems (ids) {
  ids = ids || []
  return Promise.all(ids.map(fetchItem))
}

function fetchItem (id) {
  return fetch(`item/${id}`)
}

function fetchUser (id) {
  return fetch(`user/${id}`)
}
