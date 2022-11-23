/**
 * @typedef {import('prismjs')} Prism
 */

import fs from 'node:fs/promises'
import test from 'tape'
import {rehype} from 'rehype'
import {isHidden} from 'is-hidden'
import {removePosition} from 'unist-util-remove-position'
import {refractor} from '../lib/all.js'

/* eslint-disable no-await-in-loop */

test('.highlight(value, language)', (t) => {
  t.throws(
    () => {
      // @ts-expect-error runtime.
      refractor.highlight()
    },
    / Expected `string` for `value`, got `undefined`/,
    'should throw when not given a `value`'
  )

  t.throws(
    () => {
      // @ts-expect-error runtime.
      refractor.highlight('')
    },
    /Expected `string` for `name`, got `undefined`/,
    'should throw when not given a `name`'
  )

  t.throws(
    () => {
      // @ts-expect-error runtime.
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
      // @ts-expect-error runtime.
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
      // @ts-expect-error runtime.
      refractor.registered()
    },
    /Expected `string` for `aliasOrLanguage`, got `undefined`/,
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
    .readFile(
      new URL('fixtures/markdown-sublanguage/input.txt', import.meta.url)
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

test('fixtures', async (t) => {
  const root = new URL('fixtures/', import.meta.url)
  const processor = rehype().use({settings: {fragment: true}})
  const files = await fs.readdir(root)
  let index = -1

  while (++index < files.length) {
    const name = files[index]

    /* c8 ignore next */
    if (isHidden(name)) continue

    const lang = name.split('-')[0]
    const input = String(
      await fs.readFile(new URL(name + '/input.txt', root))
    ).trim()
    const expected = String(
      await fs.readFile(new URL(name + '/output.html', root))
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

  // @ts-expect-error: hush.
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

/* eslint-enable no-await-in-loop */
