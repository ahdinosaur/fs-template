const test = require('tape')

const templateDirectory = require('../')

test('template-directory', function (t) {
  t.ok(templateDirectory, 'module is require-able')
  t.end()
})
