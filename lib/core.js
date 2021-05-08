/**
 * @typedef _Token A hidden Prism token
 * @property {string} type
 * @property {string} content
 * @property {string} alias
 * @property {number} length
 *
 * @typedef _Env A hidden Prism environment
 * @property {string} type
 * @property {string} tag
 * @property {Text|RefractorElement|Array.<Text|RefractorElement>} content
 * @property {Array.<string>} classes
 * @property {Object.<string, string>} attributes
 * @property {string} language
 *
 * @typedef {import('hast').Root} Root
 * @typedef {import('hast').Element} Element
 * @typedef {import('hast').Text} Text
 * @typedef {Omit<Element, 'children'> & {children: Array.<RefractorElement|Text>}} RefractorElement
 * @typedef {Omit<Root, 'children'> & {children: Array.<RefractorElement|Text>}} RefractorRoot
 *
 * @typedef {import('prismjs').Languages} Languages
 * @typedef {import('prismjs').Grammar} Grammar Whatever this is, Prism handles it.
 * @typedef {((prism: unknown) => void) & {displayName: string, aliases?: string[]}} Syntax A refractor syntax function
 *
 * @typedef Refractor Virtual syntax highlighting
 * @property {highlight} highlight
 * @property {alias} alias
 * @property {register} register
 * @property {registered} registered
 * @property {listLanguages} listLanguages
 * @property {Languages} languages
 */

/* eslint-disable no-undef */
// Don’t allow Prism to run on page load in browser or to start messaging from
// workers.
/* c8 ignore next 15 */
/** @type {typeof globalThis} */
var ctx =
  typeof globalThis === 'object'
    ? globalThis
    : // @ts-ignore
    typeof self === 'object'
    ? // @ts-ignore
      self
    : // @ts-ignore
    typeof window === 'object'
    ? // @ts-ignore
      window
    : typeof global === 'object'
    ? global
    : {}
/* eslint-enable no-undef */

var restore = capture()

// @ts-ignore Types are incorrect.
ctx.Prism = {manual: true, disableWorkerMessageHandler: true}

// Load all stuff in `prism.js` itself, except for `prism-file-highlight.js`.
// The wrapped non-leaky grammars are loaded instead of Prism’s originals.
import {h} from 'hastscript'
import {parseEntities} from 'parse-entities'
import Prism from 'prismjs/components/prism-core.js'

restore()

var own = {}.hasOwnProperty

// Inherit.
function Refractor() {}

Refractor.prototype = Prism

/** @type {Refractor} */
export const refractor = new Refractor()

// Create.
refractor.highlight = highlight
refractor.register = register
refractor.alias = alias
refractor.registered = registered
refractor.listLanguages = listLanguages

// @ts-ignore Overwrite Prism.
refractor.util.encode = encode
// @ts-ignore Overwrite Prism.
refractor.Token.stringify = stringify

/**
 * Register a syntax.
 * Needed if you’re using `refractor/core.js`.
 *
 * @param {Syntax} syntax
 * @returns {void}
 */
function register(syntax) {
  if (typeof syntax !== 'function' || !syntax.displayName) {
    throw new Error('Expected `function` for `syntax`, got `' + syntax + '`')
  }

  // Do not duplicate registrations.
  if (!own.call(refractor.languages, syntax.displayName)) {
    syntax(refractor)
  }
}

/**
 * Register a new `alias` for the `name` language.
 *
 * @param {Object.<string, string|Array.<string>>|string} name
 * @param {string|Array.<string>} [alias]
 * @returns {void}
 */
function alias(name, alias) {
  var languages = refractor.languages
  /** @type {Object.<string, string|Array.<string>>} */
  var map
  /** @type {string} */
  var key
  /** @type {string|Array.<string>} */
  var value
  /** @type {Array.<string>} */
  var list
  /** @type {number} */
  var index

  if (typeof name === 'string') {
    map = {}
    map[name] = alias
  } else {
    map = name
  }

  for (key in map) {
    if (own.call(map, key)) {
      value = map[key]
      list = typeof value === 'string' ? [value] : value
      index = -1

      while (++index < list.length) {
        languages[list[index]] = languages[key]
      }
    }
  }
}

/**
 * Parse `value` according to the `language` (name or alias)
 * syntax.
 *
 * @param {string} value
 * @param {string|Grammar} nameOrGrammar
 * @returns {RefractorRoot}
 */
function highlight(value, nameOrGrammar) {
  /** @type {Grammar} */
  var grammar
  /** @type {string} */
  var name

  if (typeof value !== 'string') {
    throw new TypeError('Expected `string` for `value`, got `' + value + '`')
  }

  // `name` is a grammar object.
  if (nameOrGrammar && typeof nameOrGrammar === 'object') {
    grammar = nameOrGrammar
    name = null
  } else {
    // @ts-ignore Assume string.
    name = nameOrGrammar

    if (typeof name !== 'string') {
      throw new TypeError('Expected `string` for `name`, got `' + name + '`')
    }

    if (own.call(refractor.languages, name)) {
      grammar = refractor.languages[name]
    } else {
      throw new Error('Unknown language: `' + name + '` is not registered')
    }
  }

  return {
    type: 'root',
    children: Prism.highlight.call(refractor, value, grammar, name)
  }
}

/**
 * Check if a `language` (name or alias) is registered.
 *
 * @param {string} language
 * @returns {boolean}
 */
function registered(language) {
  if (typeof language !== 'string') {
    throw new TypeError(
      'Expected `string` for `language`, got `' + language + '`'
    )
  }

  return own.call(refractor.languages, language)
}

/**
 * List all registered languages (names and aliases).
 *
 * @returns {Array.<string>}
 */
function listLanguages() {
  var languages = refractor.languages
  /** @type {Array.<string>} */
  var list = []
  /** @type {string} */
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

/**
 * @param {string|_Token|Array.<string|_Token>} value
 * @param {string} language
 * @returns {Text|RefractorElement|Array.<Text|RefractorElement>}
 */
function stringify(value, language) {
  var index = -1
  /** @type {Array.<Text|RefractorElement>} */
  var result
  /** @type {_Env} */
  var env

  if (typeof value === 'string') {
    return {type: 'text', value}
  }

  if (Array.isArray(value)) {
    result = []

    while (++index < value.length) {
      if (
        value[index] !== '' &&
        value[index] !== null &&
        value[index] !== undefined
      ) {
        // @ts-ignore Assume no sub-arrays.
        result.push(stringify(value[index], language))
      }
    }

    return result
  }

  env = {
    type: value.type,
    content: stringify(value.content, language),
    tag: 'span',
    classes: ['token', value.type],
    attributes: {},
    language
  }

  if (value.alias) {
    env.classes.push(
      ...(typeof value.alias === 'string' ? [value.alias] : value.alias)
    )
  }

  // @ts-ignore Prism.
  refractor.hooks.run('wrap', env)

  // @ts-ignore Hush, it’s fine.
  return h(
    env.tag + '.' + env.classes.join('.'),
    attributes(env.attributes),
    env.content
  )
}

/**
 * @template {unknown} T
 * @param {T} tokens
 * @returns {T}
 */
function encode(tokens) {
  return tokens
}

/**
 * @param {Object.<string, string>} attrs
 * @returns {Object.<string, string>}
 */
function attributes(attrs) {
  /** @type {string} */
  var key

  for (key in attrs) {
    if (own.call(attrs, key)) {
      attrs[key] = parseEntities(attrs[key])
    }
  }

  return attrs
}

/**
 * @returns {() => void}
 */
function capture() {
  var defined = 'Prism' in ctx
  /* c8 ignore next */
  var current = defined ? ctx.Prism : undefined

  return restore

  /**
   * @returns {void}
   */
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
