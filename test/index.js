/**
 * @typedef {import('prismjs')} Prism
 */

import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import process from 'node:process'
import test from 'node:test'
import {toHtml} from 'hast-util-to-html'
import {isHidden} from 'is-hidden'
import {refractor} from '../lib/all.js'

/* eslint-disable no-await-in-loop */

test('.highlight(value, language)', () => {
  assert.throws(
    () => {
      // @ts-expect-error runtime.
      refractor.highlight()
    },
    / Expected `string` for `value`, got `undefined`/,
    'should throw when not given a `value`'
  )

  assert.throws(
    () => {
      // @ts-expect-error runtime.
      refractor.highlight('')
    },
    /Expected `string` for `name`, got `undefined`/,
    'should throw when not given a `name`'
  )

  assert.throws(
    () => {
      // @ts-expect-error runtime.
      refractor.highlight(true, 'js')
    },
    /Expected `string` for `value`, got `true`/,
    'should throw when not given `string` for `value`'
  )

  assert.throws(
    () => {
      refractor.highlight('', 'fooscript')
    },
    /Unknown language: `fooscript` is not registered/,
    'should throw when given an unknown `language`'
  )

  assert.deepEqual(
    refractor.highlight('', 'js'),
    {type: 'root', children: []},
    'should return an empty array when given an empty `value`'
  )

  assert.deepEqual(
    refractor.highlight('# foo', 'js'),
    {type: 'root', children: [{type: 'text', value: '# foo'}]},
    'should silently ignore illegals'
  )
})

test('.register(grammar)', () => {
  assert.throws(
    () => {
      // @ts-expect-error runtime.
      refractor.register()
    },
    /Expected `function` for `syntax`, got `undefined`/,
    'should throw when not given a `value`'
  )
})

test('.registered(language)', () => {
  assert.throws(
    () => {
      // @ts-expect-error runtime.
      refractor.registered()
    },
    /Expected `string` for `aliasOrLanguage`, got `undefined`/,
    'should throw when not given a `language`'
  )

  assert.equal(
    refractor.registered('notalanguage'),
    false,
    'should return false when `language` is not registered'
  )

  assert.equal(
    refractor.registered('markdown'),
    true,
    'should return true when `language` is registered'
  )
})

test('.alias(name, alias)', () => {
  const languages = refractor.languages
  const input = fs
    .readFile(
      new URL('fixtures/markdown-sublanguage/input.txt', import.meta.url)
    )
    .toString()
    .trim()
  const expected = refractor.highlight(input, 'markdown')

  refractor.alias('markdown', 'mkd')

  assert.deepEqual(
    refractor.highlight(input, 'mkd'),
    expected,
    'alias must be parsed like original language'
  )

  delete languages.mkd

  refractor.alias('markdown', ['mmkd', 'mmkdown'])

  assert.deepEqual(
    refractor.highlight(input, 'mmkd'),
    expected,
    'alias must be parsed like original language'
  )

  delete languages.mmkd
  delete languages.mmkdown

  refractor.alias({markdown: 'mdown'})

  assert.deepEqual(
    refractor.highlight(input, 'mdown'),
    expected,
    'alias must be parsed like original language'
  )

  delete languages.mdown

  refractor.alias({markdown: ['mmdown', 'mark']})

  assert.deepEqual(
    refractor.highlight(input, 'mark'),
    expected,
    'alias must be parsed like original language'
  )

  delete languages.mmdown
  delete languages.mark
})

test('fixtures', async () => {
  const root = new URL('fixtures/', import.meta.url)
  const files = await fs.readdir(root)
  let index = -1

  while (++index < files.length) {
    const name = files[index]

    /* c8 ignore next */
    if (isHidden(name)) continue

    const lang = name.split('-')[0]
    const inputUrl = new URL(name + '/input.txt', root)
    const outputUrl = new URL(name + '/output.html', root)
    const input = String(await fs.readFile(inputUrl)).trim()
    const actual = toHtml(refractor.highlight(input, lang))
    /** @type {string} */
    let expected

    try {
      expected = String(await fs.readFile(outputUrl)).trim()

      if ('UPDATE' in process.env) {
        throw new Error('Update!')
      }
    } catch {
      expected = actual
      await fs.writeFile(outputUrl, actual + '\n')
    }

    assert.equal(actual, expected, name)
  }
})

test('listLanguages', () => {
  grammar.displayName = 'grammar'

  assert.ok(
    Array.isArray(refractor.listLanguages().sort()),
    'should return a list of registered languages'
  )

  // @ts-expect-error: hush.
  refractor.register(grammar)

  assert.deepEqual(
    [
      refractor.listLanguages().includes('alpha'),
      refractor.listLanguages().includes('bravo')
    ],
    [true, true],
    'should support multiple languages from one grammar'
  )

  /** @param {Prism} prism */
  function grammar(prism) {
    prism.languages.alpha = {}
    prism.languages.bravo = {}
  }
})

/* eslint-enable no-await-in-loop */
