/**
 * @typedef {import('mdast').Root} Root
 * @typedef {import('mdast').ListItem} ListItem
 * @typedef {import('mdast').PhrasingContent} PhrasingContent
 */

import {zone} from 'mdast-zone'
import {u} from 'unist-builder'
import alphaSort from 'alpha-sort'
import {all, common} from './data.js'

const items = await Promise.all(all.sort(sort).map((d) => one(d)))

/** @type {import('unified').Plugin<[], Root>} */
export default function syntaxes() {
  return async function (tree) {
    zone(tree, 'support', function (start, _, end) {
      return [start, u('list', {spread: false, ordered: false}, items), end]
    })
  }
}

/**
 * @param {string} name
 * @returns {Promise<ListItem>}
 */
async function one(name) {
  /** @type {{default: {aliases: Array<string>}}} */
  const mod = await import('../lang/' + name + '.js')
  const aliases = mod.default.aliases
  /** @type {Array<PhrasingContent>} */
  const content = [
    u(
      'link',
      {
        url:
          'https://github.com/wooorm/refractor/blob/main/lang/' + name + '.js'
      },
      [u('inlineCode', name)]
    )
  ]
  let index = -1

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
