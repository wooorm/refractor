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
 * @property {Text|RefractorElement|Array<Text|RefractorElement>} content
 * @property {Array<string>} classes
 * @property {Record<string, string>} attributes
 * @property {string} language
 *
 * @typedef {import('hast').Root} Root
 * @typedef {import('hast').Element} Element
 * @typedef {import('hast').Text} Text
 * @typedef {Omit<Element, 'children'> & {children: Array<RefractorElement|Text>}} RefractorElement
 * @typedef {Omit<Root, 'children'> & {children: Array<RefractorElement|Text>}} RefractorRoot
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
const ctx =
  typeof globalThis === 'object'
    ? globalThis
    : // @ts-expect-error
    typeof self === 'object'
    ? // @ts-expect-error
      self
    : // @ts-expect-error
    typeof window === 'object'
    ? // @ts-expect-error
      window
    : typeof global === 'object'
    ? global
    : {}
/* eslint-enable no-undef */

const restore = capture()

/* c8 ignore next 5 */
ctx.Prism = ctx.Prism || {}
// @ts-expect-error Types are incorrect.
ctx.Prism.manual = true
// @ts-expect-error Types are incorrect.
ctx.Prism.disableWorkerMessageHandler = true

/* eslint-disable import/first */

// Load all stuff in `prism.js` itself, except for `prism-file-highlight.js`.
// The wrapped non-leaky grammars are loaded instead of Prism’s originals.
import {h} from 'hastscript'
import {parseEntities} from 'parse-entities'
// @ts-expect-error: untyped.
import Prism from 'prismjs/components/prism-core.js'

/* eslint-enable import/first */

restore()

const own = {}.hasOwnProperty

// Inherit.
function Refractor() {}

Refractor.prototype = Prism

/** @type {Refractor} */
// @ts-expect-error: TS is wrong.
export const refractor = new Refractor()

// Create.
refractor.highlight = highlight
refractor.register = register
refractor.alias = alias
refractor.registered = registered
refractor.listLanguages = listLanguages

// @ts-expect-error Overwrite Prism.
refractor.util.encode = encode
// @ts-expect-error Overwrite Prism.
refractor.Token.stringify = stringify

/**
 * Highlight `value` (code) as `language` (programming language).
 *
 * @param {string} value
 *   Code to highlight.
 * @param {string|Grammar} language
 *   Programming language name, alias, or grammar.
 * @returns {RefractorRoot}
 *   Node representing highlighted code.
 */
function highlight(value, language) {
  if (typeof value !== 'string') {
    throw new TypeError('Expected `string` for `value`, got `' + value + '`')
  }

  /** @type {Grammar} */
  let grammar
  /** @type {string|undefined} */
  let name

  // `name` is a grammar object.
  if (language && typeof language === 'object') {
    grammar = language
  } else {
    name = language

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
 * Register a syntax.
 *
 * @param {Syntax} syntax
 *   Language function made for refractor, as in, the files in
 *   `refractor/lang/*.js`.
 * @returns {void}
 */
function register(syntax) {
  // @ts-expect-error: runtime.
  if (typeof syntax !== 'function' || !syntax.displayName) {
    throw new Error('Expected `function` for `syntax`, got `' + syntax + '`')
  }

  // Do not duplicate registrations.
  // @ts-expect-error: TypeScript is wrong.
  if (!own.call(refractor.languages, syntax.displayName)) {
    // @ts-expect-error: TypeScript is wrong.
    syntax(refractor)
  }
}

/**
 * Register aliases for already registered languages.
 *
 * @param {Record<string, string|Array<string>>|string} language
 * @param {string|Array<string>} [alias]
 * @returns {void}
 */
function alias(language, alias) {
  const languages = refractor.languages
  /** @type {Record<string, string|Array<string>>} */
  let map = {}

  if (typeof language === 'string') {
    if (alias) {
      map[language] = alias
    }
  } else {
    map = language
  }

  /** @type {string} */
  let key

  for (key in map) {
    if (own.call(map, key)) {
      const value = map[key]
      const list = typeof value === 'string' ? [value] : value
      let index = -1

      while (++index < list.length) {
        languages[list[index]] = languages[key]
      }
    }
  }
}

/**
 * Check whether an `alias` or `language` is registered.
 *
 * @param {string} aliasOrLanguage
 * @returns {boolean}
 */
function registered(aliasOrLanguage) {
  if (typeof aliasOrLanguage !== 'string') {
    throw new TypeError(
      'Expected `string` for `aliasOrLanguage`, got `' + aliasOrLanguage + '`'
    )
  }

  return own.call(refractor.languages, aliasOrLanguage)
}

/**
 * List all registered languages (names and aliases).
 *
 * @returns {Array<string>}
 */
function listLanguages() {
  const languages = refractor.languages
  /** @type {Array<string>} */
  const list = []
  /** @type {string} */
  let language

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
 * @param {string|_Token|Array<string|_Token>} value
 * @param {string} language
 * @returns {Text|RefractorElement|Array<Text|RefractorElement>}
 */
function stringify(value, language) {
  if (typeof value === 'string') {
    return {type: 'text', value}
  }

  if (Array.isArray(value)) {
    /** @type {Array<Text|RefractorElement>} */
    const result = []
    let index = -1

    while (++index < value.length) {
      if (
        value[index] !== '' &&
        value[index] !== null &&
        value[index] !== undefined
      ) {
        // @ts-expect-error Assume no sub-arrays.
        result.push(stringify(value[index], language))
      }
    }

    return result
  }

  /** @type {_Env} */
  const env = {
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

  // @ts-expect-error Prism.
  refractor.hooks.run('wrap', env)

  // @ts-expect-error Hush, it’s fine.
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
 * @param {Record<string, string>} attrs
 * @returns {Record<string, string>}
 */
function attributes(attrs) {
  /** @type {string} */
  let key

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
  /** @type {boolean|undefined} */
  let defined = 'Prism' in ctx
  /* c8 ignore next */
  let current = defined ? ctx.Prism : undefined

  return restore

  /**
   * @returns {void}
   */
  function restore() {
    /* istanbul ignore else - Clean leaks after Prism. */
    if (defined) {
      // @ts-expect-error: hush.
      ctx.Prism = current
      /* c8 ignore next 4 */
    } else {
      // @ts-expect-error: hush.
      delete ctx.Prism
    }

    defined = undefined
    current = undefined
  }
}
