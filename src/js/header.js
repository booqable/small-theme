/**
 * Header Component
 *
 * Handles header height calculations and CSS variable management
 * with preview bar integration.
 *
 */

import {
  frameSequence,
  resizeObserver,
  cleanupSystem,
  setCssVar,
  getDimensions
} from 'utils.js'

const HeaderConfig = {
  selectors: {
    checkboxes: 'input[type="checkbox"]',
    doc: document.documentElement,
    header: '.header',
    icons: '.header__icons',
    logo: '.header__logo',
    preview: '.preview-bar__container',
    menu: {
      container: '.header__menu-nav',
      opener: '#header-opener-menu',
      label: 'label[for="header-opener-menu"]',
      hasDropdown: '.has-dropdown'
    },
    search: {
      container: '.search__wrapper',
      opener: '#header-opener-search',
      label: 'label[for="header-opener-search"]'
    }
  },
  modifier: {
    active: 'active'
  },
  cssVars: {
    headerHeight: '--header-height',
    previewHeight: '--preview-height',
    transitionDuration: '--transition-duration'
  },
  breakpoint: 992,
  debounceTime: 0
}

const HeaderDOM = () => {
  const elements = new Map()
  const cache = new Map([
    ['headerHeight', 0],
    ['previewHeight', 0]
  ])

  const init = (headerElement) => {
    elements.set('doc', HeaderConfig.selectors.doc)
    elements.set('header', headerElement)
    elements.set('preview', document.querySelector(HeaderConfig.selectors.preview))
    return elements.get('header') !== null
  }

  const get = (key) => {
    return elements.get(key)
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
    setCache,
    cleanup
  }
}

const setHeaderHeight = (domManager) => {
  const calculate = () => {
    if (!domManager.get('header')) return

    const read = () => {
      const header = domManager.get('header')
      const preview = domManager.get('preview')

      const headerDimensions = getDimensions(header)
      let previewDimensions = { height: 0 }

      if (preview) previewDimensions = getDimensions(preview)

      return {
        headerHeight: headerDimensions.height,
        previewHeight: previewDimensions.height
      }
    }

    const write = (data) => {
      const { headerHeight, previewHeight } = data
      const doc = domManager.get('doc')

      setCssVar(HeaderConfig.cssVars.headerHeight, `${headerHeight}px`, doc)
      domManager.setCache('headerHeight', headerHeight)

      if (!domManager.get('preview') || previewHeight <= 0 ) return

      setCssVar(HeaderConfig.cssVars.previewHeight, `${previewHeight}px`, doc)
      domManager.setCache('previewHeight', previewHeight)
    }

    frameSequence(read, write)
  }

  return {
    calculate,
    recalculate: calculate
  }
}

const headerEventManager = (headerHeight) => {
  let resizeObserverInstance = null

  const init = () => {
    headerHeight.calculate()

    // Set up ResizeObserver for efficient resize handling
    const resizeObserverHandler = () => headerHeight.recalculate()

    resizeObserverInstance = resizeObserver(
      resizeObserverHandler,
      { debounceTime: HeaderConfig.debounceTime }
    )

    resizeObserverInstance.init()
  }

  const destroy = () => {
    resizeObserverInstance?.destroy()
    resizeObserverInstance = null
  }

  return { init, destroy }
}

const headerComponent = () => {
  const dom = HeaderDOM()
  let headerHeight = null
  let eventManager = null

  const init = () => {
    const header = document.querySelector(HeaderConfig.selectors.header)
    if (!header) return null
    if (!dom.init(header)) return null

    headerHeight = setHeaderHeight(dom)
    eventManager = headerEventManager(headerHeight)

    eventManager.init()

    return destroy
  }

  const destroy = () => {
    eventManager?.destroy()
    dom?.cleanup()
    headerHeight = null
    eventManager = null
  }

  return {
    init,
    destroy
  }
}

const outsideHandler = () => {
  const dom = new Map()
  let durationCache = null
  let hoverTimeout = null
  let mediaQuery = null

  const isDesktop = () => mediaQuery && mediaQuery.matches

  const clearHoverTimeout = () => {
    if (!hoverTimeout) return
    clearTimeout(hoverTimeout)
    hoverTimeout = null
  }

  const getDuration = () => {
    if (durationCache !== null) return durationCache

    const propName = HeaderConfig.cssVars.transitionDuration
    const getStyles = getComputedStyle(HeaderConfig.selectors.doc)
    const transitionDuration = getStyles.getPropertyValue(propName).trim()

    let time = 0
    if (transitionDuration) {
      if (transitionDuration.endsWith('ms')) {
        time = parseFloat(transitionDuration)
      } else if (transitionDuration.endsWith('s')) {
        time = parseFloat(transitionDuration) * 1000
      }
    }

    durationCache = time
    return time
  }

  const closeInside = (element, delay = false) => {
    const cacheKey = `container_${element}`
    let container = dom.get(cacheKey)

    if (container === null) return false

    if (!container) {
      container = document.querySelector(element)
      if (!container) {
        dom.set(cacheKey, null)
        return false
      }
      dom.set(cacheKey, container)
    }

    const nodes = container.querySelectorAll(HeaderConfig.selectors.checkboxes)
    if (!nodes.length) return false

    const closer = () => {
      nodes.forEach(node => {
        if (node.checked) node.checked = false
      })
    }

    if (!delay) {
      closer()
      return true
    }

    const time = getDuration()
    setTimeout(closer, time)
    return true
  }

  const closeOpener = (opener, container) => {
    if (!opener || !opener.checked) return false
    opener.checked = false
    closeInside(container, true)
    return true
  }

  const closeModal = (opener, container, label) => (e) => {
    if (!opener || !opener.checked) return false

    const isDropdown = e.target.closest(container)
    const isLabel = e.target.closest(label)
    const isOpener = e.target === opener
    const isModal = isDropdown || isLabel || isOpener

    if (isModal) return false

    closeOpener(opener, container)
  }

  const closeOnResize = () => {
    const menuOpener = dom.get('menuOpener')
    if (!menuOpener || !menuOpener.checked) return

    closeOpener(menuOpener, HeaderConfig.selectors.menu.container)
  }

  const handleMediaQueryChange = (mediaQuery) => {
    if (mediaQuery.matches) closeOnResize()
  }

  const closeOnHover = (event) => {
    if (!isDesktop()) return

    const searchOpener = dom.get('searchOpener')
    if (!searchOpener || !searchOpener.checked) return

    const hasDropdown = event.target.closest(HeaderConfig.selectors.menu.hasDropdown)
    if (!hasDropdown) return

    closeOpener(searchOpener, HeaderConfig.selectors.search.container)
  }

  const setupDropdownHover = () => {
    if (!isDesktop()) return

    const menuContainer = dom.get('menuContainer')
    if (!menuContainer) return

    const dropdownItems = menuContainer.querySelectorAll(HeaderConfig.selectors.menu.hasDropdown)
    if (!dropdownItems.length) return

    const activeClass = HeaderConfig.modifier.active
    const dropdownItemsArray = Array.from(dropdownItems) // Cache as array

    dropdownItems.forEach((item) => {
      const handleMouseEnter = () => {
        clearHoverTimeout()

        dropdownItemsArray.forEach(dropdownItem => {
          dropdownItem.classList.remove(activeClass)
        })

        item.classList.add(activeClass)
      }

      const handleMouseLeave = () => {
        clearHoverTimeout()

        hoverTimeout = setTimeout(() => {
          item.classList.remove(activeClass)
        }, 500)
      }

      item.addEventListener('mouseenter', handleMouseEnter, { passive: true })
      item.addEventListener('mouseleave', handleMouseLeave, { passive: true })

      // Store handlers for cleanup
      if (!dom.has('dropdownHandlers')) {
        dom.set('dropdownHandlers', [])
      }
      dom.get('dropdownHandlers').push({
        element: item,
        enter: handleMouseEnter,
        leave: handleMouseLeave
      })
    })
  }

  const cleanupDropdownHover = () => {
    const handlers = dom.get('dropdownHandlers')
    if (!handlers) return

    handlers.forEach(({ element, enter, leave }) => {
      element.removeEventListener('mouseenter', enter)
      element.removeEventListener('mouseleave', leave)
    })

    dom.delete('dropdownHandlers')
  }

  const init = () => {
    dom.set('menuOpener', document.querySelector(HeaderConfig.selectors.menu.opener))
    dom.set('searchOpener', document.querySelector(HeaderConfig.selectors.search.opener))
    dom.set('menuContainer', document.querySelector(HeaderConfig.selectors.menu.container))

    if (!dom.get('menuOpener') && !dom.get('searchOpener')) return false

    const menuCloser = closeModal(
      dom.get('menuOpener'),
      HeaderConfig.selectors.menu.container,
      HeaderConfig.selectors.menu.label
    )

    const searchCloser = closeModal(
      dom.get('searchOpener'),
      HeaderConfig.selectors.search.container,
      HeaderConfig.selectors.search.label
    )

    const clickOutside = (event) => {
      if (dom.get('menuOpener')) menuCloser(event)
      if (dom.get('searchOpener')) searchCloser(event)
    }

    document.addEventListener('click', clickOutside, { passive: true })
    mediaQuery = window.matchMedia(`(min-width: ${HeaderConfig.breakpoint}px)`)
    mediaQuery.addEventListener('change', handleMediaQueryChange)

    const menuContainer = dom.get('menuContainer')
    if (menuContainer) {
      menuContainer.addEventListener('mouseover', closeOnHover, { passive: true })
      setupDropdownHover()
    }

    dom.set('clickOutside', clickOutside)

    return true
  }

  const destroy = () => {
    const clickOutside = dom.get('clickOutside')
    if (clickOutside) {
      document.removeEventListener('click', clickOutside)
    }

    if (mediaQuery) {
      mediaQuery.removeEventListener('change', handleMediaQueryChange)
      mediaQuery = null
    }

    clearHoverTimeout()

    const menuContainer = dom.get('menuContainer')
    if (menuContainer) {
      menuContainer.removeEventListener('mouseover', closeOnHover)
      cleanupDropdownHover()
    }

    durationCache = null
    dom.clear()
  }

  return { init, destroy }
}

const initHeader = () => {
  const globalCleanup = cleanupSystem()
  const header = headerComponent()
  const cleanup = header.init()

  if (!cleanup) return
  globalCleanup.register('HeaderAPI', cleanup)

  const menuAPI = outsideHandler()
  menuAPI.init()
  globalCleanup.register('MenuAPI', menuAPI.destroy)
}

initHeader()
