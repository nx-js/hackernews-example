/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	// this exposes the global nx object, which is the entry point of the NX framework
	__webpack_require__(1)

	// this exposes a global store object, that can be used to access Hacker News data
	__webpack_require__(69)

	// this registers the NX components to be used in HTML by their name
	__webpack_require__(72)


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	module.exports = __webpack_require__(2)


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	var nx

	if (typeof Proxy === 'undefined') {
	  nx = { supported: false }
	} else {
	  nx = {
	    component: __webpack_require__(3),
	    middlewares: __webpack_require__(14),
	    components: __webpack_require__(44),
	    utils: __webpack_require__(49),
	    supported: true
	  }

	  __webpack_require__(50)
	  __webpack_require__(61)
	}

	if (typeof module !== 'undefined' && module.exports) {
	  module.exports = nx
	}
	if (typeof window !== 'undefined') {
	  window.nx = nx
	}


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	__webpack_require__(4)
	module.exports = __webpack_require__(6)


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	__webpack_require__(5)


/***/ },
/* 5 */
/***/ function(module, exports) {

	'use strict'

	const secret = {
	  registered: Symbol('registered')
	}

	if (!document.registerElement) {
	  const registry = new Map()

	  const observer = new MutationObserver(onMutations)
	  observer.observe(document, {childList: true, subtree: true})

	  function onMutations (mutations) {
	    for (let mutation of mutations) {
	      Array.prototype.forEach.call(mutation.addedNodes, onNodeAdded)
	      Array.prototype.forEach.call(mutation.removedNodes, onNodeRemoved)
	    }
	    mutations = observer.takeRecords()
	    if (mutations.length) {
	      onMutations(mutations)
	    }
	  }

	  function onNodeAdded (node) {
	    if (!(node instanceof Element)) return

	    let config = registry.get(node.getAttribute('is'))
	    if (!config || config.extends !== node.tagName.toLowerCase()) {
	      config = registry.get(node.tagName.toLowerCase())
	    }
	    if (config && !node[secret.registered]) {
	      Object.assign(node, config.prototype)
	      node[secret.registered] = true
	    }
	    if (node[secret.registered] && node.attachedCallback) {
	      node.attachedCallback()
	    }
	    Array.prototype.forEach.call(node.childNodes, onNodeAdded)
	  }

	  function onNodeRemoved (node) {
	    if (node[secret.registered] && node.detachedCallback) {
	      node.detachedCallback()
	    }
	    Array.prototype.forEach.call(node.childNodes, onNodeRemoved)
	  }

	  document.registerElement = function registerElement (name, config) {
	    name = name.toLowerCase()
	    if (config.extends) {
	      config.extends = config.extends.toLowerCase()
	    }
	    registry.set(name, config)

	    if (config.extends) {
	      Array.prototype.forEach.call(document.querySelectorAll(`[is=${name}]`), onNodeAdded)
	    } else {
	      Array.prototype.forEach.call(document.getElementsByTagName(name), onNodeAdded)
	    }
	  }

	  const originalCreateElement = document.createElement
	  document.createElement = function createElement (name, is) {
	    const element = originalCreateElement.call(document, name)
	    if (is) {
	      element.setAttribute('is', is)
	    }
	    return element
	  }
	}


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	module.exports = __webpack_require__(7)


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	const validateConfig = __webpack_require__(8)
	const validateMiddlewares = __webpack_require__(9)
	const getContext = __webpack_require__(10)
	const onNodeAdded = __webpack_require__(11)
	const onNodeRemoved = __webpack_require__(13)

	const secret = {
	  config: Symbol('component config')
	}
	const observerConfig = {
	  childList: true,
	  subtree: true
	}
	let context
	let prevParent
	const addedNodes = new Set()

	module.exports = function component (rawConfig) {
	  return {use, useOnContent, register, [secret.config]: validateConfig(rawConfig)}
	}

	function use (middleware) {
	  if (typeof middleware !== 'function') {
	    throw new TypeError('first argument must be a function')
	  }
	  const config = this[secret.config]
	  config.middlewares = config.middlewares || []
	  config.middlewares.push(middleware)
	  return this
	}

	function useOnContent (contentMiddleware) {
	  if (typeof contentMiddleware !== 'function') {
	    throw new TypeError('first argument must be a function')
	  }
	  const config = this[secret.config]
	  if (config.isolate === true) {
	    console.log('warning: content middlewares have no effect inside isolated components')
	  }
	  config.contentMiddlewares = config.contentMiddlewares || []
	  config.contentMiddlewares.push(contentMiddleware)
	  return this
	}

	function register (name) {
	  if (typeof name !== 'string') {
	    throw new TypeError('first argument must be a string')
	  }
	  const config = this[secret.config]
	  const parentProto = config.element ? config.elementProto : HTMLElement.prototype
	  const proto = Object.create(parentProto)
	  config.shouldValidate = validateMiddlewares(config.contentMiddlewares, config.middlewares)
	  proto[secret.config] = config
	  proto.attachedCallback = attachedCallback
	  if (config.root) {
	    proto.detachedCallback = detachedCallback
	  }
	  return document.registerElement(name, {prototype: proto, extends: config.element})
	}

	function attachedCallback () {
	  const config = this[secret.config]
	  if (!this.$registered) {
	    if (typeof config.state === 'object') {
	      this.$state = config.state
	    } else if (config.state === true) {
	      this.$state = {}
	    } else if (config.state === 'inherit') {
	      this.$state = {}
	      this.$inheritState = true
	    }

	    this.$isolate = config.isolate
	    this.$contentMiddlewares = config.contentMiddlewares
	    this.$middlewares = config.middlewares
	    this.$shouldValidate = config.shouldValidate
	    this.$registered = true

	    if (config.root) {
	      this.$root = this
	      const contentObserver = new MutationObserver(onMutations)
	      contentObserver.observe(this, observerConfig)
	    }

	    if (addedNodes.size === 0) {
	      Promise.resolve().then(processAddedNodes)
	    }
	    addedNodes.add(this)
	  }
	}

	function detachedCallback () {
	  onNodeRemoved(this)
	}

	function onMutations (mutations, contentObserver) {
	  let mutationIndex = mutations.length
	  while (mutationIndex--) {
	    const mutation = mutations[mutationIndex]

	    let nodes = mutation.removedNodes
	    let nodeIndex = nodes.length
	    while (nodeIndex--) {
	      onNodeRemoved(nodes[nodeIndex])
	    }

	    nodes = mutation.addedNodes
	    nodeIndex = nodes.length
	    while (nodeIndex--) {
	      addedNodes.add(nodes[nodeIndex])
	    }
	  }

	  mutations = contentObserver.takeRecords()
	  if (mutations.length) {
	    onMutations(mutations, contentObserver)
	  }

	  processAddedNodes()
	}

	function processAddedNodes () {
	  addedNodes.forEach(processAddedNode)
	  addedNodes.clear()
	  context = prevParent = undefined
	}

	function processAddedNode (node) {
	  const parentNode = node.parentNode || node.host
	  if (prevParent !== parentNode) {
	    prevParent = parentNode
	    context = getContext(parentNode)
	  }
	  onNodeAdded(node, context)
	  if (node.shadowRoot) {
	    const shadowObserver = new MutationObserver(onMutations)
	    shadowObserver.observe(node.shadowRoot, observerConfig)
	  }
	}


/***/ },
/* 8 */
/***/ function(module, exports) {

	'use strict'

	module.exports = function validateConfig (rawConfig) {
	  if (rawConfig === undefined) {
	    rawConfig = {}
	  }
	  if (typeof rawConfig !== 'object') {
	    throw new TypeError('invalid component config, must be an object or undefined')
	  }

	  const resultConfig = {}

	  if (typeof rawConfig.state === 'boolean' || rawConfig.state === 'inherit') {
	    resultConfig.state = rawConfig.state
	  } else if (typeof rawConfig.state === 'object') {
	    resultConfig.state = rawConfig.state
	  } else if (rawConfig.state === undefined) {
	    resultConfig.state = true
	  } else {
	    throw new Error('invalid state config: ' + rawConfig.state)
	  }

	  if (typeof rawConfig.isolate === 'boolean' || rawConfig.isolate === 'middlewares') {
	    resultConfig.isolate = rawConfig.isolate
	  } else if (rawConfig.isolate === undefined) {
	    resultConfig.isolate = false
	  } else {
	    throw new Error(`invalid isolate config: ${rawConfig.isolate}, must be a boolean, undefined or 'middlewares'`)
	  }

	  if (typeof rawConfig.root === 'boolean') {
	    resultConfig.root = rawConfig.root
	  } else if (rawConfig.root === undefined) {
	    resultConfig.root = false
	  } else {
	    throw new Error('invalid root config: ' + rawConfig.root)
	  }

	  if (resultConfig.root && (resultConfig.isolate === true || !resultConfig.state)) {
	    throw new Error('root components must have a state and must not be isolated')
	  }

	  if (typeof rawConfig.element === 'string') {
	    try {
	      resultConfig.elementProto = Object.getPrototypeOf(document.createElement(rawConfig.element))
	      resultConfig.element = rawConfig.element
	    } catch (err) {
	      throw new Error(`invalid element config: ${rawConfig.element}, must be the name of a native element`)
	    }
	  } else if (rawConfig.element !== undefined) {
	    throw new Error(`invalid element config: ${rawConfig.element}, must be the name of a native element`)
	  }
	  return resultConfig
	}


/***/ },
/* 9 */
/***/ function(module, exports) {

	'use strict'

	const names = new Set()
	const missing = new Set()
	const duplicates = new Set()

	module.exports = function validateMiddlewares (contentMiddlewares, middlewares, strict) {
	  names.clear()
	  missing.clear()
	  duplicates.clear()

	  if (contentMiddlewares) {
	    contentMiddlewares.forEach(validateMiddleware)
	  }
	  if (middlewares) {
	    middlewares.forEach(validateMiddleware)
	  }
	  if (missing.size) {
	    if (!strict) return true
	    throw new Error(`missing middlewares: ${Array.from(missing).join()}`)
	  }
	  if (duplicates.size) {
	    if (!strict) return true
	    throw new Error(`duplicate middlewares: ${Array.from(duplicates).join()}`)
	  }
	}

	function validateMiddleware (middleware) {
	  const name = middleware.$name
	  const require = middleware.$require
	  if (name) {
	    if (names.has(name)) {
	      duplicates.add(name)
	    }
	    names.add(name)
	  }
	  if (require) {
	    for (let dependency of require) {
	      if (!names.has(dependency)) {
	        missing.add(dependency)
	      }
	    }
	  }
	}


/***/ },
/* 10 */
/***/ function(module, exports) {

	'use strict'

	module.exports = function getContext (node) {
	  const context = {contentMiddlewares: []}

	  while (node) {
	    if (!context.state && node.$state) {
	      context.state = node.$state
	    }
	    if (!context.state && node.$contextState) {
	      context.state = node.$contextState
	    }
	    if (!context.isolate) {
	      context.isolate = node.$isolate
	      if (node.$contentMiddlewares) {
	        context.contentMiddlewares = node.$contentMiddlewares.concat(context.contentMiddlewares)
	      }
	    }
	    if (node === node.$root) {
	      context.root = context.root || node
	      return context
	    }
	    if (node.host) {
	      context.root = context.root || node
	      node = node.host
	    } else {
	      node = node.parentNode
	    }
	  }
	  return context
	}


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	const validateMiddlewares = __webpack_require__(9)
	const runMiddlewares = __webpack_require__(12)

	module.exports = function onNodeAdded (node, context) {
	  const parent = node.parentNode
	  const validParent = (parent && parent.$lifecycleStage === 'attached')
	  if (validParent && node === node.$root) {
	    throw new Error(`Nested root component: ${node.tagName}`)
	  }
	  if ((validParent || node === node.$root) && context.isolate !== true) {
	    setupNodeAndChildren(node, context.state, context.contentMiddlewares, context.root)
	  }
	}

	function setupNodeAndChildren (node, state, contentMiddlewares, root) {
	  const type = node.nodeType
	  if (!shouldProcess(node, type)) return
	  node.$lifecycleStage = 'attached'

	  node.$contextState = node.$contextState || state || node.$state
	  node.$state = node.$state || node.$contextState
	  if (node.$inheritState) {
	    Object.setPrototypeOf(node.$state, node.$contextState)
	  }

	  node.$root = node.$root || root

	  if (node.$isolate === 'middlewares') {
	    contentMiddlewares = node.$contentMiddlewares || []
	  } else if (node.$contentMiddlewares) {
	    contentMiddlewares = contentMiddlewares.concat(node.$contentMiddlewares)
	  }
	  if (node.$shouldValidate) {
	    validateMiddlewares(contentMiddlewares, node.$middlewares, true)
	  }
	  node.$cleanup = $cleanup

	  runMiddlewares(node, contentMiddlewares, node.$middlewares)

	  if (type === 1 && node.$isolate !== true) {
	    let child = node.firstChild
	    while (child) {
	      setupNodeAndChildren(child, node.$state, contentMiddlewares, node.$root)
	      child = child.nextSibling
	    }

	    child = node.shadowRoot ? node.shadowRoot.firstChild : undefined
	    while (child) {
	      setupNodeAndChildren(child, node.$state, contentMiddlewares, node.shadowRoot)
	      child = child.nextSibling
	    }
	  }
	}

	function shouldProcess (node, type) {
	  if (node.$lifecycleStage) {
	    return false
	  }
	  if (type === 1) {
	    return ((!node.hasAttribute('is') && node.tagName.indexOf('-') === -1) || node.$registered)
	  }
	  if (type === 3) {
	    return node.nodeValue.trim()
	  }
	}

	function $cleanup (fn, ...args) {
	  if (typeof fn !== 'function') {
	    throw new TypeError('first argument must be a function')
	  }
	  this.$cleaners = this.$cleaners || []
	  this.$cleaners.push({fn, args})
	}


/***/ },
/* 12 */
/***/ function(module, exports) {

	'use strict'

	let node
	let index, middlewares, middlewaresLength
	let contentIndex, contentMiddlewares, contentMiddlewaresLength

	module.exports = function runMiddlewares (currNode, currContentMiddlewares, currMiddlewares) {
	  node = currNode
	  middlewares = currMiddlewares
	  contentMiddlewares = currContentMiddlewares
	  middlewaresLength = currMiddlewares ? currMiddlewares.length : 0
	  contentMiddlewaresLength = currContentMiddlewares ? currContentMiddlewares.length : 0
	  index = contentIndex = 0
	  next()
	  node = middlewares = contentMiddlewares = undefined
	}

	function next () {
	  if (contentIndex < contentMiddlewaresLength) {
	    contentMiddlewares[contentIndex++].call(node, node, node.$state, next)
	    next()
	  } else if (index < middlewaresLength) {
	    middlewares[index++].call(node, node, node.$state, next)
	    next()
	  }
	}


/***/ },
/* 13 */
/***/ function(module, exports) {

	'use strict'

	module.exports = function onNodeRemoved (node) {
	  const parent = node.parentNode
	  if (!parent || parent.$lifecycleStage === 'detached') {
	    cleanupNodeAndChildren(node)
	  }
	}

	function cleanupNodeAndChildren (node) {
	  if (node.$lifecycleStage !== 'attached') return
	  node.$lifecycleStage = 'detached'

	  if (node.$cleaners) {
	    node.$cleaners.forEach(runCleaner, node)
	    node.$cleaners = undefined
	  }

	  let child = node.firstChild
	  while (child) {
	    cleanupNodeAndChildren(child)
	    child = child.nextSibling
	  }

	  child = node.shadowRoot ? node.shadowRoot.firstChild : undefined
	  while (child) {
	    cleanupNodeAndChildren(child, node.$state, contentMiddlewares)
	    child = child.nextSibling
	  }
	}

	function runCleaner (cleaner) {
	  cleaner.fn.apply(this, cleaner.args)
	}


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	module.exports = {
	  attributes: __webpack_require__(15),
	  events: __webpack_require__(22),
	  interpolate: __webpack_require__(23),
	  render: __webpack_require__(24),
	  flow: __webpack_require__(25),
	  bindable: __webpack_require__(27),
	  bind: __webpack_require__(28),
	  style: __webpack_require__(29),
	  animate: __webpack_require__(30),
	  route: __webpack_require__(31),
	  params: __webpack_require__(32),
	  ref: __webpack_require__(33),
	  observe: __webpack_require__(34)
	}


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	const compiler = __webpack_require__(16)

	let currAttributes
	const handlers = new Map()
	const attributeCache = new Map()

	function attributes (elem, state, next) {
	  if (elem.nodeType !== 1) return

	  currAttributes = getAttributes(elem)
	  elem.$attribute = $attribute
	  elem.$hasAttribute = $hasAttribute
	  next()

	  currAttributes.forEach(processAttributeWithoutHandler, elem)
	  handlers.forEach(processAttributeWithHandler, elem)
	  handlers.clear()
	}
	attributes.$name = 'attributes'
	attributes.$require = ['observe']
	module.exports = attributes

	function $attribute (name, handler) {
	  if (typeof name !== 'string') {
	    throw new TypeError('first argument must be a string')
	  }
	  if (typeof handler !== 'function') {
	    throw new TypeError('second argument must be a function')
	  }
	  if (currAttributes.has(name)) {
	    handlers.set(name, handler)
	  }
	}

	function $hasAttribute (name) {
	  if (typeof name !== 'string') {
	    throw new TypeError('first argument must be a string')
	  }
	  return currAttributes.has(name)
	}

	function getAttributes (elem) {
	  const cloneId = elem.getAttribute('clone-id')
	  let attributes
	  if (cloneId) {
	    attributes = attributeCache.get(cloneId)
	    if (!attributes) {
	      attributes = cacheAttributes(elem.attributes)
	      attributeCache.set(cloneId, attributes)
	    }
	    return attributes
	  }
	  return cacheAttributes(elem.attributes)
	}

	function cacheAttributes (attributes) {
	  let i = attributes.length
	  const cachedAttributes = new Map()
	  while (i--) {
	    const attribute = attributes[i]
	    const type = attribute.name[0]
	    const name = (type === '$' || type === '@') ? attribute.name.slice(1) : attribute.name
	    cachedAttributes.set(name, {value: attribute.value, type})
	  }
	  return cachedAttributes
	}

	function processAttributeWithoutHandler (attr, name) {
	  if (!handlers.has(name)) {
	    if (attr.type === '$') {
	      const expression = compiler.compileExpression(attr.value || name)
	      this.$queue(processExpression, expression, name, defaultHandler)
	    } else if (attr.type === '@') {
	      const expression = compiler.compileExpression(attr.value || name)
	      this.$observe(processExpression, expression, name, defaultHandler)
	    }
	  }
	}

	function processAttributeWithHandler (handler, name) {
	  const attr = currAttributes.get(name)
	  if (attr.type === '@') {
	    const expression = compiler.compileExpression(attr.value || name)
	    this.$observe(processExpression, expression, name, handler)
	  } else if (attr.type === '$') {
	    const expression = compiler.compileExpression(attr.value || name)
	    this.$queue(processExpression, expression, name, handler)
	  } else {
	    handler.call(this, attr.value, name)
	  }
	}

	function processExpression (expression, name, handler) {
	  const value = expression(this.$contextState)
	  handler.call(this, value, name)
	}

	function defaultHandler (value, name) {
	  if (value) {
	    this.setAttribute(name, value)
	  } else {
	    this.removeAttribute(name)
	  }
	}


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	const context = __webpack_require__(17)
	const modifiers = __webpack_require__(18)
	const compiler = __webpack_require__(19)

	module.exports = {
	  compileExpression: compiler.compileExpression,
	  compileCode: compiler.compileCode,
	  expose: context.expose,
	  hide: context.hide,
	  hideAll: context.hideAll,
	  filter: modifiers.filter,
	  limiter: modifiers.limiter
	}


/***/ },
/* 17 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict'

	const globals = new Set()
	const proxies = new WeakMap()
	const handlers = {has}

	let globalObj
	if (typeof window !== 'undefined') globalObj = window // eslint-disable-line
	else if (typeof global !== 'undefined') globalObj = global // eslint-disable-line
	else if (typeof self !== 'undefined') globalObj = self // eslint-disable-line
	globalObj.$nxCompileToSandbox = toSandbox
	globalObj.$nxCompileCreateBackup = createBackup

	module.exports = {
	  expose,
	  hide,
	  hideAll
	}

	function expose (...globalNames) {
	  for (let globalName of globalNames) {
	    globals.add(globalName)
	  }
	  return this
	}

	function hide (...globalNames) {
	  for (let globalName of globalNames) {
	    globals.delete(globalName)
	  }
	  return this
	}

	function hideAll () {
	  globals.clear()
	  return this
	}

	function has (target, key) {
	  return globals.has(key) ? Reflect.has(target, key) : true
	}

	function toSandbox (obj) {
	  if (typeof obj !== 'object') {
	    throw new TypeError('first argument must be an object')
	  }
	  let sandbox = proxies.get(obj)
	  if (!sandbox) {
	    sandbox = new Proxy(obj, handlers)
	    proxies.set(obj, sandbox)
	  }
	  return sandbox
	}

	function createBackup (context, tempVars) {
	  if (typeof tempVars === 'object') {
	    const backup = {}
	    for (let key of Object.keys(tempVars)) {
	      backup[key] = context[key]
	    }
	    return backup
	  }
	}

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 18 */
/***/ function(module, exports) {

	'use strict'

	const filters = new Map()
	const limiters = new Map()

	module.exports = {
	  filters,
	  limiters,
	  filter,
	  limiter
	}

	function filter (name, handler) {
	  if (typeof name !== 'string') {
	    throw new TypeError('First argument must be a string.')
	  }
	  if (typeof handler !== 'function') {
	    throw new TypeError('Second argument must be a function.')
	  }
	  if (filters.has(name)) {
	    throw new Error(`A filter named ${name} is already registered.`)
	  }
	  filters.set(name, handler)
	  return this
	}

	function limiter (name, handler) {
	  if (typeof name !== 'string') {
	    throw new TypeError('First argument must be a string.')
	  }
	  if (typeof handler !== 'function') {
	    throw new TypeError('Second argument must be a function.')
	  }
	  if (limiters.has(name)) {
	    throw new Error(`A limiter named ${name} is already registered.`)
	  }
	  limiters.set(name, handler)
	  return this
	}


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	const parser = __webpack_require__(20)

	const expressionCache = new Map()
	const codeCache = new Map()

	module.exports = {
	  compileExpression,
	  compileCode
	}

	function compileExpression (src) {
	  if (typeof src !== 'string') {
	    throw new TypeError('First argument must be a string.')
	  }
	  let expression = expressionCache.get(src)
	  if (!expression) {
	    expression = parser.parseExpression(src)
	    expressionCache.set(src, expression)
	  }

	  if (typeof expression === 'function') {
	    return expression
	  }

	  return function evaluateExpression (context) {
	    let value = expression.exec(context)
	    for (let filter of expression.filters) {
	      const args = filter.argExpressions.map(evaluateArgExpression, context)
	      value = filter.effect(value, ...args)
	    }
	    return value
	  }
	}

	function compileCode (src) {
	  if (typeof src !== 'string') {
	    throw new TypeError('First argument must be a string.')
	  }
	  let code = codeCache.get(src)
	  if (!code) {
	    code = parser.parseCode(src)
	    codeCache.set(src, code)
	  }

	  if (typeof code === 'function') {
	    return code
	  }

	  const context = {}
	  return function evaluateCode (state, tempVars) {
	    let i = 0
	    function next () {
	      Object.assign(context, tempVars)
	      if (i < code.limiters.length) {
	        const limiter = code.limiters[i++]
	        const args = limiter.argExpressions.map(evaluateArgExpression, state)
	        limiter.effect(next, context, ...args)
	      } else {
	        code.exec(state, tempVars)
	      }
	    }
	    next()
	  }
	}

	function evaluateArgExpression (argExpression) {
	  return argExpression(this)
	}


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	const modifiers = __webpack_require__(18)
	const rawCompiler = __webpack_require__(21)

	const filterRegex = /(?:[^\|]|\|\|)+/g
	const limiterRegex = /(?:[^&]|&&)+/g
	const argsRegex = /\S+/g

	module.exports = {
	  parseExpression,
	  parseCode
	}

	function parseExpression (src) {
	  const tokens = src.match(filterRegex)
	  if (tokens.length === 1) {
	    return rawCompiler.compileExpression(tokens[0])
	  }

	  const expression = {
	    exec: rawCompiler.compileExpression(tokens[0]),
	    filters: []
	  }
	  for (let i = 1; i < tokens.length; i++) {
	    let filterTokens = tokens[i].match(argsRegex) || []
	    const filterName = filterTokens.shift()
	    const effect = modifiers.filters.get(filterName)
	    if (!effect) {
	      throw new Error(`There is no filter named: ${filterName}.`)
	    }
	    expression.filters.push({effect, argExpressions: filterTokens.map(compileArgExpression)})
	  }
	  return expression
	}

	function parseCode (src) {
	  const tokens = src.match(limiterRegex)
	  if (tokens.length === 1) {
	    return rawCompiler.compileCode(tokens[0])
	  }

	  const code = {
	    exec: rawCompiler.compileCode(tokens[0]),
	    limiters: []
	  }
	  for (let i = 1; i < tokens.length; i++) {
	    const limiterTokens = tokens[i].match(argsRegex) || []
	    const limiterName = limiterTokens.shift()
	    const effect = modifiers.limiters.get(limiterName)
	    if (!effect) {
	      throw new Error(`There is no limiter named: ${limiterName}.`)
	    }
	    code.limiters.push({effect, argExpressions: limiterTokens.map(compileArgExpression)})
	  }
	  return code
	}

	function compileArgExpression (argExpression) {
	  return rawCompiler.compileExpression(argExpression)
	}


/***/ },
/* 21 */
/***/ function(module, exports) {

	'use strict'

	module.exports = {
	  compileCode,
	  compileExpression
	}

	function compileExpression (src) {
	  return new Function('context', // eslint-disable-line
	    `const sandbox = $nxCompileToSandbox(context)
	    try { with (sandbox) { return ${src} } } catch (err) {
	      if (!(err instanceof TypeError)) throw err
	    }`)
	}

	function compileCode (src) {
	  return new Function('context', 'tempVars', // eslint-disable-line
	    `const backup = $nxCompileCreateBackup(context, tempVars)
	    Object.assign(context, tempVars)
	    const sandbox = $nxCompileToSandbox(context)
	    try {
	      with (sandbox) { ${src} }
	    } finally {
	      Object.assign(context, backup)
	    }`)
	}


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	const compiler = __webpack_require__(16)

	const secret = {
	  handlers: Symbol('event handlers')
	}
	const handlerCache = new Map()

	function events (elem) {
	  if (elem.nodeType !== 1) return

	  const handlers = getEventHandlers(elem)
	  if (handlers) {
	    handlers.forEach(addEventHandlers, elem)
	    elem[secret.handlers] = handlers
	  }
	}
	events.$name = 'events'
	module.exports = events

	function getEventHandlers (elem) {
	  const cloneId = elem.getAttribute('clone-id')
	  if (cloneId) {
	    let handlers = handlerCache.get(cloneId)
	    if (handlers === undefined) {
	      handlers = createEventHandlers(elem)
	      handlerCache.set(cloneId, handlers)
	    }
	    return handlers
	  }
	  return createEventHandlers(elem)
	}

	function createEventHandlers (elem) {
	  let handlers = false
	  const attributes = elem.attributes
	  let i = attributes.length
	  while (i--) {
	    const attribute = attributes[i]
	    if (attribute.name[0] === '#') {
	      handlers = handlers || new Map()
	      const handler = compiler.compileCode(attribute.value)
	      const names = attribute.name.slice(1).split(',')
	      for (let name of names) {
	        let typeHandlers = handlers.get(name)
	        if (!typeHandlers) {
	          typeHandlers = new Set()
	          handlers.set(name, typeHandlers)
	        }
	        typeHandlers.add(handler)
	      }
	    }
	  }
	  return handlers
	}

	function addEventHandlers (handlers, type) {
	  this.addEventListener(type, listener, true)
	}

	function listener (ev) {
	  const handlers = this[secret.handlers].get(ev.type)
	  for (let handler of handlers) {
	    handler(this.$contextState, { $event: ev })
	  }
	}


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	const compiler = __webpack_require__(16)

	const tokenCache = new Map()

	function interpolate (node) {
	  if (node.nodeType !== 3) return
	  createTokens(node).forEach(processToken, node)
	}
	interpolate.$name = 'interpolate'
	interpolate.$require = ['observe']
	module.exports = interpolate

	function createTokens (node) {
	  const nodeValue = node.nodeValue
	  let tokens = tokenCache.get(nodeValue)
	  if (!tokens) {
	    tokens = parseValue(node.nodeValue)
	    tokenCache.set(nodeValue, tokens)
	    return tokens
	  }
	  return tokens.map(cloneToken)
	}

	function cloneToken (token) {
	  if (typeof token === 'object') {
	    return {
	      observed: token.observed,
	      expression: token.expression,
	      toString: token.toString
	    }
	  }
	  return token
	}

	function processToken (token, index, tokens) {
	  if (typeof token === 'object') {
	    const expression = compiler.compileExpression(token.expression)
	    if (token.observed) {
	      this.$observe(interpolateToken, expression, token, tokens)
	    } else {
	      this.$queue(interpolateToken, expression, token, tokens)
	    }
	  }
	}

	function interpolateToken (expression, token, tokens) {
	  let value = expression(this.$state)
	  value = (value !== undefined) ? value : ''
	  if (token.value !== value) {
	    token.value = value
	    this.nodeValue = (1 < tokens.length) ? tokens.join('') : value
	  }
	}

	function parseValue (string) {
	  const tokens = []
	  const length = string.length
	  let expression = false
	  let anchor = 0
	  let depth = 0
	  let token

	  for (let i = 0; i < length; i++) {
	    const char = string[i]

	    if (expression) {
	      if (char === '{') {
	        depth++
	      } else if (char === '}') {
	        depth--
	      }

	      if (depth === 0) {
	        token.expression = string.slice(anchor, i)
	        token.toString = tokenToString
	        tokens.push(token)
	        anchor = i + 1
	        expression = false
	      }
	    } else {
	      if (i === length - 1) {
	        tokens.push(string.slice(anchor, i + 1))
	      } else if ((char === '$' || char === '@') && string.charAt(i + 1) === '{') {
	        if (i !== anchor) {
	          tokens.push(string.slice(anchor, i))
	        }
	        token = {observed: (char === '@')}
	        anchor = i + 2
	        depth = 0
	        expression = true
	      }
	    }
	  }
	  return tokens
	}

	function tokenToString () {
	  return String(this.value)
	}


/***/ },
/* 24 */
/***/ function(module, exports) {

	'use strict'

	let cloneId = 0
	let selectorScope
	const hostRegex = /:host/g
	const functionalHostRegex = /:host\((.*?)\)/g

	module.exports = function renderFactory (config) {
	  config = validateAndCloneConfig(config)
	  config.template = cacheTemplate(config.template)

	  function render (elem) {
	    if (elem.nodeType !== 1) {
	      throw new Error('render only works with element nodes')
	    }
	    addContext(elem)

	    const template = document.importNode(config.template, true)

	    // fall back to non shadow mode (scoped style) for now, add polyfill later
	    if (config.shadow && elem.attachShadow) {
	      const shadowRoot = elem.attachShadow({mode: 'open'})
	      shadowRoot.appendChild(template)
	      const style = document.createElement('style')
	      style.appendChild(document.createTextNode(config.style))
	      shadowRoot.appendChild(style)
	    } else {
	      composeContentWithTemplate(elem, template)
	      if (config.style) {
	        addScopedStyle(elem, config.style)
	        config.style = undefined
	      }
	    }
	  }
	  render.$name = 'render'
	  return render
	}

	function addContext (elem) {
	  let child = elem.firstChild
	  while (child) {
	    child.$contextState = elem.$contextState
	    child = child.nextSibling
	  }
	}

	function composeContentWithTemplate (elem, template) {
	  let defaultSlot
	  const slots = template.querySelectorAll('slot')

	  for (let i = slots.length; i--;) {
	    const slot = slots[i]
	    if (slot.getAttribute('name')) {
	      const slotFillers = elem.querySelectorAll(`[slot=${slot.getAttribute('name')}]`)
	      if (slotFillers.length) {
	        slot.innerHTML = ''
	        for (let i = slotFillers.length; i--;) {
	          slot.appendChild(slotFillers[i])
	        }
	      }
	    } else {
	      defaultSlot = slot
	    }
	  }

	  if (defaultSlot && elem.firstChild) {
	    defaultSlot.innerHTML = ''
	    while (elem.firstChild) {
	      defaultSlot.appendChild(elem.firstChild)
	    }
	  }
	  elem.innerHTML = ''
	  elem.appendChild(template)
	}

	function addScopedStyle (elem, styleString) {
	  setSelectorScope(elem)
	  styleString = styleString
	    .replace(functionalHostRegex, `${selectorScope}$1`)
	    .replace(hostRegex, selectorScope)

	  const style = document.createElement('style')
	  style.appendChild(document.createTextNode(styleString))
	  document.head.insertBefore(style, document.head.firstChild)

	  scopeSheet(style.sheet)
	}

	function setSelectorScope (elem) {
	  const is = elem.getAttribute('is')
	  selectorScope = (is ? `${elem.tagName}[is="${is}"]` : elem.tagName).toLowerCase()
	}

	function scopeSheet (sheet) {
	  const rules = sheet.cssRules
	  for (let i = rules.length; i--;) {
	    const rule = rules[i]
	    if (rule.type === 1) {
	      const selectorText = rule.selectorText.split(',').map(scopeSelector).join(', ')
	      const styleText = rule.style.cssText
	      sheet.deleteRule(i)
	      sheet.insertRule(`${selectorText} { ${styleText} }`, i)
	    } else if (rule.type === 4) { // media rules
	      scopeSheet(rule)
	    }
	  }
	}

	function scopeSelector (selector) {
	  if (selector.indexOf(selectorScope) !== -1) {
	    return selector
	  }
	  return `${selectorScope} ${selector}`
	}

	function cacheTemplate (templateHTML) {
	  let template = document.createElement('template')
	  template.innerHTML = templateHTML
	  return template.content
	}

	function validateAndCloneConfig (rawConfig) {
	  const resultConfig = {}

	  if (typeof rawConfig !== 'object') {
	    throw new TypeError('config must be an object')
	  }

	  if (typeof rawConfig.template === 'string') {
	    resultConfig.template = rawConfig.template
	  } else {
	    throw new TypeError('template config must be a string')
	  }

	  if (typeof rawConfig.style === 'string') {
	    resultConfig.style = rawConfig.style
	  } else if (rawConfig.style !== undefined) {
	    throw new TypeError('style config must be a string or undefined')
	  }

	  if (typeof rawConfig.shadow === 'boolean') {
	    resultConfig.shadow = rawConfig.shadow
	  } else if (rawConfig.shadow !== undefined) {
	    throw new TypeError('shadow config must be a boolean or undefined')
	  }

	  return resultConfig
	}


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	const dom = __webpack_require__(26)

	const secret = {
	  showing: Symbol('flow showing'),
	  prevArray: Symbol('flow prevArray'),
	  trackBy: Symbol('track by')
	}

	function flow (elem) {
	  if (elem.nodeType !== 1) return

	  const hasIf = elem.$hasAttribute('if')
	  const hasRepeat = elem.$hasAttribute('repeat')

	  if (hasIf && hasRepeat) {
	    throw new Error('if and repeat attributes can not be used on the same element')
	  }
	  if (hasIf || hasRepeat) {
	    dom.normalizeContent(elem)
	    dom.extractContent(elem)
	  }

	  elem.$attribute('if', ifAttribute)
	  elem.$attribute('track-by', trackByAttribute)
	  elem.$attribute('repeat', repeatAttribute)
	}
	flow.$name = 'flow'
	flow.$require = ['attributes']
	module.exports = flow

	function ifAttribute (show) {
	  if (show && !this[secret.showing]) {
	    dom.insertContent(this)
	    this[secret.showing] = true
	  } else if (!show && this[secret.showing]) {
	    dom.clearContent(this)
	    this[secret.showing] = false
	  }
	}

	function trackByAttribute (trackBy) {
	  this[secret.trackBy] = trackBy
	}

	function repeatAttribute (array) {
	  const repeatValue = this.getAttribute('repeat-value') || '$value'
	  const repeatIndex = this.getAttribute('repeat-index') || '$index'

	  let trackBy = this[secret.trackBy] || isSame
	  let trackByProp
	  if (typeof trackBy === 'string') {
	    trackByProp = trackBy
	    trackBy = isSame
	  }

	  array = array || []
	  const prevArray = this[secret.prevArray] = this[secret.prevArray] || []

	  let i = -1
	  iteration: for (let item of array) {
	    let prevItem = prevArray[++i]

	    if (prevItem === item) {
	      continue
	    }
	    if (trackBy(item, prevItem, trackByProp)) {
	      dom.mutateContext(this, i, {[repeatValue]: item})
	      prevArray[i] = item
	      continue
	    }
	    for (let j = i + 1; j < prevArray.length; j++) {
	      prevItem = prevArray[j]
	      if (trackBy(item, prevItem, trackByProp)) {
	        dom.moveContent(this, j, i, {[repeatIndex]: i})
	        prevArray.splice(i, 0, prevItem)
	        prevArray.splice(j, 1)
	        continue iteration
	      }
	    }
	    dom.insertContent(this, i, {[repeatIndex]: i, [repeatValue]: item})
	    prevArray.splice(i, 0, item)
	  }

	  if ((++i) === 0) {
	    prevArray.length = 0
	    dom.clearContent(this)
	  } else {
	    while (i < prevArray.length) {
	      dom.removeContent(this)
	      prevArray.pop()
	    }
	  }
	}

	function isSame (item1, item2, prop) {
	  return (item1 === item2 ||
	    (prop && typeof item1 === 'object' && typeof item2 === 'object' &&
	    item1 && item2 && item1[prop] === item2[prop]))
	}


/***/ },
/* 26 */
/***/ function(module, exports) {

	'use strict'

	const secret = {
	  template: Symbol('content template'),
	  firstNodes: Symbol('first nodes')
	}
	let cloneId = 0

	module.exports = {
	  extractContent,
	  normalizeContent,
	  insertContent,
	  moveContent,
	  removeContent,
	  clearContent,
	  mutateContext
	}

	function extractContent (elem) {
	  const template = document.createDocumentFragment()
	  let node = elem.firstChild
	  while (node) {
	    template.appendChild(node)
	    node = elem.firstChild
	  }
	  elem[secret.template] = template
	  elem[secret.firstNodes] = []
	  return template
	}

	function normalizeContent (node) {
	  if (node.nodeType === 1) {
	    node.setAttribute('clone-id', `content-${cloneId++}`)
	    const childNodes = node.childNodes
	    let i = childNodes.length
	    while (i--) {
	      normalizeContent(childNodes[i])
	    }
	  } else if (node.nodeType === 3) {
	    if (!node.nodeValue.trim()) node.remove()
	  } else {
	    node.remove()
	  }
	}

	function insertContent (elem, index, contextState) {
	  if (index !== undefined && typeof index !== 'number') {
	    throw new TypeError('Second argument must be a number or undefined.')
	  }
	  if (contextState !== undefined && typeof contextState !== 'object') {
	    throw new TypeError('Third argument must be an object or undefined.')
	  }
	  if (!elem[secret.template]) {
	    throw new Error('you must extract a template with $extractContent before inserting')
	  }
	  const content = elem[secret.template].cloneNode(true)
	  const firstNodes = elem[secret.firstNodes]
	  const firstNode = content.firstChild
	  const beforeNode = firstNodes[index]

	  if (contextState) {
	    contextState = Object.assign(Object.create(elem.$state), contextState)
	    let node = firstNode
	    while (node) {
	      node.$contextState = contextState
	      node = node.nextSibling
	    }
	  }

	  elem.insertBefore(content, beforeNode)
	  if (beforeNode) firstNodes.splice(index, 0, firstNode)
	  else firstNodes.push(firstNode)
	}

	function removeContent (elem, index) {
	  if (index !== undefined && typeof index !== 'number') {
	    throw new TypeError('Second argument must be a number or undefined.')
	  }
	  const firstNodes = elem[secret.firstNodes]
	  index = firstNodes[index] ? index : (firstNodes.length - 1)
	  const firstNode = firstNodes[index]
	  const nextNode = firstNodes[index + 1]


	  let node = firstNode
	  let next
	  while (node && node !== nextNode) {
	    next = node.nextSibling
	    node.remove()
	    node = next
	  }

	  if (nextNode) firstNodes.splice(index, 1)
	  else firstNodes.pop()
	}

	function clearContent (elem) {
	  elem.innerHTML = ''
	  elem[secret.firstNodes] = []
	}

	function moveContent (elem, fromIndex, toIndex, extraContext) {
	  if (typeof fromIndex !== 'number' || typeof toIndex !== 'number') {
	    throw new Error('first and second argument must be numbers')
	  }
	  if (extraContext !== undefined && typeof extraContext !== 'object') {
	    throw new Error('third argument must be an object or undefined')
	  }
	  const firstNodes = elem[secret.firstNodes]
	  const fromNode = firstNodes[fromIndex]
	  const untilNode = firstNodes[fromIndex + 1]
	  const toNode = firstNodes[toIndex]

	  let node = fromNode
	  let next
	  while (node && node !== untilNode) {
	    next = node.nextSibling
	    elem.insertBefore(node, toNode)
	    node = next
	  }
	  firstNodes.splice(fromIndex, 1)
	  firstNodes.splice(toIndex, 0, fromNode)

	  if (extraContext && fromNode && fromNode.$contextState) {
	    Object.assign(fromNode.$contextState, extraContext)
	  }
	}

	function mutateContext (elem, index, extraContext) {
	  if (index !== undefined && typeof index !== 'number') {
	    throw new TypeError('first argument must be a number or undefined')
	  }
	  if (typeof extraContext !== 'object') {
	    throw new TypeError('second argument must be an object')
	  }
	  const startNode = elem[secret.firstNodes][index]
	  if (startNode && startNode.$contextState) {
	    Object.assign(startNode.$contextState, extraContext)
	  }
	}


/***/ },
/* 27 */
/***/ function(module, exports) {

	'use strict'

	const secret = {
	  bound: Symbol('bound element'),
	  params: Symbol('bind params'),
	  bindEvents: Symbol('bind events'),
	  signal: Symbol('observing signal'),
	  preventSubmit: Symbol('prevent submit')
	}
	const paramsRegex = /\S+/g
	const defaultParams = {mode: 'two-way', on: 'change', type: 'string'}

	function onInput (ev) {
	  const elem = ev.target
	  const params = elem[secret.params]
	  if (ev.type === 'submit') {
	    syncStateWithForm(elem)
	  } else if (elem[secret.bound] && params.on.indexOf(ev.type) !== -1) {
	    syncStateWithElement(elem)
	  }
	}

	function bindable (elem, state, next) {
	  if (elem.nodeType !== 1) return

	  elem.$bindable = $bindable
	  next()
	  elem.$attribute('bind', bindAttribute)
	}
	bindable.$name = 'bindable'
	bindable.$require = ['observe', 'attributes']
	module.exports = bindable

	function $bindable (params) {
	  this[secret.params] = Object.assign({}, defaultParams, params)
	}

	function bindAttribute (newParams) {
	  const params = this[secret.params]

	  if (params) {
	    if (newParams && typeof newParams === 'string') {
	      const tokens = newParams.match(paramsRegex)
	      params.mode = tokens[0] || params.mode,
	      params.on = tokens[1] ? tokens[1].split(',') : params.on,
	      params.type = tokens[2] || params.type
	    } else if (newParams && typeof newParams === 'object') {
	      Object.assign(params, newParams)
	    }
	    if (!Array.isArray(params.on)) {
	      params.on = [params.on]
	    }
	    bindElement(this)
	    this[secret.bound] = true
	  }
	}

	function bindElement (elem) {
	  const params = elem[secret.params]
	  if (params.mode === 'two-way' && !elem[secret.signal]) {
	    Promise.resolve().then(() => elem[secret.signal] = elem.$observe(syncElementWithState, elem))
	  } else if (params.mode === 'one-time') {
	    elem.$unobserve(elem[secret.signal])
	    Promise.resolve().then(() => elem.$queue(syncElementWithState, elem))
	    elem[secret.signal] = undefined
	  } else if (params.mode === 'one-way') {
	    elem.$unobserve(elem[secret.signal])
	    elem[secret.signal] = undefined
	  }
	  registerListeners(elem, params)
	}

	function registerListeners (elem, params) {
	  const root = elem.$root
	  let bindEvents = root[secret.bindEvents]
	  if (!bindEvents) {
	    bindEvents = root[secret.bindEvents] = new Set()
	  }
	  if (!root[secret.preventSubmit]) {
	    root.addEventListener('submit', preventDefault, true)
	    root[secret.preventSubmit] = true
	  }
	  for (let eventName of params.on) {
	    if (!bindEvents.has(eventName)) {
	      root.addEventListener(eventName, onInput, true)
	      bindEvents.add(eventName)
	    }
	  }
	}

	function preventDefault (ev) {
	  ev.preventDefault()
	}

	function syncElementWithState (elem) {
	  const params = elem[secret.params]
	  const value = getValue(elem.$state, elem.name)
	  if (elem.type === 'radio' || elem.type === 'checkbox') {
	    elem.checked = (value === toType(elem.value, params.type))
	  } else if (elem.value !== toType(value)) {
	    elem.value = toType(value)
	  }
	}

	function syncStateWithElement (elem) {
	  const params = elem[secret.params]
	  if (elem.type === 'radio' || elem.type === 'checkbox') {
	    const value = elem.checked ? toType(elem.value, params.type) : undefined
	    setValue(elem.$state, elem.name, value)
	  } else {
	    setValue(elem.$state, elem.name, toType(elem.value, params.type))
	  }
	}

	function syncStateWithForm (form) {
	  Array.prototype.forEach.call(form.elements, syncStateWithFormControl)
	}

	function syncStateWithFormControl (elem) {
	  if (elem[secret.bound]) {
	    const params = elem[secret.params]
	    if (params.on.indexOf('submit') !== -1) {
	      syncStateWithElement(elem)
	    }
	  }
	}

	function toType (value, type) {
	  if (value === '') return undefined
	  if (value === undefined) return ''
	  if (type === 'string') return String(value)
	  else if (type === 'number') return Number(value)
	  else if (type === 'boolean') return Boolean(value)
	  else if (type === 'date') return new Date(value)
	  return value
	}

	function getValue (state, name) {
	  const tokens = name.split('.')
	  let value = state
	  for (let token of tokens) {
	    value = value[token]
	  }
	  return value
	}

	function setValue (state, name, value) {
	  const tokens = name.split('.')
	  const propName = tokens.pop()
	  let parent = state
	  for (let token of tokens) {
	    parent = parent[token]
	  }
	  parent[propName] = value
	}


/***/ },
/* 28 */
/***/ function(module, exports) {

	'use strict'

	function bind (elem) {
	  if (!elem.nodeType === 1) return

	  if (isInput(elem)) {
	    elem.$bindable({
	      mode: 'two-way',
	      on: elem.form ? 'submit' : 'change',
	      type: getType(elem)
	    })
	  }
	}
	bind.$name = 'bind'
	bind.$require = ['bindable']
	module.exports = bind

	function isInput (elem) {
	  const tagName = elem.tagName
	  return (tagName === 'INPUT' || tagName === 'SELECT' || tagName === 'TEXTAREA')
	}

	function getType (elem) {
	  if (elem.tagName === 'INPUT') {
	    if (elem.type === 'checkbox') {
	      return 'boolean'
	    }
	    if (elem.type === 'number' || elem.type === 'range' || elem.type === 'week') {
	      return 'number'
	    }
	    if (elem.type === 'date' || elem.type === 'datetime') {
	      return 'date'
	    }
	    if (elem.type === 'datetime-local' || elem.type === 'month') {
	      return 'date'
	    }
	  }
	  return 'string'
	}


/***/ },
/* 29 */
/***/ function(module, exports) {

	'use strict'

	function style (elem) {
	  if (elem.nodeType !== 1) return

	  elem.$attribute('class', classAttribute)
	  elem.$attribute('style', styleAttribute)
	}
	style.$name = 'style'
	style.$require = ['attributes']
	module.exports = style

	function classAttribute (classes) {
	  if (typeof classes === 'object') {
	    for (var item in classes) {
	      if (classes[item]) {
	        this.classList.add(item)
	      } else if (this.className) {
	        this.classList.remove(item)
	      }
	    }
	  } else if (this.className !== classes) {
	    this.className = classes
	  }
	}

	function styleAttribute (styles) {
	  if (typeof styles === 'object') {
	    Object.assign(this.style, styles)
	  } else if (this.style.cssText !== styles) {
	    this.style.cssText = styles
	  }
	}


/***/ },
/* 30 */
/***/ function(module, exports) {

	'use strict'

	const secret = {
	  entering: Symbol('during entering animation'),
	  leaving: Symbol('during leaving animation'),
	  moveTransition: Symbol('watch move transition'),
	  position: Symbol('animated element position'),
	  parent: Symbol('parent node of leaving node'),
	  listening: Symbol('listening for animationend')
	}
	const watchedNodes = new Set()
	let checkQueued = false

	function onAnimationEnd (ev) {
	  const elem = ev.target
	  if (elem[secret.leaving]) {
	    elem.remove()
	  }
	  if (elem[secret.entering]) {
	    elem.style.animation = ''
	    elem[secret.entering] = false
	  }
	}

	function animate (elem) {
	  if (elem.nodeType !== 1) return

	  elem.$attribute('enter-animation', enterAttribute)
	  elem.$attribute('leave-animation', leaveAttribute)
	  elem.$attribute('move-animation', moveAttribute)

	  queueCheck()
	  elem.$cleanup(queueCheck)
	}
	animate.$name = 'animate'
	animate.$require = ['attributes']
	module.exports = animate

	function enterAttribute (animation) {
	  if (this[secret.entering] !== false) {
	    this[secret.entering] = true
	    if (typeof animation === 'object' && animation) {
	      animation = animationObjectToString(animation)
	    } else if (typeof animation === 'string') {
	      animation = animation
	    }
	    this.style.animation = animation
	    setAnimationDefaults(this)
	    registerListener(this)
	  }
	}

	function leaveAttribute (animation) {
	  if (!this[secret.parent]) {
	    watchedNodes.add(this)
	    this.$cleanup(unwatch)
	    this.$cleanup(onLeave, animation)
	    this[secret.parent] = this.parentNode
	    registerListener(this)
	  }
	}

	function registerListener (elem) {
	  const root = elem.$root
	  if (!root[secret.listening]) {
	    root.addEventListener('animationend', onAnimationEnd, true)
	    root[secret.listening] = true
	  }
	}

	function onLeave (animation) {
	  this[secret.leaving] = true
	  if (typeof animation === 'object' && animation) {
	    animation = animationObjectToString(animation)
	  } else if (typeof animation === 'string') {
	    animation = animation
	  }
	  this.style.animation = animation
	  setAnimationDefaults(this)

	  this[secret.parent].appendChild(this)
	  if (shouldAbsolutePosition(this)) {
	    toAbsolutePosition(this)
	  }
	}

	function moveAttribute (transition) {
	  if (!this[secret.moveTransition]) {
	    watchedNodes.add(this)
	    this.$cleanup(unwatch)
	    this[secret.moveTransition] = true
	  }
	  if (typeof transition === 'object' && transition) {
	    transition = 'transform ' + transitionObjectToString(transition)
	  } else if (typeof transition === 'string') {
	    transition = 'transform ' + transition
	  } else {
	    transition = 'transform'
	  }
	  this.style.transition = transition
	  setTransitionDefaults(this)
	}

	function unwatch () {
	  watchedNodes.delete(this)
	}

	function queueCheck () {
	  if (!checkQueued) {
	    checkQueued = true
	    requestAnimationFrame(checkWatchedNodes)
	  }
	}

	function checkWatchedNodes () {
	  for (let elem of watchedNodes) {
	    const position = {
	      left: elem.offsetLeft,
	      top: elem.offsetTop
	    }
	    const prevPosition = elem[secret.position] || {}
	    elem[secret.position] = position

	    const xDiff = (prevPosition.left - position.left) || 0
	    const yDiff = (prevPosition.top - position.top) || 0
	    if (elem[secret.moveTransition] && (xDiff || yDiff)) {
	      onMove(elem, xDiff, yDiff)
	    }
	  }
	  checkQueued = false
	}

	function onMove (elem, xDiff, yDiff) {
	  const style = elem.style
	  const transition = style.transition
	  style.transition = ''
	  style.transform = `translate3d(${xDiff}px, ${yDiff}px, 0)`
	  requestAnimationFrame(() => {
	    style.transition = transition
	    style.transform = ''
	  })
	}

	function animationObjectToString (animation) {
	  return [
	    animation.name,
	    timeToString(animation.duration),
	    animation.timingFunction,
	    timeToString(animation.delay),
	    animation.iterationCount,
	    animation.direction,
	    animation.fillMode,
	    boolToPlayState(animation.playState)
	  ].join(' ')
	}

	function transitionObjectToString (transition) {
	  return [
	    timeToString(transition.duration),
	    timeToString(transition.delay),
	    transition.timingFunction
	  ].join(' ')
	}

	function setAnimationDefaults (elem) {
	  const style = elem.style
	  const duration = style.animationDuration
	  const fillMode = style.animationFillMode
	  if (duration === 'initial' || duration === '' || duration === '0s') {
	    style.animationDuration = '1s'
	  }
	  if (fillMode === 'initial' || fillMode === '' || fillMode === 'none') {
	    style.animationFillMode = 'both'
	  }
	}

	function setTransitionDefaults (elem) {
	  const style = elem.style
	  const duration = style.transitionDuration
	  if (duration === 'initial' || duration === '' || duration === '0s') {
	    style.transitionDuration = '1s'
	  }
	}

	function shouldAbsolutePosition (elem) {
	  elem = elem.parentNode
	  while (elem && elem !== elem.$root) {
	    if (elem[secret.leaving]) return false
	    elem = elem.parentNode
	  }
	  return true
	}

	function toAbsolutePosition (elem) {
	  const style = elem.style
	  const position = elem[secret.position]
	  style.left = `${position.left}px`
	  style.top = `${position.top}px`
	  style.margin = '0'
	  style.width = '-moz-max-content'
	  style.width = '-webkit-max-content'
	  style.width = 'max-content'
	  style.position = 'absolute'
	}

	function timeToString (time) {
	  return (typeof time === 'number') ? time + 'ms' : time
	}

	function boolToPlayState (bool) {
	  return (bool === false || bool === 'paused') ? 'paused' : 'running'
	}


/***/ },
/* 31 */
/***/ function(module, exports) {

	'use strict'

	const secret = {
	  config: Symbol('router config')
	}
	const rootRouters = new Set()
	let cloneId = 0

	window.addEventListener('popstate', onPopState, true)

	function onPopState (ev) {
	  for (let router of rootRouters) {
	    routeRouterAndChildren(router, history.state.route)
	  }
	}

	function router (router) {
	  if (router.nodeType !== 1) {
	    throw new Error('router only works with element nodes')
	  }
	  setupRouter(router)
	  extractViews(router)
	  routeRouterAndChildren(router, absoluteToRelativeRoute(router, history.state.route))
	}
	router.$name = 'router'
	module.exports = router

	function setupRouter (router) {
	  router[secret.config] = {
	    children: new Set(),
	    templates: new Map()
	  }
	  const parentRouter = findParentRouter(router)
	  if (parentRouter) {
	    router.$routerLevel = parentRouter.$routerLevel + 1
	    const siblingRouters = parentRouter[secret.config].children
	    siblingRouters.add(router)
	    router.$cleanup(cleanupRouter, siblingRouters)
	  } else {
	    router.$routerLevel = 1
	    rootRouters.add(router)
	    router.$cleanup(cleanupRouter, rootRouters)
	  }
	}

	function cleanupRouter (siblingRouters) {
	  siblingRouters.delete(this)
	}

	function absoluteToRelativeRoute (router, route) {
	  return route.slice(router.$routerLevel - 1)
	}

	function extractViews (router) {
	  let child = router.firstChild
	  while (child) {
	    if (child.nodeType === 1 && child.hasAttribute('route')) {
	      const route = child.getAttribute('route')
	      router[secret.config].templates.set(route, child)
	      if (child.hasAttribute('default-route')) {
	        router[secret.config].defaultView = route
	      }
	    }
	    child.remove()
	    child = router.firstChild
	  }
	}

	function findParentRouter (node) {
	  node = node.parentNode
	  while (node && node.$routerLevel === undefined) {
	    node = node.parentNode
	  }
	  return node
	}

	function routeRouterAndChildren (router, route) {
	  route = route.slice()
	  const config = router[secret.config]
	  const templates = config.templates
	  const defaultView = config.defaultView
	  const prevView = router.$currentView
	  let nextView = route.shift()

	  if (!templates.has(nextView) && templates.has(defaultView)) {
	    nextView = defaultView
	  }
	  if (prevView !== nextView) {
	    const eventConfig = {
	      bubbles: true,
	      cancelable: true,
	      detail: {
	        from: prevView,
	        to: nextView
	      }
	    }
	    const routeEvent = new CustomEvent('route', eventConfig)
	    router.dispatchEvent(routeEvent)

	    if (!routeEvent.defaultPrevented) {
	      routeRouter(router, nextView)
	      router.$currentView = nextView
	    }
	  } else {
	    routeChildren(router, route)
	  }
	}

	function routeRouter (router, nextView) {
	  router.innerHTML = ''
	  const template = router[secret.config].templates.get(nextView)
	  if (template) {
	    router.appendChild(document.importNode(template, true))
	  }
	}

	function routeChildren (router, route) {
	  for (let childRouter of router[secret.config].children) {
	    routeRouterAndChildren(childRouter, route)
	  }
	}


/***/ },
/* 32 */
/***/ function(module, exports) {

	'use strict'

	const secret = {
	  config: Symbol('params sync config'),
	  initSynced: Symbol('node initial synced')
	}
	const watchedNodes = new Set()

	window.addEventListener('popstate', onPopState)

	function onPopState (ev) {
	  for (let node of watchedNodes) {
	    if (document.body.contains(node)) { // TODO -> refine this a bit! I need a better check
	      syncStateWithParams(node)
	      syncParamsWithState(node, false)
	    }
	  }
	}

	module.exports = function paramsFactory (config) {
	  function params (node, state, next) {
	    node[secret.config] = config
	    watchedNodes.add(node)
	    node.$cleanup(unwatch)

	    syncStateWithParams(node)
	    next()
	    syncParamsWithState(node, false)
	    node.$observe(syncParamsWithState, node, true)
	  }
	  params.$name = 'params'
	  params.$require = ['observe']
	  return params
	}

	function unwatch () {
	  watchedNodes.delete(this)
	}

	function syncStateWithParams (node) {
	  const params = history.state.params
	  const state = node.$state
	  const config = node[secret.config]

	  for (let paramName in config) {
	    const param = params[paramName] || config[paramName].default
	    if (config[paramName].required && param === undefined) {
	      throw new Error(`${paramName} is a required parameter`)
	    }
	    const type = config[paramName].type
	    if (state[paramName] !== param) {
	      if (param === undefined) {
	        state[paramName] = undefined
	      } else if (type === 'number') {
	        state[paramName] = Number(param)
	      } else if (type === 'boolean') {
	        state[paramName] = Boolean(param)
	      } else if (type === 'date') {
	        state[paramName] = new Date(param)
	      } else {
	        state[paramName] = decodeURI(param)
	      }
	    }
	  }
	}

	function syncParamsWithState (node, shouldUpdateHistory) {
	  const params = history.state.params
	  const state = node.$state
	  const config = node[secret.config]
	  let newParams = {}
	  let paramsChanged = false
	  let historyChanged = false

	  for (let paramName in config) {
	    if (params[paramName] !== state[paramName]) {
	      if (config[paramName].readOnly) {
	        throw new Error(`${paramName} is readOnly`)
	      }
	      newParams[paramName] = state[paramName]
	      paramsChanged = true
	      if (config[paramName].history && shouldUpdateHistory) {
	        historyChanged = true
	      }
	    }
	  }
	  if (paramsChanged) {
	    updateHistory(newParams, historyChanged)
	  }
	}

	function updateHistory (params, historyChanged) {
	  params = Object.assign({}, history.state.params, params)

	  const url = location.pathname + paramsToQuery(params)
	  if (historyChanged) {
	    history.pushState({route: history.state.route, params}, '', url)
	  } else {
	    history.replaceState({route: history.state.route, params}, '', url)
	  }
	}

	function paramsToQuery (params) {
	  let query = ''
	  for (let paramName in params) {
	    const param = params[paramName]
	    if (param !== undefined) {
	      query += `${paramName}=${param}&`
	    }
	  }
	  if (query !== '') {
	    query = '?' + query.slice(0, -1)
	  }
	  return query
	}


/***/ },
/* 33 */
/***/ function(module, exports) {

	'use strict'

	const secret = {
	  config: Symbol('ref config')
	}

	updateHistory(pathToRoute(location.pathname), queryToParams(location.search), {history: false})

	function ref (elem) {
	  if (elem.nodeType !== 1) return

	  elem.$route = $route
	  if (elem.tagName === 'A') {
	    elem.$attribute('iref', irefAttribute)
	    elem.$attribute('iref-params', irefParamsAttribute)
	    elem.$attribute('iref-options', irefOptionsAttribute)
	  }
	}
	ref.$name = 'ref'
	ref.$require = ['attributes']
	module.exports = ref

	function irefAttribute (path) {
	  const config = this[secret.config] = this[secret.config] || {}
	  config.path = path

	  let route = pathToRoute(path)
	  if (route.some(filterRelativeTokens)) {
	    route = relativeToAbsoluteRoute(this, route)
	  }
	  this.href = routeToPath(route) + (this.search || '')
	  this.addEventListener('click', onClick, true)
	}

	function irefParamsAttribute (params) {
	  const config = this[secret.config] = this[secret.config] || {}
	  config.params = params
	  this.href = (this.pathname || '') + paramsToQuery(params)
	  this.addEventListener('click', onClick, true)
	}

	function onClick (ev) {
	  const config = this[secret.config]
	  if (config) {
	    this.$route(config.path, config.params, config.options)
	    ev.preventDefault()
	  }
	}

	function irefOptionsAttribute (options) {
	  const config = this[secret.config] = this[secret.config] || {}
	  config.options = options
	}

	function $route (path, params, options) {
	  params = params || {}
	  options = options || {}
	  let route = pathToRoute(path)
	  if (route.some(filterRelativeTokens)) {
	    route = relativeToAbsoluteRoute(this, route)
	  }
	  updateHistory(route, params, options)
	  window.scroll(0, 0)
	}

	function relativeToAbsoluteRoute (node, relativeRoute) {
	  let router = findParentRouter(node)
	  let routerLevel = router ? router.$routerLevel : 0

	  for (let token of relativeRoute) {
	    if (token === '..') routerLevel--
	  }
	  if (routerLevel < 0) {
	    throw new Error('invalid relative route')
	  }

	  const currentRoute = []
	  while (router) {
	    currentRoute.unshift(router.$currentView)
	    router = findParentRouter(router)
	  }
	  const route = relativeRoute.filter(filterAbsoluteTokens)
	  return currentRoute.slice(0, routerLevel).concat(route)
	}

	function filterAbsoluteTokens (token) {
	  return (token !== '..' && token !== '.')
	}

	function filterRelativeTokens (token) {
	  return (token === '..' || token === '.')
	}

	function filterEmptyTokens (token) {
	  return (token !== '')
	}

	function findParentRouter (node) {
	  node = node.parentNode
	  while (node && node.$routerLevel === undefined) {
	    node = node.parentNode
	  }
	  return node
	}

	function updateHistory (route, params, options) {
	  if (options.inherit) {
	    params = Object.assign({}, history.state.params, params)
	  }

	  const url = routeToPath(route) + paramsToQuery(params)
	  if (options.history === false) {
	    history.replaceState({route, params}, '', url)
	  } else {
	    history.pushState({route, params}, '', url)
	  }

	  const eventConfig = {bubbles: true, cancelable: false }
	  document.dispatchEvent(new Event('popstate', eventConfig))
	}

	function routeToPath (route) {
	  return route ? '/' + route.join('/') : ''
	}

	function pathToRoute (path) {
	  return path.split('/').filter(filterEmptyTokens)
	}

	function paramsToQuery (params) {
	  params = params || {}
	  let query = ''
	  for (let paramName in params) {
	    const param = params[paramName]
	    if (param !== undefined) {
	      query += `${paramName}=${param}&`
	    }
	  }
	  if (query !== '') {
	    query = '?' + query.slice(0, -1)
	  }
	  return query
	}

	function queryToParams (query) {
	  if (query[0] === '?') {
	    query = query.slice(1)
	  }
	  query = query.split('&')

	  const params = {}
	  for (let keyValue of query) {
	    keyValue = keyValue.split('=')
	    if (keyValue.length === 2) {
	      params[keyValue[0]] = keyValue[1]
	    }
	  }
	  return params
	}


/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	const observer = __webpack_require__(35)

	function observe (node, state) {
	  node.$contextState = observer.observable(node.$contextState)
	  node.$state = observer.observable(node.$state)

	  node.$observe = $observe
	  node.$queue = $queue
	  node.$unobserve = observer.unobserve
	}
	observe.$name = 'observe'
	module.exports = observe

	function $observe (fn, ...args) {
	  args.unshift(fn, this)
	  const signal = observer.observe.apply(null, args)
	  this.$cleanup(observer.unobserve, signal)
	  return signal
	}

	function $queue (fn, ...args) {
	  args.unshift(fn, this)
	  return observer.queue.apply(null, args)
	}


/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	module.exports = __webpack_require__(36)


/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	const nextTick = __webpack_require__(37)
	const builtIns = __webpack_require__(38)
	const wellKnowSymbols = __webpack_require__(43)

	const proxies = new WeakMap()
	const observers = new WeakMap()
	const queuedObservers = new Set()
	const enumerate = Symbol('enumerate')
	let queued = false
	let currentObserver
	const handlers = {get, ownKeys, set, deleteProperty}

	module.exports = {
	  observe,
	  unobserve,
	  queue,
	  observable,
	  isObservable
	}

	function observe (fn, context, ...args) {
	  if (typeof fn !== 'function') {
	    throw new TypeError('first argument must be a function')
	  }
	  args = args.length ? args : undefined
	  const observer = {fn, context, args, observedKeys: []}
	  queueObserver(observer)
	  return observer
	}

	function unobserve (observer) {
	  if (typeof observer === 'object') {
	    if (observer.observedKeys) {
	      observer.observedKeys.forEach(unobserveKey, observer)
	    }
	    observer.fn = observer.context = observer.args = observer.observedKeys = undefined
	  }
	}

	function queue (fn, context, ...args) {
	  if (typeof fn !== 'function') {
	    throw new TypeError('first argument must be a function')
	  }
	  args = args.length ? args : undefined
	  const observer = {fn, context, args, once: true}
	  queueObserver(observer)
	  return observer
	}

	function observable (obj) {
	  obj = obj || {}
	  if (typeof obj !== 'object') {
	    throw new TypeError('first argument must be an object or undefined')
	  }
	  return proxies.get(obj) || toObservable(obj)
	}

	function toObservable (obj) {
	  let observable
	  const builtIn = builtIns.get(obj.constructor)
	  if (typeof builtIn === 'function') {
	    observable = builtIn(obj, registerObserver, queueObservers)
	  } else if (!builtIn) {
	    observable = new Proxy(obj, handlers)
	  } else {
	    observable = obj
	  }
	  proxies.set(obj, observable)
	  proxies.set(observable, observable)
	  observers.set(obj, new Map())
	  return observable
	}

	function isObservable (obj) {
	  if (typeof obj !== 'object') {
	    throw new TypeError('first argument must be an object')
	  }
	  return (proxies.get(obj) === obj)
	}

	function get (target, key, receiver) {
	  if (key === '$raw') return target
	  const result = Reflect.get(target, key, receiver)
	  if (typeof key === 'symbol' && wellKnowSymbols.has(key)) {
	    return result
	  }
	  const isObject = (typeof result === 'object' && result)
	  const observable = isObject && proxies.get(result)
	  if (currentObserver) {
	    registerObserver(target, key)
	    if (isObject) {
	      return observable || toObservable(result)
	    }
	  }
	  return observable || result
	}

	function registerObserver (target, key) {
	  if (currentObserver) {
	    const observersForTarget = observers.get(target)
	    let observersForKey = observersForTarget.get(key)
	    if (!observersForKey) {
	      observersForKey = new Set()
	      observersForTarget.set(key, observersForKey)
	    }
	    if (!observersForKey.has(currentObserver)) {
	      observersForKey.add(currentObserver)
	      currentObserver.observedKeys.push(observersForKey)
	    }
	  }
	}

	function ownKeys (target) {
	  registerObserver(target, enumerate)
	  return Reflect.ownKeys(target)
	}

	function set (target, key, value, receiver) {
	  if (key === 'length' || value !== Reflect.get(target, key, receiver)) {
	    queueObservers(target, key)
	    queueObservers(target, enumerate)
	  }
	  if (typeof value === 'object' && value) {
	    value = value.$raw || value
	  }
	  return Reflect.set(target, key, value, receiver)
	}

	function deleteProperty (target, key) {
	  if (Reflect.has(target, key)) {
	    queueObservers(target, key)
	    queueObservers(target, enumerate)
	  }
	  return Reflect.deleteProperty(target, key)
	}

	function queueObservers (target, key) {
	  const observersForKey = observers.get(target).get(key)
	  if (observersForKey) {
	    observersForKey.forEach(queueObserver)
	  }
	}

	function queueObserver (observer) {
	  if (!queued) {
	    nextTick(runObservers)
	    queued = true
	  }
	  queuedObservers.add(observer)
	}

	function runObservers () {
	  queuedObservers.forEach(runObserver)
	  queuedObservers.clear()
	  queued = false
	}

	function runObserver (observer) {
	  if (observer.fn) {
	    if (observer.once) {
	      observer.fn.apply(observer.context, observer.args)
	      unobserve(observer)
	    } else {
	      try {
	        currentObserver = observer
	        observer.fn.apply(observer.context, observer.args)
	      } finally {
	        currentObserver = undefined
	      }
	    }
	  }
	}

	function unobserveKey (observersForKey) {
	  observersForKey.delete(this)
	}


/***/ },
/* 37 */
/***/ function(module, exports) {

	'use strict'

	let promise = Promise.resolve()
	let mutateWithTask
	let currTask

	module.exports = function nextTick (task) {
	  currTask = task
	  if (mutateWithTask) {
	    mutateWithTask()
	  } else {
	    promise = promise.then(task)
	  }
	}

	if (typeof MutationObserver !== 'undefined') {
	  let counter = 0
	  const observer = new MutationObserver(onTask)
	  const textNode = document.createTextNode(String(counter))
	  observer.observe(textNode, {characterData: true})

	  mutateWithTask = function mutateWithTask () {
	    counter = (counter + 1) % 2
	    textNode.textContent = counter
	  }
	}

	function onTask () {
	  if (currTask) {
	    currTask()
	  }
	}


/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	const MapShim = __webpack_require__(39)
	const SetShim = __webpack_require__(40)
	const WeakMapShim = __webpack_require__(41)
	const WeakSetShim = __webpack_require__(42)

	module.exports = new Map([
	  [Map, MapShim],
	  [Set, SetShim],
	  [WeakMap, WeakMapShim],
	  [WeakSet, WeakSetShim],
	  [Date, true],
	  [RegExp, true]
	])


/***/ },
/* 39 */
/***/ function(module, exports) {

	'use strict'

	const native = Map.prototype
	const masterKey = Symbol('Map master key')

	const getters = ['has', 'get']
	const iterators = ['forEach', 'keys', 'values', 'entries', Symbol.iterator]
	const all = ['set', 'delete', 'clear'].concat(getters, iterators)

	module.exports = function shim (target, registerObserver, queueObservers) {
	  target.$raw = {}

	  for (let method of all) {
	    target.$raw[method] = function () {
	      native[method].apply(target, arguments)
	    }
	  }

	  for (let getter of getters) {
	    target[getter] = function (key) {
	      registerObserver(this, key)
	      return native[getter].apply(this, arguments)
	    }
	  }

	  for (let iterator of iterators) {
	    target[iterator] = function () {
	      registerObserver(this, masterKey)
	      return native[iterator].apply(this, arguments)
	    }
	  }

	  target.set = function (key, value) {
	    if (this.get(key) !== value) {
	      queueObservers(this, key)
	      queueObservers(this, masterKey)
	    }
	    return native.set.apply(this, arguments)
	  }

	  target.delete = function (key) {
	    if (this.has(key)) {
	      queueObservers(this, key)
	      queueObservers(this, masterKey)
	    }
	    return native.delete.apply(this, arguments)
	  }

	  target.clear = function () {
	    if (this.size) {
	      queueObservers(this, masterKey)
	    }
	    return native.clear.apply(this, arguments)
	  }

	  return target
	}


/***/ },
/* 40 */
/***/ function(module, exports) {

	'use strict'

	const native = Set.prototype
	const masterValue = Symbol('Set master value')

	const getters = ['has']
	const iterators = ['forEach', 'keys', 'values', 'entries', Symbol.iterator]
	const all = ['add', 'delete', 'clear'].concat(getters, iterators)

	module.exports = function shim (target, registerObserver, queueObservers) {
	  target.$raw = {}

	  for (let method of all) {
	    target.$raw[method] = function () {
	      native[method].apply(target, arguments)
	    }
	  }

	  for (let getter of getters) {
	    target[getter] = function (value) {
	      registerObserver(this, value)
	      return native[getter].apply(this, arguments)
	    }
	  }

	  for (let iterator of iterators) {
	    target[iterator] = function () {
	      registerObserver(this, masterValue)
	      return native[iterator].apply(this, arguments)
	    }
	  }

	  target.add = function (value) {
	    if (!this.has(value)) {
	      queueObservers(this, value)
	      queueObservers(this, masterValue)
	    }
	    return native.add.apply(this, arguments)
	  }

	  target.delete = function (value) {
	    if (this.has(value)) {
	      queueObservers(this, value)
	      queueObservers(this, masterValue)
	    }
	    return native.delete.apply(this, arguments)
	  }

	  target.clear = function () {
	    if (this.size) {
	      queueObservers(this, masterValue)
	    }
	    return native.clear.apply(this, arguments)
	  }

	  return target
	}


/***/ },
/* 41 */
/***/ function(module, exports) {

	'use strict'

	const native = WeakMap.prototype

	const getters = ['has', 'get']
	const all = ['set', 'delete'].concat(getters)

	module.exports = function shim (target, registerObserver, queueObservers) {
	  target.$raw = {}

	  for (let method of all) {
	    target.$raw[method] = function () {
	      native[method].apply(target, arguments)
	    }
	  }

	  for (let getter of getters) {
	    target[getter] = function (key) {
	      registerObserver(this, key)
	      return native[getter].apply(this, arguments)
	    }
	  }

	  target.set = function (key, value) {
	    if (this.get(key) !== value) {
	      queueObservers(this, key)
	    }
	    return native.set.apply(this, arguments)
	  }

	  target.delete = function (key) {
	    if (this.has(key)) {
	      queueObservers(this, key)
	    }
	    return native.delete.apply(this, arguments)
	  }

	  return target
	}


/***/ },
/* 42 */
/***/ function(module, exports) {

	'use strict'

	const native = WeakSet.prototype

	const getters = ['has']
	const all = ['add', 'delete'].concat(getters)

	module.exports = function shim (target, registerObserver, queueObservers) {
	  target.$raw = {}

	  for (let method of all) {
	    target.$raw[method] = function () {
	      native[method].apply(target, arguments)
	    }
	  }

	  for (let getter of getters) {
	    target[getter] = function (value) {
	      registerObserver(this, value)
	      return native[getter].apply(this, arguments)
	    }
	  }

	  target.add = function (value) {
	    if (!this.has(value)) {
	      queueObservers(this, value)
	    }
	    return native.add.apply(this, arguments)
	  }

	  target.delete = function (value) {
	    if (this.has(value)) {
	      queueObservers(this, value)
	    }
	    return native.delete.apply(this, arguments)
	  }

	  return target
	}


/***/ },
/* 43 */
/***/ function(module, exports) {

	'use strict'

	const wellKnowSymbols = new Set()

	for (let key of Object.getOwnPropertyNames(Symbol)) {
	  const value = Symbol[key]
	  if (typeof value === 'symbol') {
	    wellKnowSymbols.add(value)
	  }
	}

	module.exports = wellKnowSymbols


/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	module.exports = {
	  app: __webpack_require__(45),
	  page: __webpack_require__(46),
	  rendered: __webpack_require__(47),
	  router: __webpack_require__(48)
	}


/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	const component = __webpack_require__(3)
	const middlewares = __webpack_require__(14)

	module.exports = function app (config) {
	  config = Object.assign({root: true, isolate: 'middlewares'}, config)

	  return component(config)
	    .useOnContent(middlewares.observe)
	    .useOnContent(middlewares.interpolate)
	    .useOnContent(middlewares.attributes)
	    .useOnContent(middlewares.style)
	    .useOnContent(middlewares.animate)
	    .useOnContent(middlewares.ref)
	    .useOnContent(middlewares.flow)
	    .useOnContent(middlewares.bindable)
	    .useOnContent(middlewares.bind)
	    .useOnContent(middlewares.events)
	}


/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	const component = __webpack_require__(3)
	const middlewares = __webpack_require__(14)

	module.exports = function page (config) {
	  config = config || {}

	  return component(config)
	    .use(middlewares.render(config))
	    .use(middlewares.params(config.params))
	}


/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	const component = __webpack_require__(3)
	const middlewares = __webpack_require__(14)

	module.exports = function rendered (config) {
	  config = config || {}

	  return component(config)
	    .use(middlewares.render(config))
	}


/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	const component = __webpack_require__(3)
	const middlewares = __webpack_require__(14)

	module.exports = function router (config) {
	  config = Object.assign({state: false}, config)

	  return component(config)
	    .use(middlewares.route)
	}


/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	module.exports = {
	  compiler: __webpack_require__(16),
	  observer: __webpack_require__(35),
	  dom: __webpack_require__(26)
	}


/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	const compiler = __webpack_require__(16)
	const filters = __webpack_require__(51)

	for (let name in filters) {
	  compiler.filter(name, filters[name])
	}


/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	module.exports = {
	  capitalize: __webpack_require__(52),
	  uppercase: __webpack_require__(53),
	  lowercase: __webpack_require__(54),
	  unit: __webpack_require__(55),
	  json: __webpack_require__(56),
	  slice: __webpack_require__(57),
	  date: __webpack_require__(58),
	  time: __webpack_require__(59),
	  datetime: __webpack_require__(60)
	}


/***/ },
/* 52 */
/***/ function(module, exports) {

	'use strict'

	module.exports = function capitalize (value) {
	  if (value === undefined) {
	    return value
	  }
	  value = String(value)
	  return value.charAt(0).toUpperCase() + value.slice(1)
	}


/***/ },
/* 53 */
/***/ function(module, exports) {

	'use strict'

	module.exports = function uppercase (value) {
	  if (value === undefined) {
	    return value
	  }
	  return String(value).toUpperCase()
	}


/***/ },
/* 54 */
/***/ function(module, exports) {

	'use strict'

	module.exports = function lowercase (value) {
	  if (value === undefined) {
	    return value
	  }
	  return String(value).toLowerCase()
	}


/***/ },
/* 55 */
/***/ function(module, exports) {

	'use strict'

	module.exports = function unit (value, unitName, postfix) {
	  unitName = unitName || 'item'
	  postfix = postfix || 's'
	  if (isNaN(value)) {
	    return value + ' ' + unitName
	  }
	  let result = value + ' ' + unitName
	  if (value !== 1) result += postfix
	  return result
	}


/***/ },
/* 56 */
/***/ function(module, exports) {

	'use strict'

	module.exports = function json (value, indent) {
	  if (value === undefined) {
	    return value
	  }
	  return JSON.stringify(value, null, indent)
	}


/***/ },
/* 57 */
/***/ function(module, exports) {

	'use strict'

	module.exports = function slice (value, begin, end) {
	  if (value === undefined) {
	    return value
	  }
	  return value.slice(begin, end)
	}


/***/ },
/* 58 */
/***/ function(module, exports) {

	'use strict'

	module.exports = function date (value) {
	  if (value instanceof Date) {
	    return value.toLocaleDateString()
	  }
	  return value
	}


/***/ },
/* 59 */
/***/ function(module, exports) {

	'use strict'

	module.exports = function time (value) {
	  if (value instanceof Date) {
	    return value.toLocaleTimeString()
	  }
	  return value
	}


/***/ },
/* 60 */
/***/ function(module, exports) {

	'use strict'

	module.exports = function datetime (value) {
	  if (value instanceof Date) {
	    return value.toLocaleString()
	  }
	  return value
	}


/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	const compiler = __webpack_require__(16)
	const limiters = __webpack_require__(62)

	for (let name in limiters) {
	  compiler.limiter(name, limiters[name])
	}


/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	module.exports = {
	  if: __webpack_require__(63),
	  delay: __webpack_require__(64),
	  debounce: __webpack_require__(65),
	  throttle: __webpack_require__(66),
	  key: __webpack_require__(67)
	}


/***/ },
/* 63 */
/***/ function(module, exports) {

	'use strict'

	module.exports = function ifLimiter (next, context, condition) {
	  if (condition) {
	    next()
	  }
	}


/***/ },
/* 64 */
/***/ function(module, exports) {

	'use strict'

	module.exports = function delay (next, context, time) {
	  if (time === undefined || isNaN(time)) {
	    time = 200
	  }
	  setTimeout(next, time)
	}


/***/ },
/* 65 */
/***/ function(module, exports) {

	'use strict'

	const timer = Symbol('debounce timer')

	module.exports = function debounce (next, context, delay) {
	  if (delay === undefined || isNaN(delay)) {
	    delay = 200
	  }
	  clearTimeout(context[timer])
	  context[timer] = setTimeout(next, delay)
	}


/***/ },
/* 66 */
/***/ function(module, exports) {

	'use strict'

	const lastExecution = Symbol('throttle last execution')

	module.exports = function throttle (next, context, threshold) {
	  if (threshold === undefined || isNaN(threshold)) {
	    threshold = 200
	  }

	  const last = context[lastExecution]
	  const now = Date.now()
	  if (!last || (last + threshold) < now) {
	    context[lastExecution] = now
	    next()
	  }
	}


/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	const stringToCode = __webpack_require__(68)

	module.exports = function keyLimiter (next, context, ...keys) {
	  if (!(context.$event instanceof KeyboardEvent)) {
	    return next()
	  }

	  const keyCodes = keys.map(stringToCode)
	  const keyCode = context.$event.keyCode || context.$event.which
	  if (keyCodes.indexOf(keyCode) !== -1) {
	    next()
	  }
	}


/***/ },
/* 68 */
/***/ function(module, exports) {

	// Source: http://jsfiddle.net/vWx8V/
	// http://stackoverflow.com/questions/5603195/full-list-of-javascript-keycodes

	/**
	 * Conenience method returns corresponding value for given keyName or keyCode.
	 *
	 * @param {Mixed} keyCode {Number} or keyName {String}
	 * @return {Mixed}
	 * @api public
	 */

	exports = module.exports = function(searchInput) {
	  // Keyboard Events
	  if (searchInput && 'object' === typeof searchInput) {
	    var hasKeyCode = searchInput.which || searchInput.keyCode || searchInput.charCode
	    if (hasKeyCode) searchInput = hasKeyCode
	  }

	  // Numbers
	  if ('number' === typeof searchInput) return names[searchInput]

	  // Everything else (cast to string)
	  var search = String(searchInput)

	  // check codes
	  var foundNamedKey = codes[search.toLowerCase()]
	  if (foundNamedKey) return foundNamedKey

	  // check aliases
	  var foundNamedKey = aliases[search.toLowerCase()]
	  if (foundNamedKey) return foundNamedKey

	  // weird character?
	  if (search.length === 1) return search.charCodeAt(0)

	  return undefined
	}

	/**
	 * Get by name
	 *
	 *   exports.code['enter'] // => 13
	 */

	var codes = exports.code = exports.codes = {
	  'backspace': 8,
	  'tab': 9,
	  'enter': 13,
	  'shift': 16,
	  'ctrl': 17,
	  'alt': 18,
	  'pause/break': 19,
	  'caps lock': 20,
	  'esc': 27,
	  'space': 32,
	  'page up': 33,
	  'page down': 34,
	  'end': 35,
	  'home': 36,
	  'left': 37,
	  'up': 38,
	  'right': 39,
	  'down': 40,
	  'insert': 45,
	  'delete': 46,
	  'command': 91,
	  'left command': 91,
	  'right command': 93,
	  'numpad *': 106,
	  'numpad +': 107,
	  'numpad -': 109,
	  'numpad .': 110,
	  'numpad /': 111,
	  'num lock': 144,
	  'scroll lock': 145,
	  'my computer': 182,
	  'my calculator': 183,
	  ';': 186,
	  '=': 187,
	  ',': 188,
	  '-': 189,
	  '.': 190,
	  '/': 191,
	  '`': 192,
	  '[': 219,
	  '\\': 220,
	  ']': 221,
	  "'": 222
	}

	// Helper aliases

	var aliases = exports.aliases = {
	  'windows': 91,
	  '⇧': 16,
	  '⌥': 18,
	  '⌃': 17,
	  '⌘': 91,
	  'ctl': 17,
	  'control': 17,
	  'option': 18,
	  'pause': 19,
	  'break': 19,
	  'caps': 20,
	  'return': 13,
	  'escape': 27,
	  'spc': 32,
	  'pgup': 33,
	  'pgdn': 34,
	  'ins': 45,
	  'del': 46,
	  'cmd': 91
	}


	/*!
	 * Programatically add the following
	 */

	// lower case chars
	for (i = 97; i < 123; i++) codes[String.fromCharCode(i)] = i - 32

	// numbers
	for (var i = 48; i < 58; i++) codes[i - 48] = i

	// function keys
	for (i = 1; i < 13; i++) codes['f'+i] = i + 111

	// numpad keys
	for (i = 0; i < 10; i++) codes['numpad '+i] = i + 96

	/**
	 * Get by code
	 *
	 *   exports.name[13] // => 'Enter'
	 */

	var names = exports.names = exports.title = {} // title for backward compat

	// Create reverse mapping
	for (i in codes) names[codes[i]] = i

	// Add aliases
	for (var alias in aliases) {
	  codes[alias] = aliases[alias]
	}


/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	// use Firebase and EventListener for simple real-time updates
	const Firebase = __webpack_require__(70)
	const EventListener = __webpack_require__(71)

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


/***/ },
/* 70 */
/***/ function(module, exports) {

	/*! @license Firebase v2.4.2
	    License: https://www.firebase.com/terms/terms-of-service.html */
	(function() {var h,n=this;function p(a){return void 0!==a}function aa(){}function ba(a){a.yb=function(){return a.zf?a.zf:a.zf=new a}}
	function ca(a){var b=typeof a;if("object"==b)if(a){if(a instanceof Array)return"array";if(a instanceof Object)return b;var c=Object.prototype.toString.call(a);if("[object Window]"==c)return"object";if("[object Array]"==c||"number"==typeof a.length&&"undefined"!=typeof a.splice&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("splice"))return"array";if("[object Function]"==c||"undefined"!=typeof a.call&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("call"))return"function"}else return"null";
	else if("function"==b&&"undefined"==typeof a.call)return"object";return b}function da(a){return"array"==ca(a)}function ea(a){var b=ca(a);return"array"==b||"object"==b&&"number"==typeof a.length}function q(a){return"string"==typeof a}function fa(a){return"number"==typeof a}function r(a){return"function"==ca(a)}function ga(a){var b=typeof a;return"object"==b&&null!=a||"function"==b}function ha(a,b,c){return a.call.apply(a.bind,arguments)}
	function ia(a,b,c){if(!a)throw Error();if(2<arguments.length){var d=Array.prototype.slice.call(arguments,2);return function(){var c=Array.prototype.slice.call(arguments);Array.prototype.unshift.apply(c,d);return a.apply(b,c)}}return function(){return a.apply(b,arguments)}}function u(a,b,c){u=Function.prototype.bind&&-1!=Function.prototype.bind.toString().indexOf("native code")?ha:ia;return u.apply(null,arguments)}var ja=Date.now||function(){return+new Date};
	function ka(a,b){function c(){}c.prototype=b.prototype;a.ph=b.prototype;a.prototype=new c;a.prototype.constructor=a;a.lh=function(a,c,f){for(var g=Array(arguments.length-2),k=2;k<arguments.length;k++)g[k-2]=arguments[k];return b.prototype[c].apply(a,g)}};function la(a){if(Error.captureStackTrace)Error.captureStackTrace(this,la);else{var b=Error().stack;b&&(this.stack=b)}a&&(this.message=String(a))}ka(la,Error);la.prototype.name="CustomError";function v(a,b){for(var c in a)b.call(void 0,a[c],c,a)}function ma(a,b){var c={},d;for(d in a)c[d]=b.call(void 0,a[d],d,a);return c}function na(a,b){for(var c in a)if(!b.call(void 0,a[c],c,a))return!1;return!0}function oa(a){var b=0,c;for(c in a)b++;return b}function pa(a){for(var b in a)return b}function qa(a){var b=[],c=0,d;for(d in a)b[c++]=a[d];return b}function ra(a){var b=[],c=0,d;for(d in a)b[c++]=d;return b}function sa(a,b){for(var c in a)if(a[c]==b)return!0;return!1}
	function ta(a,b,c){for(var d in a)if(b.call(c,a[d],d,a))return d}function ua(a,b){var c=ta(a,b,void 0);return c&&a[c]}function va(a){for(var b in a)return!1;return!0}function wa(a){var b={},c;for(c in a)b[c]=a[c];return b}var xa="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");
	function ya(a,b){for(var c,d,e=1;e<arguments.length;e++){d=arguments[e];for(c in d)a[c]=d[c];for(var f=0;f<xa.length;f++)c=xa[f],Object.prototype.hasOwnProperty.call(d,c)&&(a[c]=d[c])}};function za(a){a=String(a);if(/^\s*$/.test(a)?0:/^[\],:{}\s\u2028\u2029]*$/.test(a.replace(/\\["\\\/bfnrtu]/g,"@").replace(/"[^"\\\n\r\u2028\u2029\x00-\x08\x0a-\x1f]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:[\s\u2028\u2029]*\[)+/g,"")))try{return eval("("+a+")")}catch(b){}throw Error("Invalid JSON string: "+a);}function Aa(){this.Vd=void 0}
	function Ba(a,b,c){switch(typeof b){case "string":Ca(b,c);break;case "number":c.push(isFinite(b)&&!isNaN(b)?b:"null");break;case "boolean":c.push(b);break;case "undefined":c.push("null");break;case "object":if(null==b){c.push("null");break}if(da(b)){var d=b.length;c.push("[");for(var e="",f=0;f<d;f++)c.push(e),e=b[f],Ba(a,a.Vd?a.Vd.call(b,String(f),e):e,c),e=",";c.push("]");break}c.push("{");d="";for(f in b)Object.prototype.hasOwnProperty.call(b,f)&&(e=b[f],"function"!=typeof e&&(c.push(d),Ca(f,c),
	c.push(":"),Ba(a,a.Vd?a.Vd.call(b,f,e):e,c),d=","));c.push("}");break;case "function":break;default:throw Error("Unknown type: "+typeof b);}}var Da={'"':'\\"',"\\":"\\\\","/":"\\/","\b":"\\b","\f":"\\f","\n":"\\n","\r":"\\r","\t":"\\t","\x0B":"\\u000b"},Ea=/\uffff/.test("\uffff")?/[\\\"\x00-\x1f\x7f-\uffff]/g:/[\\\"\x00-\x1f\x7f-\xff]/g;
	function Ca(a,b){b.push('"',a.replace(Ea,function(a){if(a in Da)return Da[a];var b=a.charCodeAt(0),e="\\u";16>b?e+="000":256>b?e+="00":4096>b&&(e+="0");return Da[a]=e+b.toString(16)}),'"')};function Fa(){return Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^ja()).toString(36)};var w;a:{var Ga=n.navigator;if(Ga){var Ha=Ga.userAgent;if(Ha){w=Ha;break a}}w=""};function Ia(){this.Ya=-1};function Ja(){this.Ya=-1;this.Ya=64;this.P=[];this.pe=[];this.eg=[];this.Od=[];this.Od[0]=128;for(var a=1;a<this.Ya;++a)this.Od[a]=0;this.ge=this.ec=0;this.reset()}ka(Ja,Ia);Ja.prototype.reset=function(){this.P[0]=1732584193;this.P[1]=4023233417;this.P[2]=2562383102;this.P[3]=271733878;this.P[4]=3285377520;this.ge=this.ec=0};
	function Ka(a,b,c){c||(c=0);var d=a.eg;if(q(b))for(var e=0;16>e;e++)d[e]=b.charCodeAt(c)<<24|b.charCodeAt(c+1)<<16|b.charCodeAt(c+2)<<8|b.charCodeAt(c+3),c+=4;else for(e=0;16>e;e++)d[e]=b[c]<<24|b[c+1]<<16|b[c+2]<<8|b[c+3],c+=4;for(e=16;80>e;e++){var f=d[e-3]^d[e-8]^d[e-14]^d[e-16];d[e]=(f<<1|f>>>31)&4294967295}b=a.P[0];c=a.P[1];for(var g=a.P[2],k=a.P[3],m=a.P[4],l,e=0;80>e;e++)40>e?20>e?(f=k^c&(g^k),l=1518500249):(f=c^g^k,l=1859775393):60>e?(f=c&g|k&(c|g),l=2400959708):(f=c^g^k,l=3395469782),f=(b<<
	5|b>>>27)+f+m+l+d[e]&4294967295,m=k,k=g,g=(c<<30|c>>>2)&4294967295,c=b,b=f;a.P[0]=a.P[0]+b&4294967295;a.P[1]=a.P[1]+c&4294967295;a.P[2]=a.P[2]+g&4294967295;a.P[3]=a.P[3]+k&4294967295;a.P[4]=a.P[4]+m&4294967295}
	Ja.prototype.update=function(a,b){if(null!=a){p(b)||(b=a.length);for(var c=b-this.Ya,d=0,e=this.pe,f=this.ec;d<b;){if(0==f)for(;d<=c;)Ka(this,a,d),d+=this.Ya;if(q(a))for(;d<b;){if(e[f]=a.charCodeAt(d),++f,++d,f==this.Ya){Ka(this,e);f=0;break}}else for(;d<b;)if(e[f]=a[d],++f,++d,f==this.Ya){Ka(this,e);f=0;break}}this.ec=f;this.ge+=b}};var x=Array.prototype,La=x.indexOf?function(a,b,c){return x.indexOf.call(a,b,c)}:function(a,b,c){c=null==c?0:0>c?Math.max(0,a.length+c):c;if(q(a))return q(b)&&1==b.length?a.indexOf(b,c):-1;for(;c<a.length;c++)if(c in a&&a[c]===b)return c;return-1},Ma=x.forEach?function(a,b,c){x.forEach.call(a,b,c)}:function(a,b,c){for(var d=a.length,e=q(a)?a.split(""):a,f=0;f<d;f++)f in e&&b.call(c,e[f],f,a)},Na=x.filter?function(a,b,c){return x.filter.call(a,b,c)}:function(a,b,c){for(var d=a.length,e=[],f=0,g=q(a)?
	a.split(""):a,k=0;k<d;k++)if(k in g){var m=g[k];b.call(c,m,k,a)&&(e[f++]=m)}return e},Oa=x.map?function(a,b,c){return x.map.call(a,b,c)}:function(a,b,c){for(var d=a.length,e=Array(d),f=q(a)?a.split(""):a,g=0;g<d;g++)g in f&&(e[g]=b.call(c,f[g],g,a));return e},Pa=x.reduce?function(a,b,c,d){for(var e=[],f=1,g=arguments.length;f<g;f++)e.push(arguments[f]);d&&(e[0]=u(b,d));return x.reduce.apply(a,e)}:function(a,b,c,d){var e=c;Ma(a,function(c,g){e=b.call(d,e,c,g,a)});return e},Qa=x.every?function(a,b,
	c){return x.every.call(a,b,c)}:function(a,b,c){for(var d=a.length,e=q(a)?a.split(""):a,f=0;f<d;f++)if(f in e&&!b.call(c,e[f],f,a))return!1;return!0};function Ra(a,b){var c=Sa(a,b,void 0);return 0>c?null:q(a)?a.charAt(c):a[c]}function Sa(a,b,c){for(var d=a.length,e=q(a)?a.split(""):a,f=0;f<d;f++)if(f in e&&b.call(c,e[f],f,a))return f;return-1}function Ta(a,b){var c=La(a,b);0<=c&&x.splice.call(a,c,1)}function Ua(a,b,c){return 2>=arguments.length?x.slice.call(a,b):x.slice.call(a,b,c)}
	function Va(a,b){a.sort(b||Wa)}function Wa(a,b){return a>b?1:a<b?-1:0};function Xa(a){n.setTimeout(function(){throw a;},0)}var Ya;
	function Za(){var a=n.MessageChannel;"undefined"===typeof a&&"undefined"!==typeof window&&window.postMessage&&window.addEventListener&&-1==w.indexOf("Presto")&&(a=function(){var a=document.createElement("iframe");a.style.display="none";a.src="";document.documentElement.appendChild(a);var b=a.contentWindow,a=b.document;a.open();a.write("");a.close();var c="callImmediate"+Math.random(),d="file:"==b.location.protocol?"*":b.location.protocol+"//"+b.location.host,a=u(function(a){if(("*"==d||a.origin==
	d)&&a.data==c)this.port1.onmessage()},this);b.addEventListener("message",a,!1);this.port1={};this.port2={postMessage:function(){b.postMessage(c,d)}}});if("undefined"!==typeof a&&-1==w.indexOf("Trident")&&-1==w.indexOf("MSIE")){var b=new a,c={},d=c;b.port1.onmessage=function(){if(p(c.next)){c=c.next;var a=c.hb;c.hb=null;a()}};return function(a){d.next={hb:a};d=d.next;b.port2.postMessage(0)}}return"undefined"!==typeof document&&"onreadystatechange"in document.createElement("script")?function(a){var b=
	document.createElement("script");b.onreadystatechange=function(){b.onreadystatechange=null;b.parentNode.removeChild(b);b=null;a();a=null};document.documentElement.appendChild(b)}:function(a){n.setTimeout(a,0)}};function $a(a,b){ab||bb();cb||(ab(),cb=!0);db.push(new eb(a,b))}var ab;function bb(){if(n.Promise&&n.Promise.resolve){var a=n.Promise.resolve();ab=function(){a.then(fb)}}else ab=function(){var a=fb;!r(n.setImmediate)||n.Window&&n.Window.prototype&&n.Window.prototype.setImmediate==n.setImmediate?(Ya||(Ya=Za()),Ya(a)):n.setImmediate(a)}}var cb=!1,db=[];[].push(function(){cb=!1;db=[]});
	function fb(){for(;db.length;){var a=db;db=[];for(var b=0;b<a.length;b++){var c=a[b];try{c.yg.call(c.scope)}catch(d){Xa(d)}}}cb=!1}function eb(a,b){this.yg=a;this.scope=b};var gb=-1!=w.indexOf("Opera")||-1!=w.indexOf("OPR"),hb=-1!=w.indexOf("Trident")||-1!=w.indexOf("MSIE"),ib=-1!=w.indexOf("Gecko")&&-1==w.toLowerCase().indexOf("webkit")&&!(-1!=w.indexOf("Trident")||-1!=w.indexOf("MSIE")),jb=-1!=w.toLowerCase().indexOf("webkit");
	(function(){var a="",b;if(gb&&n.opera)return a=n.opera.version,r(a)?a():a;ib?b=/rv\:([^\);]+)(\)|;)/:hb?b=/\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/:jb&&(b=/WebKit\/(\S+)/);b&&(a=(a=b.exec(w))?a[1]:"");return hb&&(b=(b=n.document)?b.documentMode:void 0,b>parseFloat(a))?String(b):a})();var kb=null,lb=null,mb=null;function nb(a,b){if(!ea(a))throw Error("encodeByteArray takes an array as a parameter");ob();for(var c=b?lb:kb,d=[],e=0;e<a.length;e+=3){var f=a[e],g=e+1<a.length,k=g?a[e+1]:0,m=e+2<a.length,l=m?a[e+2]:0,t=f>>2,f=(f&3)<<4|k>>4,k=(k&15)<<2|l>>6,l=l&63;m||(l=64,g||(k=64));d.push(c[t],c[f],c[k],c[l])}return d.join("")}
	function ob(){if(!kb){kb={};lb={};mb={};for(var a=0;65>a;a++)kb[a]="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(a),lb[a]="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.".charAt(a),mb[lb[a]]=a,62<=a&&(mb["ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(a)]=a)}};function pb(a,b){this.N=qb;this.Rf=void 0;this.Ba=this.Ha=null;this.yd=this.ye=!1;if(a==rb)sb(this,tb,b);else try{var c=this;a.call(b,function(a){sb(c,tb,a)},function(a){if(!(a instanceof ub))try{if(a instanceof Error)throw a;throw Error("Promise rejected.");}catch(b){}sb(c,vb,a)})}catch(d){sb(this,vb,d)}}var qb=0,tb=2,vb=3;function rb(){}pb.prototype.then=function(a,b,c){return wb(this,r(a)?a:null,r(b)?b:null,c)};pb.prototype.then=pb.prototype.then;pb.prototype.$goog_Thenable=!0;h=pb.prototype;
	h.gh=function(a,b){return wb(this,null,a,b)};h.cancel=function(a){this.N==qb&&$a(function(){var b=new ub(a);xb(this,b)},this)};function xb(a,b){if(a.N==qb)if(a.Ha){var c=a.Ha;if(c.Ba){for(var d=0,e=-1,f=0,g;g=c.Ba[f];f++)if(g=g.o)if(d++,g==a&&(e=f),0<=e&&1<d)break;0<=e&&(c.N==qb&&1==d?xb(c,b):(d=c.Ba.splice(e,1)[0],yb(c,d,vb,b)))}a.Ha=null}else sb(a,vb,b)}function zb(a,b){a.Ba&&a.Ba.length||a.N!=tb&&a.N!=vb||Ab(a);a.Ba||(a.Ba=[]);a.Ba.push(b)}
	function wb(a,b,c,d){var e={o:null,Hf:null,Jf:null};e.o=new pb(function(a,g){e.Hf=b?function(c){try{var e=b.call(d,c);a(e)}catch(l){g(l)}}:a;e.Jf=c?function(b){try{var e=c.call(d,b);!p(e)&&b instanceof ub?g(b):a(e)}catch(l){g(l)}}:g});e.o.Ha=a;zb(a,e);return e.o}h.Yf=function(a){this.N=qb;sb(this,tb,a)};h.Zf=function(a){this.N=qb;sb(this,vb,a)};
	function sb(a,b,c){if(a.N==qb){if(a==c)b=vb,c=new TypeError("Promise cannot resolve to itself");else{var d;if(c)try{d=!!c.$goog_Thenable}catch(e){d=!1}else d=!1;if(d){a.N=1;c.then(a.Yf,a.Zf,a);return}if(ga(c))try{var f=c.then;if(r(f)){Bb(a,c,f);return}}catch(g){b=vb,c=g}}a.Rf=c;a.N=b;a.Ha=null;Ab(a);b!=vb||c instanceof ub||Cb(a,c)}}function Bb(a,b,c){function d(b){f||(f=!0,a.Zf(b))}function e(b){f||(f=!0,a.Yf(b))}a.N=1;var f=!1;try{c.call(b,e,d)}catch(g){d(g)}}
	function Ab(a){a.ye||(a.ye=!0,$a(a.wg,a))}h.wg=function(){for(;this.Ba&&this.Ba.length;){var a=this.Ba;this.Ba=null;for(var b=0;b<a.length;b++)yb(this,a[b],this.N,this.Rf)}this.ye=!1};function yb(a,b,c,d){if(c==tb)b.Hf(d);else{if(b.o)for(;a&&a.yd;a=a.Ha)a.yd=!1;b.Jf(d)}}function Cb(a,b){a.yd=!0;$a(function(){a.yd&&Db.call(null,b)})}var Db=Xa;function ub(a){la.call(this,a)}ka(ub,la);ub.prototype.name="cancel";var Eb=Eb||"2.4.2";function y(a,b){return Object.prototype.hasOwnProperty.call(a,b)}function z(a,b){if(Object.prototype.hasOwnProperty.call(a,b))return a[b]}function Fb(a,b){for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&b(c,a[c])}function Gb(a){var b={};Fb(a,function(a,d){b[a]=d});return b}function Hb(a){return"object"===typeof a&&null!==a};function Ib(a){var b=[];Fb(a,function(a,d){da(d)?Ma(d,function(d){b.push(encodeURIComponent(a)+"="+encodeURIComponent(d))}):b.push(encodeURIComponent(a)+"="+encodeURIComponent(d))});return b.length?"&"+b.join("&"):""}function Jb(a){var b={};a=a.replace(/^\?/,"").split("&");Ma(a,function(a){a&&(a=a.split("="),b[a[0]]=a[1])});return b};function Kb(a,b){if(!a)throw Lb(b);}function Lb(a){return Error("Firebase ("+Eb+") INTERNAL ASSERT FAILED: "+a)};var Mb=n.Promise||pb;pb.prototype["catch"]=pb.prototype.gh;function B(){var a=this;this.reject=this.resolve=null;this.D=new Mb(function(b,c){a.resolve=b;a.reject=c})}function C(a,b){return function(c,d){c?a.reject(c):a.resolve(d);r(b)&&(Nb(a.D),1===b.length?b(c):b(c,d))}}function Nb(a){a.then(void 0,aa)};function Ob(a){for(var b=[],c=0,d=0;d<a.length;d++){var e=a.charCodeAt(d);55296<=e&&56319>=e&&(e-=55296,d++,Kb(d<a.length,"Surrogate pair missing trail surrogate."),e=65536+(e<<10)+(a.charCodeAt(d)-56320));128>e?b[c++]=e:(2048>e?b[c++]=e>>6|192:(65536>e?b[c++]=e>>12|224:(b[c++]=e>>18|240,b[c++]=e>>12&63|128),b[c++]=e>>6&63|128),b[c++]=e&63|128)}return b}function Pb(a){for(var b=0,c=0;c<a.length;c++){var d=a.charCodeAt(c);128>d?b++:2048>d?b+=2:55296<=d&&56319>=d?(b+=4,c++):b+=3}return b};function D(a,b,c,d){var e;d<b?e="at least "+b:d>c&&(e=0===c?"none":"no more than "+c);if(e)throw Error(a+" failed: Was called with "+d+(1===d?" argument.":" arguments.")+" Expects "+e+".");}function E(a,b,c){var d="";switch(b){case 1:d=c?"first":"First";break;case 2:d=c?"second":"Second";break;case 3:d=c?"third":"Third";break;case 4:d=c?"fourth":"Fourth";break;default:throw Error("errorPrefix called with argumentNumber > 4.  Need to update it?");}return a=a+" failed: "+(d+" argument ")}
	function F(a,b,c,d){if((!d||p(c))&&!r(c))throw Error(E(a,b,d)+"must be a valid function.");}function Qb(a,b,c){if(p(c)&&(!ga(c)||null===c))throw Error(E(a,b,!0)+"must be a valid context object.");};function Rb(a){return"undefined"!==typeof JSON&&p(JSON.parse)?JSON.parse(a):za(a)}function G(a){if("undefined"!==typeof JSON&&p(JSON.stringify))a=JSON.stringify(a);else{var b=[];Ba(new Aa,a,b);a=b.join("")}return a};function Sb(){this.Zd=H}Sb.prototype.j=function(a){return this.Zd.S(a)};Sb.prototype.toString=function(){return this.Zd.toString()};function Tb(){}Tb.prototype.uf=function(){return null};Tb.prototype.Ce=function(){return null};var Ub=new Tb;function Vb(a,b,c){this.bg=a;this.Oa=b;this.Nd=c}Vb.prototype.uf=function(a){var b=this.Oa.Q;if(Wb(b,a))return b.j().T(a);b=null!=this.Nd?new Xb(this.Nd,!0,!1):this.Oa.w();return this.bg.Bc(a,b)};Vb.prototype.Ce=function(a,b,c){var d=null!=this.Nd?this.Nd:Yb(this.Oa);a=this.bg.qe(d,b,1,c,a);return 0===a.length?null:a[0]};function Zb(){this.xb=[]}function $b(a,b){for(var c=null,d=0;d<b.length;d++){var e=b[d],f=e.cc();null===c||f.ea(c.cc())||(a.xb.push(c),c=null);null===c&&(c=new ac(f));c.add(e)}c&&a.xb.push(c)}function bc(a,b,c){$b(a,c);cc(a,function(a){return a.ea(b)})}function dc(a,b,c){$b(a,c);cc(a,function(a){return a.contains(b)||b.contains(a)})}
	function cc(a,b){for(var c=!0,d=0;d<a.xb.length;d++){var e=a.xb[d];if(e)if(e=e.cc(),b(e)){for(var e=a.xb[d],f=0;f<e.xd.length;f++){var g=e.xd[f];if(null!==g){e.xd[f]=null;var k=g.Zb();ec&&fc("event: "+g.toString());gc(k)}}a.xb[d]=null}else c=!1}c&&(a.xb=[])}function ac(a){this.ta=a;this.xd=[]}ac.prototype.add=function(a){this.xd.push(a)};ac.prototype.cc=function(){return this.ta};function J(a,b,c,d){this.type=a;this.Na=b;this.Za=c;this.Oe=d;this.Td=void 0}function hc(a){return new J(ic,a)}var ic="value";function jc(a,b,c,d){this.xe=b;this.be=c;this.Td=d;this.wd=a}jc.prototype.cc=function(){var a=this.be.Mb();return"value"===this.wd?a.path:a.parent().path};jc.prototype.De=function(){return this.wd};jc.prototype.Zb=function(){return this.xe.Zb(this)};jc.prototype.toString=function(){return this.cc().toString()+":"+this.wd+":"+G(this.be.qf())};function kc(a,b,c){this.xe=a;this.error=b;this.path=c}kc.prototype.cc=function(){return this.path};kc.prototype.De=function(){return"cancel"};
	kc.prototype.Zb=function(){return this.xe.Zb(this)};kc.prototype.toString=function(){return this.path.toString()+":cancel"};function Xb(a,b,c){this.A=a;this.ga=b;this.Yb=c}function lc(a){return a.ga}function mc(a){return a.Yb}function nc(a,b){return b.e()?a.ga&&!a.Yb:Wb(a,K(b))}function Wb(a,b){return a.ga&&!a.Yb||a.A.Fa(b)}Xb.prototype.j=function(){return this.A};function oc(a){this.pg=a;this.Gd=null}oc.prototype.get=function(){var a=this.pg.get(),b=wa(a);if(this.Gd)for(var c in this.Gd)b[c]-=this.Gd[c];this.Gd=a;return b};function pc(a,b){this.Vf={};this.hd=new oc(a);this.da=b;var c=1E4+2E4*Math.random();setTimeout(u(this.Of,this),Math.floor(c))}pc.prototype.Of=function(){var a=this.hd.get(),b={},c=!1,d;for(d in a)0<a[d]&&y(this.Vf,d)&&(b[d]=a[d],c=!0);c&&this.da.Ye(b);setTimeout(u(this.Of,this),Math.floor(6E5*Math.random()))};function qc(){this.Hc={}}function rc(a,b,c){p(c)||(c=1);y(a.Hc,b)||(a.Hc[b]=0);a.Hc[b]+=c}qc.prototype.get=function(){return wa(this.Hc)};var sc={},tc={};function uc(a){a=a.toString();sc[a]||(sc[a]=new qc);return sc[a]}function vc(a,b){var c=a.toString();tc[c]||(tc[c]=b());return tc[c]};function L(a,b){this.name=a;this.U=b}function wc(a,b){return new L(a,b)};function xc(a,b){return yc(a.name,b.name)}function zc(a,b){return yc(a,b)};function Ac(a,b,c){this.type=Bc;this.source=a;this.path=b;this.Ja=c}Ac.prototype.$c=function(a){return this.path.e()?new Ac(this.source,M,this.Ja.T(a)):new Ac(this.source,N(this.path),this.Ja)};Ac.prototype.toString=function(){return"Operation("+this.path+": "+this.source.toString()+" overwrite: "+this.Ja.toString()+")"};function Cc(a,b){this.type=Dc;this.source=a;this.path=b}Cc.prototype.$c=function(){return this.path.e()?new Cc(this.source,M):new Cc(this.source,N(this.path))};Cc.prototype.toString=function(){return"Operation("+this.path+": "+this.source.toString()+" listen_complete)"};function Ec(a,b){this.Pa=a;this.xa=b?b:Fc}h=Ec.prototype;h.Sa=function(a,b){return new Ec(this.Pa,this.xa.Sa(a,b,this.Pa).$(null,null,!1,null,null))};h.remove=function(a){return new Ec(this.Pa,this.xa.remove(a,this.Pa).$(null,null,!1,null,null))};h.get=function(a){for(var b,c=this.xa;!c.e();){b=this.Pa(a,c.key);if(0===b)return c.value;0>b?c=c.left:0<b&&(c=c.right)}return null};
	function Gc(a,b){for(var c,d=a.xa,e=null;!d.e();){c=a.Pa(b,d.key);if(0===c){if(d.left.e())return e?e.key:null;for(d=d.left;!d.right.e();)d=d.right;return d.key}0>c?d=d.left:0<c&&(e=d,d=d.right)}throw Error("Attempted to find predecessor key for a nonexistent key.  What gives?");}h.e=function(){return this.xa.e()};h.count=function(){return this.xa.count()};h.Vc=function(){return this.xa.Vc()};h.jc=function(){return this.xa.jc()};h.ka=function(a){return this.xa.ka(a)};
	h.ac=function(a){return new Hc(this.xa,null,this.Pa,!1,a)};h.bc=function(a,b){return new Hc(this.xa,a,this.Pa,!1,b)};h.dc=function(a,b){return new Hc(this.xa,a,this.Pa,!0,b)};h.xf=function(a){return new Hc(this.xa,null,this.Pa,!0,a)};function Hc(a,b,c,d,e){this.Xd=e||null;this.Je=d;this.Ta=[];for(e=1;!a.e();)if(e=b?c(a.key,b):1,d&&(e*=-1),0>e)a=this.Je?a.left:a.right;else if(0===e){this.Ta.push(a);break}else this.Ta.push(a),a=this.Je?a.right:a.left}
	function Ic(a){if(0===a.Ta.length)return null;var b=a.Ta.pop(),c;c=a.Xd?a.Xd(b.key,b.value):{key:b.key,value:b.value};if(a.Je)for(b=b.left;!b.e();)a.Ta.push(b),b=b.right;else for(b=b.right;!b.e();)a.Ta.push(b),b=b.left;return c}function Jc(a){if(0===a.Ta.length)return null;var b;b=a.Ta;b=b[b.length-1];return a.Xd?a.Xd(b.key,b.value):{key:b.key,value:b.value}}function Kc(a,b,c,d,e){this.key=a;this.value=b;this.color=null!=c?c:!0;this.left=null!=d?d:Fc;this.right=null!=e?e:Fc}h=Kc.prototype;
	h.$=function(a,b,c,d,e){return new Kc(null!=a?a:this.key,null!=b?b:this.value,null!=c?c:this.color,null!=d?d:this.left,null!=e?e:this.right)};h.count=function(){return this.left.count()+1+this.right.count()};h.e=function(){return!1};h.ka=function(a){return this.left.ka(a)||a(this.key,this.value)||this.right.ka(a)};function Lc(a){return a.left.e()?a:Lc(a.left)}h.Vc=function(){return Lc(this).key};h.jc=function(){return this.right.e()?this.key:this.right.jc()};
	h.Sa=function(a,b,c){var d,e;e=this;d=c(a,e.key);e=0>d?e.$(null,null,null,e.left.Sa(a,b,c),null):0===d?e.$(null,b,null,null,null):e.$(null,null,null,null,e.right.Sa(a,b,c));return Mc(e)};function Nc(a){if(a.left.e())return Fc;a.left.ha()||a.left.left.ha()||(a=Oc(a));a=a.$(null,null,null,Nc(a.left),null);return Mc(a)}
	h.remove=function(a,b){var c,d;c=this;if(0>b(a,c.key))c.left.e()||c.left.ha()||c.left.left.ha()||(c=Oc(c)),c=c.$(null,null,null,c.left.remove(a,b),null);else{c.left.ha()&&(c=Pc(c));c.right.e()||c.right.ha()||c.right.left.ha()||(c=Qc(c),c.left.left.ha()&&(c=Pc(c),c=Qc(c)));if(0===b(a,c.key)){if(c.right.e())return Fc;d=Lc(c.right);c=c.$(d.key,d.value,null,null,Nc(c.right))}c=c.$(null,null,null,null,c.right.remove(a,b))}return Mc(c)};h.ha=function(){return this.color};
	function Mc(a){a.right.ha()&&!a.left.ha()&&(a=Rc(a));a.left.ha()&&a.left.left.ha()&&(a=Pc(a));a.left.ha()&&a.right.ha()&&(a=Qc(a));return a}function Oc(a){a=Qc(a);a.right.left.ha()&&(a=a.$(null,null,null,null,Pc(a.right)),a=Rc(a),a=Qc(a));return a}function Rc(a){return a.right.$(null,null,a.color,a.$(null,null,!0,null,a.right.left),null)}function Pc(a){return a.left.$(null,null,a.color,null,a.$(null,null,!0,a.left.right,null))}
	function Qc(a){return a.$(null,null,!a.color,a.left.$(null,null,!a.left.color,null,null),a.right.$(null,null,!a.right.color,null,null))}function Sc(){}h=Sc.prototype;h.$=function(){return this};h.Sa=function(a,b){return new Kc(a,b,null)};h.remove=function(){return this};h.count=function(){return 0};h.e=function(){return!0};h.ka=function(){return!1};h.Vc=function(){return null};h.jc=function(){return null};h.ha=function(){return!1};var Fc=new Sc;function Tc(a,b){return a&&"object"===typeof a?(O(".sv"in a,"Unexpected leaf node or priority contents"),b[a[".sv"]]):a}function Uc(a,b){var c=new Vc;Wc(a,new P(""),function(a,e){c.rc(a,Xc(e,b))});return c}function Xc(a,b){var c=a.C().J(),c=Tc(c,b),d;if(a.L()){var e=Tc(a.Ea(),b);return e!==a.Ea()||c!==a.C().J()?new Yc(e,Q(c)):a}d=a;c!==a.C().J()&&(d=d.ia(new Yc(c)));a.R(R,function(a,c){var e=Xc(c,b);e!==c&&(d=d.W(a,e))});return d};function Zc(){this.Ac={}}Zc.prototype.set=function(a,b){null==b?delete this.Ac[a]:this.Ac[a]=b};Zc.prototype.get=function(a){return y(this.Ac,a)?this.Ac[a]:null};Zc.prototype.remove=function(a){delete this.Ac[a]};Zc.prototype.Af=!0;function $c(a){this.Ic=a;this.Sd="firebase:"}h=$c.prototype;h.set=function(a,b){null==b?this.Ic.removeItem(this.Sd+a):this.Ic.setItem(this.Sd+a,G(b))};h.get=function(a){a=this.Ic.getItem(this.Sd+a);return null==a?null:Rb(a)};h.remove=function(a){this.Ic.removeItem(this.Sd+a)};h.Af=!1;h.toString=function(){return this.Ic.toString()};function ad(a){try{if("undefined"!==typeof window&&"undefined"!==typeof window[a]){var b=window[a];b.setItem("firebase:sentinel","cache");b.removeItem("firebase:sentinel");return new $c(b)}}catch(c){}return new Zc}var bd=ad("localStorage"),cd=ad("sessionStorage");function dd(a,b,c,d,e){this.host=a.toLowerCase();this.domain=this.host.substr(this.host.indexOf(".")+1);this.ob=b;this.lc=c;this.jh=d;this.Rd=e||"";this.ab=bd.get("host:"+a)||this.host}function ed(a,b){b!==a.ab&&(a.ab=b,"s-"===a.ab.substr(0,2)&&bd.set("host:"+a.host,a.ab))}
	function fd(a,b,c){O("string"===typeof b,"typeof type must == string");O("object"===typeof c,"typeof params must == object");if(b===gd)b=(a.ob?"wss://":"ws://")+a.ab+"/.ws?";else if(b===hd)b=(a.ob?"https://":"http://")+a.ab+"/.lp?";else throw Error("Unknown connection type: "+b);a.host!==a.ab&&(c.ns=a.lc);var d=[];v(c,function(a,b){d.push(b+"="+a)});return b+d.join("&")}dd.prototype.toString=function(){var a=(this.ob?"https://":"http://")+this.host;this.Rd&&(a+="<"+this.Rd+">");return a};var id=function(){var a=1;return function(){return a++}}(),O=Kb,jd=Lb;
	function kd(a){try{var b;if("undefined"!==typeof atob)b=atob(a);else{ob();for(var c=mb,d=[],e=0;e<a.length;){var f=c[a.charAt(e++)],g=e<a.length?c[a.charAt(e)]:0;++e;var k=e<a.length?c[a.charAt(e)]:64;++e;var m=e<a.length?c[a.charAt(e)]:64;++e;if(null==f||null==g||null==k||null==m)throw Error();d.push(f<<2|g>>4);64!=k&&(d.push(g<<4&240|k>>2),64!=m&&d.push(k<<6&192|m))}if(8192>d.length)b=String.fromCharCode.apply(null,d);else{a="";for(c=0;c<d.length;c+=8192)a+=String.fromCharCode.apply(null,Ua(d,c,
	c+8192));b=a}}return b}catch(l){fc("base64Decode failed: ",l)}return null}function ld(a){var b=Ob(a);a=new Ja;a.update(b);var b=[],c=8*a.ge;56>a.ec?a.update(a.Od,56-a.ec):a.update(a.Od,a.Ya-(a.ec-56));for(var d=a.Ya-1;56<=d;d--)a.pe[d]=c&255,c/=256;Ka(a,a.pe);for(d=c=0;5>d;d++)for(var e=24;0<=e;e-=8)b[c]=a.P[d]>>e&255,++c;return nb(b)}
	function md(a){for(var b="",c=0;c<arguments.length;c++)b=ea(arguments[c])?b+md.apply(null,arguments[c]):"object"===typeof arguments[c]?b+G(arguments[c]):b+arguments[c],b+=" ";return b}var ec=null,nd=!0;
	function od(a,b){Kb(!b||!0===a||!1===a,"Can't turn on custom loggers persistently.");!0===a?("undefined"!==typeof console&&("function"===typeof console.log?ec=u(console.log,console):"object"===typeof console.log&&(ec=function(a){console.log(a)})),b&&cd.set("logging_enabled",!0)):r(a)?ec=a:(ec=null,cd.remove("logging_enabled"))}function fc(a){!0===nd&&(nd=!1,null===ec&&!0===cd.get("logging_enabled")&&od(!0));if(ec){var b=md.apply(null,arguments);ec(b)}}
	function pd(a){return function(){fc(a,arguments)}}function qd(a){if("undefined"!==typeof console){var b="FIREBASE INTERNAL ERROR: "+md.apply(null,arguments);"undefined"!==typeof console.error?console.error(b):console.log(b)}}function rd(a){var b=md.apply(null,arguments);throw Error("FIREBASE FATAL ERROR: "+b);}function S(a){if("undefined"!==typeof console){var b="FIREBASE WARNING: "+md.apply(null,arguments);"undefined"!==typeof console.warn?console.warn(b):console.log(b)}}
	function sd(a){var b="",c="",d="",e="",f=!0,g="https",k=443;if(q(a)){var m=a.indexOf("//");0<=m&&(g=a.substring(0,m-1),a=a.substring(m+2));m=a.indexOf("/");-1===m&&(m=a.length);b=a.substring(0,m);e="";a=a.substring(m).split("/");for(m=0;m<a.length;m++)if(0<a[m].length){var l=a[m];try{l=decodeURIComponent(l.replace(/\+/g," "))}catch(t){}e+="/"+l}a=b.split(".");3===a.length?(c=a[1],d=a[0].toLowerCase()):2===a.length&&(c=a[0]);m=b.indexOf(":");0<=m&&(f="https"===g||"wss"===g,k=b.substring(m+1),isFinite(k)&&
	(k=String(k)),k=q(k)?/^\s*-?0x/i.test(k)?parseInt(k,16):parseInt(k,10):NaN)}return{host:b,port:k,domain:c,fh:d,ob:f,scheme:g,bd:e}}function td(a){return fa(a)&&(a!=a||a==Number.POSITIVE_INFINITY||a==Number.NEGATIVE_INFINITY)}
	function ud(a){if("complete"===document.readyState)a();else{var b=!1,c=function(){document.body?b||(b=!0,a()):setTimeout(c,Math.floor(10))};document.addEventListener?(document.addEventListener("DOMContentLoaded",c,!1),window.addEventListener("load",c,!1)):document.attachEvent&&(document.attachEvent("onreadystatechange",function(){"complete"===document.readyState&&c()}),window.attachEvent("onload",c))}}
	function yc(a,b){if(a===b)return 0;if("[MIN_NAME]"===a||"[MAX_NAME]"===b)return-1;if("[MIN_NAME]"===b||"[MAX_NAME]"===a)return 1;var c=vd(a),d=vd(b);return null!==c?null!==d?0==c-d?a.length-b.length:c-d:-1:null!==d?1:a<b?-1:1}function wd(a,b){if(b&&a in b)return b[a];throw Error("Missing required key ("+a+") in object: "+G(b));}
	function xd(a){if("object"!==typeof a||null===a)return G(a);var b=[],c;for(c in a)b.push(c);b.sort();c="{";for(var d=0;d<b.length;d++)0!==d&&(c+=","),c+=G(b[d]),c+=":",c+=xd(a[b[d]]);return c+"}"}function yd(a,b){if(a.length<=b)return[a];for(var c=[],d=0;d<a.length;d+=b)d+b>a?c.push(a.substring(d,a.length)):c.push(a.substring(d,d+b));return c}function zd(a,b){if(da(a))for(var c=0;c<a.length;++c)b(c,a[c]);else v(a,b)}
	function Ad(a){O(!td(a),"Invalid JSON number");var b,c,d,e;0===a?(d=c=0,b=-Infinity===1/a?1:0):(b=0>a,a=Math.abs(a),a>=Math.pow(2,-1022)?(d=Math.min(Math.floor(Math.log(a)/Math.LN2),1023),c=d+1023,d=Math.round(a*Math.pow(2,52-d)-Math.pow(2,52))):(c=0,d=Math.round(a/Math.pow(2,-1074))));e=[];for(a=52;a;--a)e.push(d%2?1:0),d=Math.floor(d/2);for(a=11;a;--a)e.push(c%2?1:0),c=Math.floor(c/2);e.push(b?1:0);e.reverse();b=e.join("");c="";for(a=0;64>a;a+=8)d=parseInt(b.substr(a,8),2).toString(16),1===d.length&&
	(d="0"+d),c+=d;return c.toLowerCase()}var Bd=/^-?\d{1,10}$/;function vd(a){return Bd.test(a)&&(a=Number(a),-2147483648<=a&&2147483647>=a)?a:null}function gc(a){try{a()}catch(b){setTimeout(function(){S("Exception was thrown by user callback.",b.stack||"");throw b;},Math.floor(0))}}function T(a,b){if(r(a)){var c=Array.prototype.slice.call(arguments,1).slice();gc(function(){a.apply(null,c)})}};function Cd(a){var b={},c={},d={},e="";try{var f=a.split("."),b=Rb(kd(f[0])||""),c=Rb(kd(f[1])||""),e=f[2],d=c.d||{};delete c.d}catch(g){}return{mh:b,Ec:c,data:d,bh:e}}function Dd(a){a=Cd(a).Ec;return"object"===typeof a&&a.hasOwnProperty("iat")?z(a,"iat"):null}function Ed(a){a=Cd(a);var b=a.Ec;return!!a.bh&&!!b&&"object"===typeof b&&b.hasOwnProperty("iat")};function Fd(a){this.Y=a;this.g=a.n.g}function Gd(a,b,c,d){var e=[],f=[];Ma(b,function(b){"child_changed"===b.type&&a.g.Dd(b.Oe,b.Na)&&f.push(new J("child_moved",b.Na,b.Za))});Hd(a,e,"child_removed",b,d,c);Hd(a,e,"child_added",b,d,c);Hd(a,e,"child_moved",f,d,c);Hd(a,e,"child_changed",b,d,c);Hd(a,e,ic,b,d,c);return e}function Hd(a,b,c,d,e,f){d=Na(d,function(a){return a.type===c});Va(d,u(a.qg,a));Ma(d,function(c){var d=Id(a,c,f);Ma(e,function(e){e.Qf(c.type)&&b.push(e.createEvent(d,a.Y))})})}
	function Id(a,b,c){"value"!==b.type&&"child_removed"!==b.type&&(b.Td=c.wf(b.Za,b.Na,a.g));return b}Fd.prototype.qg=function(a,b){if(null==a.Za||null==b.Za)throw jd("Should only compare child_ events.");return this.g.compare(new L(a.Za,a.Na),new L(b.Za,b.Na))};function Jd(){this.ib={}}
	function Kd(a,b){var c=b.type,d=b.Za;O("child_added"==c||"child_changed"==c||"child_removed"==c,"Only child changes supported for tracking");O(".priority"!==d,"Only non-priority child changes can be tracked.");var e=z(a.ib,d);if(e){var f=e.type;if("child_added"==c&&"child_removed"==f)a.ib[d]=new J("child_changed",b.Na,d,e.Na);else if("child_removed"==c&&"child_added"==f)delete a.ib[d];else if("child_removed"==c&&"child_changed"==f)a.ib[d]=new J("child_removed",e.Oe,d);else if("child_changed"==c&&
	"child_added"==f)a.ib[d]=new J("child_added",b.Na,d);else if("child_changed"==c&&"child_changed"==f)a.ib[d]=new J("child_changed",b.Na,d,e.Oe);else throw jd("Illegal combination of changes: "+b+" occurred after "+e);}else a.ib[d]=b};function Ld(a){this.g=a}h=Ld.prototype;h.H=function(a,b,c,d,e,f){O(a.Mc(this.g),"A node must be indexed if only a child is updated");e=a.T(b);if(e.S(d).ea(c.S(d))&&e.e()==c.e())return a;null!=f&&(c.e()?a.Fa(b)?Kd(f,new J("child_removed",e,b)):O(a.L(),"A child remove without an old child only makes sense on a leaf node"):e.e()?Kd(f,new J("child_added",c,b)):Kd(f,new J("child_changed",c,b,e)));return a.L()&&c.e()?a:a.W(b,c).pb(this.g)};
	h.ya=function(a,b,c){null!=c&&(a.L()||a.R(R,function(a,e){b.Fa(a)||Kd(c,new J("child_removed",e,a))}),b.L()||b.R(R,function(b,e){if(a.Fa(b)){var f=a.T(b);f.ea(e)||Kd(c,new J("child_changed",e,b,f))}else Kd(c,new J("child_added",e,b))}));return b.pb(this.g)};h.ia=function(a,b){return a.e()?H:a.ia(b)};h.Ra=function(){return!1};h.$b=function(){return this};function Md(a){this.Fe=new Ld(a.g);this.g=a.g;var b;a.oa?(b=Nd(a),b=a.g.Sc(Od(a),b)):b=a.g.Wc();this.gd=b;a.ra?(b=Pd(a),a=a.g.Sc(Rd(a),b)):a=a.g.Tc();this.Jc=a}h=Md.prototype;h.matches=function(a){return 0>=this.g.compare(this.gd,a)&&0>=this.g.compare(a,this.Jc)};h.H=function(a,b,c,d,e,f){this.matches(new L(b,c))||(c=H);return this.Fe.H(a,b,c,d,e,f)};
	h.ya=function(a,b,c){b.L()&&(b=H);var d=b.pb(this.g),d=d.ia(H),e=this;b.R(R,function(a,b){e.matches(new L(a,b))||(d=d.W(a,H))});return this.Fe.ya(a,d,c)};h.ia=function(a){return a};h.Ra=function(){return!0};h.$b=function(){return this.Fe};function Sd(a){this.ua=new Md(a);this.g=a.g;O(a.la,"Only valid if limit has been set");this.ma=a.ma;this.Nb=!Td(a)}h=Sd.prototype;h.H=function(a,b,c,d,e,f){this.ua.matches(new L(b,c))||(c=H);return a.T(b).ea(c)?a:a.Hb()<this.ma?this.ua.$b().H(a,b,c,d,e,f):Ud(this,a,b,c,e,f)};
	h.ya=function(a,b,c){var d;if(b.L()||b.e())d=H.pb(this.g);else if(2*this.ma<b.Hb()&&b.Mc(this.g)){d=H.pb(this.g);b=this.Nb?b.dc(this.ua.Jc,this.g):b.bc(this.ua.gd,this.g);for(var e=0;0<b.Ta.length&&e<this.ma;){var f=Ic(b),g;if(g=this.Nb?0>=this.g.compare(this.ua.gd,f):0>=this.g.compare(f,this.ua.Jc))d=d.W(f.name,f.U),e++;else break}}else{d=b.pb(this.g);d=d.ia(H);var k,m,l;if(this.Nb){b=d.xf(this.g);k=this.ua.Jc;m=this.ua.gd;var t=Vd(this.g);l=function(a,b){return t(b,a)}}else b=d.ac(this.g),k=this.ua.gd,
	m=this.ua.Jc,l=Vd(this.g);for(var e=0,A=!1;0<b.Ta.length;)f=Ic(b),!A&&0>=l(k,f)&&(A=!0),(g=A&&e<this.ma&&0>=l(f,m))?e++:d=d.W(f.name,H)}return this.ua.$b().ya(a,d,c)};h.ia=function(a){return a};h.Ra=function(){return!0};h.$b=function(){return this.ua.$b()};
	function Ud(a,b,c,d,e,f){var g;if(a.Nb){var k=Vd(a.g);g=function(a,b){return k(b,a)}}else g=Vd(a.g);O(b.Hb()==a.ma,"");var m=new L(c,d),l=a.Nb?Wd(b,a.g):Xd(b,a.g),t=a.ua.matches(m);if(b.Fa(c)){for(var A=b.T(c),l=e.Ce(a.g,l,a.Nb);null!=l&&(l.name==c||b.Fa(l.name));)l=e.Ce(a.g,l,a.Nb);e=null==l?1:g(l,m);if(t&&!d.e()&&0<=e)return null!=f&&Kd(f,new J("child_changed",d,c,A)),b.W(c,d);null!=f&&Kd(f,new J("child_removed",A,c));b=b.W(c,H);return null!=l&&a.ua.matches(l)?(null!=f&&Kd(f,new J("child_added",
	l.U,l.name)),b.W(l.name,l.U)):b}return d.e()?b:t&&0<=g(l,m)?(null!=f&&(Kd(f,new J("child_removed",l.U,l.name)),Kd(f,new J("child_added",d,c))),b.W(c,d).W(l.name,H)):b};function Yd(a,b){this.me=a;this.og=b}function Zd(a){this.X=a}
	Zd.prototype.gb=function(a,b,c,d){var e=new Jd,f;if(b.type===Bc)b.source.Ae?c=$d(this,a,b.path,b.Ja,c,d,e):(O(b.source.tf,"Unknown source."),f=b.source.ef||mc(a.w())&&!b.path.e(),c=ae(this,a,b.path,b.Ja,c,d,f,e));else if(b.type===be)b.source.Ae?c=ce(this,a,b.path,b.children,c,d,e):(O(b.source.tf,"Unknown source."),f=b.source.ef||mc(a.w()),c=de(this,a,b.path,b.children,c,d,f,e));else if(b.type===ee)if(b.Yd)if(b=b.path,null!=c.xc(b))c=a;else{f=new Vb(c,a,d);d=a.Q.j();if(b.e()||".priority"===K(b))lc(a.w())?
	b=c.Aa(Yb(a)):(b=a.w().j(),O(b instanceof fe,"serverChildren would be complete if leaf node"),b=c.Cc(b)),b=this.X.ya(d,b,e);else{var g=K(b),k=c.Bc(g,a.w());null==k&&Wb(a.w(),g)&&(k=d.T(g));b=null!=k?this.X.H(d,g,k,N(b),f,e):a.Q.j().Fa(g)?this.X.H(d,g,H,N(b),f,e):d;b.e()&&lc(a.w())&&(d=c.Aa(Yb(a)),d.L()&&(b=this.X.ya(b,d,e)))}d=lc(a.w())||null!=c.xc(M);c=ge(a,b,d,this.X.Ra())}else c=he(this,a,b.path,b.Ub,c,d,e);else if(b.type===Dc)d=b.path,b=a.w(),f=b.j(),g=b.ga||d.e(),c=ie(this,new je(a.Q,new Xb(f,
	g,b.Yb)),d,c,Ub,e);else throw jd("Unknown operation type: "+b.type);e=qa(e.ib);d=c;b=d.Q;b.ga&&(f=b.j().L()||b.j().e(),g=ke(a),(0<e.length||!a.Q.ga||f&&!b.j().ea(g)||!b.j().C().ea(g.C()))&&e.push(hc(ke(d))));return new Yd(c,e)};
	function ie(a,b,c,d,e,f){var g=b.Q;if(null!=d.xc(c))return b;var k;if(c.e())O(lc(b.w()),"If change path is empty, we must have complete server data"),mc(b.w())?(e=Yb(b),d=d.Cc(e instanceof fe?e:H)):d=d.Aa(Yb(b)),f=a.X.ya(b.Q.j(),d,f);else{var m=K(c);if(".priority"==m)O(1==le(c),"Can't have a priority with additional path components"),f=g.j(),k=b.w().j(),d=d.nd(c,f,k),f=null!=d?a.X.ia(f,d):g.j();else{var l=N(c);Wb(g,m)?(k=b.w().j(),d=d.nd(c,g.j(),k),d=null!=d?g.j().T(m).H(l,d):g.j().T(m)):d=d.Bc(m,
	b.w());f=null!=d?a.X.H(g.j(),m,d,l,e,f):g.j()}}return ge(b,f,g.ga||c.e(),a.X.Ra())}function ae(a,b,c,d,e,f,g,k){var m=b.w();g=g?a.X:a.X.$b();if(c.e())d=g.ya(m.j(),d,null);else if(g.Ra()&&!m.Yb)d=m.j().H(c,d),d=g.ya(m.j(),d,null);else{var l=K(c);if(!nc(m,c)&&1<le(c))return b;var t=N(c);d=m.j().T(l).H(t,d);d=".priority"==l?g.ia(m.j(),d):g.H(m.j(),l,d,t,Ub,null)}m=m.ga||c.e();b=new je(b.Q,new Xb(d,m,g.Ra()));return ie(a,b,c,e,new Vb(e,b,f),k)}
	function $d(a,b,c,d,e,f,g){var k=b.Q;e=new Vb(e,b,f);if(c.e())g=a.X.ya(b.Q.j(),d,g),a=ge(b,g,!0,a.X.Ra());else if(f=K(c),".priority"===f)g=a.X.ia(b.Q.j(),d),a=ge(b,g,k.ga,k.Yb);else{c=N(c);var m=k.j().T(f);if(!c.e()){var l=e.uf(f);d=null!=l?".priority"===me(c)&&l.S(c.parent()).e()?l:l.H(c,d):H}m.ea(d)?a=b:(g=a.X.H(k.j(),f,d,c,e,g),a=ge(b,g,k.ga,a.X.Ra()))}return a}
	function ce(a,b,c,d,e,f,g){var k=b;ne(d,function(d,l){var t=c.o(d);Wb(b.Q,K(t))&&(k=$d(a,k,t,l,e,f,g))});ne(d,function(d,l){var t=c.o(d);Wb(b.Q,K(t))||(k=$d(a,k,t,l,e,f,g))});return k}function oe(a,b){ne(b,function(b,d){a=a.H(b,d)});return a}
	function de(a,b,c,d,e,f,g,k){if(b.w().j().e()&&!lc(b.w()))return b;var m=b;c=c.e()?d:pe(qe,c,d);var l=b.w().j();c.children.ka(function(c,d){if(l.Fa(c)){var I=b.w().j().T(c),I=oe(I,d);m=ae(a,m,new P(c),I,e,f,g,k)}});c.children.ka(function(c,d){var I=!Wb(b.w(),c)&&null==d.value;l.Fa(c)||I||(I=b.w().j().T(c),I=oe(I,d),m=ae(a,m,new P(c),I,e,f,g,k))});return m}
	function he(a,b,c,d,e,f,g){if(null!=e.xc(c))return b;var k=mc(b.w()),m=b.w();if(null!=d.value){if(c.e()&&m.ga||nc(m,c))return ae(a,b,c,m.j().S(c),e,f,k,g);if(c.e()){var l=qe;m.j().R(re,function(a,b){l=l.set(new P(a),b)});return de(a,b,c,l,e,f,k,g)}return b}l=qe;ne(d,function(a){var b=c.o(a);nc(m,b)&&(l=l.set(a,m.j().S(b)))});return de(a,b,c,l,e,f,k,g)};function se(){}var te={};function Vd(a){return u(a.compare,a)}se.prototype.Dd=function(a,b){return 0!==this.compare(new L("[MIN_NAME]",a),new L("[MIN_NAME]",b))};se.prototype.Wc=function(){return ue};function ve(a){O(!a.e()&&".priority"!==K(a),"Can't create PathIndex with empty path or .priority key");this.gc=a}ka(ve,se);h=ve.prototype;h.Lc=function(a){return!a.S(this.gc).e()};h.compare=function(a,b){var c=a.U.S(this.gc),d=b.U.S(this.gc),c=c.Gc(d);return 0===c?yc(a.name,b.name):c};
	h.Sc=function(a,b){var c=Q(a),c=H.H(this.gc,c);return new L(b,c)};h.Tc=function(){var a=H.H(this.gc,we);return new L("[MAX_NAME]",a)};h.toString=function(){return this.gc.slice().join("/")};function xe(){}ka(xe,se);h=xe.prototype;h.compare=function(a,b){var c=a.U.C(),d=b.U.C(),c=c.Gc(d);return 0===c?yc(a.name,b.name):c};h.Lc=function(a){return!a.C().e()};h.Dd=function(a,b){return!a.C().ea(b.C())};h.Wc=function(){return ue};h.Tc=function(){return new L("[MAX_NAME]",new Yc("[PRIORITY-POST]",we))};
	h.Sc=function(a,b){var c=Q(a);return new L(b,new Yc("[PRIORITY-POST]",c))};h.toString=function(){return".priority"};var R=new xe;function ye(){}ka(ye,se);h=ye.prototype;h.compare=function(a,b){return yc(a.name,b.name)};h.Lc=function(){throw jd("KeyIndex.isDefinedOn not expected to be called.");};h.Dd=function(){return!1};h.Wc=function(){return ue};h.Tc=function(){return new L("[MAX_NAME]",H)};h.Sc=function(a){O(q(a),"KeyIndex indexValue must always be a string.");return new L(a,H)};h.toString=function(){return".key"};
	var re=new ye;function ze(){}ka(ze,se);h=ze.prototype;h.compare=function(a,b){var c=a.U.Gc(b.U);return 0===c?yc(a.name,b.name):c};h.Lc=function(){return!0};h.Dd=function(a,b){return!a.ea(b)};h.Wc=function(){return ue};h.Tc=function(){return Ae};h.Sc=function(a,b){var c=Q(a);return new L(b,c)};h.toString=function(){return".value"};var Be=new ze;function Ce(){this.Xb=this.ra=this.Pb=this.oa=this.la=!1;this.ma=0;this.Rb="";this.ic=null;this.Bb="";this.fc=null;this.zb="";this.g=R}var De=new Ce;function Td(a){return""===a.Rb?a.oa:"l"===a.Rb}function Od(a){O(a.oa,"Only valid if start has been set");return a.ic}function Nd(a){O(a.oa,"Only valid if start has been set");return a.Pb?a.Bb:"[MIN_NAME]"}function Rd(a){O(a.ra,"Only valid if end has been set");return a.fc}
	function Pd(a){O(a.ra,"Only valid if end has been set");return a.Xb?a.zb:"[MAX_NAME]"}function Ee(a){var b=new Ce;b.la=a.la;b.ma=a.ma;b.oa=a.oa;b.ic=a.ic;b.Pb=a.Pb;b.Bb=a.Bb;b.ra=a.ra;b.fc=a.fc;b.Xb=a.Xb;b.zb=a.zb;b.g=a.g;return b}h=Ce.prototype;h.Le=function(a){var b=Ee(this);b.la=!0;b.ma=a;b.Rb="";return b};h.Me=function(a){var b=Ee(this);b.la=!0;b.ma=a;b.Rb="l";return b};h.Ne=function(a){var b=Ee(this);b.la=!0;b.ma=a;b.Rb="r";return b};
	h.ce=function(a,b){var c=Ee(this);c.oa=!0;p(a)||(a=null);c.ic=a;null!=b?(c.Pb=!0,c.Bb=b):(c.Pb=!1,c.Bb="");return c};h.vd=function(a,b){var c=Ee(this);c.ra=!0;p(a)||(a=null);c.fc=a;p(b)?(c.Xb=!0,c.zb=b):(c.oh=!1,c.zb="");return c};function Fe(a,b){var c=Ee(a);c.g=b;return c}function Ge(a){var b={};a.oa&&(b.sp=a.ic,a.Pb&&(b.sn=a.Bb));a.ra&&(b.ep=a.fc,a.Xb&&(b.en=a.zb));if(a.la){b.l=a.ma;var c=a.Rb;""===c&&(c=Td(a)?"l":"r");b.vf=c}a.g!==R&&(b.i=a.g.toString());return b}
	function He(a){return!(a.oa||a.ra||a.la)}function Ie(a){return He(a)&&a.g==R}function Je(a){var b={};if(Ie(a))return b;var c;a.g===R?c="$priority":a.g===Be?c="$value":a.g===re?c="$key":(O(a.g instanceof ve,"Unrecognized index type!"),c=a.g.toString());b.orderBy=G(c);a.oa&&(b.startAt=G(a.ic),a.Pb&&(b.startAt+=","+G(a.Bb)));a.ra&&(b.endAt=G(a.fc),a.Xb&&(b.endAt+=","+G(a.zb)));a.la&&(Td(a)?b.limitToFirst=a.ma:b.limitToLast=a.ma);return b}h.toString=function(){return G(Ge(this))};function Ke(a,b){this.Ed=a;this.hc=b}Ke.prototype.get=function(a){var b=z(this.Ed,a);if(!b)throw Error("No index defined for "+a);return b===te?null:b};function Le(a,b,c){var d=ma(a.Ed,function(d,f){var g=z(a.hc,f);O(g,"Missing index implementation for "+f);if(d===te){if(g.Lc(b.U)){for(var k=[],m=c.ac(wc),l=Ic(m);l;)l.name!=b.name&&k.push(l),l=Ic(m);k.push(b);return Me(k,Vd(g))}return te}g=c.get(b.name);k=d;g&&(k=k.remove(new L(b.name,g)));return k.Sa(b,b.U)});return new Ke(d,a.hc)}
	function Ne(a,b,c){var d=ma(a.Ed,function(a){if(a===te)return a;var d=c.get(b.name);return d?a.remove(new L(b.name,d)):a});return new Ke(d,a.hc)}var Oe=new Ke({".priority":te},{".priority":R});function Yc(a,b){this.B=a;O(p(this.B)&&null!==this.B,"LeafNode shouldn't be created with null/undefined value.");this.ca=b||H;Pe(this.ca);this.Gb=null}var Qe=["object","boolean","number","string"];h=Yc.prototype;h.L=function(){return!0};h.C=function(){return this.ca};h.ia=function(a){return new Yc(this.B,a)};h.T=function(a){return".priority"===a?this.ca:H};h.S=function(a){return a.e()?this:".priority"===K(a)?this.ca:H};h.Fa=function(){return!1};h.wf=function(){return null};
	h.W=function(a,b){return".priority"===a?this.ia(b):b.e()&&".priority"!==a?this:H.W(a,b).ia(this.ca)};h.H=function(a,b){var c=K(a);if(null===c)return b;if(b.e()&&".priority"!==c)return this;O(".priority"!==c||1===le(a),".priority must be the last token in a path");return this.W(c,H.H(N(a),b))};h.e=function(){return!1};h.Hb=function(){return 0};h.R=function(){return!1};h.J=function(a){return a&&!this.C().e()?{".value":this.Ea(),".priority":this.C().J()}:this.Ea()};
	h.hash=function(){if(null===this.Gb){var a="";this.ca.e()||(a+="priority:"+Re(this.ca.J())+":");var b=typeof this.B,a=a+(b+":"),a="number"===b?a+Ad(this.B):a+this.B;this.Gb=ld(a)}return this.Gb};h.Ea=function(){return this.B};h.Gc=function(a){if(a===H)return 1;if(a instanceof fe)return-1;O(a.L(),"Unknown node type");var b=typeof a.B,c=typeof this.B,d=La(Qe,b),e=La(Qe,c);O(0<=d,"Unknown leaf type: "+b);O(0<=e,"Unknown leaf type: "+c);return d===e?"object"===c?0:this.B<a.B?-1:this.B===a.B?0:1:e-d};
	h.pb=function(){return this};h.Mc=function(){return!0};h.ea=function(a){return a===this?!0:a.L()?this.B===a.B&&this.ca.ea(a.ca):!1};h.toString=function(){return G(this.J(!0))};function fe(a,b,c){this.m=a;(this.ca=b)&&Pe(this.ca);a.e()&&O(!this.ca||this.ca.e(),"An empty node cannot have a priority");this.Ab=c;this.Gb=null}h=fe.prototype;h.L=function(){return!1};h.C=function(){return this.ca||H};h.ia=function(a){return this.m.e()?this:new fe(this.m,a,this.Ab)};h.T=function(a){if(".priority"===a)return this.C();a=this.m.get(a);return null===a?H:a};h.S=function(a){var b=K(a);return null===b?this:this.T(b).S(N(a))};h.Fa=function(a){return null!==this.m.get(a)};
	h.W=function(a,b){O(b,"We should always be passing snapshot nodes");if(".priority"===a)return this.ia(b);var c=new L(a,b),d,e;b.e()?(d=this.m.remove(a),c=Ne(this.Ab,c,this.m)):(d=this.m.Sa(a,b),c=Le(this.Ab,c,this.m));e=d.e()?H:this.ca;return new fe(d,e,c)};h.H=function(a,b){var c=K(a);if(null===c)return b;O(".priority"!==K(a)||1===le(a),".priority must be the last token in a path");var d=this.T(c).H(N(a),b);return this.W(c,d)};h.e=function(){return this.m.e()};h.Hb=function(){return this.m.count()};
	var Se=/^(0|[1-9]\d*)$/;h=fe.prototype;h.J=function(a){if(this.e())return null;var b={},c=0,d=0,e=!0;this.R(R,function(f,g){b[f]=g.J(a);c++;e&&Se.test(f)?d=Math.max(d,Number(f)):e=!1});if(!a&&e&&d<2*c){var f=[],g;for(g in b)f[g]=b[g];return f}a&&!this.C().e()&&(b[".priority"]=this.C().J());return b};h.hash=function(){if(null===this.Gb){var a="";this.C().e()||(a+="priority:"+Re(this.C().J())+":");this.R(R,function(b,c){var d=c.hash();""!==d&&(a+=":"+b+":"+d)});this.Gb=""===a?"":ld(a)}return this.Gb};
	h.wf=function(a,b,c){return(c=Te(this,c))?(a=Gc(c,new L(a,b)))?a.name:null:Gc(this.m,a)};function Wd(a,b){var c;c=(c=Te(a,b))?(c=c.Vc())&&c.name:a.m.Vc();return c?new L(c,a.m.get(c)):null}function Xd(a,b){var c;c=(c=Te(a,b))?(c=c.jc())&&c.name:a.m.jc();return c?new L(c,a.m.get(c)):null}h.R=function(a,b){var c=Te(this,a);return c?c.ka(function(a){return b(a.name,a.U)}):this.m.ka(b)};h.ac=function(a){return this.bc(a.Wc(),a)};
	h.bc=function(a,b){var c=Te(this,b);if(c)return c.bc(a,function(a){return a});for(var c=this.m.bc(a.name,wc),d=Jc(c);null!=d&&0>b.compare(d,a);)Ic(c),d=Jc(c);return c};h.xf=function(a){return this.dc(a.Tc(),a)};h.dc=function(a,b){var c=Te(this,b);if(c)return c.dc(a,function(a){return a});for(var c=this.m.dc(a.name,wc),d=Jc(c);null!=d&&0<b.compare(d,a);)Ic(c),d=Jc(c);return c};h.Gc=function(a){return this.e()?a.e()?0:-1:a.L()||a.e()?1:a===we?-1:0};
	h.pb=function(a){if(a===re||sa(this.Ab.hc,a.toString()))return this;var b=this.Ab,c=this.m;O(a!==re,"KeyIndex always exists and isn't meant to be added to the IndexMap.");for(var d=[],e=!1,c=c.ac(wc),f=Ic(c);f;)e=e||a.Lc(f.U),d.push(f),f=Ic(c);d=e?Me(d,Vd(a)):te;e=a.toString();c=wa(b.hc);c[e]=a;a=wa(b.Ed);a[e]=d;return new fe(this.m,this.ca,new Ke(a,c))};h.Mc=function(a){return a===re||sa(this.Ab.hc,a.toString())};
	h.ea=function(a){if(a===this)return!0;if(a.L())return!1;if(this.C().ea(a.C())&&this.m.count()===a.m.count()){var b=this.ac(R);a=a.ac(R);for(var c=Ic(b),d=Ic(a);c&&d;){if(c.name!==d.name||!c.U.ea(d.U))return!1;c=Ic(b);d=Ic(a)}return null===c&&null===d}return!1};function Te(a,b){return b===re?null:a.Ab.get(b.toString())}h.toString=function(){return G(this.J(!0))};function Q(a,b){if(null===a)return H;var c=null;"object"===typeof a&&".priority"in a?c=a[".priority"]:"undefined"!==typeof b&&(c=b);O(null===c||"string"===typeof c||"number"===typeof c||"object"===typeof c&&".sv"in c,"Invalid priority type found: "+typeof c);"object"===typeof a&&".value"in a&&null!==a[".value"]&&(a=a[".value"]);if("object"!==typeof a||".sv"in a)return new Yc(a,Q(c));if(a instanceof Array){var d=H,e=a;v(e,function(a,b){if(y(e,b)&&"."!==b.substring(0,1)){var c=Q(a);if(c.L()||!c.e())d=
	d.W(b,c)}});return d.ia(Q(c))}var f=[],g=!1,k=a;Fb(k,function(a){if("string"!==typeof a||"."!==a.substring(0,1)){var b=Q(k[a]);b.e()||(g=g||!b.C().e(),f.push(new L(a,b)))}});if(0==f.length)return H;var m=Me(f,xc,function(a){return a.name},zc);if(g){var l=Me(f,Vd(R));return new fe(m,Q(c),new Ke({".priority":l},{".priority":R}))}return new fe(m,Q(c),Oe)}var Ue=Math.log(2);
	function Ve(a){this.count=parseInt(Math.log(a+1)/Ue,10);this.nf=this.count-1;this.ng=a+1&parseInt(Array(this.count+1).join("1"),2)}function We(a){var b=!(a.ng&1<<a.nf);a.nf--;return b}
	function Me(a,b,c,d){function e(b,d){var f=d-b;if(0==f)return null;if(1==f){var l=a[b],t=c?c(l):l;return new Kc(t,l.U,!1,null,null)}var l=parseInt(f/2,10)+b,f=e(b,l),A=e(l+1,d),l=a[l],t=c?c(l):l;return new Kc(t,l.U,!1,f,A)}a.sort(b);var f=function(b){function d(b,g){var k=t-b,A=t;t-=b;var A=e(k+1,A),k=a[k],I=c?c(k):k,A=new Kc(I,k.U,g,null,A);f?f.left=A:l=A;f=A}for(var f=null,l=null,t=a.length,A=0;A<b.count;++A){var I=We(b),Qd=Math.pow(2,b.count-(A+1));I?d(Qd,!1):(d(Qd,!1),d(Qd,!0))}return l}(new Ve(a.length));
	return null!==f?new Ec(d||b,f):new Ec(d||b)}function Re(a){return"number"===typeof a?"number:"+Ad(a):"string:"+a}function Pe(a){if(a.L()){var b=a.J();O("string"===typeof b||"number"===typeof b||"object"===typeof b&&y(b,".sv"),"Priority must be a string or number.")}else O(a===we||a.e(),"priority of unexpected type.");O(a===we||a.C().e(),"Priority nodes can't have a priority of their own.")}var H=new fe(new Ec(zc),null,Oe);function Xe(){fe.call(this,new Ec(zc),H,Oe)}ka(Xe,fe);h=Xe.prototype;
	h.Gc=function(a){return a===this?0:1};h.ea=function(a){return a===this};h.C=function(){return this};h.T=function(){return H};h.e=function(){return!1};var we=new Xe,ue=new L("[MIN_NAME]",H),Ae=new L("[MAX_NAME]",we);function je(a,b){this.Q=a;this.ae=b}function ge(a,b,c,d){return new je(new Xb(b,c,d),a.ae)}function ke(a){return a.Q.ga?a.Q.j():null}je.prototype.w=function(){return this.ae};function Yb(a){return a.ae.ga?a.ae.j():null};function Ye(a,b){this.Y=a;var c=a.n,d=new Ld(c.g),c=He(c)?new Ld(c.g):c.la?new Sd(c):new Md(c);this.Nf=new Zd(c);var e=b.w(),f=b.Q,g=d.ya(H,e.j(),null),k=c.ya(H,f.j(),null);this.Oa=new je(new Xb(k,f.ga,c.Ra()),new Xb(g,e.ga,d.Ra()));this.$a=[];this.ug=new Fd(a)}function Ze(a){return a.Y}h=Ye.prototype;h.w=function(){return this.Oa.w().j()};h.kb=function(a){var b=Yb(this.Oa);return b&&(He(this.Y.n)||!a.e()&&!b.T(K(a)).e())?b.S(a):null};h.e=function(){return 0===this.$a.length};h.Tb=function(a){this.$a.push(a)};
	h.nb=function(a,b){var c=[];if(b){O(null==a,"A cancel should cancel all event registrations.");var d=this.Y.path;Ma(this.$a,function(a){(a=a.lf(b,d))&&c.push(a)})}if(a){for(var e=[],f=0;f<this.$a.length;++f){var g=this.$a[f];if(!g.matches(a))e.push(g);else if(a.yf()){e=e.concat(this.$a.slice(f+1));break}}this.$a=e}else this.$a=[];return c};
	h.gb=function(a,b,c){a.type===be&&null!==a.source.Lb&&(O(Yb(this.Oa),"We should always have a full cache before handling merges"),O(ke(this.Oa),"Missing event cache, even though we have a server cache"));var d=this.Oa;a=this.Nf.gb(d,a,b,c);b=this.Nf;c=a.me;O(c.Q.j().Mc(b.X.g),"Event snap not indexed");O(c.w().j().Mc(b.X.g),"Server snap not indexed");O(lc(a.me.w())||!lc(d.w()),"Once a server snap is complete, it should never go back");this.Oa=a.me;return $e(this,a.og,a.me.Q.j(),null)};
	function af(a,b){var c=a.Oa.Q,d=[];c.j().L()||c.j().R(R,function(a,b){d.push(new J("child_added",b,a))});c.ga&&d.push(hc(c.j()));return $e(a,d,c.j(),b)}function $e(a,b,c,d){return Gd(a.ug,b,c,d?[d]:a.$a)};function bf(a,b,c){this.type=be;this.source=a;this.path=b;this.children=c}bf.prototype.$c=function(a){if(this.path.e())return a=this.children.subtree(new P(a)),a.e()?null:a.value?new Ac(this.source,M,a.value):new bf(this.source,M,a);O(K(this.path)===a,"Can't get a merge for a child not on the path of the operation");return new bf(this.source,N(this.path),this.children)};bf.prototype.toString=function(){return"Operation("+this.path+": "+this.source.toString()+" merge: "+this.children.toString()+")"};function cf(a,b){this.f=pd("p:rest:");this.G=a;this.Kb=b;this.Ca=null;this.ba={}}function df(a,b){if(p(b))return"tag$"+b;O(Ie(a.n),"should have a tag if it's not a default query.");return a.path.toString()}h=cf.prototype;
	h.Cf=function(a,b,c,d){var e=a.path.toString();this.f("Listen called for "+e+" "+a.wa());var f=df(a,c),g={};this.ba[f]=g;a=Je(a.n);var k=this;ef(this,e+".json",a,function(a,b){var t=b;404===a&&(a=t=null);null===a&&k.Kb(e,t,!1,c);z(k.ba,f)===g&&d(a?401==a?"permission_denied":"rest_error:"+a:"ok",null)})};h.$f=function(a,b){var c=df(a,b);delete this.ba[c]};h.O=function(a,b){this.Ca=a;var c=Cd(a),d=c.data,c=c.Ec&&c.Ec.exp;b&&b("ok",{auth:d,expires:c})};h.je=function(a){this.Ca=null;a("ok",null)};
	h.Qe=function(){};h.Gf=function(){};h.Md=function(){};h.put=function(){};h.Df=function(){};h.Ye=function(){};
	function ef(a,b,c,d){c=c||{};c.format="export";a.Ca&&(c.auth=a.Ca);var e=(a.G.ob?"https://":"http://")+a.G.host+b+"?"+Ib(c);a.f("Sending REST request for "+e);var f=new XMLHttpRequest;f.onreadystatechange=function(){if(d&&4===f.readyState){a.f("REST Response for "+e+" received. status:",f.status,"response:",f.responseText);var b=null;if(200<=f.status&&300>f.status){try{b=Rb(f.responseText)}catch(c){S("Failed to parse JSON response for "+e+": "+f.responseText)}d(null,b)}else 401!==f.status&&404!==
	f.status&&S("Got unsuccessful REST response for "+e+" Status: "+f.status),d(f.status);d=null}};f.open("GET",e,!0);f.send()};function ff(a){O(da(a)&&0<a.length,"Requires a non-empty array");this.fg=a;this.Rc={}}ff.prototype.ie=function(a,b){var c;c=this.Rc[a]||[];var d=c.length;if(0<d){for(var e=Array(d),f=0;f<d;f++)e[f]=c[f];c=e}else c=[];for(d=0;d<c.length;d++)c[d].Dc.apply(c[d].Qa,Array.prototype.slice.call(arguments,1))};ff.prototype.Ib=function(a,b,c){gf(this,a);this.Rc[a]=this.Rc[a]||[];this.Rc[a].push({Dc:b,Qa:c});(a=this.Ee(a))&&b.apply(c,a)};
	ff.prototype.mc=function(a,b,c){gf(this,a);a=this.Rc[a]||[];for(var d=0;d<a.length;d++)if(a[d].Dc===b&&(!c||c===a[d].Qa)){a.splice(d,1);break}};function gf(a,b){O(Ra(a.fg,function(a){return a===b}),"Unknown event: "+b)};var hf=function(){var a=0,b=[];return function(c){var d=c===a;a=c;for(var e=Array(8),f=7;0<=f;f--)e[f]="-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(c%64),c=Math.floor(c/64);O(0===c,"Cannot push at time == 0");c=e.join("");if(d){for(f=11;0<=f&&63===b[f];f--)b[f]=0;b[f]++}else for(f=0;12>f;f++)b[f]=Math.floor(64*Math.random());for(f=0;12>f;f++)c+="-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(b[f]);O(20===c.length,"nextPushId: Length should be 20.");
	return c}}();function jf(){ff.call(this,["online"]);this.oc=!0;if("undefined"!==typeof window&&"undefined"!==typeof window.addEventListener){var a=this;window.addEventListener("online",function(){a.oc||(a.oc=!0,a.ie("online",!0))},!1);window.addEventListener("offline",function(){a.oc&&(a.oc=!1,a.ie("online",!1))},!1)}}ka(jf,ff);jf.prototype.Ee=function(a){O("online"===a,"Unknown event type: "+a);return[this.oc]};ba(jf);function kf(){ff.call(this,["visible"]);var a,b;"undefined"!==typeof document&&"undefined"!==typeof document.addEventListener&&("undefined"!==typeof document.hidden?(b="visibilitychange",a="hidden"):"undefined"!==typeof document.mozHidden?(b="mozvisibilitychange",a="mozHidden"):"undefined"!==typeof document.msHidden?(b="msvisibilitychange",a="msHidden"):"undefined"!==typeof document.webkitHidden&&(b="webkitvisibilitychange",a="webkitHidden"));this.Sb=!0;if(b){var c=this;document.addEventListener(b,
	function(){var b=!document[a];b!==c.Sb&&(c.Sb=b,c.ie("visible",b))},!1)}}ka(kf,ff);kf.prototype.Ee=function(a){O("visible"===a,"Unknown event type: "+a);return[this.Sb]};ba(kf);function P(a,b){if(1==arguments.length){this.u=a.split("/");for(var c=0,d=0;d<this.u.length;d++)0<this.u[d].length&&(this.u[c]=this.u[d],c++);this.u.length=c;this.aa=0}else this.u=a,this.aa=b}function lf(a,b){var c=K(a);if(null===c)return b;if(c===K(b))return lf(N(a),N(b));throw Error("INTERNAL ERROR: innerPath ("+b+") is not within outerPath ("+a+")");}
	function mf(a,b){for(var c=a.slice(),d=b.slice(),e=0;e<c.length&&e<d.length;e++){var f=yc(c[e],d[e]);if(0!==f)return f}return c.length===d.length?0:c.length<d.length?-1:1}function K(a){return a.aa>=a.u.length?null:a.u[a.aa]}function le(a){return a.u.length-a.aa}function N(a){var b=a.aa;b<a.u.length&&b++;return new P(a.u,b)}function me(a){return a.aa<a.u.length?a.u[a.u.length-1]:null}h=P.prototype;
	h.toString=function(){for(var a="",b=this.aa;b<this.u.length;b++)""!==this.u[b]&&(a+="/"+this.u[b]);return a||"/"};h.slice=function(a){return this.u.slice(this.aa+(a||0))};h.parent=function(){if(this.aa>=this.u.length)return null;for(var a=[],b=this.aa;b<this.u.length-1;b++)a.push(this.u[b]);return new P(a,0)};
	h.o=function(a){for(var b=[],c=this.aa;c<this.u.length;c++)b.push(this.u[c]);if(a instanceof P)for(c=a.aa;c<a.u.length;c++)b.push(a.u[c]);else for(a=a.split("/"),c=0;c<a.length;c++)0<a[c].length&&b.push(a[c]);return new P(b,0)};h.e=function(){return this.aa>=this.u.length};h.ea=function(a){if(le(this)!==le(a))return!1;for(var b=this.aa,c=a.aa;b<=this.u.length;b++,c++)if(this.u[b]!==a.u[c])return!1;return!0};
	h.contains=function(a){var b=this.aa,c=a.aa;if(le(this)>le(a))return!1;for(;b<this.u.length;){if(this.u[b]!==a.u[c])return!1;++b;++c}return!0};var M=new P("");function nf(a,b){this.Ua=a.slice();this.Ka=Math.max(1,this.Ua.length);this.pf=b;for(var c=0;c<this.Ua.length;c++)this.Ka+=Pb(this.Ua[c]);of(this)}nf.prototype.push=function(a){0<this.Ua.length&&(this.Ka+=1);this.Ua.push(a);this.Ka+=Pb(a);of(this)};nf.prototype.pop=function(){var a=this.Ua.pop();this.Ka-=Pb(a);0<this.Ua.length&&--this.Ka};
	function of(a){if(768<a.Ka)throw Error(a.pf+"has a key path longer than 768 bytes ("+a.Ka+").");if(32<a.Ua.length)throw Error(a.pf+"path specified exceeds the maximum depth that can be written (32) or object contains a cycle "+pf(a));}function pf(a){return 0==a.Ua.length?"":"in property '"+a.Ua.join(".")+"'"};function qf(a,b){this.value=a;this.children=b||rf}var rf=new Ec(function(a,b){return a===b?0:a<b?-1:1});function sf(a){var b=qe;v(a,function(a,d){b=b.set(new P(d),a)});return b}h=qf.prototype;h.e=function(){return null===this.value&&this.children.e()};function tf(a,b,c){if(null!=a.value&&c(a.value))return{path:M,value:a.value};if(b.e())return null;var d=K(b);a=a.children.get(d);return null!==a?(b=tf(a,N(b),c),null!=b?{path:(new P(d)).o(b.path),value:b.value}:null):null}
	function uf(a,b){return tf(a,b,function(){return!0})}h.subtree=function(a){if(a.e())return this;var b=this.children.get(K(a));return null!==b?b.subtree(N(a)):qe};h.set=function(a,b){if(a.e())return new qf(b,this.children);var c=K(a),d=(this.children.get(c)||qe).set(N(a),b),c=this.children.Sa(c,d);return new qf(this.value,c)};
	h.remove=function(a){if(a.e())return this.children.e()?qe:new qf(null,this.children);var b=K(a),c=this.children.get(b);return c?(a=c.remove(N(a)),b=a.e()?this.children.remove(b):this.children.Sa(b,a),null===this.value&&b.e()?qe:new qf(this.value,b)):this};h.get=function(a){if(a.e())return this.value;var b=this.children.get(K(a));return b?b.get(N(a)):null};
	function pe(a,b,c){if(b.e())return c;var d=K(b);b=pe(a.children.get(d)||qe,N(b),c);d=b.e()?a.children.remove(d):a.children.Sa(d,b);return new qf(a.value,d)}function vf(a,b){return wf(a,M,b)}function wf(a,b,c){var d={};a.children.ka(function(a,f){d[a]=wf(f,b.o(a),c)});return c(b,a.value,d)}function xf(a,b,c){return yf(a,b,M,c)}function yf(a,b,c,d){var e=a.value?d(c,a.value):!1;if(e)return e;if(b.e())return null;e=K(b);return(a=a.children.get(e))?yf(a,N(b),c.o(e),d):null}
	function zf(a,b,c){Af(a,b,M,c)}function Af(a,b,c,d){if(b.e())return a;a.value&&d(c,a.value);var e=K(b);return(a=a.children.get(e))?Af(a,N(b),c.o(e),d):qe}function ne(a,b){Bf(a,M,b)}function Bf(a,b,c){a.children.ka(function(a,e){Bf(e,b.o(a),c)});a.value&&c(b,a.value)}function Cf(a,b){a.children.ka(function(a,d){d.value&&b(a,d.value)})}var qe=new qf(null);qf.prototype.toString=function(){var a={};ne(this,function(b,c){a[b.toString()]=c.toString()});return G(a)};function Df(a,b,c){this.type=ee;this.source=Ef;this.path=a;this.Ub=b;this.Yd=c}Df.prototype.$c=function(a){if(this.path.e()){if(null!=this.Ub.value)return O(this.Ub.children.e(),"affectedTree should not have overlapping affected paths."),this;a=this.Ub.subtree(new P(a));return new Df(M,a,this.Yd)}O(K(this.path)===a,"operationForChild called for unrelated child.");return new Df(N(this.path),this.Ub,this.Yd)};
	Df.prototype.toString=function(){return"Operation("+this.path+": "+this.source.toString()+" ack write revert="+this.Yd+" affectedTree="+this.Ub+")"};var Bc=0,be=1,ee=2,Dc=3;function Ff(a,b,c,d){this.Ae=a;this.tf=b;this.Lb=c;this.ef=d;O(!d||b,"Tagged queries must be from server.")}var Ef=new Ff(!0,!1,null,!1),Gf=new Ff(!1,!0,null,!1);Ff.prototype.toString=function(){return this.Ae?"user":this.ef?"server(queryID="+this.Lb+")":"server"};function Hf(a){this.Z=a}var If=new Hf(new qf(null));function Jf(a,b,c){if(b.e())return new Hf(new qf(c));var d=uf(a.Z,b);if(null!=d){var e=d.path,d=d.value;b=lf(e,b);d=d.H(b,c);return new Hf(a.Z.set(e,d))}a=pe(a.Z,b,new qf(c));return new Hf(a)}function Kf(a,b,c){var d=a;Fb(c,function(a,c){d=Jf(d,b.o(a),c)});return d}Hf.prototype.Ud=function(a){if(a.e())return If;a=pe(this.Z,a,qe);return new Hf(a)};function Lf(a,b){var c=uf(a.Z,b);return null!=c?a.Z.get(c.path).S(lf(c.path,b)):null}
	function Mf(a){var b=[],c=a.Z.value;null!=c?c.L()||c.R(R,function(a,c){b.push(new L(a,c))}):a.Z.children.ka(function(a,c){null!=c.value&&b.push(new L(a,c.value))});return b}function Nf(a,b){if(b.e())return a;var c=Lf(a,b);return null!=c?new Hf(new qf(c)):new Hf(a.Z.subtree(b))}Hf.prototype.e=function(){return this.Z.e()};Hf.prototype.apply=function(a){return Of(M,this.Z,a)};
	function Of(a,b,c){if(null!=b.value)return c.H(a,b.value);var d=null;b.children.ka(function(b,f){".priority"===b?(O(null!==f.value,"Priority writes must always be leaf nodes"),d=f.value):c=Of(a.o(b),f,c)});c.S(a).e()||null===d||(c=c.H(a.o(".priority"),d));return c};function Pf(){this.V=If;this.pa=[];this.Pc=-1}function Qf(a,b){for(var c=0;c<a.pa.length;c++){var d=a.pa[c];if(d.md===b)return d}return null}h=Pf.prototype;
	h.Ud=function(a){var b=Sa(this.pa,function(b){return b.md===a});O(0<=b,"removeWrite called with nonexistent writeId.");var c=this.pa[b];this.pa.splice(b,1);for(var d=c.visible,e=!1,f=this.pa.length-1;d&&0<=f;){var g=this.pa[f];g.visible&&(f>=b&&Rf(g,c.path)?d=!1:c.path.contains(g.path)&&(e=!0));f--}if(d){if(e)this.V=Sf(this.pa,Tf,M),this.Pc=0<this.pa.length?this.pa[this.pa.length-1].md:-1;else if(c.Ja)this.V=this.V.Ud(c.path);else{var k=this;v(c.children,function(a,b){k.V=k.V.Ud(c.path.o(b))})}return!0}return!1};
	h.Aa=function(a,b,c,d){if(c||d){var e=Nf(this.V,a);return!d&&e.e()?b:d||null!=b||null!=Lf(e,M)?(e=Sf(this.pa,function(b){return(b.visible||d)&&(!c||!(0<=La(c,b.md)))&&(b.path.contains(a)||a.contains(b.path))},a),b=b||H,e.apply(b)):null}e=Lf(this.V,a);if(null!=e)return e;e=Nf(this.V,a);return e.e()?b:null!=b||null!=Lf(e,M)?(b=b||H,e.apply(b)):null};
	h.Cc=function(a,b){var c=H,d=Lf(this.V,a);if(d)d.L()||d.R(R,function(a,b){c=c.W(a,b)});else if(b){var e=Nf(this.V,a);b.R(R,function(a,b){var d=Nf(e,new P(a)).apply(b);c=c.W(a,d)});Ma(Mf(e),function(a){c=c.W(a.name,a.U)})}else e=Nf(this.V,a),Ma(Mf(e),function(a){c=c.W(a.name,a.U)});return c};h.nd=function(a,b,c,d){O(c||d,"Either existingEventSnap or existingServerSnap must exist");a=a.o(b);if(null!=Lf(this.V,a))return null;a=Nf(this.V,a);return a.e()?d.S(b):a.apply(d.S(b))};
	h.Bc=function(a,b,c){a=a.o(b);var d=Lf(this.V,a);return null!=d?d:Wb(c,b)?Nf(this.V,a).apply(c.j().T(b)):null};h.xc=function(a){return Lf(this.V,a)};h.qe=function(a,b,c,d,e,f){var g;a=Nf(this.V,a);g=Lf(a,M);if(null==g)if(null!=b)g=a.apply(b);else return[];g=g.pb(f);if(g.e()||g.L())return[];b=[];a=Vd(f);e=e?g.dc(c,f):g.bc(c,f);for(f=Ic(e);f&&b.length<d;)0!==a(f,c)&&b.push(f),f=Ic(e);return b};
	function Rf(a,b){return a.Ja?a.path.contains(b):!!ta(a.children,function(c,d){return a.path.o(d).contains(b)})}function Tf(a){return a.visible}
	function Sf(a,b,c){for(var d=If,e=0;e<a.length;++e){var f=a[e];if(b(f)){var g=f.path;if(f.Ja)c.contains(g)?(g=lf(c,g),d=Jf(d,g,f.Ja)):g.contains(c)&&(g=lf(g,c),d=Jf(d,M,f.Ja.S(g)));else if(f.children)if(c.contains(g))g=lf(c,g),d=Kf(d,g,f.children);else{if(g.contains(c))if(g=lf(g,c),g.e())d=Kf(d,M,f.children);else if(f=z(f.children,K(g)))f=f.S(N(g)),d=Jf(d,M,f)}else throw jd("WriteRecord should have .snap or .children");}}return d}function Uf(a,b){this.Qb=a;this.Z=b}h=Uf.prototype;
	h.Aa=function(a,b,c){return this.Z.Aa(this.Qb,a,b,c)};h.Cc=function(a){return this.Z.Cc(this.Qb,a)};h.nd=function(a,b,c){return this.Z.nd(this.Qb,a,b,c)};h.xc=function(a){return this.Z.xc(this.Qb.o(a))};h.qe=function(a,b,c,d,e){return this.Z.qe(this.Qb,a,b,c,d,e)};h.Bc=function(a,b){return this.Z.Bc(this.Qb,a,b)};h.o=function(a){return new Uf(this.Qb.o(a),this.Z)};function Vf(){this.children={};this.pd=0;this.value=null}function Wf(a,b,c){this.Jd=a?a:"";this.Ha=b?b:null;this.A=c?c:new Vf}function Xf(a,b){for(var c=b instanceof P?b:new P(b),d=a,e;null!==(e=K(c));)d=new Wf(e,d,z(d.A.children,e)||new Vf),c=N(c);return d}h=Wf.prototype;h.Ea=function(){return this.A.value};function Yf(a,b){O("undefined"!==typeof b,"Cannot set value to undefined");a.A.value=b;Zf(a)}h.clear=function(){this.A.value=null;this.A.children={};this.A.pd=0;Zf(this)};
	h.zd=function(){return 0<this.A.pd};h.e=function(){return null===this.Ea()&&!this.zd()};h.R=function(a){var b=this;v(this.A.children,function(c,d){a(new Wf(d,b,c))})};function $f(a,b,c,d){c&&!d&&b(a);a.R(function(a){$f(a,b,!0,d)});c&&d&&b(a)}function ag(a,b){for(var c=a.parent();null!==c&&!b(c);)c=c.parent()}h.path=function(){return new P(null===this.Ha?this.Jd:this.Ha.path()+"/"+this.Jd)};h.name=function(){return this.Jd};h.parent=function(){return this.Ha};
	function Zf(a){if(null!==a.Ha){var b=a.Ha,c=a.Jd,d=a.e(),e=y(b.A.children,c);d&&e?(delete b.A.children[c],b.A.pd--,Zf(b)):d||e||(b.A.children[c]=a.A,b.A.pd++,Zf(b))}};var bg=/[\[\].#$\/\u0000-\u001F\u007F]/,cg=/[\[\].#$\u0000-\u001F\u007F]/,dg=/^[a-zA-Z][a-zA-Z._\-+]+$/;function eg(a){return q(a)&&0!==a.length&&!bg.test(a)}function fg(a){return null===a||q(a)||fa(a)&&!td(a)||ga(a)&&y(a,".sv")}function gg(a,b,c,d){d&&!p(b)||hg(E(a,1,d),b,c)}
	function hg(a,b,c){c instanceof P&&(c=new nf(c,a));if(!p(b))throw Error(a+"contains undefined "+pf(c));if(r(b))throw Error(a+"contains a function "+pf(c)+" with contents: "+b.toString());if(td(b))throw Error(a+"contains "+b.toString()+" "+pf(c));if(q(b)&&b.length>10485760/3&&10485760<Pb(b))throw Error(a+"contains a string greater than 10485760 utf8 bytes "+pf(c)+" ('"+b.substring(0,50)+"...')");if(ga(b)){var d=!1,e=!1;Fb(b,function(b,g){if(".value"===b)d=!0;else if(".priority"!==b&&".sv"!==b&&(e=
	!0,!eg(b)))throw Error(a+" contains an invalid key ("+b+") "+pf(c)+'.  Keys must be non-empty strings and can\'t contain ".", "#", "$", "/", "[", or "]"');c.push(b);hg(a,g,c);c.pop()});if(d&&e)throw Error(a+' contains ".value" child '+pf(c)+" in addition to actual children.");}}
	function ig(a,b){var c,d;for(c=0;c<b.length;c++){d=b[c];for(var e=d.slice(),f=0;f<e.length;f++)if((".priority"!==e[f]||f!==e.length-1)&&!eg(e[f]))throw Error(a+"contains an invalid key ("+e[f]+") in path "+d.toString()+'. Keys must be non-empty strings and can\'t contain ".", "#", "$", "/", "[", or "]"');}b.sort(mf);e=null;for(c=0;c<b.length;c++){d=b[c];if(null!==e&&e.contains(d))throw Error(a+"contains a path "+e.toString()+" that is ancestor of another path "+d.toString());e=d}}
	function jg(a,b,c){var d=E(a,1,!1);if(!ga(b)||da(b))throw Error(d+" must be an object containing the children to replace.");var e=[];Fb(b,function(a,b){var k=new P(a);hg(d,b,c.o(k));if(".priority"===me(k)&&!fg(b))throw Error(d+"contains an invalid value for '"+k.toString()+"', which must be a valid Firebase priority (a string, finite number, server value, or null).");e.push(k)});ig(d,e)}
	function kg(a,b,c){if(td(c))throw Error(E(a,b,!1)+"is "+c.toString()+", but must be a valid Firebase priority (a string, finite number, server value, or null).");if(!fg(c))throw Error(E(a,b,!1)+"must be a valid Firebase priority (a string, finite number, server value, or null).");}
	function lg(a,b,c){if(!c||p(b))switch(b){case "value":case "child_added":case "child_removed":case "child_changed":case "child_moved":break;default:throw Error(E(a,1,c)+'must be a valid event type: "value", "child_added", "child_removed", "child_changed", or "child_moved".');}}function mg(a,b){if(p(b)&&!eg(b))throw Error(E(a,2,!0)+'was an invalid key: "'+b+'".  Firebase keys must be non-empty strings and can\'t contain ".", "#", "$", "/", "[", or "]").');}
	function ng(a,b){if(!q(b)||0===b.length||cg.test(b))throw Error(E(a,1,!1)+'was an invalid path: "'+b+'". Paths must be non-empty strings and can\'t contain ".", "#", "$", "[", or "]"');}function og(a,b){if(".info"===K(b))throw Error(a+" failed: Can't modify data under /.info/");}function pg(a,b){if(!q(b))throw Error(E(a,1,!1)+"must be a valid credential (a string).");}function qg(a,b,c){if(!q(c))throw Error(E(a,b,!1)+"must be a valid string.");}
	function rg(a,b){qg(a,1,b);if(!dg.test(b))throw Error(E(a,1,!1)+"'"+b+"' is not a valid authentication provider.");}function sg(a,b,c,d){if(!d||p(c))if(!ga(c)||null===c)throw Error(E(a,b,d)+"must be a valid object.");}function tg(a,b,c){if(!ga(b)||!y(b,c))throw Error(E(a,1,!1)+'must contain the key "'+c+'"');if(!q(z(b,c)))throw Error(E(a,1,!1)+'must contain the key "'+c+'" with type "string"');};function ug(){this.set={}}h=ug.prototype;h.add=function(a,b){this.set[a]=null!==b?b:!0};h.contains=function(a){return y(this.set,a)};h.get=function(a){return this.contains(a)?this.set[a]:void 0};h.remove=function(a){delete this.set[a]};h.clear=function(){this.set={}};h.e=function(){return va(this.set)};h.count=function(){return oa(this.set)};function vg(a,b){v(a.set,function(a,d){b(d,a)})}h.keys=function(){var a=[];v(this.set,function(b,c){a.push(c)});return a};function Vc(){this.m=this.B=null}Vc.prototype.find=function(a){if(null!=this.B)return this.B.S(a);if(a.e()||null==this.m)return null;var b=K(a);a=N(a);return this.m.contains(b)?this.m.get(b).find(a):null};Vc.prototype.rc=function(a,b){if(a.e())this.B=b,this.m=null;else if(null!==this.B)this.B=this.B.H(a,b);else{null==this.m&&(this.m=new ug);var c=K(a);this.m.contains(c)||this.m.add(c,new Vc);c=this.m.get(c);a=N(a);c.rc(a,b)}};
	function wg(a,b){if(b.e())return a.B=null,a.m=null,!0;if(null!==a.B){if(a.B.L())return!1;var c=a.B;a.B=null;c.R(R,function(b,c){a.rc(new P(b),c)});return wg(a,b)}return null!==a.m?(c=K(b),b=N(b),a.m.contains(c)&&wg(a.m.get(c),b)&&a.m.remove(c),a.m.e()?(a.m=null,!0):!1):!0}function Wc(a,b,c){null!==a.B?c(b,a.B):a.R(function(a,e){var f=new P(b.toString()+"/"+a);Wc(e,f,c)})}Vc.prototype.R=function(a){null!==this.m&&vg(this.m,function(b,c){a(b,c)})};var xg="auth.firebase.com";function yg(a,b,c){this.qd=a||{};this.he=b||{};this.fb=c||{};this.qd.remember||(this.qd.remember="default")}var zg=["remember","redirectTo"];function Ag(a){var b={},c={};Fb(a||{},function(a,e){0<=La(zg,a)?b[a]=e:c[a]=e});return new yg(b,{},c)};function Bg(a,b){this.Ue=["session",a.Rd,a.lc].join(":");this.ee=b}Bg.prototype.set=function(a,b){if(!b)if(this.ee.length)b=this.ee[0];else throw Error("fb.login.SessionManager : No storage options available!");b.set(this.Ue,a)};Bg.prototype.get=function(){var a=Oa(this.ee,u(this.Bg,this)),a=Na(a,function(a){return null!==a});Va(a,function(a,c){return Dd(c.token)-Dd(a.token)});return 0<a.length?a.shift():null};Bg.prototype.Bg=function(a){try{var b=a.get(this.Ue);if(b&&b.token)return b}catch(c){}return null};
	Bg.prototype.clear=function(){var a=this;Ma(this.ee,function(b){b.remove(a.Ue)})};function Cg(){return"undefined"!==typeof navigator&&"string"===typeof navigator.userAgent?navigator.userAgent:""}function Dg(){return"undefined"!==typeof window&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(Cg())}function Eg(){return"undefined"!==typeof location&&/^file:\//.test(location.href)}
	function Fg(a){var b=Cg();if(""===b)return!1;if("Microsoft Internet Explorer"===navigator.appName){if((b=b.match(/MSIE ([0-9]{1,}[\.0-9]{0,})/))&&1<b.length)return parseFloat(b[1])>=a}else if(-1<b.indexOf("Trident")&&(b=b.match(/rv:([0-9]{2,2}[\.0-9]{0,})/))&&1<b.length)return parseFloat(b[1])>=a;return!1};function Gg(){var a=window.opener.frames,b;for(b=a.length-1;0<=b;b--)try{if(a[b].location.protocol===window.location.protocol&&a[b].location.host===window.location.host&&"__winchan_relay_frame"===a[b].name)return a[b]}catch(c){}return null}function Hg(a,b,c){a.attachEvent?a.attachEvent("on"+b,c):a.addEventListener&&a.addEventListener(b,c,!1)}function Ig(a,b,c){a.detachEvent?a.detachEvent("on"+b,c):a.removeEventListener&&a.removeEventListener(b,c,!1)}
	function Jg(a){/^https?:\/\//.test(a)||(a=window.location.href);var b=/^(https?:\/\/[\-_a-zA-Z\.0-9:]+)/.exec(a);return b?b[1]:a}function Kg(a){var b="";try{a=a.replace(/.*\?/,"");var c=Jb(a);c&&y(c,"__firebase_request_key")&&(b=z(c,"__firebase_request_key"))}catch(d){}return b}function Lg(){try{var a=document.location.hash.replace(/&__firebase_request_key=([a-zA-z0-9]*)/,""),a=a.replace(/\?$/,""),a=a.replace(/^#+$/,"");document.location.hash=a}catch(b){}}
	function Mg(){var a=sd(xg);return a.scheme+"://"+a.host+"/v2"}function Ng(a){return Mg()+"/"+a+"/auth/channel"};function Og(a){var b=this;this.hb=a;this.fe="*";Fg(8)?this.Uc=this.Cd=Gg():(this.Uc=window.opener,this.Cd=window);if(!b.Uc)throw"Unable to find relay frame";Hg(this.Cd,"message",u(this.nc,this));Hg(this.Cd,"message",u(this.Ff,this));try{Pg(this,{a:"ready"})}catch(c){Hg(this.Uc,"load",function(){Pg(b,{a:"ready"})})}Hg(window,"unload",u(this.Ng,this))}function Pg(a,b){b=G(b);Fg(8)?a.Uc.doPost(b,a.fe):a.Uc.postMessage(b,a.fe)}
	Og.prototype.nc=function(a){var b=this,c;try{c=Rb(a.data)}catch(d){}c&&"request"===c.a&&(Ig(window,"message",this.nc),this.fe=a.origin,this.hb&&setTimeout(function(){b.hb(b.fe,c.d,function(a,c){b.mg=!c;b.hb=void 0;Pg(b,{a:"response",d:a,forceKeepWindowOpen:c})})},0))};Og.prototype.Ng=function(){try{Ig(this.Cd,"message",this.Ff)}catch(a){}this.hb&&(Pg(this,{a:"error",d:"unknown closed window"}),this.hb=void 0);try{window.close()}catch(b){}};Og.prototype.Ff=function(a){if(this.mg&&"die"===a.data)try{window.close()}catch(b){}};function Qg(a){this.tc=Fa()+Fa()+Fa();this.Kf=a}Qg.prototype.open=function(a,b){cd.set("redirect_request_id",this.tc);cd.set("redirect_request_id",this.tc);b.requestId=this.tc;b.redirectTo=b.redirectTo||window.location.href;a+=(/\?/.test(a)?"":"?")+Ib(b);window.location=a};Qg.isAvailable=function(){return!Eg()&&!Dg()};Qg.prototype.Fc=function(){return"redirect"};var Rg={NETWORK_ERROR:"Unable to contact the Firebase server.",SERVER_ERROR:"An unknown server error occurred.",TRANSPORT_UNAVAILABLE:"There are no login transports available for the requested method.",REQUEST_INTERRUPTED:"The browser redirected the page before the login request could complete.",USER_CANCELLED:"The user cancelled authentication."};function Sg(a){var b=Error(z(Rg,a),a);b.code=a;return b};function Tg(a){var b;(b=!a.window_features)||(b=Cg(),b=-1!==b.indexOf("Fennec/")||-1!==b.indexOf("Firefox/")&&-1!==b.indexOf("Android"));b&&(a.window_features=void 0);a.window_name||(a.window_name="_blank");this.options=a}
	Tg.prototype.open=function(a,b,c){function d(a){g&&(document.body.removeChild(g),g=void 0);t&&(t=clearInterval(t));Ig(window,"message",e);Ig(window,"unload",d);if(l&&!a)try{l.close()}catch(b){k.postMessage("die",m)}l=k=void 0}function e(a){if(a.origin===m)try{var b=Rb(a.data);"ready"===b.a?k.postMessage(A,m):"error"===b.a?(d(!1),c&&(c(b.d),c=null)):"response"===b.a&&(d(b.forceKeepWindowOpen),c&&(c(null,b.d),c=null))}catch(e){}}var f=Fg(8),g,k;if(!this.options.relay_url)return c(Error("invalid arguments: origin of url and relay_url must match"));
	var m=Jg(a);if(m!==Jg(this.options.relay_url))c&&setTimeout(function(){c(Error("invalid arguments: origin of url and relay_url must match"))},0);else{f&&(g=document.createElement("iframe"),g.setAttribute("src",this.options.relay_url),g.style.display="none",g.setAttribute("name","__winchan_relay_frame"),document.body.appendChild(g),k=g.contentWindow);a+=(/\?/.test(a)?"":"?")+Ib(b);var l=window.open(a,this.options.window_name,this.options.window_features);k||(k=l);var t=setInterval(function(){l&&l.closed&&
	(d(!1),c&&(c(Sg("USER_CANCELLED")),c=null))},500),A=G({a:"request",d:b});Hg(window,"unload",d);Hg(window,"message",e)}};
	Tg.isAvailable=function(){var a;if(a="postMessage"in window&&!Eg())(a=Dg()||"undefined"!==typeof navigator&&(!!Cg().match(/Windows Phone/)||!!window.Windows&&/^ms-appx:/.test(location.href)))||(a=Cg(),a="undefined"!==typeof navigator&&"undefined"!==typeof window&&!!(a.match(/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i)||a.match(/CriOS/)||a.match(/Twitter for iPhone/)||a.match(/FBAN\/FBIOS/)||window.navigator.standalone)),a=!a;return a&&!Cg().match(/PhantomJS/)};Tg.prototype.Fc=function(){return"popup"};function Ug(a){a.method||(a.method="GET");a.headers||(a.headers={});a.headers.content_type||(a.headers.content_type="application/json");a.headers.content_type=a.headers.content_type.toLowerCase();this.options=a}
	Ug.prototype.open=function(a,b,c){function d(){c&&(c(Sg("REQUEST_INTERRUPTED")),c=null)}var e=new XMLHttpRequest,f=this.options.method.toUpperCase(),g;Hg(window,"beforeunload",d);e.onreadystatechange=function(){if(c&&4===e.readyState){var a;if(200<=e.status&&300>e.status){try{a=Rb(e.responseText)}catch(b){}c(null,a)}else 500<=e.status&&600>e.status?c(Sg("SERVER_ERROR")):c(Sg("NETWORK_ERROR"));c=null;Ig(window,"beforeunload",d)}};if("GET"===f)a+=(/\?/.test(a)?"":"?")+Ib(b),g=null;else{var k=this.options.headers.content_type;
	"application/json"===k&&(g=G(b));"application/x-www-form-urlencoded"===k&&(g=Ib(b))}e.open(f,a,!0);a={"X-Requested-With":"XMLHttpRequest",Accept:"application/json;text/plain"};ya(a,this.options.headers);for(var m in a)e.setRequestHeader(m,a[m]);e.send(g)};Ug.isAvailable=function(){var a;if(a=!!window.XMLHttpRequest)a=Cg(),a=!(a.match(/MSIE/)||a.match(/Trident/))||Fg(10);return a};Ug.prototype.Fc=function(){return"json"};function Vg(a){this.tc=Fa()+Fa()+Fa();this.Kf=a}
	Vg.prototype.open=function(a,b,c){function d(){c&&(c(Sg("USER_CANCELLED")),c=null)}var e=this,f=sd(xg),g;b.requestId=this.tc;b.redirectTo=f.scheme+"://"+f.host+"/blank/page.html";a+=/\?/.test(a)?"":"?";a+=Ib(b);(g=window.open(a,"_blank","location=no"))&&r(g.addEventListener)?(g.addEventListener("loadstart",function(a){var b;if(b=a&&a.url)a:{try{var l=document.createElement("a");l.href=a.url;b=l.host===f.host&&"/blank/page.html"===l.pathname;break a}catch(t){}b=!1}b&&(a=Kg(a.url),g.removeEventListener("exit",
	d),g.close(),a=new yg(null,null,{requestId:e.tc,requestKey:a}),e.Kf.requestWithCredential("/auth/session",a,c),c=null)}),g.addEventListener("exit",d)):c(Sg("TRANSPORT_UNAVAILABLE"))};Vg.isAvailable=function(){return Dg()};Vg.prototype.Fc=function(){return"redirect"};function Wg(a){a.callback_parameter||(a.callback_parameter="callback");this.options=a;window.__firebase_auth_jsonp=window.__firebase_auth_jsonp||{}}
	Wg.prototype.open=function(a,b,c){function d(){c&&(c(Sg("REQUEST_INTERRUPTED")),c=null)}function e(){setTimeout(function(){window.__firebase_auth_jsonp[f]=void 0;va(window.__firebase_auth_jsonp)&&(window.__firebase_auth_jsonp=void 0);try{var a=document.getElementById(f);a&&a.parentNode.removeChild(a)}catch(b){}},1);Ig(window,"beforeunload",d)}var f="fn"+(new Date).getTime()+Math.floor(99999*Math.random());b[this.options.callback_parameter]="__firebase_auth_jsonp."+f;a+=(/\?/.test(a)?"":"?")+Ib(b);
	Hg(window,"beforeunload",d);window.__firebase_auth_jsonp[f]=function(a){c&&(c(null,a),c=null);e()};Xg(f,a,c)};
	function Xg(a,b,c){setTimeout(function(){try{var d=document.createElement("script");d.type="text/javascript";d.id=a;d.async=!0;d.src=b;d.onerror=function(){var b=document.getElementById(a);null!==b&&b.parentNode.removeChild(b);c&&c(Sg("NETWORK_ERROR"))};var e=document.getElementsByTagName("head");(e&&0!=e.length?e[0]:document.documentElement).appendChild(d)}catch(f){c&&c(Sg("NETWORK_ERROR"))}},0)}Wg.isAvailable=function(){return"undefined"!==typeof document&&null!=document.createElement};
	Wg.prototype.Fc=function(){return"json"};function Yg(a,b,c,d){ff.call(this,["auth_status"]);this.G=a;this.hf=b;this.ih=c;this.Pe=d;this.wc=new Bg(a,[bd,cd]);this.qb=null;this.We=!1;Zg(this)}ka(Yg,ff);h=Yg.prototype;h.Be=function(){return this.qb||null};function Zg(a){cd.get("redirect_request_id")&&$g(a);var b=a.wc.get();b&&b.token?(ah(a,b),a.hf(b.token,function(c,d){bh(a,c,d,!1,b.token,b)},function(b,d){ch(a,"resumeSession()",b,d)})):ah(a,null)}
	function dh(a,b,c,d,e,f){"firebaseio-demo.com"===a.G.domain&&S("Firebase authentication is not supported on demo Firebases (*.firebaseio-demo.com). To secure your Firebase, create a production Firebase at https://www.firebase.com.");a.hf(b,function(f,k){bh(a,f,k,!0,b,c,d||{},e)},function(b,c){ch(a,"auth()",b,c,f)})}function eh(a,b){a.wc.clear();ah(a,null);a.ih(function(a,d){if("ok"===a)T(b,null);else{var e=(a||"error").toUpperCase(),f=e;d&&(f+=": "+d);f=Error(f);f.code=e;T(b,f)}})}
	function bh(a,b,c,d,e,f,g,k){"ok"===b?(d&&(b=c.auth,f.auth=b,f.expires=c.expires,f.token=Ed(e)?e:"",c=null,b&&y(b,"uid")?c=z(b,"uid"):y(f,"uid")&&(c=z(f,"uid")),f.uid=c,c="custom",b&&y(b,"provider")?c=z(b,"provider"):y(f,"provider")&&(c=z(f,"provider")),f.provider=c,a.wc.clear(),Ed(e)&&(g=g||{},c=bd,"sessionOnly"===g.remember&&(c=cd),"none"!==g.remember&&a.wc.set(f,c)),ah(a,f)),T(k,null,f)):(a.wc.clear(),ah(a,null),f=a=(b||"error").toUpperCase(),c&&(f+=": "+c),f=Error(f),f.code=a,T(k,f))}
	function ch(a,b,c,d,e){S(b+" was canceled: "+d);a.wc.clear();ah(a,null);a=Error(d);a.code=c.toUpperCase();T(e,a)}function fh(a,b,c,d,e){gh(a);c=new yg(d||{},{},c||{});hh(a,[Ug,Wg],"/auth/"+b,c,e)}
	function ih(a,b,c,d){gh(a);var e=[Tg,Vg];c=Ag(c);var f=625;"anonymous"===b||"password"===b?setTimeout(function(){T(d,Sg("TRANSPORT_UNAVAILABLE"))},0):("github"===b&&(f=1025),c.he.window_features="menubar=yes,modal=yes,alwaysRaised=yeslocation=yes,resizable=yes,scrollbars=yes,status=yes,height=625,width="+f+",top="+("object"===typeof screen?.5*(screen.height-625):0)+",left="+("object"===typeof screen?.5*(screen.width-f):0),c.he.relay_url=Ng(a.G.lc),c.he.requestWithCredential=u(a.uc,a),hh(a,e,"/auth/"+
	b,c,d))}function $g(a){var b=cd.get("redirect_request_id");if(b){var c=cd.get("redirect_client_options");cd.remove("redirect_request_id");cd.remove("redirect_client_options");var d=[Ug,Wg],b={requestId:b,requestKey:Kg(document.location.hash)},c=new yg(c,{},b);a.We=!0;Lg();hh(a,d,"/auth/session",c,function(){this.We=!1}.bind(a))}}h.ve=function(a,b){gh(this);var c=Ag(a);c.fb._method="POST";this.uc("/users",c,function(a,c){a?T(b,a):T(b,a,c)})};
	h.Xe=function(a,b){var c=this;gh(this);var d="/users/"+encodeURIComponent(a.email),e=Ag(a);e.fb._method="DELETE";this.uc(d,e,function(a,d){!a&&d&&d.uid&&c.qb&&c.qb.uid&&c.qb.uid===d.uid&&eh(c);T(b,a)})};h.se=function(a,b){gh(this);var c="/users/"+encodeURIComponent(a.email)+"/password",d=Ag(a);d.fb._method="PUT";d.fb.password=a.newPassword;this.uc(c,d,function(a){T(b,a)})};
	h.re=function(a,b){gh(this);var c="/users/"+encodeURIComponent(a.oldEmail)+"/email",d=Ag(a);d.fb._method="PUT";d.fb.email=a.newEmail;d.fb.password=a.password;this.uc(c,d,function(a){T(b,a)})};h.Ze=function(a,b){gh(this);var c="/users/"+encodeURIComponent(a.email)+"/password",d=Ag(a);d.fb._method="POST";this.uc(c,d,function(a){T(b,a)})};h.uc=function(a,b,c){jh(this,[Ug,Wg],a,b,c)};
	function hh(a,b,c,d,e){jh(a,b,c,d,function(b,c){!b&&c&&c.token&&c.uid?dh(a,c.token,c,d.qd,function(a,b){a?T(e,a):T(e,null,b)}):T(e,b||Sg("UNKNOWN_ERROR"))})}
	function jh(a,b,c,d,e){b=Na(b,function(a){return"function"===typeof a.isAvailable&&a.isAvailable()});0===b.length?setTimeout(function(){T(e,Sg("TRANSPORT_UNAVAILABLE"))},0):(b=new (b.shift())(d.he),d=Gb(d.fb),d.v="js-"+Eb,d.transport=b.Fc(),d.suppress_status_codes=!0,a=Mg()+"/"+a.G.lc+c,b.open(a,d,function(a,b){if(a)T(e,a);else if(b&&b.error){var c=Error(b.error.message);c.code=b.error.code;c.details=b.error.details;T(e,c)}else T(e,null,b)}))}
	function ah(a,b){var c=null!==a.qb||null!==b;a.qb=b;c&&a.ie("auth_status",b);a.Pe(null!==b)}h.Ee=function(a){O("auth_status"===a,'initial event must be of type "auth_status"');return this.We?null:[this.qb]};function gh(a){var b=a.G;if("firebaseio.com"!==b.domain&&"firebaseio-demo.com"!==b.domain&&"auth.firebase.com"===xg)throw Error("This custom Firebase server ('"+a.G.domain+"') does not support delegated login.");};var gd="websocket",hd="long_polling";function kh(a){this.nc=a;this.Qd=[];this.Wb=0;this.te=-1;this.Jb=null}function lh(a,b,c){a.te=b;a.Jb=c;a.te<a.Wb&&(a.Jb(),a.Jb=null)}function mh(a,b,c){for(a.Qd[b]=c;a.Qd[a.Wb];){var d=a.Qd[a.Wb];delete a.Qd[a.Wb];for(var e=0;e<d.length;++e)if(d[e]){var f=a;gc(function(){f.nc(d[e])})}if(a.Wb===a.te){a.Jb&&(clearTimeout(a.Jb),a.Jb(),a.Jb=null);break}a.Wb++}};function nh(a,b,c,d){this.ue=a;this.f=pd(a);this.rb=this.sb=0;this.Xa=uc(b);this.Xf=c;this.Kc=!1;this.Fb=d;this.ld=function(a){return fd(b,hd,a)}}var oh,ph;
	nh.prototype.open=function(a,b){this.mf=0;this.na=b;this.Ef=new kh(a);this.Db=!1;var c=this;this.ub=setTimeout(function(){c.f("Timed out trying to connect.");c.bb();c.ub=null},Math.floor(3E4));ud(function(){if(!c.Db){c.Wa=new qh(function(a,b,d,k,m){rh(c,arguments);if(c.Wa)if(c.ub&&(clearTimeout(c.ub),c.ub=null),c.Kc=!0,"start"==a)c.id=b,c.Mf=d;else if("close"===a)b?(c.Wa.$d=!1,lh(c.Ef,b,function(){c.bb()})):c.bb();else throw Error("Unrecognized command received: "+a);},function(a,b){rh(c,arguments);
	mh(c.Ef,a,b)},function(){c.bb()},c.ld);var a={start:"t"};a.ser=Math.floor(1E8*Math.random());c.Wa.ke&&(a.cb=c.Wa.ke);a.v="5";c.Xf&&(a.s=c.Xf);c.Fb&&(a.ls=c.Fb);"undefined"!==typeof location&&location.href&&-1!==location.href.indexOf("firebaseio.com")&&(a.r="f");a=c.ld(a);c.f("Connecting via long-poll to "+a);sh(c.Wa,a,function(){})}})};
	nh.prototype.start=function(){var a=this.Wa,b=this.Mf;a.Gg=this.id;a.Hg=b;for(a.oe=!0;th(a););a=this.id;b=this.Mf;this.kc=document.createElement("iframe");var c={dframe:"t"};c.id=a;c.pw=b;this.kc.src=this.ld(c);this.kc.style.display="none";document.body.appendChild(this.kc)};
	nh.isAvailable=function(){return oh||!ph&&"undefined"!==typeof document&&null!=document.createElement&&!("object"===typeof window&&window.chrome&&window.chrome.extension&&!/^chrome/.test(window.location.href))&&!("object"===typeof Windows&&"object"===typeof Windows.kh)&&!0};h=nh.prototype;h.Hd=function(){};h.fd=function(){this.Db=!0;this.Wa&&(this.Wa.close(),this.Wa=null);this.kc&&(document.body.removeChild(this.kc),this.kc=null);this.ub&&(clearTimeout(this.ub),this.ub=null)};
	h.bb=function(){this.Db||(this.f("Longpoll is closing itself"),this.fd(),this.na&&(this.na(this.Kc),this.na=null))};h.close=function(){this.Db||(this.f("Longpoll is being closed."),this.fd())};h.send=function(a){a=G(a);this.sb+=a.length;rc(this.Xa,"bytes_sent",a.length);a=Ob(a);a=nb(a,!0);a=yd(a,1840);for(var b=0;b<a.length;b++){var c=this.Wa;c.cd.push({Yg:this.mf,hh:a.length,of:a[b]});c.oe&&th(c);this.mf++}};function rh(a,b){var c=G(b).length;a.rb+=c;rc(a.Xa,"bytes_received",c)}
	function qh(a,b,c,d){this.ld=d;this.lb=c;this.Te=new ug;this.cd=[];this.we=Math.floor(1E8*Math.random());this.$d=!0;this.ke=id();window["pLPCommand"+this.ke]=a;window["pRTLPCB"+this.ke]=b;a=document.createElement("iframe");a.style.display="none";if(document.body){document.body.appendChild(a);try{a.contentWindow.document||fc("No IE domain setting required")}catch(e){a.src="javascript:void((function(){document.open();document.domain='"+document.domain+"';document.close();})())"}}else throw"Document body has not initialized. Wait to initialize Firebase until after the document is ready.";
	a.contentDocument?a.jb=a.contentDocument:a.contentWindow?a.jb=a.contentWindow.document:a.document&&(a.jb=a.document);this.Ga=a;a="";this.Ga.src&&"javascript:"===this.Ga.src.substr(0,11)&&(a='<script>document.domain="'+document.domain+'";\x3c/script>');a="<html><body>"+a+"</body></html>";try{this.Ga.jb.open(),this.Ga.jb.write(a),this.Ga.jb.close()}catch(f){fc("frame writing exception"),f.stack&&fc(f.stack),fc(f)}}
	qh.prototype.close=function(){this.oe=!1;if(this.Ga){this.Ga.jb.body.innerHTML="";var a=this;setTimeout(function(){null!==a.Ga&&(document.body.removeChild(a.Ga),a.Ga=null)},Math.floor(0))}var b=this.lb;b&&(this.lb=null,b())};
	function th(a){if(a.oe&&a.$d&&a.Te.count()<(0<a.cd.length?2:1)){a.we++;var b={};b.id=a.Gg;b.pw=a.Hg;b.ser=a.we;for(var b=a.ld(b),c="",d=0;0<a.cd.length;)if(1870>=a.cd[0].of.length+30+c.length){var e=a.cd.shift(),c=c+"&seg"+d+"="+e.Yg+"&ts"+d+"="+e.hh+"&d"+d+"="+e.of;d++}else break;uh(a,b+c,a.we);return!0}return!1}function uh(a,b,c){function d(){a.Te.remove(c);th(a)}a.Te.add(c,1);var e=setTimeout(d,Math.floor(25E3));sh(a,b,function(){clearTimeout(e);d()})}
	function sh(a,b,c){setTimeout(function(){try{if(a.$d){var d=a.Ga.jb.createElement("script");d.type="text/javascript";d.async=!0;d.src=b;d.onload=d.onreadystatechange=function(){var a=d.readyState;a&&"loaded"!==a&&"complete"!==a||(d.onload=d.onreadystatechange=null,d.parentNode&&d.parentNode.removeChild(d),c())};d.onerror=function(){fc("Long-poll script failed to load: "+b);a.$d=!1;a.close()};a.Ga.jb.body.appendChild(d)}}catch(e){}},Math.floor(1))};var vh=null;"undefined"!==typeof MozWebSocket?vh=MozWebSocket:"undefined"!==typeof WebSocket&&(vh=WebSocket);function wh(a,b,c,d){this.ue=a;this.f=pd(this.ue);this.frames=this.Nc=null;this.rb=this.sb=this.ff=0;this.Xa=uc(b);a={v:"5"};"undefined"!==typeof location&&location.href&&-1!==location.href.indexOf("firebaseio.com")&&(a.r="f");c&&(a.s=c);d&&(a.ls=d);this.jf=fd(b,gd,a)}var xh;
	wh.prototype.open=function(a,b){this.lb=b;this.Lg=a;this.f("Websocket connecting to "+this.jf);this.Kc=!1;bd.set("previous_websocket_failure",!0);try{this.La=new vh(this.jf)}catch(c){this.f("Error instantiating WebSocket.");var d=c.message||c.data;d&&this.f(d);this.bb();return}var e=this;this.La.onopen=function(){e.f("Websocket connected.");e.Kc=!0};this.La.onclose=function(){e.f("Websocket connection was disconnected.");e.La=null;e.bb()};this.La.onmessage=function(a){if(null!==e.La)if(a=a.data,e.rb+=
	a.length,rc(e.Xa,"bytes_received",a.length),yh(e),null!==e.frames)zh(e,a);else{a:{O(null===e.frames,"We already have a frame buffer");if(6>=a.length){var b=Number(a);if(!isNaN(b)){e.ff=b;e.frames=[];a=null;break a}}e.ff=1;e.frames=[]}null!==a&&zh(e,a)}};this.La.onerror=function(a){e.f("WebSocket error.  Closing connection.");(a=a.message||a.data)&&e.f(a);e.bb()}};wh.prototype.start=function(){};
	wh.isAvailable=function(){var a=!1;if("undefined"!==typeof navigator&&navigator.userAgent){var b=navigator.userAgent.match(/Android ([0-9]{0,}\.[0-9]{0,})/);b&&1<b.length&&4.4>parseFloat(b[1])&&(a=!0)}return!a&&null!==vh&&!xh};wh.responsesRequiredToBeHealthy=2;wh.healthyTimeout=3E4;h=wh.prototype;h.Hd=function(){bd.remove("previous_websocket_failure")};function zh(a,b){a.frames.push(b);if(a.frames.length==a.ff){var c=a.frames.join("");a.frames=null;c=Rb(c);a.Lg(c)}}
	h.send=function(a){yh(this);a=G(a);this.sb+=a.length;rc(this.Xa,"bytes_sent",a.length);a=yd(a,16384);1<a.length&&Ah(this,String(a.length));for(var b=0;b<a.length;b++)Ah(this,a[b])};h.fd=function(){this.Db=!0;this.Nc&&(clearInterval(this.Nc),this.Nc=null);this.La&&(this.La.close(),this.La=null)};h.bb=function(){this.Db||(this.f("WebSocket is closing itself"),this.fd(),this.lb&&(this.lb(this.Kc),this.lb=null))};h.close=function(){this.Db||(this.f("WebSocket is being closed"),this.fd())};
	function yh(a){clearInterval(a.Nc);a.Nc=setInterval(function(){a.La&&Ah(a,"0");yh(a)},Math.floor(45E3))}function Ah(a,b){try{a.La.send(b)}catch(c){a.f("Exception thrown from WebSocket.send():",c.message||c.data,"Closing connection."),setTimeout(u(a.bb,a),0)}};function Bh(a){Ch(this,a)}var Dh=[nh,wh];function Ch(a,b){var c=wh&&wh.isAvailable(),d=c&&!(bd.Af||!0===bd.get("previous_websocket_failure"));b.jh&&(c||S("wss:// URL used, but browser isn't known to support websockets.  Trying anyway."),d=!0);if(d)a.jd=[wh];else{var e=a.jd=[];zd(Dh,function(a,b){b&&b.isAvailable()&&e.push(b)})}}function Eh(a){if(0<a.jd.length)return a.jd[0];throw Error("No transports available");};function Fh(a,b,c,d,e,f,g){this.id=a;this.f=pd("c:"+this.id+":");this.nc=c;this.Zc=d;this.na=e;this.Re=f;this.G=b;this.Pd=[];this.kf=0;this.Wf=new Bh(b);this.N=0;this.Fb=g;this.f("Connection created");Gh(this)}
	function Gh(a){var b=Eh(a.Wf);a.K=new b("c:"+a.id+":"+a.kf++,a.G,void 0,a.Fb);a.Ve=b.responsesRequiredToBeHealthy||0;var c=Hh(a,a.K),d=Ih(a,a.K);a.kd=a.K;a.ed=a.K;a.F=null;a.Eb=!1;setTimeout(function(){a.K&&a.K.open(c,d)},Math.floor(0));b=b.healthyTimeout||0;0<b&&(a.Bd=setTimeout(function(){a.Bd=null;a.Eb||(a.K&&102400<a.K.rb?(a.f("Connection exceeded healthy timeout but has received "+a.K.rb+" bytes.  Marking connection healthy."),a.Eb=!0,a.K.Hd()):a.K&&10240<a.K.sb?a.f("Connection exceeded healthy timeout but has sent "+
	a.K.sb+" bytes.  Leaving connection alive."):(a.f("Closing unhealthy connection after timeout."),a.close()))},Math.floor(b)))}function Ih(a,b){return function(c){b===a.K?(a.K=null,c||0!==a.N?1===a.N&&a.f("Realtime connection lost."):(a.f("Realtime connection failed."),"s-"===a.G.ab.substr(0,2)&&(bd.remove("host:"+a.G.host),a.G.ab=a.G.host)),a.close()):b===a.F?(a.f("Secondary connection lost."),c=a.F,a.F=null,a.kd!==c&&a.ed!==c||a.close()):a.f("closing an old connection")}}
	function Hh(a,b){return function(c){if(2!=a.N)if(b===a.ed){var d=wd("t",c);c=wd("d",c);if("c"==d){if(d=wd("t",c),"d"in c)if(c=c.d,"h"===d){var d=c.ts,e=c.v,f=c.h;a.Uf=c.s;ed(a.G,f);0==a.N&&(a.K.start(),Jh(a,a.K,d),"5"!==e&&S("Protocol version mismatch detected"),c=a.Wf,(c=1<c.jd.length?c.jd[1]:null)&&Kh(a,c))}else if("n"===d){a.f("recvd end transmission on primary");a.ed=a.F;for(c=0;c<a.Pd.length;++c)a.Ld(a.Pd[c]);a.Pd=[];Lh(a)}else"s"===d?(a.f("Connection shutdown command received. Shutting down..."),
	a.Re&&(a.Re(c),a.Re=null),a.na=null,a.close()):"r"===d?(a.f("Reset packet received.  New host: "+c),ed(a.G,c),1===a.N?a.close():(Mh(a),Gh(a))):"e"===d?qd("Server Error: "+c):"o"===d?(a.f("got pong on primary."),Nh(a),Oh(a)):qd("Unknown control packet command: "+d)}else"d"==d&&a.Ld(c)}else if(b===a.F)if(d=wd("t",c),c=wd("d",c),"c"==d)"t"in c&&(c=c.t,"a"===c?Ph(a):"r"===c?(a.f("Got a reset on secondary, closing it"),a.F.close(),a.kd!==a.F&&a.ed!==a.F||a.close()):"o"===c&&(a.f("got pong on secondary."),
	a.Tf--,Ph(a)));else if("d"==d)a.Pd.push(c);else throw Error("Unknown protocol layer: "+d);else a.f("message on old connection")}}Fh.prototype.Ia=function(a){Qh(this,{t:"d",d:a})};function Lh(a){a.kd===a.F&&a.ed===a.F&&(a.f("cleaning up and promoting a connection: "+a.F.ue),a.K=a.F,a.F=null)}
	function Ph(a){0>=a.Tf?(a.f("Secondary connection is healthy."),a.Eb=!0,a.F.Hd(),a.F.start(),a.f("sending client ack on secondary"),a.F.send({t:"c",d:{t:"a",d:{}}}),a.f("Ending transmission on primary"),a.K.send({t:"c",d:{t:"n",d:{}}}),a.kd=a.F,Lh(a)):(a.f("sending ping on secondary."),a.F.send({t:"c",d:{t:"p",d:{}}}))}Fh.prototype.Ld=function(a){Nh(this);this.nc(a)};function Nh(a){a.Eb||(a.Ve--,0>=a.Ve&&(a.f("Primary connection is healthy."),a.Eb=!0,a.K.Hd()))}
	function Kh(a,b){a.F=new b("c:"+a.id+":"+a.kf++,a.G,a.Uf);a.Tf=b.responsesRequiredToBeHealthy||0;a.F.open(Hh(a,a.F),Ih(a,a.F));setTimeout(function(){a.F&&(a.f("Timed out trying to upgrade."),a.F.close())},Math.floor(6E4))}function Jh(a,b,c){a.f("Realtime connection established.");a.K=b;a.N=1;a.Zc&&(a.Zc(c,a.Uf),a.Zc=null);0===a.Ve?(a.f("Primary connection is healthy."),a.Eb=!0):setTimeout(function(){Oh(a)},Math.floor(5E3))}
	function Oh(a){a.Eb||1!==a.N||(a.f("sending ping on primary."),Qh(a,{t:"c",d:{t:"p",d:{}}}))}function Qh(a,b){if(1!==a.N)throw"Connection is not connected";a.kd.send(b)}Fh.prototype.close=function(){2!==this.N&&(this.f("Closing realtime connection."),this.N=2,Mh(this),this.na&&(this.na(),this.na=null))};function Mh(a){a.f("Shutting down all connections");a.K&&(a.K.close(),a.K=null);a.F&&(a.F.close(),a.F=null);a.Bd&&(clearTimeout(a.Bd),a.Bd=null)};function Rh(a,b,c,d){this.id=Sh++;this.f=pd("p:"+this.id+":");this.Bf=this.Ie=!1;this.ba={};this.sa=[];this.ad=0;this.Yc=[];this.qa=!1;this.eb=1E3;this.Id=3E5;this.Kb=b;this.Xc=c;this.Se=d;this.G=a;this.wb=this.Ca=this.Ma=this.Fb=this.$e=null;this.Sb=!1;this.Wd={};this.Xg=0;this.rf=!0;this.Oc=this.Ke=null;Th(this,0);kf.yb().Ib("visible",this.Og,this);-1===a.host.indexOf("fblocal")&&jf.yb().Ib("online",this.Mg,this)}var Sh=0,Uh=0;h=Rh.prototype;
	h.Ia=function(a,b,c){var d=++this.Xg;a={r:d,a:a,b:b};this.f(G(a));O(this.qa,"sendRequest call when we're not connected not allowed.");this.Ma.Ia(a);c&&(this.Wd[d]=c)};h.Cf=function(a,b,c,d){var e=a.wa(),f=a.path.toString();this.f("Listen called for "+f+" "+e);this.ba[f]=this.ba[f]||{};O(Ie(a.n)||!He(a.n),"listen() called for non-default but complete query");O(!this.ba[f][e],"listen() called twice for same path/queryId.");a={I:d,Ad:b,Ug:a,tag:c};this.ba[f][e]=a;this.qa&&Vh(this,a)};
	function Vh(a,b){var c=b.Ug,d=c.path.toString(),e=c.wa();a.f("Listen on "+d+" for "+e);var f={p:d};b.tag&&(f.q=Ge(c.n),f.t=b.tag);f.h=b.Ad();a.Ia("q",f,function(f){var k=f.d,m=f.s;if(k&&"object"===typeof k&&y(k,"w")){var l=z(k,"w");da(l)&&0<=La(l,"no_index")&&S("Using an unspecified index. Consider adding "+('".indexOn": "'+c.n.g.toString()+'"')+" at "+c.path.toString()+" to your security rules for better performance")}(a.ba[d]&&a.ba[d][e])===b&&(a.f("listen response",f),"ok"!==m&&Wh(a,d,e),b.I&&
	b.I(m,k))})}h.O=function(a,b,c){this.Ca={rg:a,sf:!1,Dc:b,od:c};this.f("Authenticating using credential: "+a);Xh(this);(b=40==a.length)||(a=Cd(a).Ec,b="object"===typeof a&&!0===z(a,"admin"));b&&(this.f("Admin auth credential detected.  Reducing max reconnect time."),this.Id=3E4)};h.je=function(a){this.Ca=null;this.qa&&this.Ia("unauth",{},function(b){a(b.s,b.d)})};
	function Xh(a){var b=a.Ca;a.qa&&b&&a.Ia("auth",{cred:b.rg},function(c){var d=c.s;c=c.d||"error";"ok"!==d&&a.Ca===b&&(a.Ca=null);b.sf?"ok"!==d&&b.od&&b.od(d,c):(b.sf=!0,b.Dc&&b.Dc(d,c))})}h.$f=function(a,b){var c=a.path.toString(),d=a.wa();this.f("Unlisten called for "+c+" "+d);O(Ie(a.n)||!He(a.n),"unlisten() called for non-default but complete query");if(Wh(this,c,d)&&this.qa){var e=Ge(a.n);this.f("Unlisten on "+c+" for "+d);c={p:c};b&&(c.q=e,c.t=b);this.Ia("n",c)}};
	h.Qe=function(a,b,c){this.qa?Yh(this,"o",a,b,c):this.Yc.push({bd:a,action:"o",data:b,I:c})};h.Gf=function(a,b,c){this.qa?Yh(this,"om",a,b,c):this.Yc.push({bd:a,action:"om",data:b,I:c})};h.Md=function(a,b){this.qa?Yh(this,"oc",a,null,b):this.Yc.push({bd:a,action:"oc",data:null,I:b})};function Yh(a,b,c,d,e){c={p:c,d:d};a.f("onDisconnect "+b,c);a.Ia(b,c,function(a){e&&setTimeout(function(){e(a.s,a.d)},Math.floor(0))})}h.put=function(a,b,c,d){Zh(this,"p",a,b,c,d)};
	h.Df=function(a,b,c,d){Zh(this,"m",a,b,c,d)};function Zh(a,b,c,d,e,f){d={p:c,d:d};p(f)&&(d.h=f);a.sa.push({action:b,Pf:d,I:e});a.ad++;b=a.sa.length-1;a.qa?$h(a,b):a.f("Buffering put: "+c)}function $h(a,b){var c=a.sa[b].action,d=a.sa[b].Pf,e=a.sa[b].I;a.sa[b].Vg=a.qa;a.Ia(c,d,function(d){a.f(c+" response",d);delete a.sa[b];a.ad--;0===a.ad&&(a.sa=[]);e&&e(d.s,d.d)})}
	h.Ye=function(a){this.qa&&(a={c:a},this.f("reportStats",a),this.Ia("s",a,function(a){"ok"!==a.s&&this.f("reportStats","Error sending stats: "+a.d)}))};
	h.Ld=function(a){if("r"in a){this.f("from server: "+G(a));var b=a.r,c=this.Wd[b];c&&(delete this.Wd[b],c(a.b))}else{if("error"in a)throw"A server-side error has occurred: "+a.error;"a"in a&&(b=a.a,c=a.b,this.f("handleServerMessage",b,c),"d"===b?this.Kb(c.p,c.d,!1,c.t):"m"===b?this.Kb(c.p,c.d,!0,c.t):"c"===b?ai(this,c.p,c.q):"ac"===b?(a=c.s,b=c.d,c=this.Ca,this.Ca=null,c&&c.od&&c.od(a,b)):"sd"===b?this.$e?this.$e(c):"msg"in c&&"undefined"!==typeof console&&console.log("FIREBASE: "+c.msg.replace("\n",
	"\nFIREBASE: ")):qd("Unrecognized action received from server: "+G(b)+"\nAre you using the latest client?"))}};h.Zc=function(a,b){this.f("connection ready");this.qa=!0;this.Oc=(new Date).getTime();this.Se({serverTimeOffset:a-(new Date).getTime()});this.Fb=b;if(this.rf){var c={};c["sdk.js."+Eb.replace(/\./g,"-")]=1;Dg()?c["framework.cordova"]=1:"object"===typeof navigator&&"ReactNative"===navigator.product&&(c["framework.reactnative"]=1);this.Ye(c)}bi(this);this.rf=!1;this.Xc(!0)};
	function Th(a,b){O(!a.Ma,"Scheduling a connect when we're already connected/ing?");a.wb&&clearTimeout(a.wb);a.wb=setTimeout(function(){a.wb=null;ci(a)},Math.floor(b))}h.Og=function(a){a&&!this.Sb&&this.eb===this.Id&&(this.f("Window became visible.  Reducing delay."),this.eb=1E3,this.Ma||Th(this,0));this.Sb=a};h.Mg=function(a){a?(this.f("Browser went online."),this.eb=1E3,this.Ma||Th(this,0)):(this.f("Browser went offline.  Killing connection."),this.Ma&&this.Ma.close())};
	h.If=function(){this.f("data client disconnected");this.qa=!1;this.Ma=null;for(var a=0;a<this.sa.length;a++){var b=this.sa[a];b&&"h"in b.Pf&&b.Vg&&(b.I&&b.I("disconnect"),delete this.sa[a],this.ad--)}0===this.ad&&(this.sa=[]);this.Wd={};di(this)&&(this.Sb?this.Oc&&(3E4<(new Date).getTime()-this.Oc&&(this.eb=1E3),this.Oc=null):(this.f("Window isn't visible.  Delaying reconnect."),this.eb=this.Id,this.Ke=(new Date).getTime()),a=Math.max(0,this.eb-((new Date).getTime()-this.Ke)),a*=Math.random(),this.f("Trying to reconnect in "+
	a+"ms"),Th(this,a),this.eb=Math.min(this.Id,1.3*this.eb));this.Xc(!1)};function ci(a){if(di(a)){a.f("Making a connection attempt");a.Ke=(new Date).getTime();a.Oc=null;var b=u(a.Ld,a),c=u(a.Zc,a),d=u(a.If,a),e=a.id+":"+Uh++;a.Ma=new Fh(e,a.G,b,c,d,function(b){S(b+" ("+a.G.toString()+")");a.Bf=!0},a.Fb)}}h.Cb=function(){this.Ie=!0;this.Ma?this.Ma.close():(this.wb&&(clearTimeout(this.wb),this.wb=null),this.qa&&this.If())};h.vc=function(){this.Ie=!1;this.eb=1E3;this.Ma||Th(this,0)};
	function ai(a,b,c){c=c?Oa(c,function(a){return xd(a)}).join("$"):"default";(a=Wh(a,b,c))&&a.I&&a.I("permission_denied")}function Wh(a,b,c){b=(new P(b)).toString();var d;p(a.ba[b])?(d=a.ba[b][c],delete a.ba[b][c],0===oa(a.ba[b])&&delete a.ba[b]):d=void 0;return d}function bi(a){Xh(a);v(a.ba,function(b){v(b,function(b){Vh(a,b)})});for(var b=0;b<a.sa.length;b++)a.sa[b]&&$h(a,b);for(;a.Yc.length;)b=a.Yc.shift(),Yh(a,b.action,b.bd,b.data,b.I)}function di(a){var b;b=jf.yb().oc;return!a.Bf&&!a.Ie&&b};var U={zg:function(){oh=xh=!0}};U.forceLongPolling=U.zg;U.Ag=function(){ph=!0};U.forceWebSockets=U.Ag;U.Eg=function(){return wh.isAvailable()};U.isWebSocketsAvailable=U.Eg;U.ah=function(a,b){a.k.Va.$e=b};U.setSecurityDebugCallback=U.ah;U.bf=function(a,b){a.k.bf(b)};U.stats=U.bf;U.cf=function(a,b){a.k.cf(b)};U.statsIncrementCounter=U.cf;U.ud=function(a){return a.k.ud};U.dataUpdateCount=U.ud;U.Dg=function(a,b){a.k.He=b};U.interceptServerData=U.Dg;U.Kg=function(a){new Og(a)};U.onPopupOpen=U.Kg;
	U.Zg=function(a){xg=a};U.setAuthenticationServer=U.Zg;function ei(a,b){this.committed=a;this.snapshot=b};function V(a,b){this.dd=a;this.ta=b}V.prototype.cancel=function(a){D("Firebase.onDisconnect().cancel",0,1,arguments.length);F("Firebase.onDisconnect().cancel",1,a,!0);var b=new B;this.dd.Md(this.ta,C(b,a));return b.D};V.prototype.cancel=V.prototype.cancel;V.prototype.remove=function(a){D("Firebase.onDisconnect().remove",0,1,arguments.length);og("Firebase.onDisconnect().remove",this.ta);F("Firebase.onDisconnect().remove",1,a,!0);var b=new B;fi(this.dd,this.ta,null,C(b,a));return b.D};
	V.prototype.remove=V.prototype.remove;V.prototype.set=function(a,b){D("Firebase.onDisconnect().set",1,2,arguments.length);og("Firebase.onDisconnect().set",this.ta);gg("Firebase.onDisconnect().set",a,this.ta,!1);F("Firebase.onDisconnect().set",2,b,!0);var c=new B;fi(this.dd,this.ta,a,C(c,b));return c.D};V.prototype.set=V.prototype.set;
	V.prototype.Ob=function(a,b,c){D("Firebase.onDisconnect().setWithPriority",2,3,arguments.length);og("Firebase.onDisconnect().setWithPriority",this.ta);gg("Firebase.onDisconnect().setWithPriority",a,this.ta,!1);kg("Firebase.onDisconnect().setWithPriority",2,b);F("Firebase.onDisconnect().setWithPriority",3,c,!0);var d=new B;gi(this.dd,this.ta,a,b,C(d,c));return d.D};V.prototype.setWithPriority=V.prototype.Ob;
	V.prototype.update=function(a,b){D("Firebase.onDisconnect().update",1,2,arguments.length);og("Firebase.onDisconnect().update",this.ta);if(da(a)){for(var c={},d=0;d<a.length;++d)c[""+d]=a[d];a=c;S("Passing an Array to Firebase.onDisconnect().update() is deprecated. Use set() if you want to overwrite the existing data, or an Object with integer keys if you really do want to only update some of the children.")}jg("Firebase.onDisconnect().update",a,this.ta);F("Firebase.onDisconnect().update",2,b,!0);
	c=new B;hi(this.dd,this.ta,a,C(c,b));return c.D};V.prototype.update=V.prototype.update;function W(a,b,c){this.A=a;this.Y=b;this.g=c}W.prototype.J=function(){D("Firebase.DataSnapshot.val",0,0,arguments.length);return this.A.J()};W.prototype.val=W.prototype.J;W.prototype.qf=function(){D("Firebase.DataSnapshot.exportVal",0,0,arguments.length);return this.A.J(!0)};W.prototype.exportVal=W.prototype.qf;W.prototype.xg=function(){D("Firebase.DataSnapshot.exists",0,0,arguments.length);return!this.A.e()};W.prototype.exists=W.prototype.xg;
	W.prototype.o=function(a){D("Firebase.DataSnapshot.child",0,1,arguments.length);fa(a)&&(a=String(a));ng("Firebase.DataSnapshot.child",a);var b=new P(a),c=this.Y.o(b);return new W(this.A.S(b),c,R)};W.prototype.child=W.prototype.o;W.prototype.Fa=function(a){D("Firebase.DataSnapshot.hasChild",1,1,arguments.length);ng("Firebase.DataSnapshot.hasChild",a);var b=new P(a);return!this.A.S(b).e()};W.prototype.hasChild=W.prototype.Fa;
	W.prototype.C=function(){D("Firebase.DataSnapshot.getPriority",0,0,arguments.length);return this.A.C().J()};W.prototype.getPriority=W.prototype.C;W.prototype.forEach=function(a){D("Firebase.DataSnapshot.forEach",1,1,arguments.length);F("Firebase.DataSnapshot.forEach",1,a,!1);if(this.A.L())return!1;var b=this;return!!this.A.R(this.g,function(c,d){return a(new W(d,b.Y.o(c),R))})};W.prototype.forEach=W.prototype.forEach;
	W.prototype.zd=function(){D("Firebase.DataSnapshot.hasChildren",0,0,arguments.length);return this.A.L()?!1:!this.A.e()};W.prototype.hasChildren=W.prototype.zd;W.prototype.name=function(){S("Firebase.DataSnapshot.name() being deprecated. Please use Firebase.DataSnapshot.key() instead.");D("Firebase.DataSnapshot.name",0,0,arguments.length);return this.key()};W.prototype.name=W.prototype.name;W.prototype.key=function(){D("Firebase.DataSnapshot.key",0,0,arguments.length);return this.Y.key()};
	W.prototype.key=W.prototype.key;W.prototype.Hb=function(){D("Firebase.DataSnapshot.numChildren",0,0,arguments.length);return this.A.Hb()};W.prototype.numChildren=W.prototype.Hb;W.prototype.Mb=function(){D("Firebase.DataSnapshot.ref",0,0,arguments.length);return this.Y};W.prototype.ref=W.prototype.Mb;function ii(a,b,c){this.Vb=a;this.tb=b;this.vb=c||null}h=ii.prototype;h.Qf=function(a){return"value"===a};h.createEvent=function(a,b){var c=b.n.g;return new jc("value",this,new W(a.Na,b.Mb(),c))};h.Zb=function(a){var b=this.vb;if("cancel"===a.De()){O(this.tb,"Raising a cancel event on a listener with no cancel callback");var c=this.tb;return function(){c.call(b,a.error)}}var d=this.Vb;return function(){d.call(b,a.be)}};h.lf=function(a,b){return this.tb?new kc(this,a,b):null};
	h.matches=function(a){return a instanceof ii?a.Vb&&this.Vb?a.Vb===this.Vb&&a.vb===this.vb:!0:!1};h.yf=function(){return null!==this.Vb};function ji(a,b,c){this.ja=a;this.tb=b;this.vb=c}h=ji.prototype;h.Qf=function(a){a="children_added"===a?"child_added":a;return("children_removed"===a?"child_removed":a)in this.ja};h.lf=function(a,b){return this.tb?new kc(this,a,b):null};
	h.createEvent=function(a,b){O(null!=a.Za,"Child events should have a childName.");var c=b.Mb().o(a.Za);return new jc(a.type,this,new W(a.Na,c,b.n.g),a.Td)};h.Zb=function(a){var b=this.vb;if("cancel"===a.De()){O(this.tb,"Raising a cancel event on a listener with no cancel callback");var c=this.tb;return function(){c.call(b,a.error)}}var d=this.ja[a.wd];return function(){d.call(b,a.be,a.Td)}};
	h.matches=function(a){if(a instanceof ji){if(!this.ja||!a.ja)return!0;if(this.vb===a.vb){var b=oa(a.ja);if(b===oa(this.ja)){if(1===b){var b=pa(a.ja),c=pa(this.ja);return c===b&&(!a.ja[b]||!this.ja[c]||a.ja[b]===this.ja[c])}return na(this.ja,function(b,c){return a.ja[c]===b})}}}return!1};h.yf=function(){return null!==this.ja};function ki(){this.za={}}h=ki.prototype;h.e=function(){return va(this.za)};h.gb=function(a,b,c){var d=a.source.Lb;if(null!==d)return d=z(this.za,d),O(null!=d,"SyncTree gave us an op for an invalid query."),d.gb(a,b,c);var e=[];v(this.za,function(d){e=e.concat(d.gb(a,b,c))});return e};h.Tb=function(a,b,c,d,e){var f=a.wa(),g=z(this.za,f);if(!g){var g=c.Aa(e?d:null),k=!1;g?k=!0:(g=d instanceof fe?c.Cc(d):H,k=!1);g=new Ye(a,new je(new Xb(g,k,!1),new Xb(d,e,!1)));this.za[f]=g}g.Tb(b);return af(g,b)};
	h.nb=function(a,b,c){var d=a.wa(),e=[],f=[],g=null!=li(this);if("default"===d){var k=this;v(this.za,function(a,d){f=f.concat(a.nb(b,c));a.e()&&(delete k.za[d],He(a.Y.n)||e.push(a.Y))})}else{var m=z(this.za,d);m&&(f=f.concat(m.nb(b,c)),m.e()&&(delete this.za[d],He(m.Y.n)||e.push(m.Y)))}g&&null==li(this)&&e.push(new X(a.k,a.path));return{Wg:e,vg:f}};function mi(a){return Na(qa(a.za),function(a){return!He(a.Y.n)})}h.kb=function(a){var b=null;v(this.za,function(c){b=b||c.kb(a)});return b};
	function ni(a,b){if(He(b.n))return li(a);var c=b.wa();return z(a.za,c)}function li(a){return ua(a.za,function(a){return He(a.Y.n)})||null};function oi(a){this.va=qe;this.mb=new Pf;this.df={};this.qc={};this.Qc=a}function pi(a,b,c,d,e){var f=a.mb,g=e;O(d>f.Pc,"Stacking an older write on top of newer ones");p(g)||(g=!0);f.pa.push({path:b,Ja:c,md:d,visible:g});g&&(f.V=Jf(f.V,b,c));f.Pc=d;return e?qi(a,new Ac(Ef,b,c)):[]}function ri(a,b,c,d){var e=a.mb;O(d>e.Pc,"Stacking an older merge on top of newer ones");e.pa.push({path:b,children:c,md:d,visible:!0});e.V=Kf(e.V,b,c);e.Pc=d;c=sf(c);return qi(a,new bf(Ef,b,c))}
	function si(a,b,c){c=c||!1;var d=Qf(a.mb,b);if(a.mb.Ud(b)){var e=qe;null!=d.Ja?e=e.set(M,!0):Fb(d.children,function(a,b){e=e.set(new P(a),b)});return qi(a,new Df(d.path,e,c))}return[]}function ti(a,b,c){c=sf(c);return qi(a,new bf(Gf,b,c))}function ui(a,b,c,d){d=vi(a,d);if(null!=d){var e=wi(d);d=e.path;e=e.Lb;b=lf(d,b);c=new Ac(new Ff(!1,!0,e,!0),b,c);return xi(a,d,c)}return[]}
	function yi(a,b,c,d){if(d=vi(a,d)){var e=wi(d);d=e.path;e=e.Lb;b=lf(d,b);c=sf(c);c=new bf(new Ff(!1,!0,e,!0),b,c);return xi(a,d,c)}return[]}
	oi.prototype.Tb=function(a,b){var c=a.path,d=null,e=!1;zf(this.va,c,function(a,b){var f=lf(a,c);d=d||b.kb(f);e=e||null!=li(b)});var f=this.va.get(c);f?(e=e||null!=li(f),d=d||f.kb(M)):(f=new ki,this.va=this.va.set(c,f));var g;null!=d?g=!0:(g=!1,d=H,Cf(this.va.subtree(c),function(a,b){var c=b.kb(M);c&&(d=d.W(a,c))}));var k=null!=ni(f,a);if(!k&&!He(a.n)){var m=zi(a);O(!(m in this.qc),"View does not exist, but we have a tag");var l=Ai++;this.qc[m]=l;this.df["_"+l]=m}g=f.Tb(a,b,new Uf(c,this.mb),d,g);
	k||e||(f=ni(f,a),g=g.concat(Bi(this,a,f)));return g};
	oi.prototype.nb=function(a,b,c){var d=a.path,e=this.va.get(d),f=[];if(e&&("default"===a.wa()||null!=ni(e,a))){f=e.nb(a,b,c);e.e()&&(this.va=this.va.remove(d));e=f.Wg;f=f.vg;b=-1!==Sa(e,function(a){return He(a.n)});var g=xf(this.va,d,function(a,b){return null!=li(b)});if(b&&!g&&(d=this.va.subtree(d),!d.e()))for(var d=Ci(d),k=0;k<d.length;++k){var m=d[k],l=m.Y,m=Di(this,m);this.Qc.af(Ei(l),Fi(this,l),m.Ad,m.I)}if(!g&&0<e.length&&!c)if(b)this.Qc.de(Ei(a),null);else{var t=this;Ma(e,function(a){a.wa();
	var b=t.qc[zi(a)];t.Qc.de(Ei(a),b)})}Gi(this,e)}return f};oi.prototype.Aa=function(a,b){var c=this.mb,d=xf(this.va,a,function(b,c){var d=lf(b,a);if(d=c.kb(d))return d});return c.Aa(a,d,b,!0)};function Ci(a){return vf(a,function(a,c,d){if(c&&null!=li(c))return[li(c)];var e=[];c&&(e=mi(c));v(d,function(a){e=e.concat(a)});return e})}function Gi(a,b){for(var c=0;c<b.length;++c){var d=b[c];if(!He(d.n)){var d=zi(d),e=a.qc[d];delete a.qc[d];delete a.df["_"+e]}}}
	function Ei(a){return He(a.n)&&!Ie(a.n)?a.Mb():a}function Bi(a,b,c){var d=b.path,e=Fi(a,b);c=Di(a,c);b=a.Qc.af(Ei(b),e,c.Ad,c.I);d=a.va.subtree(d);if(e)O(null==li(d.value),"If we're adding a query, it shouldn't be shadowed");else for(e=vf(d,function(a,b,c){if(!a.e()&&b&&null!=li(b))return[Ze(li(b))];var d=[];b&&(d=d.concat(Oa(mi(b),function(a){return a.Y})));v(c,function(a){d=d.concat(a)});return d}),d=0;d<e.length;++d)c=e[d],a.Qc.de(Ei(c),Fi(a,c));return b}
	function Di(a,b){var c=b.Y,d=Fi(a,c);return{Ad:function(){return(b.w()||H).hash()},I:function(b){if("ok"===b){if(d){var f=c.path;if(b=vi(a,d)){var g=wi(b);b=g.path;g=g.Lb;f=lf(b,f);f=new Cc(new Ff(!1,!0,g,!0),f);b=xi(a,b,f)}else b=[]}else b=qi(a,new Cc(Gf,c.path));return b}f="Unknown Error";"too_big"===b?f="The data requested exceeds the maximum size that can be accessed with a single request.":"permission_denied"==b?f="Client doesn't have permission to access the desired data.":"unavailable"==b&&
	(f="The service is unavailable");f=Error(b+" at "+c.path.toString()+": "+f);f.code=b.toUpperCase();return a.nb(c,null,f)}}}function zi(a){return a.path.toString()+"$"+a.wa()}function wi(a){var b=a.indexOf("$");O(-1!==b&&b<a.length-1,"Bad queryKey.");return{Lb:a.substr(b+1),path:new P(a.substr(0,b))}}function vi(a,b){var c=a.df,d="_"+b;return d in c?c[d]:void 0}function Fi(a,b){var c=zi(b);return z(a.qc,c)}var Ai=1;
	function xi(a,b,c){var d=a.va.get(b);O(d,"Missing sync point for query tag that we're tracking");return d.gb(c,new Uf(b,a.mb),null)}function qi(a,b){return Hi(a,b,a.va,null,new Uf(M,a.mb))}function Hi(a,b,c,d,e){if(b.path.e())return Ii(a,b,c,d,e);var f=c.get(M);null==d&&null!=f&&(d=f.kb(M));var g=[],k=K(b.path),m=b.$c(k);if((c=c.children.get(k))&&m)var l=d?d.T(k):null,k=e.o(k),g=g.concat(Hi(a,m,c,l,k));f&&(g=g.concat(f.gb(b,e,d)));return g}
	function Ii(a,b,c,d,e){var f=c.get(M);null==d&&null!=f&&(d=f.kb(M));var g=[];c.children.ka(function(c,f){var l=d?d.T(c):null,t=e.o(c),A=b.$c(c);A&&(g=g.concat(Ii(a,A,f,l,t)))});f&&(g=g.concat(f.gb(b,e,d)));return g};function Ji(a,b){this.G=a;this.Xa=uc(a);this.hd=null;this.fa=new Zb;this.Kd=1;this.Va=null;b||0<=("object"===typeof window&&window.navigator&&window.navigator.userAgent||"").search(/googlebot|google webmaster tools|bingbot|yahoo! slurp|baiduspider|yandexbot|duckduckbot/i)?(this.da=new cf(this.G,u(this.Kb,this)),setTimeout(u(this.Xc,this,!0),0)):this.da=this.Va=new Rh(this.G,u(this.Kb,this),u(this.Xc,this),u(this.Se,this));this.eh=vc(a,u(function(){return new pc(this.Xa,this.da)},this));this.yc=new Wf;
	this.Ge=new Sb;var c=this;this.Fd=new oi({af:function(a,b,f,g){b=[];f=c.Ge.j(a.path);f.e()||(b=qi(c.Fd,new Ac(Gf,a.path,f)),setTimeout(function(){g("ok")},0));return b},de:aa});Ki(this,"connected",!1);this.na=new Vc;this.O=new Yg(a,u(this.da.O,this.da),u(this.da.je,this.da),u(this.Pe,this));this.ud=0;this.He=null;this.M=new oi({af:function(a,b,f,g){c.da.Cf(a,f,b,function(b,e){var f=g(b,e);dc(c.fa,a.path,f)});return[]},de:function(a,b){c.da.$f(a,b)}})}h=Ji.prototype;
	h.toString=function(){return(this.G.ob?"https://":"http://")+this.G.host};h.name=function(){return this.G.lc};function Li(a){a=a.Ge.j(new P(".info/serverTimeOffset")).J()||0;return(new Date).getTime()+a}function Mi(a){a=a={timestamp:Li(a)};a.timestamp=a.timestamp||(new Date).getTime();return a}
	h.Kb=function(a,b,c,d){this.ud++;var e=new P(a);b=this.He?this.He(a,b):b;a=[];d?c?(b=ma(b,function(a){return Q(a)}),a=yi(this.M,e,b,d)):(b=Q(b),a=ui(this.M,e,b,d)):c?(d=ma(b,function(a){return Q(a)}),a=ti(this.M,e,d)):(d=Q(b),a=qi(this.M,new Ac(Gf,e,d)));d=e;0<a.length&&(d=Ni(this,e));dc(this.fa,d,a)};h.Xc=function(a){Ki(this,"connected",a);!1===a&&Oi(this)};h.Se=function(a){var b=this;zd(a,function(a,d){Ki(b,d,a)})};h.Pe=function(a){Ki(this,"authenticated",a)};
	function Ki(a,b,c){b=new P("/.info/"+b);c=Q(c);var d=a.Ge;d.Zd=d.Zd.H(b,c);c=qi(a.Fd,new Ac(Gf,b,c));dc(a.fa,b,c)}h.Ob=function(a,b,c,d){this.f("set",{path:a.toString(),value:b,nh:c});var e=Mi(this);b=Q(b,c);var e=Xc(b,e),f=this.Kd++,e=pi(this.M,a,e,f,!0);$b(this.fa,e);var g=this;this.da.put(a.toString(),b.J(!0),function(b,c){var e="ok"===b;e||S("set at "+a+" failed: "+b);e=si(g.M,f,!e);dc(g.fa,a,e);Pi(d,b,c)});e=Qi(this,a);Ni(this,e);dc(this.fa,e,[])};
	h.update=function(a,b,c){this.f("update",{path:a.toString(),value:b});var d=!0,e=Mi(this),f={};v(b,function(a,b){d=!1;var c=Q(a);f[b]=Xc(c,e)});if(d)fc("update() called with empty data.  Don't do anything."),Pi(c,"ok");else{var g=this.Kd++,k=ri(this.M,a,f,g);$b(this.fa,k);var m=this;this.da.Df(a.toString(),b,function(b,d){var e="ok"===b;e||S("update at "+a+" failed: "+b);var e=si(m.M,g,!e),f=a;0<e.length&&(f=Ni(m,a));dc(m.fa,f,e);Pi(c,b,d)});b=Qi(this,a);Ni(this,b);dc(this.fa,a,[])}};
	function Oi(a){a.f("onDisconnectEvents");var b=Mi(a),c=[];Wc(Uc(a.na,b),M,function(b,e){c=c.concat(qi(a.M,new Ac(Gf,b,e)));var f=Qi(a,b);Ni(a,f)});a.na=new Vc;dc(a.fa,M,c)}h.Md=function(a,b){var c=this;this.da.Md(a.toString(),function(d,e){"ok"===d&&wg(c.na,a);Pi(b,d,e)})};function fi(a,b,c,d){var e=Q(c);a.da.Qe(b.toString(),e.J(!0),function(c,g){"ok"===c&&a.na.rc(b,e);Pi(d,c,g)})}function gi(a,b,c,d,e){var f=Q(c,d);a.da.Qe(b.toString(),f.J(!0),function(c,d){"ok"===c&&a.na.rc(b,f);Pi(e,c,d)})}
	function hi(a,b,c,d){var e=!0,f;for(f in c)e=!1;e?(fc("onDisconnect().update() called with empty data.  Don't do anything."),Pi(d,"ok")):a.da.Gf(b.toString(),c,function(e,f){if("ok"===e)for(var m in c){var l=Q(c[m]);a.na.rc(b.o(m),l)}Pi(d,e,f)})}function Ri(a,b,c){c=".info"===K(b.path)?a.Fd.Tb(b,c):a.M.Tb(b,c);bc(a.fa,b.path,c)}h.Cb=function(){this.Va&&this.Va.Cb()};h.vc=function(){this.Va&&this.Va.vc()};
	h.bf=function(a){if("undefined"!==typeof console){a?(this.hd||(this.hd=new oc(this.Xa)),a=this.hd.get()):a=this.Xa.get();var b=Pa(ra(a),function(a,b){return Math.max(b.length,a)},0),c;for(c in a){for(var d=a[c],e=c.length;e<b+2;e++)c+=" ";console.log(c+d)}}};h.cf=function(a){rc(this.Xa,a);this.eh.Vf[a]=!0};h.f=function(a){var b="";this.Va&&(b=this.Va.id+":");fc(b,arguments)};
	function Pi(a,b,c){a&&gc(function(){if("ok"==b)a(null);else{var d=(b||"error").toUpperCase(),e=d;c&&(e+=": "+c);e=Error(e);e.code=d;a(e)}})};function Si(a,b,c,d,e){function f(){}a.f("transaction on "+b);var g=new X(a,b);g.Ib("value",f);c={path:b,update:c,I:d,status:null,Lf:id(),gf:e,Sf:0,le:function(){g.mc("value",f)},ne:null,Da:null,rd:null,sd:null,td:null};d=a.M.Aa(b,void 0)||H;c.rd=d;d=c.update(d.J());if(p(d)){hg("transaction failed: Data returned ",d,c.path);c.status=1;e=Xf(a.yc,b);var k=e.Ea()||[];k.push(c);Yf(e,k);"object"===typeof d&&null!==d&&y(d,".priority")?(k=z(d,".priority"),O(fg(k),"Invalid priority returned by transaction. Priority must be a valid string, finite number, server value, or null.")):
	k=(a.M.Aa(b)||H).C().J();e=Mi(a);d=Q(d,k);e=Xc(d,e);c.sd=d;c.td=e;c.Da=a.Kd++;c=pi(a.M,b,e,c.Da,c.gf);dc(a.fa,b,c);Ti(a)}else c.le(),c.sd=null,c.td=null,c.I&&(a=new W(c.rd,new X(a,c.path),R),c.I(null,!1,a))}function Ti(a,b){var c=b||a.yc;b||Ui(a,c);if(null!==c.Ea()){var d=Vi(a,c);O(0<d.length,"Sending zero length transaction queue");Qa(d,function(a){return 1===a.status})&&Wi(a,c.path(),d)}else c.zd()&&c.R(function(b){Ti(a,b)})}
	function Wi(a,b,c){for(var d=Oa(c,function(a){return a.Da}),e=a.M.Aa(b,d)||H,d=e,e=e.hash(),f=0;f<c.length;f++){var g=c[f];O(1===g.status,"tryToSendTransactionQueue_: items in queue should all be run.");g.status=2;g.Sf++;var k=lf(b,g.path),d=d.H(k,g.sd)}d=d.J(!0);a.da.put(b.toString(),d,function(d){a.f("transaction put response",{path:b.toString(),status:d});var e=[];if("ok"===d){d=[];for(f=0;f<c.length;f++){c[f].status=3;e=e.concat(si(a.M,c[f].Da));if(c[f].I){var g=c[f].td,k=new X(a,c[f].path);d.push(u(c[f].I,
	null,null,!0,new W(g,k,R)))}c[f].le()}Ui(a,Xf(a.yc,b));Ti(a);dc(a.fa,b,e);for(f=0;f<d.length;f++)gc(d[f])}else{if("datastale"===d)for(f=0;f<c.length;f++)c[f].status=4===c[f].status?5:1;else for(S("transaction at "+b.toString()+" failed: "+d),f=0;f<c.length;f++)c[f].status=5,c[f].ne=d;Ni(a,b)}},e)}function Ni(a,b){var c=Xi(a,b),d=c.path(),c=Vi(a,c);Yi(a,c,d);return d}
	function Yi(a,b,c){if(0!==b.length){for(var d=[],e=[],f=Na(b,function(a){return 1===a.status}),f=Oa(f,function(a){return a.Da}),g=0;g<b.length;g++){var k=b[g],m=lf(c,k.path),l=!1,t;O(null!==m,"rerunTransactionsUnderNode_: relativePath should not be null.");if(5===k.status)l=!0,t=k.ne,e=e.concat(si(a.M,k.Da,!0));else if(1===k.status)if(25<=k.Sf)l=!0,t="maxretry",e=e.concat(si(a.M,k.Da,!0));else{var A=a.M.Aa(k.path,f)||H;k.rd=A;var I=b[g].update(A.J());p(I)?(hg("transaction failed: Data returned ",
	I,k.path),m=Q(I),"object"===typeof I&&null!=I&&y(I,".priority")||(m=m.ia(A.C())),A=k.Da,I=Mi(a),I=Xc(m,I),k.sd=m,k.td=I,k.Da=a.Kd++,Ta(f,A),e=e.concat(pi(a.M,k.path,I,k.Da,k.gf)),e=e.concat(si(a.M,A,!0))):(l=!0,t="nodata",e=e.concat(si(a.M,k.Da,!0)))}dc(a.fa,c,e);e=[];l&&(b[g].status=3,setTimeout(b[g].le,Math.floor(0)),b[g].I&&("nodata"===t?(k=new X(a,b[g].path),d.push(u(b[g].I,null,null,!1,new W(b[g].rd,k,R)))):d.push(u(b[g].I,null,Error(t),!1,null))))}Ui(a,a.yc);for(g=0;g<d.length;g++)gc(d[g]);
	Ti(a)}}function Xi(a,b){for(var c,d=a.yc;null!==(c=K(b))&&null===d.Ea();)d=Xf(d,c),b=N(b);return d}function Vi(a,b){var c=[];Zi(a,b,c);c.sort(function(a,b){return a.Lf-b.Lf});return c}function Zi(a,b,c){var d=b.Ea();if(null!==d)for(var e=0;e<d.length;e++)c.push(d[e]);b.R(function(b){Zi(a,b,c)})}function Ui(a,b){var c=b.Ea();if(c){for(var d=0,e=0;e<c.length;e++)3!==c[e].status&&(c[d]=c[e],d++);c.length=d;Yf(b,0<c.length?c:null)}b.R(function(b){Ui(a,b)})}
	function Qi(a,b){var c=Xi(a,b).path(),d=Xf(a.yc,b);ag(d,function(b){$i(a,b)});$i(a,d);$f(d,function(b){$i(a,b)});return c}
	function $i(a,b){var c=b.Ea();if(null!==c){for(var d=[],e=[],f=-1,g=0;g<c.length;g++)4!==c[g].status&&(2===c[g].status?(O(f===g-1,"All SENT items should be at beginning of queue."),f=g,c[g].status=4,c[g].ne="set"):(O(1===c[g].status,"Unexpected transaction status in abort"),c[g].le(),e=e.concat(si(a.M,c[g].Da,!0)),c[g].I&&d.push(u(c[g].I,null,Error("set"),!1,null))));-1===f?Yf(b,null):c.length=f+1;dc(a.fa,b.path(),e);for(g=0;g<d.length;g++)gc(d[g])}};function aj(){this.sc={};this.ag=!1}aj.prototype.Cb=function(){for(var a in this.sc)this.sc[a].Cb()};aj.prototype.vc=function(){for(var a in this.sc)this.sc[a].vc()};aj.prototype.ze=function(){this.ag=!0};ba(aj);aj.prototype.interrupt=aj.prototype.Cb;aj.prototype.resume=aj.prototype.vc;function Y(a,b,c,d){this.k=a;this.path=b;this.n=c;this.pc=d}
	function bj(a){var b=null,c=null;a.oa&&(b=Od(a));a.ra&&(c=Rd(a));if(a.g===re){if(a.oa){if("[MIN_NAME]"!=Nd(a))throw Error("Query: When ordering by key, you may only pass one argument to startAt(), endAt(), or equalTo().");if("string"!==typeof b)throw Error("Query: When ordering by key, the argument passed to startAt(), endAt(),or equalTo() must be a string.");}if(a.ra){if("[MAX_NAME]"!=Pd(a))throw Error("Query: When ordering by key, you may only pass one argument to startAt(), endAt(), or equalTo().");if("string"!==
	typeof c)throw Error("Query: When ordering by key, the argument passed to startAt(), endAt(),or equalTo() must be a string.");}}else if(a.g===R){if(null!=b&&!fg(b)||null!=c&&!fg(c))throw Error("Query: When ordering by priority, the first argument passed to startAt(), endAt(), or equalTo() must be a valid priority value (null, a number, or a string).");}else if(O(a.g instanceof ve||a.g===Be,"unknown index type."),null!=b&&"object"===typeof b||null!=c&&"object"===typeof c)throw Error("Query: First argument passed to startAt(), endAt(), or equalTo() cannot be an object.");
	}function cj(a){if(a.oa&&a.ra&&a.la&&(!a.la||""===a.Rb))throw Error("Query: Can't combine startAt(), endAt(), and limit(). Use limitToFirst() or limitToLast() instead.");}function dj(a,b){if(!0===a.pc)throw Error(b+": You can't combine multiple orderBy calls.");}h=Y.prototype;h.Mb=function(){D("Query.ref",0,0,arguments.length);return new X(this.k,this.path)};
	h.Ib=function(a,b,c,d){D("Query.on",2,4,arguments.length);lg("Query.on",a,!1);F("Query.on",2,b,!1);var e=ej("Query.on",c,d);if("value"===a)Ri(this.k,this,new ii(b,e.cancel||null,e.Qa||null));else{var f={};f[a]=b;Ri(this.k,this,new ji(f,e.cancel,e.Qa))}return b};
	h.mc=function(a,b,c){D("Query.off",0,3,arguments.length);lg("Query.off",a,!0);F("Query.off",2,b,!0);Qb("Query.off",3,c);var d=null,e=null;"value"===a?d=new ii(b||null,null,c||null):a&&(b&&(e={},e[a]=b),d=new ji(e,null,c||null));e=this.k;d=".info"===K(this.path)?e.Fd.nb(this,d):e.M.nb(this,d);bc(e.fa,this.path,d)};
	h.Pg=function(a,b){function c(k){f&&(f=!1,e.mc(a,c),b&&b.call(d.Qa,k),g.resolve(k))}D("Query.once",1,4,arguments.length);lg("Query.once",a,!1);F("Query.once",2,b,!0);var d=ej("Query.once",arguments[2],arguments[3]),e=this,f=!0,g=new B;Nb(g.D);this.Ib(a,c,function(b){e.mc(a,c);d.cancel&&d.cancel.call(d.Qa,b);g.reject(b)});return g.D};
	h.Le=function(a){S("Query.limit() being deprecated. Please use Query.limitToFirst() or Query.limitToLast() instead.");D("Query.limit",1,1,arguments.length);if(!fa(a)||Math.floor(a)!==a||0>=a)throw Error("Query.limit: First argument must be a positive integer.");if(this.n.la)throw Error("Query.limit: Limit was already set (by another call to limit, limitToFirst, orlimitToLast.");var b=this.n.Le(a);cj(b);return new Y(this.k,this.path,b,this.pc)};
	h.Me=function(a){D("Query.limitToFirst",1,1,arguments.length);if(!fa(a)||Math.floor(a)!==a||0>=a)throw Error("Query.limitToFirst: First argument must be a positive integer.");if(this.n.la)throw Error("Query.limitToFirst: Limit was already set (by another call to limit, limitToFirst, or limitToLast).");return new Y(this.k,this.path,this.n.Me(a),this.pc)};
	h.Ne=function(a){D("Query.limitToLast",1,1,arguments.length);if(!fa(a)||Math.floor(a)!==a||0>=a)throw Error("Query.limitToLast: First argument must be a positive integer.");if(this.n.la)throw Error("Query.limitToLast: Limit was already set (by another call to limit, limitToFirst, or limitToLast).");return new Y(this.k,this.path,this.n.Ne(a),this.pc)};
	h.Qg=function(a){D("Query.orderByChild",1,1,arguments.length);if("$key"===a)throw Error('Query.orderByChild: "$key" is invalid.  Use Query.orderByKey() instead.');if("$priority"===a)throw Error('Query.orderByChild: "$priority" is invalid.  Use Query.orderByPriority() instead.');if("$value"===a)throw Error('Query.orderByChild: "$value" is invalid.  Use Query.orderByValue() instead.');ng("Query.orderByChild",a);dj(this,"Query.orderByChild");var b=new P(a);if(b.e())throw Error("Query.orderByChild: cannot pass in empty path.  Use Query.orderByValue() instead.");
	b=new ve(b);b=Fe(this.n,b);bj(b);return new Y(this.k,this.path,b,!0)};h.Rg=function(){D("Query.orderByKey",0,0,arguments.length);dj(this,"Query.orderByKey");var a=Fe(this.n,re);bj(a);return new Y(this.k,this.path,a,!0)};h.Sg=function(){D("Query.orderByPriority",0,0,arguments.length);dj(this,"Query.orderByPriority");var a=Fe(this.n,R);bj(a);return new Y(this.k,this.path,a,!0)};
	h.Tg=function(){D("Query.orderByValue",0,0,arguments.length);dj(this,"Query.orderByValue");var a=Fe(this.n,Be);bj(a);return new Y(this.k,this.path,a,!0)};h.ce=function(a,b){D("Query.startAt",0,2,arguments.length);gg("Query.startAt",a,this.path,!0);mg("Query.startAt",b);var c=this.n.ce(a,b);cj(c);bj(c);if(this.n.oa)throw Error("Query.startAt: Starting point was already set (by another call to startAt or equalTo).");p(a)||(b=a=null);return new Y(this.k,this.path,c,this.pc)};
	h.vd=function(a,b){D("Query.endAt",0,2,arguments.length);gg("Query.endAt",a,this.path,!0);mg("Query.endAt",b);var c=this.n.vd(a,b);cj(c);bj(c);if(this.n.ra)throw Error("Query.endAt: Ending point was already set (by another call to endAt or equalTo).");return new Y(this.k,this.path,c,this.pc)};
	h.tg=function(a,b){D("Query.equalTo",1,2,arguments.length);gg("Query.equalTo",a,this.path,!1);mg("Query.equalTo",b);if(this.n.oa)throw Error("Query.equalTo: Starting point was already set (by another call to endAt or equalTo).");if(this.n.ra)throw Error("Query.equalTo: Ending point was already set (by another call to endAt or equalTo).");return this.ce(a,b).vd(a,b)};
	h.toString=function(){D("Query.toString",0,0,arguments.length);for(var a=this.path,b="",c=a.aa;c<a.u.length;c++)""!==a.u[c]&&(b+="/"+encodeURIComponent(String(a.u[c])));return this.k.toString()+(b||"/")};h.wa=function(){var a=xd(Ge(this.n));return"{}"===a?"default":a};
	function ej(a,b,c){var d={cancel:null,Qa:null};if(b&&c)d.cancel=b,F(a,3,d.cancel,!0),d.Qa=c,Qb(a,4,d.Qa);else if(b)if("object"===typeof b&&null!==b)d.Qa=b;else if("function"===typeof b)d.cancel=b;else throw Error(E(a,3,!0)+" must either be a cancel callback or a context object.");return d}Y.prototype.ref=Y.prototype.Mb;Y.prototype.on=Y.prototype.Ib;Y.prototype.off=Y.prototype.mc;Y.prototype.once=Y.prototype.Pg;Y.prototype.limit=Y.prototype.Le;Y.prototype.limitToFirst=Y.prototype.Me;
	Y.prototype.limitToLast=Y.prototype.Ne;Y.prototype.orderByChild=Y.prototype.Qg;Y.prototype.orderByKey=Y.prototype.Rg;Y.prototype.orderByPriority=Y.prototype.Sg;Y.prototype.orderByValue=Y.prototype.Tg;Y.prototype.startAt=Y.prototype.ce;Y.prototype.endAt=Y.prototype.vd;Y.prototype.equalTo=Y.prototype.tg;Y.prototype.toString=Y.prototype.toString;var Z={};Z.zc=Rh;Z.DataConnection=Z.zc;Rh.prototype.dh=function(a,b){this.Ia("q",{p:a},b)};Z.zc.prototype.simpleListen=Z.zc.prototype.dh;Rh.prototype.sg=function(a,b){this.Ia("echo",{d:a},b)};Z.zc.prototype.echo=Z.zc.prototype.sg;Rh.prototype.interrupt=Rh.prototype.Cb;Z.dg=Fh;Z.RealTimeConnection=Z.dg;Fh.prototype.sendRequest=Fh.prototype.Ia;Fh.prototype.close=Fh.prototype.close;
	Z.Cg=function(a){var b=Rh.prototype.put;Rh.prototype.put=function(c,d,e,f){p(f)&&(f=a());b.call(this,c,d,e,f)};return function(){Rh.prototype.put=b}};Z.hijackHash=Z.Cg;Z.cg=dd;Z.ConnectionTarget=Z.cg;Z.wa=function(a){return a.wa()};Z.queryIdentifier=Z.wa;Z.Fg=function(a){return a.k.Va.ba};Z.listens=Z.Fg;Z.ze=function(a){a.ze()};Z.forceRestClient=Z.ze;function X(a,b){var c,d,e;if(a instanceof Ji)c=a,d=b;else{D("new Firebase",1,2,arguments.length);d=sd(arguments[0]);c=d.fh;"firebase"===d.domain&&rd(d.host+" is no longer supported. Please use <YOUR FIREBASE>.firebaseio.com instead");c&&"undefined"!=c||rd("Cannot parse Firebase url. Please use https://<YOUR FIREBASE>.firebaseio.com");d.ob||"undefined"!==typeof window&&window.location&&window.location.protocol&&-1!==window.location.protocol.indexOf("https:")&&S("Insecure Firebase access from a secure page. Please use https in calls to new Firebase().");
	c=new dd(d.host,d.ob,c,"ws"===d.scheme||"wss"===d.scheme);d=new P(d.bd);e=d.toString();var f;!(f=!q(c.host)||0===c.host.length||!eg(c.lc))&&(f=0!==e.length)&&(e&&(e=e.replace(/^\/*\.info(\/|$)/,"/")),f=!(q(e)&&0!==e.length&&!cg.test(e)));if(f)throw Error(E("new Firebase",1,!1)+'must be a valid firebase URL and the path can\'t contain ".", "#", "$", "[", or "]".');if(b)if(b instanceof aj)e=b;else if(q(b))e=aj.yb(),c.Rd=b;else throw Error("Expected a valid Firebase.Context for second argument to new Firebase()");
	else e=aj.yb();f=c.toString();var g=z(e.sc,f);g||(g=new Ji(c,e.ag),e.sc[f]=g);c=g}Y.call(this,c,d,De,!1);this.then=void 0;this["catch"]=void 0}ka(X,Y);var fj=X,gj=["Firebase"],hj=n;gj[0]in hj||!hj.execScript||hj.execScript("var "+gj[0]);for(var ij;gj.length&&(ij=gj.shift());)!gj.length&&p(fj)?hj[ij]=fj:hj=hj[ij]?hj[ij]:hj[ij]={};X.goOffline=function(){D("Firebase.goOffline",0,0,arguments.length);aj.yb().Cb()};X.goOnline=function(){D("Firebase.goOnline",0,0,arguments.length);aj.yb().vc()};
	X.enableLogging=od;X.ServerValue={TIMESTAMP:{".sv":"timestamp"}};X.SDK_VERSION=Eb;X.INTERNAL=U;X.Context=aj;X.TEST_ACCESS=Z;X.prototype.name=function(){S("Firebase.name() being deprecated. Please use Firebase.key() instead.");D("Firebase.name",0,0,arguments.length);return this.key()};X.prototype.name=X.prototype.name;X.prototype.key=function(){D("Firebase.key",0,0,arguments.length);return this.path.e()?null:me(this.path)};X.prototype.key=X.prototype.key;
	X.prototype.o=function(a){D("Firebase.child",1,1,arguments.length);if(fa(a))a=String(a);else if(!(a instanceof P))if(null===K(this.path)){var b=a;b&&(b=b.replace(/^\/*\.info(\/|$)/,"/"));ng("Firebase.child",b)}else ng("Firebase.child",a);return new X(this.k,this.path.o(a))};X.prototype.child=X.prototype.o;X.prototype.parent=function(){D("Firebase.parent",0,0,arguments.length);var a=this.path.parent();return null===a?null:new X(this.k,a)};X.prototype.parent=X.prototype.parent;
	X.prototype.root=function(){D("Firebase.ref",0,0,arguments.length);for(var a=this;null!==a.parent();)a=a.parent();return a};X.prototype.root=X.prototype.root;X.prototype.set=function(a,b){D("Firebase.set",1,2,arguments.length);og("Firebase.set",this.path);gg("Firebase.set",a,this.path,!1);F("Firebase.set",2,b,!0);var c=new B;this.k.Ob(this.path,a,null,C(c,b));return c.D};X.prototype.set=X.prototype.set;
	X.prototype.update=function(a,b){D("Firebase.update",1,2,arguments.length);og("Firebase.update",this.path);if(da(a)){for(var c={},d=0;d<a.length;++d)c[""+d]=a[d];a=c;S("Passing an Array to Firebase.update() is deprecated. Use set() if you want to overwrite the existing data, or an Object with integer keys if you really do want to only update some of the children.")}jg("Firebase.update",a,this.path);F("Firebase.update",2,b,!0);c=new B;this.k.update(this.path,a,C(c,b));return c.D};
	X.prototype.update=X.prototype.update;X.prototype.Ob=function(a,b,c){D("Firebase.setWithPriority",2,3,arguments.length);og("Firebase.setWithPriority",this.path);gg("Firebase.setWithPriority",a,this.path,!1);kg("Firebase.setWithPriority",2,b);F("Firebase.setWithPriority",3,c,!0);if(".length"===this.key()||".keys"===this.key())throw"Firebase.setWithPriority failed: "+this.key()+" is a read-only object.";var d=new B;this.k.Ob(this.path,a,b,C(d,c));return d.D};X.prototype.setWithPriority=X.prototype.Ob;
	X.prototype.remove=function(a){D("Firebase.remove",0,1,arguments.length);og("Firebase.remove",this.path);F("Firebase.remove",1,a,!0);return this.set(null,a)};X.prototype.remove=X.prototype.remove;
	X.prototype.transaction=function(a,b,c){D("Firebase.transaction",1,3,arguments.length);og("Firebase.transaction",this.path);F("Firebase.transaction",1,a,!1);F("Firebase.transaction",2,b,!0);if(p(c)&&"boolean"!=typeof c)throw Error(E("Firebase.transaction",3,!0)+"must be a boolean.");if(".length"===this.key()||".keys"===this.key())throw"Firebase.transaction failed: "+this.key()+" is a read-only object.";"undefined"===typeof c&&(c=!0);var d=new B;r(b)&&Nb(d.D);Si(this.k,this.path,a,function(a,c,g){a?
	d.reject(a):d.resolve(new ei(c,g));r(b)&&b(a,c,g)},c);return d.D};X.prototype.transaction=X.prototype.transaction;X.prototype.$g=function(a,b){D("Firebase.setPriority",1,2,arguments.length);og("Firebase.setPriority",this.path);kg("Firebase.setPriority",1,a);F("Firebase.setPriority",2,b,!0);var c=new B;this.k.Ob(this.path.o(".priority"),a,null,C(c,b));return c.D};X.prototype.setPriority=X.prototype.$g;
	X.prototype.push=function(a,b){D("Firebase.push",0,2,arguments.length);og("Firebase.push",this.path);gg("Firebase.push",a,this.path,!0);F("Firebase.push",2,b,!0);var c=Li(this.k),d=hf(c),c=this.o(d);if(null!=a){var e=this,f=c.set(a,b).then(function(){return e.o(d)});c.then=u(f.then,f);c["catch"]=u(f.then,f,void 0);r(b)&&Nb(f)}return c};X.prototype.push=X.prototype.push;X.prototype.lb=function(){og("Firebase.onDisconnect",this.path);return new V(this.k,this.path)};X.prototype.onDisconnect=X.prototype.lb;
	X.prototype.O=function(a,b,c){S("FirebaseRef.auth() being deprecated. Please use FirebaseRef.authWithCustomToken() instead.");D("Firebase.auth",1,3,arguments.length);pg("Firebase.auth",a);F("Firebase.auth",2,b,!0);F("Firebase.auth",3,b,!0);var d=new B;dh(this.k.O,a,{},{remember:"none"},C(d,b),c);return d.D};X.prototype.auth=X.prototype.O;X.prototype.je=function(a){D("Firebase.unauth",0,1,arguments.length);F("Firebase.unauth",1,a,!0);var b=new B;eh(this.k.O,C(b,a));return b.D};X.prototype.unauth=X.prototype.je;
	X.prototype.Be=function(){D("Firebase.getAuth",0,0,arguments.length);return this.k.O.Be()};X.prototype.getAuth=X.prototype.Be;X.prototype.Jg=function(a,b){D("Firebase.onAuth",1,2,arguments.length);F("Firebase.onAuth",1,a,!1);Qb("Firebase.onAuth",2,b);this.k.O.Ib("auth_status",a,b)};X.prototype.onAuth=X.prototype.Jg;X.prototype.Ig=function(a,b){D("Firebase.offAuth",1,2,arguments.length);F("Firebase.offAuth",1,a,!1);Qb("Firebase.offAuth",2,b);this.k.O.mc("auth_status",a,b)};X.prototype.offAuth=X.prototype.Ig;
	X.prototype.hg=function(a,b,c){D("Firebase.authWithCustomToken",1,3,arguments.length);2===arguments.length&&Hb(b)&&(c=b,b=void 0);pg("Firebase.authWithCustomToken",a);F("Firebase.authWithCustomToken",2,b,!0);sg("Firebase.authWithCustomToken",3,c,!0);var d=new B;dh(this.k.O,a,{},c||{},C(d,b));return d.D};X.prototype.authWithCustomToken=X.prototype.hg;
	X.prototype.ig=function(a,b,c){D("Firebase.authWithOAuthPopup",1,3,arguments.length);2===arguments.length&&Hb(b)&&(c=b,b=void 0);rg("Firebase.authWithOAuthPopup",a);F("Firebase.authWithOAuthPopup",2,b,!0);sg("Firebase.authWithOAuthPopup",3,c,!0);var d=new B;ih(this.k.O,a,c,C(d,b));return d.D};X.prototype.authWithOAuthPopup=X.prototype.ig;
	X.prototype.jg=function(a,b,c){D("Firebase.authWithOAuthRedirect",1,3,arguments.length);2===arguments.length&&Hb(b)&&(c=b,b=void 0);rg("Firebase.authWithOAuthRedirect",a);F("Firebase.authWithOAuthRedirect",2,b,!1);sg("Firebase.authWithOAuthRedirect",3,c,!0);var d=new B,e=this.k.O,f=c,g=C(d,b);gh(e);var k=[Qg],f=Ag(f);"anonymous"===a||"firebase"===a?T(g,Sg("TRANSPORT_UNAVAILABLE")):(cd.set("redirect_client_options",f.qd),hh(e,k,"/auth/"+a,f,g));return d.D};X.prototype.authWithOAuthRedirect=X.prototype.jg;
	X.prototype.kg=function(a,b,c,d){D("Firebase.authWithOAuthToken",2,4,arguments.length);3===arguments.length&&Hb(c)&&(d=c,c=void 0);rg("Firebase.authWithOAuthToken",a);F("Firebase.authWithOAuthToken",3,c,!0);sg("Firebase.authWithOAuthToken",4,d,!0);var e=new B;q(b)?(qg("Firebase.authWithOAuthToken",2,b),fh(this.k.O,a+"/token",{access_token:b},d,C(e,c))):(sg("Firebase.authWithOAuthToken",2,b,!1),fh(this.k.O,a+"/token",b,d,C(e,c)));return e.D};X.prototype.authWithOAuthToken=X.prototype.kg;
	X.prototype.gg=function(a,b){D("Firebase.authAnonymously",0,2,arguments.length);1===arguments.length&&Hb(a)&&(b=a,a=void 0);F("Firebase.authAnonymously",1,a,!0);sg("Firebase.authAnonymously",2,b,!0);var c=new B;fh(this.k.O,"anonymous",{},b,C(c,a));return c.D};X.prototype.authAnonymously=X.prototype.gg;
	X.prototype.lg=function(a,b,c){D("Firebase.authWithPassword",1,3,arguments.length);2===arguments.length&&Hb(b)&&(c=b,b=void 0);sg("Firebase.authWithPassword",1,a,!1);tg("Firebase.authWithPassword",a,"email");tg("Firebase.authWithPassword",a,"password");F("Firebase.authWithPassword",2,b,!0);sg("Firebase.authWithPassword",3,c,!0);var d=new B;fh(this.k.O,"password",a,c,C(d,b));return d.D};X.prototype.authWithPassword=X.prototype.lg;
	X.prototype.ve=function(a,b){D("Firebase.createUser",1,2,arguments.length);sg("Firebase.createUser",1,a,!1);tg("Firebase.createUser",a,"email");tg("Firebase.createUser",a,"password");F("Firebase.createUser",2,b,!0);var c=new B;this.k.O.ve(a,C(c,b));return c.D};X.prototype.createUser=X.prototype.ve;
	X.prototype.Xe=function(a,b){D("Firebase.removeUser",1,2,arguments.length);sg("Firebase.removeUser",1,a,!1);tg("Firebase.removeUser",a,"email");tg("Firebase.removeUser",a,"password");F("Firebase.removeUser",2,b,!0);var c=new B;this.k.O.Xe(a,C(c,b));return c.D};X.prototype.removeUser=X.prototype.Xe;
	X.prototype.se=function(a,b){D("Firebase.changePassword",1,2,arguments.length);sg("Firebase.changePassword",1,a,!1);tg("Firebase.changePassword",a,"email");tg("Firebase.changePassword",a,"oldPassword");tg("Firebase.changePassword",a,"newPassword");F("Firebase.changePassword",2,b,!0);var c=new B;this.k.O.se(a,C(c,b));return c.D};X.prototype.changePassword=X.prototype.se;
	X.prototype.re=function(a,b){D("Firebase.changeEmail",1,2,arguments.length);sg("Firebase.changeEmail",1,a,!1);tg("Firebase.changeEmail",a,"oldEmail");tg("Firebase.changeEmail",a,"newEmail");tg("Firebase.changeEmail",a,"password");F("Firebase.changeEmail",2,b,!0);var c=new B;this.k.O.re(a,C(c,b));return c.D};X.prototype.changeEmail=X.prototype.re;
	X.prototype.Ze=function(a,b){D("Firebase.resetPassword",1,2,arguments.length);sg("Firebase.resetPassword",1,a,!1);tg("Firebase.resetPassword",a,"email");F("Firebase.resetPassword",2,b,!0);var c=new B;this.k.O.Ze(a,C(c,b));return c.D};X.prototype.resetPassword=X.prototype.Ze;})();

	module.exports = Firebase;


/***/ },
/* 71 */
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	function EventEmitter() {
	  this._events = this._events || {};
	  this._maxListeners = this._maxListeners || undefined;
	}
	module.exports = EventEmitter;

	// Backwards-compat with node 0.10.x
	EventEmitter.EventEmitter = EventEmitter;

	EventEmitter.prototype._events = undefined;
	EventEmitter.prototype._maxListeners = undefined;

	// By default EventEmitters will print a warning if more than 10 listeners are
	// added to it. This is a useful default which helps finding memory leaks.
	EventEmitter.defaultMaxListeners = 10;

	// Obviously not all Emitters should be limited to 10. This function allows
	// that to be increased. Set to zero for unlimited.
	EventEmitter.prototype.setMaxListeners = function(n) {
	  if (!isNumber(n) || n < 0 || isNaN(n))
	    throw TypeError('n must be a positive number');
	  this._maxListeners = n;
	  return this;
	};

	EventEmitter.prototype.emit = function(type) {
	  var er, handler, len, args, i, listeners;

	  if (!this._events)
	    this._events = {};

	  // If there is no 'error' event listener then throw.
	  if (type === 'error') {
	    if (!this._events.error ||
	        (isObject(this._events.error) && !this._events.error.length)) {
	      er = arguments[1];
	      if (er instanceof Error) {
	        throw er; // Unhandled 'error' event
	      } else {
	        // At least give some kind of context to the user
	        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
	        err.context = er;
	        throw err;
	      }
	    }
	  }

	  handler = this._events[type];

	  if (isUndefined(handler))
	    return false;

	  if (isFunction(handler)) {
	    switch (arguments.length) {
	      // fast cases
	      case 1:
	        handler.call(this);
	        break;
	      case 2:
	        handler.call(this, arguments[1]);
	        break;
	      case 3:
	        handler.call(this, arguments[1], arguments[2]);
	        break;
	      // slower
	      default:
	        args = Array.prototype.slice.call(arguments, 1);
	        handler.apply(this, args);
	    }
	  } else if (isObject(handler)) {
	    args = Array.prototype.slice.call(arguments, 1);
	    listeners = handler.slice();
	    len = listeners.length;
	    for (i = 0; i < len; i++)
	      listeners[i].apply(this, args);
	  }

	  return true;
	};

	EventEmitter.prototype.addListener = function(type, listener) {
	  var m;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events)
	    this._events = {};

	  // To avoid recursion in the case that type === "newListener"! Before
	  // adding it to the listeners, first emit "newListener".
	  if (this._events.newListener)
	    this.emit('newListener', type,
	              isFunction(listener.listener) ?
	              listener.listener : listener);

	  if (!this._events[type])
	    // Optimize the case of one listener. Don't need the extra array object.
	    this._events[type] = listener;
	  else if (isObject(this._events[type]))
	    // If we've already got an array, just append.
	    this._events[type].push(listener);
	  else
	    // Adding the second element, need to change to array.
	    this._events[type] = [this._events[type], listener];

	  // Check for listener leak
	  if (isObject(this._events[type]) && !this._events[type].warned) {
	    if (!isUndefined(this._maxListeners)) {
	      m = this._maxListeners;
	    } else {
	      m = EventEmitter.defaultMaxListeners;
	    }

	    if (m && m > 0 && this._events[type].length > m) {
	      this._events[type].warned = true;
	      console.error('(node) warning: possible EventEmitter memory ' +
	                    'leak detected. %d listeners added. ' +
	                    'Use emitter.setMaxListeners() to increase limit.',
	                    this._events[type].length);
	      if (typeof console.trace === 'function') {
	        // not supported in IE 10
	        console.trace();
	      }
	    }
	  }

	  return this;
	};

	EventEmitter.prototype.on = EventEmitter.prototype.addListener;

	EventEmitter.prototype.once = function(type, listener) {
	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  var fired = false;

	  function g() {
	    this.removeListener(type, g);

	    if (!fired) {
	      fired = true;
	      listener.apply(this, arguments);
	    }
	  }

	  g.listener = listener;
	  this.on(type, g);

	  return this;
	};

	// emits a 'removeListener' event iff the listener was removed
	EventEmitter.prototype.removeListener = function(type, listener) {
	  var list, position, length, i;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events || !this._events[type])
	    return this;

	  list = this._events[type];
	  length = list.length;
	  position = -1;

	  if (list === listener ||
	      (isFunction(list.listener) && list.listener === listener)) {
	    delete this._events[type];
	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);

	  } else if (isObject(list)) {
	    for (i = length; i-- > 0;) {
	      if (list[i] === listener ||
	          (list[i].listener && list[i].listener === listener)) {
	        position = i;
	        break;
	      }
	    }

	    if (position < 0)
	      return this;

	    if (list.length === 1) {
	      list.length = 0;
	      delete this._events[type];
	    } else {
	      list.splice(position, 1);
	    }

	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);
	  }

	  return this;
	};

	EventEmitter.prototype.removeAllListeners = function(type) {
	  var key, listeners;

	  if (!this._events)
	    return this;

	  // not listening for removeListener, no need to emit
	  if (!this._events.removeListener) {
	    if (arguments.length === 0)
	      this._events = {};
	    else if (this._events[type])
	      delete this._events[type];
	    return this;
	  }

	  // emit removeListener for all listeners on all events
	  if (arguments.length === 0) {
	    for (key in this._events) {
	      if (key === 'removeListener') continue;
	      this.removeAllListeners(key);
	    }
	    this.removeAllListeners('removeListener');
	    this._events = {};
	    return this;
	  }

	  listeners = this._events[type];

	  if (isFunction(listeners)) {
	    this.removeListener(type, listeners);
	  } else if (listeners) {
	    // LIFO order
	    while (listeners.length)
	      this.removeListener(type, listeners[listeners.length - 1]);
	  }
	  delete this._events[type];

	  return this;
	};

	EventEmitter.prototype.listeners = function(type) {
	  var ret;
	  if (!this._events || !this._events[type])
	    ret = [];
	  else if (isFunction(this._events[type]))
	    ret = [this._events[type]];
	  else
	    ret = this._events[type].slice();
	  return ret;
	};

	EventEmitter.prototype.listenerCount = function(type) {
	  if (this._events) {
	    var evlistener = this._events[type];

	    if (isFunction(evlistener))
	      return 1;
	    else if (evlistener)
	      return evlistener.length;
	  }
	  return 0;
	};

	EventEmitter.listenerCount = function(emitter, type) {
	  return emitter.listenerCount(type);
	};

	function isFunction(arg) {
	  return typeof arg === 'function';
	}

	function isNumber(arg) {
	  return typeof arg === 'number';
	}

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}

	function isUndefined(arg) {
	  return arg === void 0;
	}


/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	__webpack_require__(73)
	__webpack_require__(76)
	__webpack_require__(77)
	__webpack_require__(80)
	__webpack_require__(83)
	__webpack_require__(86)
	__webpack_require__(89)
	__webpack_require__(92)
	__webpack_require__(95)


/***/ },
/* 73 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	const urlParser = document.createElement('a')

	// create a Web Component that inherits functionality (middlewares) from nx.components.app
	// add a render middleware, that renders the content from view.html and style.less into the component
	// add filters to the component and its descendants by using the filter middleware on its content (useOnContent)
	// register the component as 'hacker-news', from now on it can be used as <hacker-news></hacker-news>
	nx.components.app()
	  .use(nx.middlewares.render({
	    template: __webpack_require__(74),
	    style: __webpack_require__(75)
	  }))
	  .register('hacker-news')

	// register two custom filters, that can be used inside expressions
	nx.utils.compiler.filter('host', hostFilter)
	nx.utils.compiler.filter('timeAgo', timeAgoFilter)

	// this is a custom filter, that can be used in the view as 'value | host'
	function hostFilter (url) {
	  urlParser.href = url
	  return urlParser.host
	}

	// this is a custom filter, that can be used in the view as 'value | timeAgo'
	function timeAgoFilter (timestamp) {
	  const diffInSeconds = Math.round(Date.now() / 1000) - timestamp
	  if (diffInSeconds < 3600) {
	    return Math.round(diffInSeconds / 60) + 'minutes'
	  }
	  if (diffInSeconds < 86400) {
	    return Math.round(diffInSeconds / 3600) + 'hours'
	  }
	  return Math.round(diffInSeconds / 86400) + 'days'
	}


/***/ },
/* 74 */
/***/ function(module, exports) {

	module.exports = "<!-- adds routing logic with the router comp and route attributes -->\n<!-- the child which has a route attribute matching with the URL path is displayed -->\n<!-- adds leave animations to the router views -->\n<nav is=\"app-nav\"></nav>\n<app-router>\n  <story-list route=\"stories\" default-route leave-animation=\"fadeOut .6s\"></story-list>\n  <user-page route=\"user\" leave-animation=\"fadeOut .6s\"></user-page>\n  <story-page route=\"story\" leave-animation=\"fadeOut .6s\"></story-page>\n</app-router>\n"

/***/ },
/* 75 */
/***/ function(module, exports) {

	module.exports = ":host {\n  display: block;\n  width: 85%;\n  margin: auto;\n  color: black;\n  background-color: rgb(246, 246, 239);\n  font: 10pt Verdana, Geneva, sans-serif;\n}\n\na {\n  color: inherit;\n  text-decoration: none;\n  cursor: pointer;\n}\n\n.light {\n  color: #828282;\n}\n\n.light a:hover {\n  text-decoration: underline;\n}\n\n.subtext {\n  font-size: 7pt;\n}\n\n@media all and (max-width: 750px) {\n  :host {\n    width: 100%\n  }\n}\n"

/***/ },
/* 76 */
/***/ function(module, exports) {

	'use strict'

	// create a Web Component that inherits routing functionality (middlewares) from nx.components.router
	// register the component as 'app-router', from now on it can be used as <app-router></app-router>
	nx.components.router()
	  .register('app-router')


/***/ },
/* 77 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	// create a Web Component, extending the native 'nav' element
	// add a params middleware, that keeps the 'type' parameter in sync with the URL and history
	// add a render middleware, that renders the content from view.html and style.less into the component
	// register the component as 'app-nav', from now on it can be used as <app-nav></app-nav>
	nx.component({element: 'nav'})
	  .use(nx.middlewares.params({
	    type: {type: 'string', default: 'top'}
	  }))
	  .use(nx.middlewares.render({
	    template: __webpack_require__(78),
	    style: __webpack_require__(79)
	  }))
	  .register('app-nav')


/***/ },
/* 78 */
/***/ function(module, exports) {

	module.exports = "<!-- inline code is executed in the context of the component state (which is injected into middlewares) -->\n<!-- '$' prefix means one time interpolation, '@' prefix means dynamic interpolation -->\n<!-- adds client side routing navigation with the iref and iref-params attributes -->\n<a iref=\"stories\" $iref-params=\"{type: 'top'}\"><b>Hacker News</b></a>\n<a iref=\"stories\" $iref-params=\"{type: 'new'}\" @class=\"{active: type === 'new'}\">new</a>\n| <a iref=\"stories\" $iref-params=\"{type: 'show'}\" @class=\"{active: type === 'show'}\">show</a>\n| <a iref=\"stories\" $iref-params=\"{type: 'ask'}\" @class=\"{active: type === 'ask'}\">ask</a>\n| <a iref=\"stories\" $iref-params=\"{type: 'job'}\" @class=\"{active: type === 'job'}\">jobs</a>\n<span>Built with\n  <a href=\"http://nx-framework.com\" target=\"_blank\">NX</a> |\n  <a href=\"https://github.com/nx-hacker-news/nx-hacker-news.github.io\">Source</a>\n</span>\n"

/***/ },
/* 79 */
/***/ function(module, exports) {

	module.exports = ":host {\n  background-color: rgb(255, 102, 0);\n  padding: 4px;\n  overflow: hidden;\n}\n\na.active {\n  color: white;\n}\n\nb {\n  padding: 0 4px;\n}\n\nspan {\n  color: white;\n  display: inline-block;\n  float: right;\n  font-size: 9pt;\n}\n\nspan a:hover {\n  text-decoration: underline;\n}\n"

/***/ },
/* 80 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	// create a Web Component
	// add a params middleware, that keeps the 'type' and 'page' parameters in sync with the URL and history
	// add a render middleware, that renders the content from view.html and style.less into the component
	// add a custom middleware
	// register the component as 'story-list', from now on it can be used as <story-listy></story-list>
	nx.components.page({
	  template: __webpack_require__(81),
	  style: __webpack_require__(82),
	  params: {
	    type: {type: 'string', readOnly: true, default: 'top'},
	    page: {type: 'number', history: true, default: 0}
	  }
	}).use(setup).register('story-list')

	// this is a custom middleware
	// it loads stories when the store broadcasts an update event or when the 'type' or 'page' parameters change
	function setup (elem, state) {
	  store.on('stories-updated', loadStories)
	  elem.$cleanup(() => store.removeListener('stories-updated', loadStories))
	  elem.$observe(loadStories)

	  function loadStories () {
	    store.fetchItemsByType(state.type, state.page)
	      .then(items => state.stories = items)
	  }
	}


/***/ },
/* 81 */
/***/ function(module, exports) {

	module.exports = "<!-- inline code is executed in the context of the component state (which is injected into middlewares) -->\n<!-- '$' prefix means one time interpolation, '@' prefix means dynamic interpolation -->\n<!-- '#' prefix means event handling code -->\n<div @repeat=\"stories\" repeat-value=\"story\" track-by=\"id\">\n  <story-item $story=\"story\"\n    enter-animation=\"fadeIn .6s .3s\"\n    move-animation=\".6s .3s\"\n    leave-animation=\"fadeOut .6s\">\n  </story-item>\n</div>\n<a #click=\"page++\" class=\"paginator\">More</a>\n"

/***/ },
/* 82 */
/***/ function(module, exports) {

	module.exports = ":host {\n  display: block;\n  position: relative;\n  padding: 10px;\n  padding-bottom: 30px;\n  min-height: 1000px;\n}\n\nstory-item {\n  margin-bottom: 8px;\n}\n\n.paginator {\n  position: absolute;\n  padding: 10px 0;\n  bottom: 0;\n}\n"

/***/ },
/* 83 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	// create a Web Component
	// add a render middleware, that renders the content from view.html and style.less into the component
	// add a custom middleware
	// register the component as 'story-item', from now on it can be used as <story-item></story-item>
	nx.components.rendered({
	  template: __webpack_require__(84),
	  style: __webpack_require__(85)
	}).use(setup).register('story-item')

	// this is a custom middleware, that registers the story attribute on the component
	// the attribute injects a story into the component state
	function setup (elem, state) {
	  elem.$attribute('story', story => state.story = story)
	}


/***/ },
/* 84 */
/***/ function(module, exports) {

	module.exports = "<!-- inline code is executed in the context of the component state (which is injected into middlewares) -->\n<!-- '$' prefix means one time interpolation, '@' prefix means dynamic interpolation -->\n<div $if=\"story && !story.deleted && !story.dead && story.title\">\n  <div $if=\"story.url\">\n    <a $href=\"story.url\">${story.title}</a>\n    <small class=\"light\">(<a $href=\"story.url\">${story.url | host}</a>)</small>\n  </div>\n  <div $if=\"!story.url\">\n    <a iref=\"../story\" $iref-params=\"{id: story.id}\">${story.title}</a>\n  </div>\n\n  <div $if=\"story.type === 'job'\" class=\"subtext light\">\n    <a iref=\"../story\" $iref-params=\"{id: story.id}\">${story.time | timeAgo} ago</a>\n  </div>\n  <div $if=\"story.type !== 'job'\" class=\"subtext light\">\n    ${story.score | unit 'point'} by\n    <a iref=\"../user\" $iref-params=\"{id: story.by}\">${story.by}</a>\n    <a iref=\"../story\" $iref-params=\"{id: story.id}\">${story.time | timeAgo} ago</a> |\n    <a iref=\"../story\" $iref-params=\"{id: story.id}\">${story.descendants | unit 'comment'}</a>\n  </div>\n</div>\n"

/***/ },
/* 85 */
/***/ function(module, exports) {

	module.exports = ":host {\n  display: block;\n  min-height: 27px;\n}\n"

/***/ },
/* 86 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	// create a Web Component
	// add a params middleware, that keeps the 'id' parameter in sync with the URL and history
	// add a render middleware, that renders the content from view.html and style.less into the component
	// add a custom middleware
	// register the component as 'story-page', from now on it can be used as <story-page></story-page>
	nx.components.page({
	  template: __webpack_require__(87),
	  style: __webpack_require__(88),
	  params: {
	    id: {type: 'number', readOnly: true, required: true}
	  }
	}).use(setup).register('story-page')

	// this is a custom middleware, that fetches a story by its id
	function setup (elem, state) {
	  store.fetchItem(state.id)
	    .then(story => state.story = story)
	}


/***/ },
/* 87 */
/***/ function(module, exports) {

	module.exports = "<!-- inline code is executed in the context of the component state (which is injected into middlewares) -->\n<!-- '$' prefix means one time interpolation, '@' prefix means dynamic interpolation -->\n<div @if=\"story\">\n  <div enter-animation=\"fadeIn .6s .3s\">\n    <story-item $story></story-item>\n    <dynamic-html $content=\"story.text\" class=\"body\"></dynamic-html>\n    <lu $repeat=\"story.kids\" repeat-value=\"commentId\">\n      <li is=\"comment-item\" $comment-id=\"commentId\"></li>\n    </lu>\n  </div>\n</div>\n"

/***/ },
/* 88 */
/***/ function(module, exports) {

	module.exports = ":host {\n  display: block;\n  padding: 10px;\n}\n\n.body {\n  display: block;\n  margin: 20px 0;\n}\n"

/***/ },
/* 89 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	// create a Web Component
	// add a params middleware, that keeps the 'id' parameter in sync with the URL and history
	// add a render middleware, that renders the content from view.html and style.less into the component
	// add a custom middleware
	// register the component as 'user-page', from now on it can be used as <user-page></user-page>
	nx.components.page({
	  template: __webpack_require__(90),
	  style: __webpack_require__(91),
	  params: {
	    id: {type: 'string', readOnly: true, required: true}
	  }
	}).use(setup).register('user-page')

	// this is a custom middleware, that fetches a user by its id
	function setup (elem, state) {
	  store.fetchUser(state.id)
	    .then(user => state.user = user)
	}


/***/ },
/* 90 */
/***/ function(module, exports) {

	module.exports = "<!-- inline code is executed in the context of the component state (which is injected into middlewares) -->\n<!-- '$' prefix means one time interpolation, '@' prefix means dynamic interpolation -->\n<div @if=\"user\">\n  <div enter-animation=\"fadeIn .6s .3s\">\n    <p>user: ${user.id}</p>\n    <p>created: ${user.created}</p>\n    <p>karma: ${user.karma}</p>\n    <p>about: <dynamic-html $content=\"user.about\"></dynamic-html></p>\n  </div>\n</div>\n"

/***/ },
/* 91 */
/***/ function(module, exports) {

	module.exports = ":host {\n  display: block;\n  padding: 10px;\n}\n"

/***/ },
/* 92 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	// create a Web Component, extending the native 'li' element
	// add a render middleware, that renders the content from view.html and style.less into the component
	// add a custom middleware
	// register the component as 'comment-item', from now on it can be used as <comment-item></comment-item>
	nx.components.rendered({
	  element: 'li',
	  template: __webpack_require__(93),
	  style: __webpack_require__(94)
	}).use(setup).register('comment-item')

	  // this is a custom middleware
	  // it registers a comment-id attribute for the component, that fetches a comment by id
	  function setup (elem, state) {
	    elem.$attribute('comment-id', id => {
	      store.fetchItem(id)
	        .then(comment => state.comment = comment)
	    })
	  }


/***/ },
/* 93 */
/***/ function(module, exports) {

	module.exports = "\n<!-- inline code is executed in the context of the component state (which is injected into middlewares) -->\n<!-- '$' prefix means one time interpolation, '@' prefix means dynamic interpolation -->\n<!-- '#' prefix means event handling code -->\n<div @if=\"comment && !comment.deleted && !comment.dead && comment.text\">\n  <div enter-animation=\"fadeIn .6s\">\n    <div class=\"header light\">\n      <a iref=\"../user\" $iref-params=\"{id: comment.by}\">${comment.by}</a>\n      <a iref=\"../story\" $iref-params=\"{id: comment.id}\">${comment.time | timeAgo} ago</a>\n      <a #click=\"hidden = !hidden\">@{hidden ? '[+]' : '[-]'}</a>\n    </div>\n    <div @hidden>\n      <dynamic-html $content=\"comment.text\" class=\"body\"></dynamic-html>\n      <ul $repeat=\"comment.kids\" repeat-value=\"childCommentId\">\n        <li is=\"comment-item\" $comment-id=\"childCommentId\"></li>\n      </ul>\n    </div>\n  </div>\n</div>\n"

/***/ },
/* 94 */
/***/ function(module, exports) {

	module.exports = ":host {\n  margin: 20px 0;\n  font-size: 9pt;\n  list-style-type: none;\n}\n\n.header {\n  margin-bottom: 5px;\n}\n\n.body a {\n  text-decoration: underline;\n}\n"

/***/ },
/* 95 */
/***/ function(module, exports) {

	'use strict'

	// create a Web Component
	// add a custom middleware
	// register the component as 'dynamic-html', from now on it can be used as <dynamic-html></dynamic-html>
	nx.component()
	  .use(setup)
	  .register('dynamic-html')

	// this is a custom middleware
	// it registers an attribute named 'content' on the component, which sets its innerHTML
	function setup (elem, state) {
	  elem.$attribute('content', content => elem.innerHTML = content || '')
	}


/***/ }
/******/ ]);