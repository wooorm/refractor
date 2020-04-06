'use strict'

var fs = require('fs')
var path = require('path')
var Prism = require('prismjs')
var loadLanguages = require('prismjs/components/index.js')
var test = require('tape')
var not = require('not')
var hidden = require('is-hidden')
var rehype = require('rehype')
var remove = require('unist-util-remove-position')
var refractor = require('..')

loadLanguages()

var read = fs.readFileSync
var join = path.join

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
    .readFileSync(join('test', 'fixtures', 'markdown-sublanguage', 'input.txt'))
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
  var root = path.join(__dirname, 'fixtures')
  var processor = rehype().use({settings: {fragment: true}})

  fs.readdirSync(root).filter(not(hidden)).forEach(subtest)

  function subtest(name) {
    var input = read(join(root, name, 'input.txt'), 'utf8').trim()
    var lang = name.split('-')[0]
    var grammar = refractor.languages[lang]
    var actual = processor
      .processSync(Prism.highlight(input, grammar, lang))
      .toString()
    var tree = refractor.highlight(input, lang)
    var expected

    /* istanbul ignore next - useful when generating fixtures. */
    try {
      expected = read(join(root, name, 'output.html'), 'utf8').trim()
    } catch (_) {
      expected = actual
      fs.writeFileSync(join(root, name, 'output.html'), expected + '\n')
    }

    t.test(name, function (st) {
      st.plan(2)

      st.equal(actual, expected, 'Prism should compile to the fixture')

      st.deepEqual(
        tree,
        remove(processor.parse(expected), true).children,
        'Refractor should create a tree matching the fixture'
      )
    })
  }

  t.end()
})

test('listLanguages', function (t) {
  grammar.displayName = 'grammar'

  t.deepEqual(
    refractor.listLanguages().sort(),
    Object.keys(Prism.languages)
      .filter((lang) => typeof Prism.languages[lang] !== 'function')
      .sort(),
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
