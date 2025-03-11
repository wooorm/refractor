/**
 * @import {ListItem, PhrasingContent, Root} from 'mdast'
 */

import alphaSort from 'alpha-sort'
import {zone} from 'mdast-zone'
import {all, common} from './data.js'

/** @type {Array<Promise<ListItem>>} */
const promises = []

for (const d of [...all].sort(sort)) {
  promises.push(one(d))
}

const items = await Promise.all(promises)

export default function syntaxes() {
  /**
   * @param {Root} tree
   *   Tree.
   * @returns {undefined}
   *   Nothing.
   */
  return function (tree) {
    zone(tree, 'support', function (start, _, end) {
      return [
        start,
        {type: 'list', ordered: false, spread: false, children: items},
        end
      ]
    })
  }
}

/**
 * @param {string} name
 *   Language name.
 * @returns {Promise<ListItem>}
 *   Promise to a list item.
 */
async function one(name) {
  /** @type {{default: {aliases: ReadonlyArray<string>}}} */
  const moduleExports = await import('../lang/' + name + '.js')
  const aliases = moduleExports.default.aliases
  /** @type {Array<PhrasingContent>} */
  const content = [
    {
      type: 'link',
      url: 'https://github.com/wooorm/refractor/blob/main/lang/' + name + '.js',
      children: [{type: 'inlineCode', value: name}]
    }
  ]
  let index = -1

  if (aliases.length > 0) {
    content.push({type: 'text', value: ' — alias: '})

    while (++index < aliases.length) {
      if (index !== 0) {
        content.push({type: 'text', value: ', '})
      }

      content.push({type: 'inlineCode', value: aliases[index]})
    }
  }

  return {
    type: 'listItem',
    checked: included(name),
    children: [{type: 'paragraph', children: content}]
  }
}

/**
 * @param {string} name
 *   Language name.
 * @returns {boolean}
 *   Whether a language is included in `common`.
 */
function included(name) {
  return common.includes(name)
}

/**
 * @param {string} a
 *   Language name.
 * @param {string} b
 *   Other language name.
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
