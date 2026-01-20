/**
 * Top Bar Component
 *
 * Handles scroll behavior and top-bar transformations.
 * Adds/removes scroll modifier on documentElement based on scroll direction
 * with a minimum threshold of 200px.
 *
 */

import {
  frameSequence,
  cleanupSystem,
  setCssVar,
  getDimensions
} from 'utils.js'

const TopBarConfig = {
  selectors: {
    bar: '.top-bar',
    doc: document.documentElement,
    header: '.header__inner'
  },
  classes: {
    filled: 'header__inner--filled',
    sticky: 'header__inner--sticky'
  },
  modifier: {
    scroll: 'scrolled'
  },
  cssVars: {
    barHeight: '--top-bar-height'
  },
  minHeight: 200,
  hysteresis: 20
}

const TopBarDOM = () => {
  const elements = new Map()
  const cache = new Map([
    ['barHeight', 0],
    ['lastScroll', 0]
  ])

  const init = () => {
    elements.set('doc', TopBarConfig.selectors.doc)
    elements.set('header', elements.get('doc').querySelector(TopBarConfig.selectors.header))
    elements.set('bar', elements.get('doc').querySelector(TopBarConfig.selectors.bar))

    return elements.get('bar') !== null
  }

  const get = (key) => {
    return elements.get(key)
  }

  const getCache = (key) => {
    return cache.get(key)
  }

  const setCache = (key, value) => {
    cache.set(key, value)
  }

  const cleanup = () => {
    elements.clear()
    cache.clear()
  }

  return {
    init,
    get,
    getCache,
    setCache,
    cleanup
  }
}

const TopBarHeight = (dom) => {
  const calculate = () => {
    const bar = dom.get('bar')
    if (!bar) return

    const read = () => {
      const barSize = getDimensions(bar)
      const header = dom.get('header')
      const isFilled = header?.classList.contains(TopBarConfig.classes.filled)
      const isSticky = header?.classList.contains(TopBarConfig.classes.sticky)

      return {
        height: Math.floor(barSize.height),
        isFilled,
        isSticky
      }
    }

    const write = (data) => {
      const { height, isFilled, isSticky } = data

      if (!isSticky && isFilled) return

      const doc = dom.get('doc')
      dom.setCache('barHeight', height)

      setCssVar(TopBarConfig.cssVars.barHeight, `${height}px`, doc)
    }

    frameSequence(read, write)
  }

  return {
    calculate,
    recalculate: calculate
  }
}

const TopBarScroll = (dom) => {
  const doc = dom.get('doc')
  const header = dom.get('header')

  const handleScroll = () => {
    const read = () => {
      const current = window.scrollY
      const height = dom.getCache('barHeight')
      const lastScroll = dom.getCache('lastScroll')
      const isScrolled = doc.classList.contains(TopBarConfig.modifier.scroll)
      const isSticky = header?.classList.contains(TopBarConfig.classes.sticky)
      const threshold = Math.max(TopBarConfig.minHeight, height)

      return {
        current,
        threshold,
        isScrolled,
        isSticky,
        lastScroll
      }
    }

    const write = (data) => {
      if (!data) return

      const { current, isScrolled, threshold, lastScroll, isSticky } = data

      if (!isSticky) return

      // Below threshold: always show bar
      if (current <= threshold) {
        doc.classList.remove(TopBarConfig.modifier.scroll)
        dom.setCache('lastScroll', current)
        return
      }

      // Scrolling up (with hysteresis): show bar
      if (current < lastScroll - TopBarConfig.hysteresis && isScrolled && current > threshold) {
        doc.classList.remove(TopBarConfig.modifier.scroll)
        dom.setCache('lastScroll', current)
        return
      }

      // Scrolling down: hide bar
      if (current > lastScroll && !isScrolled && current > threshold) {
        doc.classList.add(TopBarConfig.modifier.scroll)
      }

      dom.setCache('lastScroll', current)
    }

    frameSequence(read, write)
  }

  return {
    handleScroll
  }
}

const topBarEvents = (height, scroll) => {
  let scrollHandler = null
  let resizeHandler = null

  const init = () => {
    height.calculate()

    scrollHandler = () => scroll.handleScroll()
    resizeHandler = () => height.recalculate()

    window.addEventListener('scroll', scrollHandler, { passive: true })
    window.addEventListener('resize', resizeHandler, { passive: true })
  }

  const destroy = () => {
    if (scrollHandler) {
      window.removeEventListener('scroll', scrollHandler, { passive: true })
      scrollHandler = null
    }

    if (resizeHandler) {
      window.removeEventListener('resize', resizeHandler, { passive: true })
      resizeHandler = null
    }
  }

  return {
    init,
    destroy
  }
}

const topBarComponent = () => {
  const dom = TopBarDOM()
  let height = null
  let scroll = null
  let events = null

  const init = () => {
    if (!dom.init()) return null

    height = TopBarHeight(dom)
    scroll = TopBarScroll(dom)
    events = topBarEvents(height, scroll)

    events.init()

    return destroy
  }

  const destroy = () => {
    events?.destroy()
    dom?.cleanup()
    height = null
    scroll = null
    events = null
  }

  return {
    init,
    destroy
  }
}

const initTopBar = () => {
  const globalCleanup = cleanupSystem()
  const topBar = topBarComponent()
  const cleanup = topBar.init()

  if (!cleanup) return
  globalCleanup.register('TopBarAPI', cleanup)
}

initTopBar()
