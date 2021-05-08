/**
 * @typedef {import('mdast').Root} Root
 * @typedef {import('mdast-zone').Handler} Handler
 */

import {zone} from 'mdast-zone'
import {u} from 'unist-builder'
import {all, common} from './data.js'

export default function count() {
  return transformer
}

/**
 * @param {Root} tree
 */
function transformer(tree) {
  zone(tree, 'count', replace)
}

/** @type {Handler} */
function replace(start, _, end) {
  return [
    start,
    u('list', {spread: false}, [
      u('listItem', [
        u('paragraph', [
          u('inlineCode', 'lib/core.js'),
          u('text', ' — 0 languages')
        ])
      ]),
      u('listItem', [
        u('paragraph', [
          u('inlineCode', 'lib/common.js'),
          u('text', ' (default) — ' + common.length + ' languages')
        ])
      ]),
      u('listItem', [
        u('paragraph', [
          u('inlineCode', 'lib/all.js'),
          u('text', ' — ' + all.length + ' languages')
        ])
      ])
    ]),
    end
  ]
}
