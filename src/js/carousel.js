/**
 * Carousel component
 *
 * Handles carousel functionality:
 * - Initializes Embla carousel with fade/slide transition effects
 * - Manages navigation buttons (prev/next) and dot indicators
 * - Autoplay with configurable pause on hover and stop on interaction
 * - Visibility-based autoplay (pauses when out of viewport)
 * - Responsive behavior (destroys on desktop when ≤4 slides)
 * - Performance optimizations:
 *   - Debounced media query handling (250ms)
 *   - frameSequence for DOM read/write batching
 *   - IntersectionObserver for visibility detection
 *   - Proper cleanup to prevent memory leaks
 */

import EmblaCarousel from 'embla-carousel'
import Fade from 'embla-carousel-fade'
import {
  frameSequence,
  cleanupSystem,
  debounce,
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
    selected: 'carousel__dot--selected'
  },
  attr: {
    current: 'aria-current',
    effect: 'data-effect',
    pause: 'data-pause',
    timer: 'data-timer'
  },
  options: {
    align: 'start',
    loop: true,
    slidesToScroll: 1
  },
  autoplay: {
    stopInteraction: true
  },
  breakpoint: 992,
  maxSlidesDesktop: 4,
  delay: 250
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

const CarouselDotsRenderer = (embla, carousel) => {
  const dots = Array.from(carousel.querySelectorAll(CarouselConfig.selectors.dot))
  if (!dots.length) return null

  const updateDots = () => {
    const read = () => ({
      index: embla['selectedScrollSnap'](),
      dots
    })

    const write = (data) => {
      data.dots.forEach((dot, i) => {
        if (i === data.index) {
          dot.classList.add(CarouselConfig.classes.selected)
          dot.setAttribute(CarouselConfig.attr.current, 'true')
        } else {
          dot.classList.remove(CarouselConfig.classes.selected)
          dot.removeAttribute(CarouselConfig.attr.current)
        }
      })
    }

    frameSequence(read, write)
  }

  const getDots = () => dots

  return {
    updateDots,
    getDots
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

const CarouselEvents = (embla, carousel, buttonsHandler, dotsHandler, autoplay, processor, pauseOnHover) => {
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
      const dots = dotsHandler.getDots()
      dots.forEach((dot, index) => {
        addEventListener(dot, 'click', () => processor.handleDot(index))
      })
    }

    const updateAll = () => {
      dotsHandler?.updateDots()
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
      if (element === embla) return // Embla handles its own cleanup
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
  let dotsHandler = null
  let autoplay = null
  let processor = null
  let eventManager = null
  let mediaQuery = null
  let initialized = false
  let visibilityObserver = null

  const getSlideCount = () => {
    const slides = carousel.querySelectorAll(CarouselConfig.selectors.slide)
    return slides.length
  }

  const desktop = () => mediaQuery && mediaQuery.matches

  const checkCarousel = () => {
    const slideCount = getSlideCount()

    if (!desktop()) return true

    return slideCount > CarouselConfig.maxSlidesDesktop
  }

  const initCarousel = () => {
    if (initialized) return

    const timer = parseInt(carousel.getAttribute(CarouselConfig.attr.timer)) || 0
    const effect = carousel.getAttribute(CarouselConfig.attr.effect) || 'slide'
    const pause = carousel.getAttribute(CarouselConfig.attr.pause) === 'true'
    const plugins = effect === 'fade' ? [Fade()] : []

    embla = EmblaCarousel(viewport, CarouselConfig.options, plugins)
    buttonsHandler = CarouselButtonsRenderer(carousel)
    dotsHandler = CarouselDotsRenderer(embla, carousel)
    autoplay = timer > 0 ? CarouselAutoplay(embla, timer) : null
    processor = CarouselProcessor(embla, autoplay)
    eventManager = CarouselEvents(embla, carousel, buttonsHandler, dotsHandler, autoplay, processor, pause)

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

  const destroyCarousel = () => {
    if (!initialized) return

    visibilityObserver?.destroy()
    eventManager?.destroy()
    autoplay?.autoplayStop()
    embla?.['destroy']()

    embla = null
    buttonsHandler = null
    dotsHandler = null
    autoplay = null
    processor = null
    eventManager = null
    visibilityObserver = null
    initialized = false
  }

  const debounceHandler = () => {
    checkCarousel() ?
      initCarousel() :
      destroyCarousel()
  }

  const handleMediaQuery = debounce(debounceHandler, CarouselConfig.delay)

  const init = () => {
    mediaQuery = window.matchMedia(`(min-width: ${CarouselConfig.breakpoint}px)`)
    mediaQuery.addEventListener('change', handleMediaQuery)

    if (checkCarousel()) initCarousel()

    return destroy
  }

  const destroy = () => {
    if (mediaQuery) {
      mediaQuery.removeEventListener('change', handleMediaQuery)
      mediaQuery = null
    }

    destroyCarousel()
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
