const ListPager = require('./')

const list = new ListPager()
list.add('http://google.com', 'Google')
list.add('http://yahoo.com', 'Yahoo')
list.add('http://cloudup.com', 'Cloudup')
list.add('http://github.com', 'Github')

list.on('keypress', function (key, selected) {
  switch (key.name) {
    case 'r':
      list.remove()
    case 'j':
      list.down()
      break;
    case 'k':
      list.up()
      break
    case 'q':
      list.stop()
    default:
  }
})

list.start()

