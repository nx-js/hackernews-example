'use strict'

if (window.nx === undefined) {
  window.addEventListener('load', function () {
    var message = '<h2>Please reopen this page in the latest Chrome, Firefox, Safari, Edge or Opera browser.</h2>'
    message += '<p style="max-width: 900px; margin: auto;">NX relies heavily on the unshimmable ES6 Proxies, '
    message += 'which means that it only supports Safari 10 and no version of IE yet. '
    message += 'This is probably the biggest downside of the framework, but it also allows for some powerful features, that differentiates it from the others. '
    message += 'With the release of Safari 10 and the replacement if IE by Edge, all major browsers will be supported.</p>'
    message += '<h3 style="max-width: 900px; margin: 10px auto;">Sorry for the inconvenience and thank you for your understanding!</h3>'
    document.body.style.textAlign = 'center'
    document.body.style.lineHeight = '150%'
    document.body.innerHTML = message
  })
}
