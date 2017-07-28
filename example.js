const TermList = require('./')

const list = new TermList()
list.add('http://google.com', 'Google')
list.add('http://yahoo.com', 'Yahoo')
list.add('http://cloudup.com', 'Cloudup')
list.add('http://github.com', 'Github')

list.start()
