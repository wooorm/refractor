import fs from 'fs'
import path from 'path'
import {bail} from 'bail'
import chalk from 'chalk'
import async from 'async'
import babel from '@babel/core'
import not from 'not'
import {isHidden} from 'is-hidden'
import {detab} from 'detab'
import diff from 'arr-diff'
import {trimLines} from 'trim-lines'
import {camelcase} from './camelcase.js'

var bundled = JSON.parse(
  String(fs.readFileSync(path.join('script', 'bundled.json')))
)
var componentsJson = JSON.parse(
  String(
    fs.readFileSync(path.join('node_modules', 'prismjs', 'components.json'))
  )
)

var root = path.join('node_modules', 'prismjs', 'components')
var anyAliasRegex = /((?:Prism\.languages\.\w+ = )+)Prism\.languages\.(extend\([^)]+\)|\w+);/g
var aliasRegex = /Prism\.languages\.(\w+) = /g
var prefix = 'refractor-'

fs.readdir(root, ondir)

function ondir(error, paths) {
  bail(error)

  paths = paths
    .filter(not(isHidden))
    .filter(not(index))
    .map((fp) => base(fp).slice('prism-'.length))
    .filter(not(minified))
    .filter(not(core))

  async.map(paths, generate, done)
}

function done(error, results) {
  bail(error)
  console.log(chalk.green('✓') + ' wrote ' + results.length + ' languages')
}

function generate(name, callback) {
  var id = camelcase(name)
  var out = path.join('lang', name + '.js')

  fs.readFile(path.join(root, 'prism-' + name + '.js'), 'utf8', onread)

  function onread(error, doc) {
    var deps
    var anyAlias
    var aliases

    if (error) {
      return callback(error)
    }

    deps = componentsJson.languages[name].require || []

    if (!Array.isArray(deps)) {
      deps = [deps]
    }

    deps = diff(
      deps.filter((d, i, all) => all.indexOf(d) === i),
      bundled.map((d) => base(d)).concat([id, 'inside'])
    )
    deps = deps.filter((d) => d !== name)

    anyAlias = findAll(doc, anyAliasRegex).join('\n')
    aliases = findAll(anyAlias, aliasRegex).filter((d) => d !== name)

    doc = babel.transformSync(doc, {plugins: [fixWrapHook]}).code

    fs.writeFile(
      out,
      [
        ...deps.map(
          (lang) =>
            'import ' + camelcase(prefix + lang) + " from './" + lang + ".js'"
        ),
        id + ".displayName = '" + id + "'",
        id + '.aliases = ' + JSON.stringify(aliases),
        '',
        'export default function ' + id + '(Prism) {',
        ...deps.map(
          (lang) => '  Prism.register(' + camelcase(prefix + lang) + ');'
        ),
        trimLines(detab(doc)),
        '}'
      ].join('\n'),
      callback
    )
  }
}

function base(fp) {
  return path.basename(fp, path.extname(fp))
}

function minified(name) {
  return path.extname(name) === '.min'
}

function core(name) {
  return name === 'core'
}

function fixWrapHook() {
  var t = babel.types

  return {
    visitor: {
      // We only perform the later changes inside `wrap` hooks, just to be safe.
      CallExpression: {
        enter(path) {
          if (isWrapHook(path)) {
            this.inWrapHook = true
          }
        },
        exit(path) {
          if (isWrapHook(path)) {
            this.inWrapHook = false
          }
        }
      },
      // If a syntax is assigning `Prism.highlight` to `env.content`, we should
      // add the result to `env.content` instead of `env.content.value`.
      AssignmentExpression: {
        enter(path) {
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
        enter(path) {
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
