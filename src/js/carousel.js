/**
 * Carousel component
 *
 * Handles carousel functionality:
 * - Initializes Embla carousel
 * - Manages navigation buttons (prev/next) and dot indicators
 * - Autoplay with configurable pause on hover and stop on interaction
 * - Visibility-based autoplay (pauses when out of viewport)
 * - Slide count logic handled by Liquid template (carousel only renders when >4 slides)
 * - Performance optimizations:
 *   - frameSequence for DOM read/write batching
 *   - IntersectionObserver for visibility detection
 *   - Proper cleanup to prevent memory leaks
 */

import EmblaCarousel from 'embla-carousel'
import {
  frameSequence,
  cleanupSystem,
  intersectionObserver
} from './utils.js'

const CarouselConfig = {
  selectors: {
    btn: '.carousel__btn',
    btnNext: '.carousel__next',
    btnPrev: '.carousel__prev',
    carousel: '.carousel',
    dot: '.carousel__dot',
    slide: '.carousel__slide',
    viewport: '.carousel__container'
  },
  classes: {
    active: 'active',
    initialized: 'initialized'
  },
  attr: {
    current: 'aria-current',
    pause: 'data-pause',
    timer: 'data-timer'
  },
  options: {
    align: 'center',
    containScroll: false,
    dragFree: false,
    duration: 30,
    inViewThreshold: 0,
    loop: true,
    skipSnaps: false,
    slidesToScroll: 1
  },
  autoplay: {
    stopInteraction: true
  }
}

const CarouselDOM = () => {
  const elements = new Map()

  const init = () => {
    const carousels = document.querySelectorAll(CarouselConfig.selectors.carousel)
    elements.set('carousels', Array.from(carousels))

    return elements.get('carousels').length > 0
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

const CarouselButtonsRenderer = (carousel) => {
  const btnPrev = carousel.querySelector(CarouselConfig.selectors.btnPrev)
  const btnNext = carousel.querySelector(CarouselConfig.selectors.btnNext)

  if (!btnPrev || !btnNext) return null

  return {
    btnPrev,
    btnNext
  }
}

const CarouselItemsRenderer = (embla, carousel, selector, useAttr = false) => {
  const elements = Array.from(carousel.querySelectorAll(selector))
  if (!elements.length) return null

  const update = () => {
    const read = () => ({
      index: embla['selectedScrollSnap'](),
      elements
    })

    const write = (data) => {
      data.elements.forEach((el, i) => {
        if (i === data.index) {
          el.classList.add(CarouselConfig.classes.active)
          if (useAttr) el.setAttribute(CarouselConfig.attr.current, 'true')
        } else {
          el.classList.remove(CarouselConfig.classes.active)
          if (useAttr) el.removeAttribute(CarouselConfig.attr.current)
        }
      })
    }

    frameSequence(read, write)
  }

  const get = () => elements

  return {
    update,
    get
  }
}

const CarouselAutoplay = (embla, delay) => {
  let autoplayInterval = null
  let autoplayActive = true

  const autoplayStart = () => {
    if (!autoplayActive || autoplayInterval) return

    const intervalHandler = () => {
      embla['canScrollNext']() ?
        embla['scrollNext']() :
        embla['scrollTo'](0)
    }

    autoplayInterval = setInterval(intervalHandler, delay)
  }

  const autoplayStop = () => {
    if (!autoplayInterval) return

    clearInterval(autoplayInterval)
    autoplayInterval = null
  }

  const autoplayPause = () => {
    autoplayStop()
  }

  const autoplayResume = () => {
    if (autoplayActive) autoplayStart()
  }

  const autoplayStopPermanently = () => {
    autoplayActive = false
    autoplayStop()
  }

  return {
    autoplayStart,
    autoplayStop,
    autoplayPause,
    autoplayResume,
    autoplayStopPermanently
  }
}

const CarouselProcessor = (embla, autoplay) => {
  let isHovering = false

  const handlePrev = () => {
    embla['scrollPrev']()
  }

  const handleNext = () => {
    embla['scrollNext']()
  }

  const handleDot = (index) => {
    embla['scrollTo'](index)
  }

  const handleCarousel = (e) => {
    if (!autoplay) return
    if (!CarouselConfig.autoplay.stopInteraction) return

    const isControl = e.target.closest(`${CarouselConfig.selectors.btn}, ${CarouselConfig.selectors.dot}`)
    if (isControl) {
      autoplay.autoplayStop()

      if (!isHovering) autoplay.autoplayStart()

      return
    }

    autoplay.autoplayStopPermanently()
  }

  const handleMouseEnter = () => {
    if (!autoplay) return

    isHovering = true
    autoplay.autoplayPause()
  }

  const handleMouseLeave = () => {
    if (!autoplay) return

    isHovering = false
    autoplay.autoplayResume()
  }

  return {
    handlePrev,
    handleNext,
    handleDot,
    handleCarousel,
    handleMouseEnter,
    handleMouseLeave
  }
}

const CarouselEvents = (embla, carousel, buttonsHandler, slidesHandler, dotsHandler, autoplay, processor, pauseOnHover) => {
  const eventListeners = []

  const addEventListener = (element, event, handler, options = {}) => {
    element.addEventListener(event, handler, options)
    eventListeners.push({ element, event, handler })
  }

  const init = () => {
    if (buttonsHandler) {
      addEventListener(buttonsHandler.btnPrev, 'click', processor.handlePrev)
      addEventListener(buttonsHandler.btnNext, 'click', processor.handleNext)
    }

    if (dotsHandler) {
      const dots = dotsHandler.get()
      dots.forEach((dot, index) => {
        addEventListener(dot, 'click', () => processor.handleDot(index))
      })
    }

    const updateAll = () => {
      slidesHandler?.update()
      dotsHandler?.update()
    }

    embla['on']('select', updateAll)
    embla['on']('init', updateAll)
    embla['on']('reInit', updateAll)

    eventListeners.push({
      element: embla,
      event: 'destroy',
      handler: () => {}
    })

    if (autoplay) {
      autoplay.autoplayStart()

      if (pauseOnHover) {
        addEventListener(carousel, 'mouseenter', processor.handleMouseEnter, { passive: true })
        addEventListener(carousel, 'mouseleave', processor.handleMouseLeave, { passive: true })
      }

      if (CarouselConfig.autoplay.stopInteraction) {
        addEventListener(carousel, 'click', processor.handleCarousel)
        addEventListener(carousel, 'touchstart', processor.handleCarousel, { passive: true })
      }

      embla['on']('destroy', () => autoplay.autoplayStop())
    }

    return true
  }

  const destroy = () => {
    eventListeners.forEach(({ element, event, handler }) => {
      if (element === embla) return
      element.removeEventListener(event, handler)
    })
    eventListeners.length = 0
  }

  return {
    init,
    destroy
  }
}

const CarouselInstance = (carousel) => {
  const viewport = carousel.querySelector(CarouselConfig.selectors.viewport)
  if (!viewport) return null

  let embla = null
  let buttonsHandler = null
  let slidesHandler = null
  let dotsHandler = null
  let autoplay = null
  let processor = null
  let eventManager = null
  let initialized = false
  let visibilityObserver = null

  const initCarousel = () => {
    if (initialized) return

    const timer = parseInt(carousel.getAttribute(CarouselConfig.attr.timer)) || 0
    const pause = carousel.getAttribute(CarouselConfig.attr.pause) === 'true'

    embla = EmblaCarousel(viewport, CarouselConfig.options)
    buttonsHandler = CarouselButtonsRenderer(carousel)
    slidesHandler = CarouselItemsRenderer(embla, carousel, CarouselConfig.selectors.slide)
    dotsHandler = CarouselItemsRenderer(embla, carousel, CarouselConfig.selectors.dot, true)
    autoplay = timer > 0 ? CarouselAutoplay(embla, timer) : null
    processor = CarouselProcessor(embla, autoplay)
    eventManager = CarouselEvents(embla, carousel, buttonsHandler, slidesHandler, dotsHandler, autoplay, processor, pause)

    embla['on']('init', () => {
      carousel.classList.add(CarouselConfig.classes.initialized)
    })

    eventManager.init()
    initialized = true

    if (autoplay) {
      const observerHandler = entries => {
        entries.forEach(entry => {
          entry.isIntersecting ?
            autoplay.autoplayResume() :
            autoplay.autoplayPause()
        })
      }

      visibilityObserver = intersectionObserver(observerHandler, { threshold: 0.1 })
      visibilityObserver.observe(carousel)
    }
  }

  const destroy = () => {
    if (!initialized) return

    visibilityObserver?.destroy()
    eventManager?.destroy()
    autoplay?.autoplayStop()
    embla?.['destroy']()

    embla = null
    buttonsHandler = null
    slidesHandler = null
    dotsHandler = null
    autoplay = null
    processor = null
    eventManager = null
    visibilityObserver = null
    initialized = false
  }

  const init = () => {
    initCarousel()
    return destroy
  }

  return {
    init
  }
}

const CarouselComponent = () => {
  const dom = CarouselDOM()
  const instances = []

  const init = () => {
    if (!dom.init()) return null

    const carousels = dom.get('carousels')

    carousels.forEach(carousel => {
      const instance = CarouselInstance(carousel)
      if (!instance) return

      const cleanup = instance.init()
      if (cleanup) instances.push(cleanup)
    })

    return destroy
  }

  const destroy = () => {
    instances.forEach(cleanup => cleanup())
    instances.length = 0
    dom?.cleanup()
  }

  return {
    init
  }
}

const initCarousel = () => {
  const globalCleanup = cleanupSystem()
  const carousel = CarouselComponent()
  const cleanup = carousel.init()

  if (!cleanup) return
  globalCleanup.register('CarouselAPI', cleanup)
}

initCarousel()
