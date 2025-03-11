/**
 * @import {Root} from 'mdast'
 */

import {zone} from 'mdast-zone'
import {u} from 'unist-builder'
import {all, common} from './data.js'

export default function count() {
  /**
   * @param {Root} tree
   *   Tree.
   * @returns {undefined}
   *   Nothing.
   */
  return function (tree) {
    zone(tree, 'count', function (start, _, end) {
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
    })
  }
}
