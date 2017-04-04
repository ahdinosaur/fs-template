'use strict'

const { assign } = Object
const { isArray } = Array
const assert = require('assert')
const Path = require('path')
const Fs = require('fs')
const is = require('typeof-is')
const pull = require('pull-stream/pull')
const pullValues = require('pull-stream/sources/values')
const pullReadFile = require('pull-file')
const pullWriteFile = require('pull-write-file')
const pullMap = require('pull-stream/throughs/map')
const pullSplit = require('pull-split')
const pullUtf8Decoder = require('pull-utf8-decoder')
const pullParamap = require('pull-paramap')
const pullDrain = require('pull-stream/sinks/drain')
const pullFs = require('pull-fs')
const { Minimatch } = require('minimatch')
const Template = require('pixie')

module.exports = fsTemplate

function fsTemplate (options = {}, cb) {
  const {
    source,
    target,
    vars = {},
    cwd = process.cwd(),
    open = '{{',
    close = '}}',
    parallel = 10
  } = options

  assert.ok(is.string(source), 'template-directory: expected string `options.source`')
  assert.ok(is.string(target), 'template-directory: expected string `options.target`')
  assert.ok(is.object(vars), 'template-directory: expected object `options.vars`')
  assert.ok(is.string(target), 'template-directory: expected string `options.cwd`')
  assert.ok(is.string(open), 'template-directory: expected string `options.open`')
  assert.ok(is.string(close), 'template-directory: expected string `options.close`')
  assert.ok(is.number(parallel), 'template-directory: expected number `options.parallel`')

  const filter = normalizeToArray(options.filter)
  const ignore = normalizeToArray(options.ignore)
  assert.ok(isArray(filter) && filter.every(is.string), 'template-directory: expected array or string `options.filter`')
  assert.ok(isArray(ignore) && ignore.every(is.string), 'template-directory: expected array or string `options.ignore`')

  pull(
    getSourceFiles({ source, filter, ignore, cwd }),
    getStats({ parallel }),
    getFileContents(),
    renderTemplates({ vars, open, close }),
    writeFiles({ target, parallel }, cb)
  )
}

function normalizeToArray (value) {
  if (is.undefined(value)) return []
  else if (isArray(value)) return value
  else return [value]
}

function getSourceFiles ({ source, filter, ignore, cwd }) {
  const match = Match({ filter, ignore })
  const base = Path.resolve(cwd, source)

  return pull(
    pullValues([source]),
    pullFs.starStar(match),
    pullMap(path => ({
      cwd,
      base,
      path: Path.resolve(base, path),
      relative: Path.relative(base, path),
      stat: null,
      contents: null
    }))
  )
}

function Match ({ filter, ignore }) {
  const filterMatchers = filter.map(Matcher)
  const ignoreMatchers = ignore.map(Matcher)

  return path => {
    // if not every filter matches, return false
    if (!filterMatchers.every(toMatchPath(path))) return false
    // if any ignore matches, return false
    else if (ignoreMatchers.some(toMatchPath(path))) return false
    // otherwise yay
    else return true
  }
}

function Matcher (pattern) {
  return new Minimatch(pattern, { dot: true })
}

function toMatchPath (path) {
  return matcher => matcher.match(path)
}

function getStats ({ parallel }) {
  const inOrder = false
  return pullParamap((file, cb) => {
    Fs.stat(file.path, (err, stat) => {
      if (err) cb(err)
      else cb(null, assign(file, { stat }))
    })
  }, parallel, inOrder)
}

function getFileContents () {
  return pullMap(file => {
    if (file.stat.isDirectory()) return file
    return assign(file, {
      contents: pullReadFile(file.path)
    })
  })
}

function renderTemplates ({ vars, open, close }) {
  return pullMap(file => {
    if (file.stat.isDirectory()) return file
    const contents = pull(
      file.contents,
      pullUtf8Decoder(),
      pullSplit(null, null, null, true),
      pullMap(renderTemplate({ vars, open, close })),
      pullMap(str => str + '\n'),
      pullMap(Buffer.from)
    )
    return assign(file, { contents })
  })
}

function renderTemplate ({ vars, open, close }) {
  return string => {
    return Template.render(string, vars, open, close)
  }
}

function writeFiles ({ target, parallel }, cb) {
  const inOrder = false
  return pull(
    pullParamap(writeFile({ target }), parallel, inOrder),
    pullDrain(null, cb)
  )
}

function writeFile ({ target }) {
  return (file, cb) => {
    const path = Path.join(target, file.relative)
    if (file.stat.isDirectory()) {
      return Fs.mkdir(path, file.stat.mode, (err) => {
        if (err && err.code !== 'EEXIST') cb(err)
        else cb()
      })
    }
    return pull(
      file.contents,
      pullWriteFile(path, cb)
    )
  }
}
