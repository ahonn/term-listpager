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

class ListPager extends EventEmitter {
  constructor(opts = {}) {
    super()
    this.items = []
    this.selected = null

    this.marker = opts.marker || '› '
    this.width = opts.width || 100
    this.height = opts.height || 200
    this.length = opts.length || 10

    const canvas = new Canvas(this.width, this.height)
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
        key.ctrl && this.stop()
        break
      default:
    }
  }

  /**
   * Get item at i
   *
   * @param {number} i - item index
   * @returns {object} item at i
   */
  at(i) {
    return this.items[i]
  }

  /**
   * Get item at id
   *
   * @param {string|number} id - item id
   * @returns {object} item at id
   */
  get(id) {
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
  add(item) {
    if (this.selected === null) {
      this.select(item.id)
    }
    this.items.push(item)
  }

  /**
   * Remove item
   *
   * @param {string|number} id - item id
   * @returns {undefined}
   */
  remove(id) {
    this.emit('remove', id)
    const ids = this.items.map(({ id }) => id)
    if (id === undefined) id = this.selected

    const i = ids.indexOf(id)
    this.items.splice(i, 1)

    if (!this.items.length) this.emit('empty')
    const prevItem = this.at(i - 1)
    prevItem ? this.select(prevItem.id) : this.draw()
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
   * Update item label
   *
   * @param {string|number} id - update item id
   * @param {string} newLabel - new item label 
   * @returns {undefined}
   */
  update(id, newLabel) {
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
  select(id) {
    this.emit('select', id)
    this.selected = id
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
      this.select(ids[i - 1])
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
      this.select(ids[i + 1])
    }
  }

  /**
   * Draw this list
   *
   * @returns {undefined}
   */
  draw() {
    let line = 0
    const padding = Array(this.marker.length + 1).join(' ')

    const ids = this.items.map(({ id }) => id)
    const i = ids.indexOf(this.selected)
    const start = Math.floor(i / this.length) * this.length
    const end = (start + 1) * this.length

    this.ctx.clear()
    this.ctx.save()
    this.ctx.translate(6, 8)
    this.items.slice(start, end).forEach(({ id, label }) => {
      const prefix = this.selected === id ? this.marker : padding
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
   * Stop the list
   *
   * @returns {undefined}
   */
  stop() {
    this.ctx.reset()
    process.stdin.pause()
    stdin.removeListener('keypress', this.onkeypress)
  }
}

module.exports = ListPager
