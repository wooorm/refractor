/**
 * @import {default as Prism} from 'prismjs'
 */

import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import process from 'node:process'
import test from 'node:test'
import {toHtml} from 'hast-util-to-html'
import {refractor} from 'refractor/all'

test('refractor', async function (t) {
  await t.test('should expose the public api', async function () {
    assert.deepEqual(Object.keys(await import('refractor')).sort(), [
      'refractor'
    ])
  })
})

test('.highlight(value, language)', async function (t) {
  await t.test('should throw when not given a `value`', async function () {
    assert.throws(function () {
      // @ts-expect-error: check how the runtime handles a missing value.
      refractor.highlight()
    }, /Expected `string` for `value`, got `undefined`/)
  })

  await t.test('should throw when not given a `name`', async function () {
    assert.throws(function () {
      // @ts-expect-error: check how the runtime handles a missing name.
      refractor.highlight('')
    }, /Expected `string` for `name`, got `undefined`/)
  })

  await t.test(
    'should throw when not given `string` for `value`',
    async function () {
      assert.throws(function () {
        // @ts-expect-error: check how the runtime handles a non-string value.
        refractor.highlight(true, 'js')
      }, /Expected `string` for `value`, got `true`/)
    }
  )

  await t.test(
    'should throw when given an unknown `language`',
    async function () {
      assert.throws(function () {
        refractor.highlight('', 'fooscript')
      }, /Unknown language: `fooscript` is not registered/)
    }
  )

  await t.test(
    'should return an empty array when given an empty `value`',
    async function () {
      assert.deepEqual(refractor.highlight('', 'js'), {
        type: 'root',
        children: []
      })
    }
  )

  await t.test('should silently ignore illegals', async function () {
    assert.deepEqual(refractor.highlight('# foo', 'js'), {
      type: 'root',
      children: [{type: 'text', value: '# foo'}]
    })
  })
})

test('.register(grammar)', async function (t) {
  await t.test('should throw when not given a `value`', async function () {
    assert.throws(function () {
      // @ts-expect-error: check how the runtime handles a missing grammar.
      refractor.register()
    }, /Expected `function` for `syntax`, got `undefined`/)
  })
})

test('.registered(language)', async function (t) {
  await t.test('should throw when not given a `language`', async function () {
    assert.throws(function () {
      // @ts-expect-error: check how the runtime handles a missing value.
      refractor.registered()
    }, /Expected `string` for `aliasOrLanguage`, got `undefined`/)
  })

  await t.test(
    'should return false when `language` is not registered',
    async function () {
      assert.equal(refractor.registered('notalanguage'), false)
    }
  )

  await t.test(
    'should return true when `language` is registered',
    async function () {
      assert.equal(refractor.registered('markdown'), true)
    }
  )
})

test('.alias(name, alias)', async function (t) {
  const languages = refractor.languages
  const input = fs
    .readFile(
      new URL('fixtures/markdown-sublanguage/input.txt', import.meta.url)
    )
    .toString()
    .trim()
  const expected = refractor.highlight(input, 'markdown')

  await t.test(
    'should parse alias like original language (string)',
    async function () {
      refractor.alias('markdown', 'mkd')

      assert.deepEqual(refractor.highlight(input, 'mkd'), expected)

      delete languages.mkd
    }
  )

  await t.test(
    'should parse alias like original language (array)',
    async function () {
      refractor.alias('markdown', ['mmkd', 'mmkdown'])

      assert.deepEqual(refractor.highlight(input, 'mmkd'), expected)

      delete languages.mmkd
      delete languages.mmkdown
    }
  )

  await t.test(
    'should parse alias must be parsed like original language (object of string)',
    async function () {
      refractor.alias({markdown: 'mdown'})

      assert.deepEqual(refractor.highlight(input, 'mdown'), expected)

      delete languages.mdown
    }
  )

  await t.test(
    'should parse alias must be parsed like original language (object of array)',
    async function () {
      refractor.alias({markdown: ['mmdown', 'mark']})

      assert.deepEqual(refractor.highlight(input, 'mark'), expected)

      delete languages.mmdown
      delete languages.mark
    }
  )
})

test('fixtures', async function (t) {
  const root = new URL('fixtures/', import.meta.url)
  const files = await fs.readdir(root)
  let index = -1

  while (++index < files.length) {
    const name = files[index]

    if (name.charAt(0) === '.') continue

    await t.test(name, async function () {
      const lang = name.split('-')[0]
      const inputUrl = new URL(name + '/input.txt', root)
      const outputUrl = new URL(name + '/output.html', root)
      const input_ = await fs.readFile(inputUrl, 'utf8')
      const input = input_.trim()
      const actual = toHtml(refractor.highlight(input, lang))
      /** @type {string} */
      let expected

      try {
        const output = await fs.readFile(outputUrl, 'utf8')

        expected = output.trim()

        if ('UPDATE' in process.env) {
          throw new Error('Update!')
        }
      } catch {
        expected = actual
        await fs.writeFile(outputUrl, actual + '\n')
      }

      assert.equal(actual, expected, name)
    })
  }
})

test('listLanguages', async function (t) {
  grammar.displayName = 'grammar'

  await t.test(
    'should return a list of registered languages',
    async function () {
      assert.ok(Array.isArray(refractor.listLanguages().sort()))
    }
  )

  await t.test(
    'should support multiple languages from one grammar',
    async function () {
      // @ts-expect-error: hush.
      refractor.register(grammar)

      assert.deepEqual(
        [
          refractor.listLanguages().includes('alpha'),
          refractor.listLanguages().includes('bravo')
        ],
        [true, true]
      )
    }
  )

  /** @param {Prism} prism */
  function grammar(prism) {
    prism.languages.alpha = {}
    prism.languages.bravo = {}
  }
})
