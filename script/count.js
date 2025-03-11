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
                    {type: 'inlineCode', value: 'refractor/all'},
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
                    {type: 'inlineCode', value: 'refractor/core'},
                    {type: 'text', value: ' — 0 languages'}
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
                    {type: 'inlineCode', value: 'refractor'},
                    {
                      type: 'text',
                      value:
                        ' (default) — ' + common.length + ' common languages'
                    }
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
