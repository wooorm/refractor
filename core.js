/* global window, self */

// Don’t allow Prism to run on page load in browser or to start messaging from
// workers.
/* c8 ignore next 10 */
var ctx =
  typeof globalThis === 'object'
    ? globalThis
    : typeof self === 'object'
    ? self
    : typeof window === 'object'
    ? window
    : typeof global === 'object'
    ? global
    : {}

var restore = capture()

ctx.Prism = {manual: true, disableWorkerMessageHandler: true}

// Load all stuff in `prism.js` itself, except for `prism-file-highlight.js`.
// The wrapped non-leaky grammars are loaded instead of Prism’s originals.
import h from 'hastscript'
import {parseEntities} from 'parse-entities'
import Prism from 'prismjs/components/prism-core.js'
import markup from './lang/markup.js'
import css from './lang/css.js'
import clike from './lang/clike.js'
import js from './lang/javascript.js'

restore()

var own = {}.hasOwnProperty

// Inherit.
function Refractor() {}

Refractor.prototype = Prism

// Construct.
export const refractor = new Refractor()

// Create.
refractor.highlight = highlight
refractor.register = register
refractor.alias = alias
refractor.registered = registered
refractor.listLanguages = listLanguages

// Register bundled grammars.
register(markup)
register(css)
register(clike)
register(js)

refractor.util.encode = encode
refractor.Token.stringify = stringify

function register(grammar) {
  if (typeof grammar !== 'function' || !grammar.displayName) {
    throw new Error('Expected `function` for `grammar`, got `' + grammar + '`')
  }

  // Do not duplicate registrations.
  if (refractor.languages[grammar.displayName] === undefined) {
    grammar(refractor)
  }
}

function alias(name, alias) {
  var languages = refractor.languages
  var map = name
  var key
  var list
  var length
  var index

  if (alias) {
    map = {}
    map[name] = alias
  }

  for (key in map) {
    if (own.call(map, key)) {
      list = map[key]
      list = typeof list === 'string' ? [list] : list
      length = list.length
      index = -1

      while (++index < length) {
        languages[list[index]] = languages[key]
      }
    }
  }
}

function highlight(value, name) {
  var sup = Prism.highlight
  var grammar

  if (typeof value !== 'string') {
    throw new TypeError('Expected `string` for `value`, got `' + value + '`')
  }

  // `name` is a grammar object.
  if (refractor.util.type(name) === 'Object') {
    grammar = name
    name = null
  } else {
    if (typeof name !== 'string') {
      throw new TypeError('Expected `string` for `name`, got `' + name + '`')
    }

    if (own.call(refractor.languages, name)) {
      grammar = refractor.languages[name]
    } else {
      throw new Error('Unknown language: `' + name + '` is not registered')
    }
  }

  return sup.call(this, value, grammar, name)
}

function registered(language) {
  if (typeof language !== 'string') {
    throw new TypeError(
      'Expected `string` for `language`, got `' + language + '`'
    )
  }

  return own.call(refractor.languages, language)
}

function listLanguages() {
  var languages = refractor.languages
  var list = []
  var language

  for (language in languages) {
    if (
      own.call(languages, language) &&
      typeof languages[language] === 'object'
    ) {
      list.push(language)
    }
  }

  return list
}

function stringify(value, language, parent) {
  var env

  if (typeof value === 'string') {
    return {type: 'text', value}
  }

  if (refractor.util.type(value) === 'Array') {
    return stringifyAll(value, language)
  }

  env = {
    type: value.type,
    content: refractor.Token.stringify(value.content, language, parent),
    tag: 'span',
    classes: ['token', value.type],
    attributes: {},
    language,
    parent
  }

  if (value.alias) {
    env.classes = env.classes.concat(value.alias)
  }

  refractor.hooks.run('wrap', env)

  return h(
    env.tag + '.' + env.classes.join('.'),
    attributes(env.attributes),
    env.content
  )
}

function stringifyAll(values, language) {
  var result = []
  var length = values.length
  var index = -1
  var value

  while (++index < length) {
    value = values[index]

    if (value !== '' && value !== null && value !== undefined) {
      result.push(value)
    }
  }

  index = -1
  length = result.length

  while (++index < length) {
    value = result[index]
    result[index] = refractor.Token.stringify(value, language, result)
  }

  return result
}

function encode(tokens) {
  return tokens
}

function attributes(attrs) {
  var key

  for (key in attrs) {
    if (own.call(attrs, key)) {
      attrs[key] = parseEntities(attrs[key])
    }
  }

  return attrs
}

function capture() {
  var defined = 'Prism' in ctx
  /* c8 ignore next */
  var current = defined ? ctx.Prism : undefined

  return restore

  function restore() {
    /* istanbul ignore else - Clean leaks after Prism. */
    if (defined) {
      ctx.Prism = current
      /* c8 ignore next 3 */
    } else {
      delete ctx.Prism
    }

    defined = undefined
    current = undefined
  }
}
