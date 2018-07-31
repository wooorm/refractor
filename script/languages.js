'use strict'

var fs = require('fs')
var path = require('path')
var bail = require('bail')
var chalk = require('chalk')
var async = require('async')
var babel = require('babel-core')
var not = require('not')
var hidden = require('is-hidden')
var detab = require('detab')
var unique = require('array-unique')
var diff = require('arr-diff')
var trim = require('trim-lines')
var bundled = require('./bundled')

var root = path.join('node_modules', 'prismjs', 'components')
var extendRegex = /languages\.extend\(['"]([^'"]+)['"]/g
var insertRegex = /Prism\.languages\.insertBefore\(["'](.+?)["']/g
var cloneRegex = /Prism\.util\.clone\(Prism\.languages\.([^[)]+)(?:\)|\[)/g
var aliasRegex = /Prism\.languages\.([\w]+) = Prism\.languages\.[\w]+;/g
var prefix = 'refractor-'

fs.readdir(root, ondir)

function ondir(err, paths) {
  bail(err)

  paths = paths
    .filter(not(hidden))
    .filter(not(index))
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

    deps = [].concat(
      findAll(doc, extendRegex),
      findAll(doc, cloneRegex),
      findAll(doc, insertRegex)
    )
    aliases = unique(findAll(doc, aliasRegex))

    deps = diff(unique(deps), bundled.map(base).concat([id, 'inside']))

    doc = babel.transform(doc, {plugins: [fixWrapHook]}).code

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
  return 'var ' + camelcase(prefix + lang) + " = require('./" + lang + ".js');"
}

function register(lang) {
  return '  Prism.register(' + camelcase(prefix + lang) + ');'
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

function fixWrapHook() {
  var t = babel.types

  return {
    visitor: {
      CallExpression: {
        enter: function(path) {
          if (isWrapHook(path)) {
            this.inWrapHook = true
          }
        },
        exit: function(path) {
          if (isWrapHook(path)) {
            this.inWrapHook = false
          }
        }
      },
      MemberExpression: {
        enter: function(path) {
          if (this.inWrapHook && path.matchesPattern('env.content')) {
            path.node.object = t.memberExpression(
              path.node.object,
              t.identifier('content')
            )
            path.node.property.name = 'value'
            path.removed = true
          }
        }
      }
    }
  }

  function isWrapHook(path) {
    return (
      path.get('callee').matchesPattern('Prism.hooks.add') &&
      path.get('arguments.0').isStringLiteral({value: 'wrap'})
    )
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

function index(fp) {
  return fp === 'index.js'
}
