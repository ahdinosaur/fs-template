const Path = require('path')
const templateDirectory = require('../')

const vars = require('./vars')

templateDirectory({
  source: Path.join(__dirname, 'source'),
  target: Path.join(__dirname, 'target'),
  vars,
  filter: '**/*.js',
  ignore: 'ignored.js'
}, err => {
  if (err) throw err
  else console.log('done!')
})
