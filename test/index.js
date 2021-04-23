import fs from 'fs'
import path from 'path'
import test from 'tape'
import rehype from 'rehype'
import {isHidden} from 'is-hidden'
import {removePosition} from 'unist-util-remove-position'
import {refractor} from '../index.js'

test('.highlight(value, language)', function (t) {
  t.throws(
    function () {
      refractor.highlight()
    },
    / Expected `string` for `value`, got `undefined`/,
    'should throw when not given a `value`'
  )

  t.throws(
    function () {
      refractor.highlight('')
    },
    /Expected `string` for `name`, got `undefined`/,
    'should throw when not given a `name`'
  )

  t.throws(
    function () {
      refractor.highlight(true, 'js')
    },
    /Expected `string` for `value`, got `true`/,
    'should throw when not given `string` for `value`'
  )

  t.throws(
    function () {
      refractor.highlight('', 'fooscript')
    },
    /Unknown language: `fooscript` is not registered/,
    'should throw when given an unknown `language`'
  )

  t.deepEqual(
    refractor.highlight('', 'js'),
    [],
    'should return an empty array when given an empty `value`'
  )

  t.deepEqual(
    refractor.highlight('# foo', 'js'),
    [{type: 'text', value: '# foo'}],
    'should silently ignore illegals'
  )

  t.test('fixture', function (st) {
    st.deepEqual(
      refractor.highlight('public void moveTo(int x, int y, int z);', 'java'),
      [
        {
          type: 'element',
          tagName: 'span',
          properties: {className: ['token', 'keyword']},
          children: [{type: 'text', value: 'public'}]
        },
        {type: 'text', value: ' '},
        {
          type: 'element',
          tagName: 'span',
          properties: {className: ['token', 'keyword']},
          children: [{type: 'text', value: 'void'}]
        },
        {type: 'text', value: ' '},
        {
          type: 'element',
          tagName: 'span',
          properties: {className: ['token', 'function']},
          children: [{type: 'text', value: 'moveTo'}]
        },
        {
          type: 'element',
          tagName: 'span',
          properties: {className: ['token', 'punctuation']},
          children: [{type: 'text', value: '('}]
        },
        {
          type: 'element',
          tagName: 'span',
          properties: {className: ['token', 'keyword']},
          children: [{type: 'text', value: 'int'}]
        },
        {type: 'text', value: ' x'},
        {
          type: 'element',
          tagName: 'span',
          properties: {className: ['token', 'punctuation']},
          children: [{type: 'text', value: ','}]
        },
        {type: 'text', value: ' '},
        {
          type: 'element',
          tagName: 'span',
          properties: {className: ['token', 'keyword']},
          children: [{type: 'text', value: 'int'}]
        },
        {type: 'text', value: ' y'},
        {
          type: 'element',
          tagName: 'span',
          properties: {className: ['token', 'punctuation']},
          children: [{type: 'text', value: ','}]
        },
        {type: 'text', value: ' '},
        {
          type: 'element',
          tagName: 'span',
          properties: {className: ['token', 'keyword']},
          children: [{type: 'text', value: 'int'}]
        },
        {type: 'text', value: ' z'},
        {
          type: 'element',
          tagName: 'span',
          properties: {className: ['token', 'punctuation']},
          children: [{type: 'text', value: ')'}]
        },
        {
          type: 'element',
          tagName: 'span',
          properties: {className: ['token', 'punctuation']},
          children: [{type: 'text', value: ';'}]
        }
      ],
      'should return the correct AST for the fixture'
    )

    st.end()
  })

  t.end()
})

test('.register(grammar)', function (t) {
  t.throws(
    function () {
      refractor.register()
    },
    /Expected `function` for `grammar`, got `undefined`/,
    'should throw when not given a `value`'
  )

  t.end()
})

test('.registered(language)', function (t) {
  t.throws(
    function () {
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

test('.alias(name, alias)', function (t) {
  var languages = refractor.languages
  var input = fs
    .readFileSync(
      path.join('test', 'fixtures', 'markdown-sublanguage', 'input.txt')
    )
    .toString()
    .trim()
  var expected = refractor.highlight(input, 'markdown').value

  refractor.alias('markdown', 'mkd')

  t.deepEqual(
    refractor.highlight(input, 'mkd').value,
    expected,
    'alias must be parsed like original language'
  )

  delete languages.mkd

  refractor.alias('markdown', ['mmkd', 'mmkdown'])

  t.deepEqual(
    refractor.highlight(input, 'mmkd').value,
    expected,
    'alias must be parsed like original language'
  )

  delete languages.mmkd
  delete languages.mmkdown

  refractor.alias({markdown: 'mdown'})

  t.deepEqual(
    refractor.highlight(input, 'mdown').value,
    expected,
    'alias must be parsed like original language'
  )

  delete languages.mdown

  refractor.alias({markdown: ['mmdown', 'mark']})

  t.deepEqual(
    refractor.highlight(input, 'mark').value,
    expected,
    'alias must be parsed like original language'
  )

  delete languages.mmdown
  delete languages.mark

  t.end()
})

test('fixtures', function (t) {
  var root = path.join('test', 'fixtures')
  var processor = rehype().use({settings: {fragment: true}})
  var files = fs.readdirSync(root)
  var index = -1
  var name
  var input
  var lang
  var expected

  while (++index < files.length) {
    name = files[index]

    /* c8 ignore next */
    if (isHidden(name)) continue

    lang = name.split('-')[0]
    input = String(fs.readFileSync(path.join(root, name, 'input.txt'))).trim()
    expected = String(
      fs.readFileSync(path.join(root, name, 'output.html'))
    ).trim()

    t.deepEqual(
      refractor.highlight(input, lang),
      removePosition(processor.parse(expected), true).children,
      name
    )
  }

  t.end()
})

test('listLanguages', function (t) {
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

  function grammar(prism) {
    prism.languages.alpha = {}
    prism.languages.bravo = {}
  }
})
