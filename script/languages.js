'use strict'

var fs = require('fs')
var path = require('path')
var bail = require('bail')
var chalk = require('chalk')
var async = require('async')
var babel = require('@babel/core')
var not = require('not')
var hidden = require('is-hidden')
var detab = require('detab')
var unique = require('array-unique')
var diff = require('arr-diff')
var trim = require('trim-lines')
var bundled = require('./bundled')

var root = path.join('node_modules', 'prismjs', 'components')
var useBracesRegex = /Prism\.languages\[['"]([^'"]+)['"]\](?!\s*[=:])/g
var extendRegex = /languages\.extend\(['"]([^'"]+)['"]/g
var insertRegex = /Prism\.languages\.insertBefore\(["'](.+?)["']/g
var cloneRegex = /Prism\.util\.clone\(Prism\.languages\.([^[)]+)(?:\)|\[)/g
var anyAliasRegex = /((?:Prism\.languages\.[\w]+ = )+)Prism\.languages\.(extend\([^)]+\)|[\w]+);/g
var aliasRegex = /Prism\.languages\.([\w]+) = /g
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
    var anyAlias
    var aliases

    if (err) {
      return callback(err)
    }

    deps = [].concat(
      findAll(doc, useBracesRegex),
      findAll(doc, extendRegex),
      findAll(doc, cloneRegex),
      findAll(doc, insertRegex)
    )
    anyAlias = findAll(doc, anyAliasRegex).join('\n')
    aliases = findAll(anyAlias, aliasRegex).filter(d => d !== name)

    deps = diff(unique(deps), bundled.map(base).concat([id, 'inside']))
    deps = deps.filter(d => d !== name)

    doc = babel.transformSync(doc, {plugins: [fixWrapHook]}).code

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
      // We only perform the later changes inside `wrap` hooks, just to be safe.
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
      // If a syntax is assigning `Prism.highlight` to `env.content`, we should
      // add the result to `env.content` instead of `env.content.value`.
      AssignmentExpression: {
        enter: function(path) {
          if (
            path.get('right.callee').matchesPattern('Prism.highlight') &&
            path.get('left').matchesPattern('env.content')
          ) {
            path.get('left').node.ignoreValueSuffix = true
          }
        }
      },
      // If a syntax is using `env.content`, it probably expects a string value,
      // those are stored at `env.content.value`.
      MemberExpression: {
        enter: function(path) {
          if (
            this.inWrapHook &&
            !path.node.ignoreValueSuffix &&
            path.matchesPattern('env.content')
          ) {
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
