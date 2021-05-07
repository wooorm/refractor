import fs from 'fs'
import path from 'path'
import {zone} from 'mdast-zone'
import {u} from 'unist-builder'
import alphaSort from 'alpha-sort'

var components = JSON.parse(
  String(
    fs.readFileSync(path.join('node_modules', 'prismjs', 'components.json'))
  )
)

var itemPromises = Promise.all(
  Object.keys(components.languages)
    .filter((d) => d !== 'meta')
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

async function one(name) {
  var aliases = (await import('../lang/' + name + '.js')).default.aliases

  var content = [
    u(
      'link',
      {
        url:
          'https://github.com/wooorm/refractor/blob/main/lang/' + name + '.js'
      },
      [u('inlineCode', name)]
    )
  ]
  var index = -1

  if (aliases.length > 0) {
    content.push(u('text', ' — alias: '))

    while (++index < aliases.length) {
      if (index !== 0) {
        content.push(u('text', ', '))
      }

      content.push(u('inlineCode', aliases[index]))
    }
  }

  return u('listItem', {checked: included(name + '.js')}, [
    u('paragraph', content)
  ])
}

function included() {
  return false
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
