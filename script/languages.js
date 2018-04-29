'use strict'

var fs = require('fs')
var path = require('path')
var bail = require('bail')
var chalk = require('chalk')
var async = require('async')
var not = require('not')
var hidden = require('is-hidden')
var detab = require('detab')
var unique = require('array-unique')
var diff = require('arr-diff')
var trim = require('trim-lines')
var bundled = require('./bundled')

var root = path.join('node_modules', 'prismjs', 'components')
var extendRegex = /languages\.extend\('([^']+)'/g
var cloneRegex = /Prism\.util\.clone\(Prism\.languages\.([^[)]+)(?:\)|\[)/g
var aliasRegex = /Prism\.languages\.([\w]+) = Prism\.languages\.[\w]+;/g

fs.readdir(root, ondir)

function ondir(err, paths) {
  bail(err)

  paths = paths
    .filter(not(hidden))
    .map(name)
    .filter(not(minified))
    .filter(not(core))

  async.map(paths, generate, done)
}

function done(err, results) {
  bail(err)
  console.log(chalk.green('✓') + ' wrote ' + results.length + ' languages')
}

function generate(name, callback) {
  var id = camelcase(name)
  var out = path.join('lang', name + '.js')

  fs.readFile(path.join(root, 'prism-' + name + '.js'), 'utf8', onread)

  function onread(err, doc) {
    var deps
    var aliases

    if (err) {
      return callback(err)
    }

    deps = findAll(doc, extendRegex).concat(findAll(doc, cloneRegex))
    aliases = unique(findAll(doc, aliasRegex))

    deps = diff(unique(deps), bundled.map(base).concat([id]))

    fs.writeFile(
      out,
      [
        "'use strict'",
        deps.map(load).join('\n'),
        'module.exports = ' + id + ';',
        id + ".displayName = '" + id + "';",
        id + '.aliases = ' + JSON.stringify(aliases) + ';',
        'function ' + id + '(Prism) {',
        deps.map(register).join('\n'),
        trim(detab(doc)),
        '}'
      ].join('\n'),
      callback
    )
  }
}

function load(lang) {
  return 'var ' + camelcase(lang) + " = require('./" + lang + ".js');"
}

function register(lang) {
  return '  Prism.register(' + camelcase(lang) + ');'
}

function name(fp) {
  return base(fp).slice('prism-'.length)
}

function base(fp) {
  return path.basename(fp, '.js')
}

function minified(name) {
  return path.extname(name) === '.min'
}

function core(name) {
  return name === 'core'
}

function camelcase(str) {
  return str.replace(/-[a-z]/gi, replace)
  function replace($0) {
    return $0.charAt(1).toUpperCase()
  }
}

function findAll(doc, re) {
  var result = []
  var match = re.exec(doc)

  while (match) {
    result.push(match[1])
    match = re.exec(doc)
  }

  return result
}
