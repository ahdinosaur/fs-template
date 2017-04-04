const Path = require('path')
const template = require('../')

const vars = require('./vars')

template({
  source: Path.join(__dirname, 'source'),
  target: Path.join(__dirname, 'target'),
  vars,
  filter: '**/*.js',
  ignore: 'ignored.js'
}, err => {
  if (err) throw err
  else console.log('done!')
})
