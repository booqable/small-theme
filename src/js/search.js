/**
 * Search Component
 *
 * Handles search functionality with modal overlay, auto-focus,
 * clear button functionality, and URL parameter management.
 *
 */

import {
  frameSequence,
  cleanupSystem
} from 'utils.js'

const SearchConfig = {
  selectors: {
    container: '.search',
    form: '#search',
    input: '.search__input',
    opener: '#header-opener-search',
    reset: '.search__reset'
  },
  classes: {
    filled: 'filled'
  },
  attributes: {
    action: 'action'
  },
  params: {
    query: 'q'
  },
  focusDelay: 50
}

const SearchDOM = () => {
  const elements = new Map()

  const init = () => {
    elements.set('container', document.querySelector(SearchConfig.selectors.container))
    elements.set('form', document.querySelector(SearchConfig.selectors.form))
    elements.set('input', document.querySelector(SearchConfig.selectors.input))
    elements.set('opener', document.querySelector(SearchConfig.selectors.opener))
    elements.set('reset', document.querySelector(SearchConfig.selectors.reset))

    return elements.get('form') && elements.get('input')
  }

  const get = (key) => {
    return elements.get(key)
  }

  const cleanup = () => {
    elements.clear()
  }

  return {
    init,
    get,
    cleanup
  }
}

const SearchUrlHandler = () => {
  let url = null

  const init = () => {
    try {
      url = new URL(window.location.href)
      return true
    } catch (error) {
      console.error('Failed to initialize search state:', error)
      return false
    }
  }

  const getQuery = () => {
    if (!url) return null
    return url.searchParams.get(SearchConfig.params.query)
  }

  const buildSearchUrl = (query, formElement) => {
    if (!url || !formElement) return ''

    const route = formElement.getAttribute(SearchConfig.attributes.action)
    if (typeof route !== 'string') return ''

    try {
      const searchUrl = new URL(url.origin + route)
      searchUrl.searchParams.set(SearchConfig.params.query, query)
      return searchUrl.href
    } catch (error) {
      console.error('Failed to build search URL:', error)
      return ''
    }
  }

  return {
    init,
    getQuery,
    buildSearchUrl
  }
}

const SearchRenderer = (dom) => {
  const updateClearButton = () => {
    const input = dom.get('input')
    if (!input?.parentElement) return

    const read = () => ({
      parent: input.parentElement,
      expose: input.value.length !== 0
    })

    const write = (data) => {
      data.parent.classList.toggle(SearchConfig.classes.filled, data.expose)
    }

    frameSequence(read, write)
  }

  const clearInput = () => {
    const input = dom.get('input')
    if (!input) return

    const read = () => ({ input })

    const write = (data) => {
      data.input.value = ''
      data.input.focus()
      updateClearButton() // Update clear button state after clearing
    }

    frameSequence(read, write)
  }

  const focusInput = () => {
    const input = dom.get('input')
    if (!input) return

    const read = () => ({ input })

    const write = (data) => {
      if (!data?.input) return
      data.input.focus()
      updateClearButton() // Update clear button after focus
    }

    setTimeout(() => {
      frameSequence(read, write)
    }, SearchConfig.focusDelay)
  }

  const autoFillInput = (query) => {
    const input = dom.get('input')
    if (!input || typeof query !== 'string') return

    const read = () => ({ input, query })

    const write = (data) => {
      if (!data?.input || typeof data.query !== 'string') return
      data.input.value = data.query
      updateClearButton()
    }

    frameSequence(read, write)
  }

  return {
    updateClearButton,
    clearInput,
    focusInput,
    autoFillInput
  }
}

const SearchProcessor = (dom, query, renderer) => {
  const handleFocus = (event) => {
    const target = event?.target
    if (target !== dom.get('opener')) return

    renderer.focusInput()
  }

  const handleClear = (event) => {
    const target = event?.target
    if (target !== dom.get('reset')) return

    event.preventDefault()
    renderer.clearInput()
  }

  const handleInput = () => {
    renderer.updateClearButton()
  }

  const handleSubmit = (event) => {
    const target = event.target
    if (target !== dom.get('form')) return

    event.preventDefault()

    const input = dom.get('input')
    if (!input || typeof input.value !== 'string') return

    const value = input.value.trim()
    if (!value) return

    const searchUrl = query.buildSearchUrl(value, target)
    if (!searchUrl.length) return

    window.location.href = searchUrl
  }

  return {
    handleFocus,
    handleClear,
    handleInput,
    handleSubmit
  }
}

const searchEvents = (processor) => {
  const eventListeners = []

  const addEventListener = (element, event, handler, options = {}) => {
    element.addEventListener(event, handler, options)
    eventListeners.push({ element, event, handler })
  }

  const init = () => {
    addEventListener(document, 'click', processor.handleFocus)
    addEventListener(document, 'click', processor.handleClear)
    addEventListener(document, 'input', processor.handleInput)
    addEventListener(document, 'submit', processor.handleSubmit)
  }

  const destroy = () => {
    eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler)
    })
    eventListeners.length = 0
  }

  return {
    init,
    destroy
  }
}

const searchComponent = () => {
  const dom = SearchDOM()
  const urlHandler = SearchUrlHandler()
  let renderer = null
  let processor = null
  let eventManager = null

  const init = () => {
    if (!dom.init()) return null
    if (!urlHandler.init()) return null

    renderer = SearchRenderer(dom)
    processor = SearchProcessor(dom, urlHandler, renderer)
    eventManager = searchEvents(processor)

    // Auto-fill input with query parameter if present
    const query = urlHandler.getQuery()
    if (query) renderer.autoFillInput(query)

    eventManager.init()

    return destroy
  }

  const destroy = () => {
    eventManager?.destroy()
    dom?.cleanup()
    renderer = null
    processor = null
    eventManager = null
  }

  return {
    init,
    destroy
  }
}

const initSearch = () => {
  const globalCleanup = cleanupSystem()
  const search = searchComponent()
  const cleanup = search.init()

  if (!cleanup) return
  globalCleanup.register('SearchAPI', cleanup)
}

initSearch()

