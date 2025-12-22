/**
 * Image loading Component
 *
 * Handles loading of images with placeholders.
 * Optimizes initial load and uses IntersectionObserver for lazy loading.
 *
 */

import {
  frameSequence,
  cleanupSystem,
  intersectionObserver,
  inViewport,
  slowConnection,
  hasFetchPriority
} from 'utils.js'

const ImageConfig = {
  selectors: {
    main: '.image-main',
    placeholder: '.image-placeholder',
    wrapper: '.image-wrapper'
  },
  attr: {
    mainSrcset: 'data-srcset',
    sourceSrcset: 'data-source-srcset'
  },
  classes: {
    hidden: 'hidden',
    loaded: 'loaded',
    main: 'image-main'
  }
}

const ImageDOM = () => {
  const elements = new Map()

  const init = () => {
    const wrappers = document.querySelectorAll(ImageConfig.selectors.wrapper)
    elements.set('wrappers', Array.from(wrappers))

    return elements.get('wrappers').length > 0
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

const ImageRenderer = () => {
  const decodeImage = (image) => {
    if (!('decode' in image)) return
    image.decode().catch(() => {
      // Silently fail - the image will still display normally
    })
  }

  const loadSources = (mainImage, isInViewport) => {
    const read = () => {
      const wrapper = mainImage.closest(ImageConfig.selectors.wrapper)
      if (!wrapper) return null

      const sources = wrapper.querySelectorAll(`source[${ImageConfig.attr.sourceSrcset}]`)
      const sourcesData = Array.from(sources).map(source => ({
        element: source,
        dataSrc: source.getAttribute(ImageConfig.attr.sourceSrcset)
      })).filter(data => data.dataSrc)

      const mainSrcset = mainImage.getAttribute(ImageConfig.attr.mainSrcset)

      return {
        sourcesData,
        mainSrcset,
        isInViewport,
        mainImage
      }
    }

    const write = (data) => {
      if (!data) return

      // Set source elements
      data.sourcesData.forEach(({ element, dataSrc }) => {
        element.setAttribute('srcset', dataSrc)
        element.removeAttribute(ImageConfig.attr.sourceSrcset)

        if ('importance' in element) {
          element.importance = (data.isInViewport && !slowConnection()) ? 'high' : 'low'
        }
      })

      // Set main image
      if (data.mainSrcset) {
        data.mainImage.setAttribute('srcset', data.mainSrcset)
        data.mainImage.removeAttribute(ImageConfig.attr.mainSrcset)
        data.mainImage.decoding = data.isInViewport ? 'sync' : 'async'

        if (hasFetchPriority()) {
          data.mainImage.fetchPriority = data.isInViewport ? 'high' : 'low'
        }

        if ('importance' in data.mainImage) {
          data.mainImage.importance = data.isInViewport ? 'high' : 'auto'
        }

        if (data.isInViewport || data.mainImage.complete) {
          decodeImage(data.mainImage)
        }
      }
    }

    frameSequence(read, write)
  }

  const fadeInImage = (mainImage, placeholder, isInViewport) => {
    loadSources(mainImage, isInViewport)

    mainImage.classList.remove(ImageConfig.classes.hidden)
    mainImage.classList.add(ImageConfig.classes.loaded)

    if (!placeholder) return
    placeholder.style.opacity = '0'
    const removePlaceholder = () => placeholder.remove()
    placeholder.addEventListener('transitionend', removePlaceholder, { once: true, passive: true })
  }

  const loadImage = (mainImage, isInViewport = null) => {
    if (!mainImage.classList.contains(ImageConfig.classes.main)) return
    if (!mainImage.classList.contains(ImageConfig.classes.hidden)) return

    const wrapper = mainImage.closest(ImageConfig.selectors.wrapper)
    const placeholder = wrapper && wrapper.querySelector(ImageConfig.selectors.placeholder)

    if (!wrapper || !placeholder) return

    if (isInViewport === null) isInViewport = inViewport(mainImage)
    if (slowConnection() && hasFetchPriority()) mainImage.fetchPriority = 'low'

    mainImage.complete ?
      fadeInImage(mainImage, placeholder, isInViewport) :
      mainImage.addEventListener('load', () => {
        fadeInImage(mainImage, placeholder, isInViewport)
      }, { once: true })
  }

  return {
    loadImage
  }
}

const ImageProcessor = (renderer) => {
  const processImages = (wrappers, observer) => {
    wrappers.forEach(node => {
      const image = node.querySelector(ImageConfig.selectors.main)
      const placeholder = node.querySelector(ImageConfig.selectors.placeholder)

      if (!image || !placeholder) return
      if (!image.classList.contains(ImageConfig.classes.hidden)) return

      const isInViewport = inViewport(image)

      isInViewport ?
        renderer.loadImage(image, isInViewport) :
        observer.observe(image)
    })
  }

  return {
    processImages
  }
}

const imageObserver = (renderer) => {
  let observer = null

  const observerCallback = (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      renderer.loadImage(entry.target)
      observer.unobserve(entry.target)
    })
  }

  const init = () => {
    observer = intersectionObserver(observerCallback)
    observer.init()
  }

  const getObserver = () => observer

  const destroy = () => {
    if (observer) {
      observer.destroy()
      observer = null
    }
  }

  return {
    init,
    getObserver,
    destroy
  }
}

const imageComponent = () => {
  const dom = ImageDOM()
  let renderer = null
  let processor = null
  let observerManager = null

  const init = () => {
    if (!dom.init()) return null

    renderer = ImageRenderer()
    processor = ImageProcessor(renderer)
    observerManager = imageObserver(renderer)

    observerManager.init()

    const wrappers = dom.get('wrappers')
    const observer = observerManager.getObserver()
    processor.processImages(wrappers, observer)

    return destroy
  }

  const destroy = () => {
    observerManager?.destroy()
    dom?.cleanup()
    renderer = null
    processor = null
    observerManager = null
  }

  return {
    init
  }
}

const initImageLoading = () => {
  const globalCleanup = cleanupSystem()
  const image = imageComponent()
  const cleanup = image.init()

  if (!cleanup) return
  globalCleanup.register('ImageLoadingAPI', cleanup)
}

initImageLoading()
