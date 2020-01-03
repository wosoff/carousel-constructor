/**
 * @typedef {object} carouselOpts
 * @property {string} cssUnit
 * @property {string} direction
 * @property {number} frame
 * @property {number} sequence
 */

/**
 * @param {Element} target 
 * @param {carouselOpts} opts 
 * @param {object} countState
 */
export default function Carousel(target, opts, countState) {
  this._accumulatedSequence = 0
  this._dom = target
  /**@type {carouselOpts} */
  this._opts = {
    ...opts
  }
  this._countState = countState
  this._timer = null
}

Carousel.prototype.getCount = function getCount() {
  return this._countState.count
}

/**
 * @param {carouselOpts} options
 */
Carousel.prototype.setOptions = function setOptions(options) {
  this._opts = {
    ...this._opts,
    ...options
  }
}

Carousel.prototype._reload = function _reload() {
  const {style, childElementCount} = this._dom
  const {cssUnit, direction , frame, sequence} = this._opts
  
  const indexToLastCarousel = childElementCount - 1
  const carouselLeft = parseFloat(style[direction], 10)
  const abs = Math.abs(carouselLeft)

  // when is next
  if (sequence < 0) {
    const reloading = indexToLastCarousel * frame
    if (abs >= reloading) {
      style[direction] = 0
      this._countState = {
        count: 0
      }
      return
    }
  } 

  // when is prev
  if (sequence > 0) {
    const reloading = 0
    if (abs === reloading) {
      style[direction] = -(indexToLastCarousel) * frame + cssUnit
      this._countState = {
        count: 0
      }
      return
    }
  }
}

Carousel.prototype._moveCarousel = function moveCarousel() {  
  const {style} = this._dom
  const {cssUnit, direction, sequence} = this._opts

  const carouselLeft = parseFloat(style[direction], 10)
  this._accumulatedSequence = carouselLeft + sequence
  style[direction] = this._accumulatedSequence + cssUnit 
}

/**@returns {boolean} */
Carousel.prototype._pause = function _pause() {
  const {style} = this._dom
  const {frame, sequence} = this._opts
  const abs = Math.abs(parseFloat(style.left, 10))

  // It is common to prev and next
  if (this._accumulatedSequence !== 0 && abs % frame === 0) {
    this._accumulatedSequence = 0
    this._countState = {
      count: this._countState.count + 1
    }
    return true
  }

  // When is prev and last carousel frame
  if (sequence > 0 && abs === 0) {
    this._countState = {
      count: this._countState.count + 1
    }
    return true
  }

  return false
}

Carousel.prototype.run = function run() {
  clearTimeout(this._timer)

  this._reload()

  this._moveCarousel()

  if (this._pause() === true) {
    return
  }

  const boundedThisFunc = this.run.bind(this)
  this._timer = setTimeout(boundedThisFunc, 10)
}

