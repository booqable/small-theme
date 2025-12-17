/**
 * JavaScript Utilities
 *
 * Performance-optimized utilities for DOM manipulation,
 * event handling, and component management.
 */

/**
 * Debounce utility - limits function execution frequency
 */
export const debounce = (func, wait) => {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}

/**
 * Single frame utility - schedules callback for next animation frame
 */
export const nextFrame = (callback) => requestAnimationFrame(callback)

/**
 * Frame sequencing for optimal performance
 * Separates DOM reads and writes to prevent layout thrashing
 */
export const frameSequence = (readCallback, writeCallback) => {
  nextFrame(() => {
    const data = readCallback()
    nextFrame(() => writeCallback(data))
  })
}

/**
 * Idle callback (with fallback for Safari)
 */
export const requestIdle = (callback, options = {}) => {
  if ('requestIdleCallback' in window) {
    return requestIdleCallback(callback, options)
  }

  const timeout = options.timeout || 100
  const startTime = Date.now()

  return setTimeout(() => {
    callback({
      didTimeout: false,
      timeRemaining: () => Math.max(0, 50 - (Date.now() - startTime))
    })
  }, timeout)
}

/**
 * Create an IntersectionObserver with custom options
 */
export const intersectionObserver = (callback, options = {}) => {
  const defaultOptions = {
    root: null,
    rootMargin: '100px',
    threshold: 0.01
  }

  const config = { ...defaultOptions, ...options }
  let observer = null

  const init = () => {
    if (observer) return observer

    // eslint-disable-next-line no-undef
    observer = new IntersectionObserver(callback, config)

    return observer
  }

  const destroy = () => {
    observer?.disconnect()
    observer = null
  }

  const observe = (element) => {
    if (!observer) init()
    observer?.observe(element)
  }

  const unobserve = (element) => {
    observer?.unobserve(element)
  }

  return {
    init,
    destroy,
    observe,
    unobserve,
    get observer() { return observer }
  }
}

/**
 * Create a ResizeObserver with debouncing
 */
export const resizeObserver = (callback, options = {}) => {
  const defaultOptions = {
    debounceTime: 150,
    element: null,
    width: true
  }

  const config = { ...defaultOptions, ...options }
  let observer = null
  let lastWidth = window.innerWidth

  const frame = (data) => nextFrame(() => callback(data))

  const debounced = config.debounceTime > 0
    ? debounce(frame, config.debounceTime)
    : frame

  const trackWidthChange = () => {
    if (!config.width) return false
    const currentWidth = window.innerWidth
    if (currentWidth === lastWidth) return true
    lastWidth = currentWidth
    return false
  }

  const handleCallback = (data) => {
    if (trackWidthChange()) return
    debounced(data)
  }

  const init = (element = config.element) => {
    if (observer) return observer

    observer = new ResizeObserver(handleCallback)

    element ?
      observer.observe(element) :
      observer.observe(document.documentElement)

    return observer
  }

  const destroy = () => {
    observer?.disconnect()
    observer = null
  }

  const observe = (element) => {
    if (!observer) init()
    observer?.observe(element)
  }

  const unobserve = (element) => {
    observer?.unobserve(element)
  }

  return {
    init,
    destroy,
    observe,
    unobserve,
    get observer() { return observer }
  }
}

/**
 * Global cleanup system to prevent memory leaks
 */
export const cleanupSystem = () => {
  const cleanupFunctions = new Map()

  const register = (name, cleanupFn) => {
    if (typeof cleanupFn !== 'function') {
      console.warn(`Cleanup function for "${name}" is not a function`)
      return
    }

    // Store the cleanup function
    cleanupFunctions.set(name, cleanupFn)

    // Add to global cleanup if it exists
    if (window.themeCleanup) {
      const originalCleanup = window.themeCleanup
      window.themeCleanup = () => {
        cleanupFn()
        originalCleanup()
      }
    } else {
      window[`cleanup${name}`] = cleanupFn
    }
  }

  const cleanup = (name) => {
    const cleanupFn = cleanupFunctions.get(name)
    if (cleanupFn) {
      cleanupFn()
      cleanupFunctions.delete(name)
    }
  }

  const cleanupAll = () => {
    cleanupFunctions.forEach((cleanupFn, name) => {
      try {
        cleanupFn()
      } catch (error) {
        console.warn(`Error cleaning up "${name}":`, error)
      }
    })
    cleanupFunctions.clear()
  }

  return {
    register,
    cleanup,
    cleanupAll,
    get registered() { return Array.from(cleanupFunctions.keys()) }
  }
}

/**
 * DOM ready state utility
 */
export const onReady = (callback) => {
  if (document.readyState === 'complete') {
    requestIdle(callback)
  } else {
    document.addEventListener('readystatechange', (event) => {
      if (event.target.readyState === 'complete') {
        requestIdle(callback)
      }
    }, { once: true })
  }
}

/**
 * Set CSS variable utility
 */
export const setCssVar = (property, value, element = document.documentElement) => {
  element.style.setProperty(property, value)
}

/**
 * Element dimension utility
 */
export const getDimensions = (element) => {
  if (!element) return { width: 0, height: 0 }
  const rect = element.getBoundingClientRect()
  return {
    width: rect.width,
    height: rect.height
  }
}

/**
 * Check if element is in viewport
 */
export const inViewport = (element) => {
  if (!element) return false
  const rect = element.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

/**
 * Network connection utilities
 */
export const slowConnection = () => {
  if (!navigator.connection) return false
  const connectionType = navigator.connection.effectiveType
  return connectionType === '2g' || connectionType === 'slow-2g'
}

/**
 * Feature detection utilities
 */
export const hasFetchPriority = () => {
  // eslint-disable-next-line no-undef
  return 'fetchPriority' in HTMLImageElement.prototype
}
