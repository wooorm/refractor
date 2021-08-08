/**
 * @typedef {import('../lib/core.js').Syntax} Syntax
 * @typedef {import('hast').Node} Node
 */

import fs from 'node:fs'
import path from 'node:path'
import test from 'tape'
import {rehype} from 'rehype'
import {isHidden} from 'is-hidden'
import {removePosition} from 'unist-util-remove-position'
import {refractor} from '../lib/all.js'

test('.highlight(value, language)', (t) => {
  t.throws(
    () => {
      // @ts-ignore runtime.
      refractor.highlight()
    },
    / Expected `string` for `value`, got `undefined`/,
    'should throw when not given a `value`'
  )

  t.throws(
    () => {
      // @ts-ignore runtime.
      refractor.highlight('')
    },
    /Expected `string` for `name`, got `undefined`/,
    'should throw when not given a `name`'
  )

  t.throws(
    () => {
      // @ts-ignore runtime.
      refractor.highlight(true, 'js')
    },
    /Expected `string` for `value`, got `true`/,
    'should throw when not given `string` for `value`'
  )

  t.throws(
    () => {
      refractor.highlight('', 'fooscript')
    },
    /Unknown language: `fooscript` is not registered/,
    'should throw when given an unknown `language`'
  )

  t.deepEqual(
    refractor.highlight('', 'js'),
    {type: 'root', children: []},
    'should return an empty array when given an empty `value`'
  )

  t.deepEqual(
    refractor.highlight('# foo', 'js'),
    {type: 'root', children: [{type: 'text', value: '# foo'}]},
    'should silently ignore illegals'
  )

  t.end()
})

test('.register(grammar)', (t) => {
  t.throws(
    () => {
      // @ts-ignore runtime.
      refractor.register()
    },
    /Expected `function` for `syntax`, got `undefined`/,
    'should throw when not given a `value`'
  )

  t.end()
})

test('.registered(language)', (t) => {
  t.throws(
    () => {
      // @ts-ignore runtime.
      refractor.registered()
    },
    /Expected `string` for `language`, got `undefined`/,
    'should throw when not given a `language`'
  )

  t.equal(
    refractor.registered('notalanguage'),
    false,
    'should return false when `language` is not registered'
  )

  t.equal(
    refractor.registered('markdown'),
    true,
    'should return true when `language` is registered'
  )

  t.end()
})

test('.alias(name, alias)', (t) => {
  const languages = refractor.languages
  const input = fs
    .readFileSync(
      path.join('test', 'fixtures', 'markdown-sublanguage', 'input.txt')
    )
    .toString()
    .trim()
  const expected = refractor.highlight(input, 'markdown')

  refractor.alias('markdown', 'mkd')

  t.deepEqual(
    refractor.highlight(input, 'mkd'),
    expected,
    'alias must be parsed like original language'
  )

  delete languages.mkd

  refractor.alias('markdown', ['mmkd', 'mmkdown'])

  t.deepEqual(
    refractor.highlight(input, 'mmkd'),
    expected,
    'alias must be parsed like original language'
  )

  delete languages.mmkd
  delete languages.mmkdown

  refractor.alias({markdown: 'mdown'})

  t.deepEqual(
    refractor.highlight(input, 'mdown'),
    expected,
    'alias must be parsed like original language'
  )

  delete languages.mdown

  refractor.alias({markdown: ['mmdown', 'mark']})

  t.deepEqual(
    refractor.highlight(input, 'mark'),
    expected,
    'alias must be parsed like original language'
  )

  delete languages.mmdown
  delete languages.mark

  t.end()
})

test('fixtures', (t) => {
  const root = path.join('test', 'fixtures')
  const processor = rehype().use({settings: {fragment: true}})
  const files = fs.readdirSync(root)
  let index = -1

  while (++index < files.length) {
    const name = files[index]

    /* c8 ignore next */
    if (isHidden(name)) continue

    const lang = name.split('-')[0]
    const input = String(
      fs.readFileSync(path.join(root, name, 'input.txt'))
    ).trim()
    const expected = String(
      fs.readFileSync(path.join(root, name, 'output.html'))
    ).trim()

    t.deepEqual(
      Object.assign(refractor.highlight(input, lang), {
        data: undefined
      }),
      Object.assign(removePosition(processor.parse(expected), true), {
        data: undefined
      }),
      name
    )
  }

  t.end()
})

test('listLanguages', (t) => {
  grammar.displayName = 'grammar'

  t.ok(
    Array.isArray(refractor.listLanguages().sort()),
    'should return a list of registered languages'
  )

  refractor.register(grammar)

  t.deepEqual(
    [
      refractor.listLanguages().includes('alpha'),
      refractor.listLanguages().includes('bravo')
    ],
    [true, true],
    'should support multiple languages from one grammar'
  )

  t.end()

  /** @param {Prism} prism */
  function grammar(prism) {
    prism.languages.alpha = {}
    prism.languages.bravo = {}
  }
})
