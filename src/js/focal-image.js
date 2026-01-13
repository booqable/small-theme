/**
 * Focal Image Component
 *
 * Converts focal point coordinates to CSS object-position.
 *
 */

import {
  frameSequence,
  cleanupSystem
} from './utils.js'

const FocalConfig = {
  selectors: {
    image: '.focal-image'
  },
  attr: {
    focalX: 'data-focal-x',
    focalY: 'data-focal-y',
    processed: 'data-focal-processed'
  },
  defaultPosition: '50% 50%'
}

const FocalDOM = () => {
  const elements = new Map()
  const cache = new Map()

  const init = () => {
    const images = document.querySelectorAll(FocalConfig.selectors.image)
    elements.set('images', Array.from(images))

    return elements.get('images').length > 0
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

const FocalCalculator = (dom) => {
  const convertToPercentage = (coordinate) => {
    const value = parseFloat(coordinate) || 0
    const percentage = (value + 1) * 50
    const clampedPercentage = Math.max(0, Math.min(100, percentage))

    return `${clampedPercentage}%`
  }

  const calculatePosition = (focalX, focalY) => {
    if (focalX === null || focalY === null) return FocalConfig.defaultPosition

    const positionKey = `${focalX}_${focalY}`
    let position = dom.getCache(positionKey)

    if (!position) {
      const objectPositionX = convertToPercentage(focalX)
      const objectPositionY = convertToPercentage(focalY)
      position = `${objectPositionX} ${objectPositionY}`

      dom.setCache(positionKey, position)
    }

    return position
  }

  return {
    calculatePosition
  }
}

const FocalRenderer = (calculator) => {
  const applyFocalPoint = (image) => {
    if (image.getAttribute(FocalConfig.attr.processed) === 'true') return

    const focalX = image.getAttribute(FocalConfig.attr.focalX)
    const focalY = image.getAttribute(FocalConfig.attr.focalY)

    if (focalX === null || focalY === null) return

    const position = calculator.calculatePosition(focalX, focalY)

    const read = () => ({ image, position })

    const write = (data) => {
      data.image.style.objectPosition = data.position
      data.image.style.opacity = '1'
      data.image.setAttribute(FocalConfig.attr.processed, 'true')
    }

    frameSequence(read, write)
  }

  return {
    applyFocalPoint
  }
}

const focalComponent = () => {
  const dom = FocalDOM()

  const init = () => {
    if (!dom.init()) return null

    const calculator = FocalCalculator(dom)
    const renderer = FocalRenderer(calculator)

    const images = dom.get('images')
    images.forEach(image => {
      renderer.applyFocalPoint(image)
    })

    return destroy
  }

  const destroy = () => {
    dom?.cleanup()
  }

  return {
    init
  }
}

const initFocalImages = () => {
  const globalCleanup = cleanupSystem()
  const focal = focalComponent()
  const cleanup = focal.init()

  if (!cleanup) return
  globalCleanup.register('FocalImageAPI', cleanup)
}

initFocalImages()
