/**
 * Main Component
 *
 * Handles core functionality for the site:
 * - Page loaded state management
 *
 */

import {
  frameSequence,
  onReady
} from './utils.js'

const MainConfig = {
  selector: {
    doc: document.documentElement
  },
  modifier: {
    loaded: 'loaded'
  }
}

const MainDOM = {
  setClassLoaded() {
    const read = () => ({
      doc: MainConfig.selector.doc,
      modifier: MainConfig.modifier.loaded
    })

    const write = (data) => {
      data.doc.classList.add(data.modifier)
    }

    frameSequence(read, write)
  }
}

const initMain = () => {
  MainDOM.setClassLoaded()
}

onReady(initMain)
