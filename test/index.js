const test = require('tape')

const fsTemplate = require('../')

test('fs-template', function (t) {
  t.ok(fsTemplate, 'module is require-able')
  t.end()
})
