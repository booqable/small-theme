/**
 * Main Component
 *
 * Handles core functionality for the site:
 * - Page loaded state management
 *
 */

const MainConfig = {
  selector: {
    doc: document.documentElement
  },
  modifier: {
    loaded: 'loaded'
  }
}

const MainDOM = {
  setClassLoaded () {
    requestAnimationFrame(() => {
      MainConfig.selector.doc.classList.add(MainConfig.modifier.loaded)
    })
  }
}

const initMain = () => {
  MainDOM.setClassLoaded()
  return true
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMain, { once: true })
} else {
  initMain()
}
