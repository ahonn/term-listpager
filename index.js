/**
 * @Author: Ahonn Jiang
 * @Date:   2017-07-28 20:40:38
 * @Email:  ahonn95@outlook.com
 *
 * scrollable interactive terminal list for Node.js
 */

const { EventEmitter } = require('events')
const Canvas = require('term-canvas')

const stdin = process.stdin
require('keypress')(stdin)

const defaults = {
  x: 4,
  y: 5,
  width: 100,
  height: 200,
  length: 10,
  marker: '› ',
  markerLength: 2,
}

class ListPager extends EventEmitter {
  constructor(options = {}) {
    super()
    this.items = []
    this.header = []
    this.selected = null

    this.options = Object.assign({}, defaults, options)

    const canvas = new Canvas(this.options.width, this.options.height)
    this.ctx = canvas.getContext('2d')
  }

  /**
   * Handle keypress event
   *
   * @param {string} ch - keypress char
   * @param {objrdct} key - keypress object
   * @returns {undefined}
   */
  onkeypress(ch, key) {
    if (!key) return

    this.emit('keypress', key, this.selected)
    switch (key.name) {
      case 'up':
        this.up()
        break
      case 'down':
        this.down()
        break
      case 'c':
        key.ctrl && this.exit()
        break
      default:
    }
  }

  /**
   * Set list header
   *
   * @param {string|array} header - header strings
   * @returns {undefined}
   */
  setHeader(header) {
    if (typeof header !== 'array') {
      header = [header]
    }
    this.header = header
  }

  /**
   * Add list header
   *
   * @returns {undefined}
   */
  addHeader(id, label) {
    this.header.push({ id, label })
  }

  /**
   * Update list header
   *
   * @param {string|number} id - update header id
   * @param {string} newLabel - new header label 
   * @returns {undefined}
   */
  updateHeader(id, newLabel) {
    const ids = this.header.map(({ id }) => id)
    const i = ids.indexOf(id)
    this.header[i].label = newLabel
    this.draw()
  }

  /**
   * Get item at i
   *
   * @param {number} i - item index
   * @returns {object} item at i
   */
  itemAt(i) {
    return this.items[i]
  }

  /**
   * Get item at id
   *
   * @param {string|number} id - item id
   * @returns {object} item at id
   */
  getItem(id) {
    const ids = this.items.map(({ id }) => id)
    const i = ids.indexOf(id)
    return this.at(i)
  }

  /**
   * Add item into list
   *
   * @param {object} item - item object { id, label }
   * @returns {undefined}
   */
  addItem(id, label) {
    if (this.selected === null) {
      this.selectItem(id)
    }
    this.items.push({ id, label })
  }

  /**
   * Remove item
   *
   * @param {string|number} id - item id
   * @returns {undefined}
   */
  removeItem(id) {
    this.emit('remove', id)
    const ids = this.items.map(({ id }) => id)
    if (id === undefined) id = this.selected

    const i = ids.indexOf(id)
    this.items.splice(i, 1)

    if (!this.items.length) this.emit('empty')
    const prevItem = this.at(i - 1)
    prevItem ? this.selectItem(prevItem.id) : this.draw()
  }

  /**
   * Update item label
   *
   * @param {string|number} id - update item id
   * @param {string} newLabel - new item label 
   * @returns {undefined}
   */
  updateItem(id, newLabel) {
    const ids = this.items.map(({ id }) => id)
    const i = ids.indexOf(id)
    this.items[i].label = newLabel
    this.draw()
  }

  /**
   * Select item
   *
   * @param {string|number} id - selected item id
   * @returns {undefined}
   */
  selectItem(id) {
    this.emit('select', id)
    this.selected = id
    this.draw()
  }

  /**
   * Reset list and selected
   *
   * @returns {undefined}
   */
  reset() {
    this.emit('reset')
    this.items = []
    this.selected = null
    this.draw()
  }

  /**
   * Select the previous item
   *
   * @returns {undefined}
   */
  up() {
    const ids = this.items.map(({ id }) => id)
    const i = ids.indexOf(this.selected)
    if (i > 0) {
      this.selectItem(ids[i - 1])
    }
  }

  /**
   * Select the next item
   *
   * @returns {undefined}
   */
  down() {
    const ids = this.items.map(({ id }) => id)
    const i = ids.indexOf(this.selected)
    if (i < ids.length - 1) {
      this.selectItem(ids[i + 1])
    }
  }

  /**
   * Draw this list
   *
   * @returns {undefined}
   */
  draw() {
    let line = 0
    const padding = Array(this.options.markerLength + 1).join(' ')

    const ids = this.items.map(({ id }) => id)
    const i = ids.indexOf(this.selected)
    const start = Math.floor(i / this.options.length) * this.options.length
    const end = (start + 1) * this.options.length

    this.ctx.clear()
    this.ctx.save()
    this.ctx.translate(this.options.x, this.options.y)

    // draw header
    this.header.forEach(({ label }) => {
      this.ctx.fillText(padding + label, 0, line++)
    })

    // draw list
    this.items.slice(start, end).forEach(({ id, label }) => {
      const prefix = this.selected === id ? this.options.marker : padding
      this.ctx.fillText(prefix + label, 0, line++)
    })
    this.ctx.restore()
  }

  /**
   * Start the list
   *
   * @returns {undefined}
   */
  start() {
    stdin.on('keypress', this.onkeypress.bind(this))
    this.draw()
    this.ctx.hideCursor()
    stdin.setRawMode(true)
    stdin.resume()
  }

  /**
   * Exit the list
   *
   * @returns {undefined}
   */
  exit() {
    this.ctx.reset()
    process.stdin.pause()
    stdin.removeListener('keypress', this.onkeypress)
    this.showCursor()
  }
}

module.exports = ListPager
