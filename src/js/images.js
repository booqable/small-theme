/**
 * Images Component
 *
 * Handles image gallery carousel functionality:
 * - Initializes Embla carousel for image galleries
 * - Manages navigation buttons (prev/next)
 * - Handles dot navigation indicators
 * - Autoplay with configurable pause on hover and stop on interaction
 * - Responsive carousel (destroys on desktop when ≤4 slides)
 * - Supports fade and slide transition effects
 */

import EmblaCarousel from 'embla-carousel'
import Fade from 'embla-carousel-fade'
import {
  frameSequence,
  cleanupSystem
} from './utils.js'

const CarouselConfig = {
  selectors: {
    carousel: '.carousel',
    viewport: '.carousel__container',
    dot: '.carousel__dot',
    prevBtn: '.carousel__prev',
    nextBtn: '.carousel__next',
    slide: '.carousel__slide',
  },
  classes: {
    disabled: 'carousel__btn--disabled',
    selected: 'carousel__dot--selected'
  },
  attr: {
    current: 'aria-current',
    timer: 'data-timer',
    effect: 'data-effect',
    pauseOnHover: 'data-pause-on-hover'
  },
  options: {
    loop: true,
    align: 'start',
    slidesToScroll: 1
  },
  autoplay: {
    stopOnInteraction: true
  },
  breakpoint: 992,
  maxSlidesDesktop: 4
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

const wdButtonsRenderer = (embla, carousel) => {
  const prevBtn = carousel.querySelector(CarouselConfig.selectors.prevBtn)
  const nextBtn = carousel.querySelector(CarouselConfig.selectors.nextBtn)

  if (!prevBtn || !nextBtn) return null

  const toggleButton = (btn, canScroll) => {
    if (canScroll) {
      btn.classList.remove(CarouselConfig.classes.disabled)
      btn.removeAttribute('disabled')
    } else {
      btn.classList.add(CarouselConfig.classes.disabled)
      btn.setAttribute('disabled', 'disabled')
    }
  }

  const updateButtons = () => {
    const read = () => ({
      canPrev: embla['canScrollPrev'](),
      canNext: embla['canScrollNext'](),
      prevBtn,
      nextBtn
    })

    const write = (data) => {
      toggleButton(data.prevBtn, data.canPrev)
      toggleButton(data.nextBtn, data.canNext)
    }

    frameSequence(read, write)
  }

  return {
    updateButtons,
    prevBtn,
    nextBtn
  }
}

const ImagesDotsRenderer = (embla, carousel) => {
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

const ImagesAutoplay = (embla, delay) => {
  let autoplayInterval = null
  let isAutoplayActive = true

  const startAutoplay = () => {
    if (!isAutoplayActive || autoplayInterval) return

    autoplayInterval = setInterval(() => {
      if (embla['canScrollNext']()) {
        embla['scrollNext']()
      } else {
        embla['scrollTo'](0)
      }
    }, delay)
  }

  const stopAutoplay = () => {
    if (!autoplayInterval) return
    clearInterval(autoplayInterval)
    autoplayInterval = null
  }

  const pauseAutoplay = () => {
    stopAutoplay()
  }

  const resumeAutoplay = () => {
    if (isAutoplayActive) {
      startAutoplay()
    }
  }

  const stopPermanently = () => {
    isAutoplayActive = false
    stopAutoplay()
  }

  return {
    startAutoplay,
    stopAutoplay,
    pauseAutoplay,
    resumeAutoplay,
    stopPermanently
  }
}

const ImagesProcessor = (embla, buttonsRenderer, autoplay) => {
  const handlePrevClick = () => {
    embla['scrollPrev']()
    buttonsRenderer.updateButtons()
  }

  const handleNextClick = () => {
    embla['scrollNext']()
    buttonsRenderer.updateButtons()
  }

  const handleDotClick = (index) => {
    embla['scrollTo'](index)
  }

  const handleCarouselClick = (e) => {
    if (!autoplay) return
    if (!CarouselConfig.autoplay.stopOnInteraction) return

    const isControl = e.target.closest('.carousel__btn, .carousel__dot')
    if (isControl) return

    autoplay.stopPermanently()
  }

  const handleMouseEnter = () => {
    if (!autoplay) return

    autoplay.pauseAutoplay()
  }

  const handleMouseLeave = () => {
    if (!autoplay) return

    autoplay.resumeAutoplay()
  }

  return {
    handlePrevClick,
    handleNextClick,
    handleDotClick,
    handleCarouselClick,
    handleMouseEnter,
    handleMouseLeave
  }
}

const ImagesEvents = (embla, carousel, buttonsRenderer, dotsRenderer, autoplay, processor, pauseOnHover) => {
  const eventListeners = []

  const addEventListener = (element, event, handler, options = {}) => {
    element.addEventListener(event, handler, options)
    eventListeners.push({ element, event, handler })
  }

  const init = () => {
    // Button events
    if (buttonsRenderer) {
      addEventListener(buttonsRenderer.prevBtn, 'click', processor.handlePrevClick)
      addEventListener(buttonsRenderer.nextBtn, 'click', processor.handleNextClick)
    }

    // Dot events
    if (dotsRenderer) {
      const dots = dotsRenderer.getDots()
      dots.forEach((dot, index) => {
        addEventListener(dot, 'click', () => processor.handleDotClick(index))
      })
    }

    // Embla events
    const updateAll = () => {
      buttonsRenderer?.updateButtons()
      dotsRenderer?.updateDots()
    }

    embla['on']('select', updateAll)
    embla['on']('init', updateAll)
    embla['on']('reInit', updateAll)
    embla['on']('settle', updateAll)

    eventListeners.push({
      element: embla,
      event: 'destroy',
      handler: () => {} // Placeholder for tracking
    })

    // Autoplay events
    if (autoplay) {
      autoplay.startAutoplay()

      if (pauseOnHover) {
        addEventListener(carousel, 'mouseenter', processor.handleMouseEnter, { passive: true })
        addEventListener(carousel, 'mouseleave', processor.handleMouseLeave, { passive: true })
      }

      if (CarouselConfig.autoplay.stopOnInteraction) {
        addEventListener(carousel, 'click', processor.handleCarouselClick)
        addEventListener(carousel, 'touchstart', processor.handleCarouselClick, { passive: true })
      }

      embla['on']('destroy', () => autoplay.stopAutoplay())
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

const ImagesCarouselInstance = (carousel) => {
  const viewport = carousel.querySelector(CarouselConfig.selectors.viewport)
  if (!viewport) return null

  let embla = null
  let buttonsRenderer = null
  let dotsRenderer = null
  let autoplay = null
  let processor = null
  let eventManager = null
  let mediaQuery = null
  let isInitialized = false

  const getSlideCount = () => {
    const slides = carousel.querySelectorAll(CarouselConfig.selectors.slide)
    return slides.length
  }

  const isDesktop = () => mediaQuery && mediaQuery.matches

  const shouldInitCarousel = () => {
    const slideCount = getSlideCount()

    if (!isDesktop()) {
      return true
    }

    return slideCount > CarouselConfig.maxSlidesDesktop
  }

  const initCarousel = () => {
    if (isInitialized) return

    const autoplayTimer = parseInt(carousel.getAttribute(CarouselConfig.attr.timer)) || 0
    const effect = carousel.getAttribute(CarouselConfig.attr.effect) || 'slide'
    const pauseOnHover = carousel.getAttribute(CarouselConfig.attr.pauseOnHover) === 'true'
    const plugins = effect === 'fade' ? [Fade()] : []

    embla = EmblaCarousel(viewport, CarouselConfig.options, plugins)
    buttonsRenderer = wdButtonsRenderer(embla, carousel)
    dotsRenderer = ImagesDotsRenderer(embla, carousel)
    autoplay = autoplayTimer > 0 ? ImagesAutoplay(embla, autoplayTimer) : null
    processor = ImagesProcessor(embla, buttonsRenderer, autoplay)
    eventManager = ImagesEvents(embla, carousel, buttonsRenderer, dotsRenderer, autoplay, processor, pauseOnHover)

    eventManager.init()
    isInitialized = true
  }

  const destroyCarousel = () => {
    if (!isInitialized) return

    eventManager?.destroy()
    autoplay?.stopAutoplay()
    embla?.['destroy']()

    embla = null
    buttonsRenderer = null
    dotsRenderer = null
    autoplay = null
    processor = null
    eventManager = null
    isInitialized = false
  }

  const handleMediaQueryChange = () => {
    if (shouldInitCarousel()) {
      initCarousel()
    } else {
      destroyCarousel()
    }
  }

  const init = () => {
    mediaQuery = window.matchMedia(`(min-width: ${CarouselConfig.breakpoint}px)`)
    mediaQuery.addEventListener('change', handleMediaQueryChange)

    if (shouldInitCarousel()) {
      initCarousel()
    }

    return destroy
  }

  const destroy = () => {
    if (mediaQuery) {
      mediaQuery.removeEventListener('change', handleMediaQueryChange)
      mediaQuery = null
    }

    destroyCarousel()
  }

  return {
    init
  }
}

const imagesComponent = () => {
  const dom = CarouselDOM()
  const instances = []

  const init = () => {
    if (!dom.init()) return null

    const carousels = dom.get('carousels')

    carousels.forEach(carousel => {
      const instance = ImagesCarouselInstance(carousel)
      if (!instance) return

      const cleanup = instance.init()
      if (cleanup) {
        instances.push(cleanup)
      }
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

const initImages = () => {
  const globalCleanup = cleanupSystem()
  const images = imagesComponent()
  const cleanup = images.init()

  if (!cleanup) return
  globalCleanup.register('ImagesCarouselAPI', cleanup)
}

initImages()
