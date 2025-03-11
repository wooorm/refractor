/**
 * @import {Root} from 'mdast'
 */

import {zone} from 'mdast-zone'
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
        {
          type: 'list',
          spread: false,
          children: [
            {
              type: 'listItem',
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {type: 'inlineCode', value: 'lib/all.js'},
                    {type: 'text', value: ' — ' + all.length + ' languages'}
                  ]
                }
              ]
            },
            {
              type: 'listItem',
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {type: 'inlineCode', value: 'lib/common.js'},
                    {
                      type: 'text',
                      value: ' (default) — ' + common.length + ' languages'
                    }
                  ]
                }
              ]
            },
            {
              type: 'listItem',
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {type: 'inlineCode', value: 'lib/core.js'},
                    {type: 'text', value: ' — 0 languages'}
                  ]
                }
              ]
            }
          ]
        },
        end
      ]
    })
  }
}
