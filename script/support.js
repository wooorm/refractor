import fs from 'fs'
import path from 'path'
import zone from 'mdast-zone'
import {u} from 'unist-builder'
import not from 'not'
import {isHidden} from 'is-hidden'
import alphaSort from 'alpha-sort'

var bundled = JSON.parse(
  String(fs.readFileSync(path.join('script', 'bundled.json')))
)

var itemPromises = Promise.all(
  fs
    .readdirSync('lang')
    .filter(not(isHidden))
    .filter(not(core))
    .sort(sort)
    .map((d) => one(d))
)

export default function syntaxes() {
  return transformer
}

async function transformer(tree) {
  var items = await itemPromises

  zone(tree, 'support', replace)

  function replace(start, nodes, end) {
    return [start, u('list', {spread: false, ordered: false}, items), end]
  }
}

async function one(fp) {
  var grammar = (await import('../lang/' + fp)).default
  var content = [
    u(
      'link',
      {url: 'https://github.com/wooorm/refractor/blob/main/lang/' + fp},
      [u('inlineCode', grammar.displayName)]
    )
  ]
  var index = -1

  if (grammar.aliases.length > 0) {
    content.push(u('text', ' — alias: '))

    while (++index < grammar.aliases.length) {
      if (index !== 0) {
        content.push(u('text', ', '))
      }

      content.push(u('inlineCode', grammar.aliases[index]))
    }
  }

  return u('listItem', {checked: included(fp)}, [u('paragraph', content)])
}

function included(fp) {
  return bundled.includes(fp)
}

function core(fp) {
  return fp === 'core.js'
}

function sort(a, b) {
  if (included(a) && !included(b)) {
    return -1
  }

  if (!included(a) && included(b)) {
    return 1
  }

  return alphaSort()(a, b)
}
