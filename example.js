const ListPager = require('./')

const list = new ListPager()
list.addItem('http://google.com', 'Google')
list.addItem('http://yahoo.com', 'Yahoo')
list.addItem('http://cloudup.com', 'Cloudup')
list.addItem('http://github.com', 'Github')

list.addHeader('playStatus', '')
list.addHeader('navbar', 'Luoo >')
list.addHeader('loading', 'loading ...')

list.on('keypress', function (key, selected) {
  switch (key.name) {
    case 'r':
      list.removeItem()
    case 'j':
      list.down()
      break;
    case 'k':
      list.up()
      break
    case 'q':
      list.exit()
    case 'space':
      list.updateHeader('playStatus', 'Playing ...')
    default:
  }
})

list.start()

