/**
 * @typedef {import('mdast').Root} Root
 * @typedef {import('mdast').PhrasingContent} PhrasingContent
 * @typedef {import('mdast-zone').Handler} Handler
 */

import {zone} from 'mdast-zone'
import {u} from 'unist-builder'
import alphaSort from 'alpha-sort'
import {all, common} from './data.js'

var itemPromises = Promise.all(all.sort(sort).map((d) => one(d)))

export default function syntaxes() {
  return transformer
}

/**
 * @param {Root} tree
 */
async function transformer(tree) {
  var items = await itemPromises

  zone(tree, 'support', replace)

  /** @type {Handler} */
  function replace(start, _, end) {
    return [start, u('list', {spread: false, ordered: false}, items), end]
  }
}

/**
 * @param {string} name
 */
async function one(name) {
  /** @type {Array.<string>} */
  var aliases = (await import('../lang/' + name + '.js')).default.aliases // type-coverage:ignore-line
  /** @type {Array.<PhrasingContent>} */
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

  return u('listItem', {checked: included(name)}, [u('paragraph', content)])
}

/**
 * @param {string} name
 */
function included(name) {
  return common.includes(name)
}

/**
 * @param {string} a
 * @param {string} b
 */
function sort(a, b) {
  if (included(a) && !included(b)) {
    return -1
  }

  if (!included(a) && included(b)) {
    return 1
  }

  return alphaSort()(a, b)
}
