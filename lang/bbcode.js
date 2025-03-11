// @ts-nocheck
/**
 * @import {Refractor} from '../lib/core.js'
 */
bbcode.displayName = 'bbcode'
bbcode.aliases = ['shortcode']

/** @param {Refractor} Prism */
export default function bbcode(Prism) {
  Prism.languages.bbcode = {
    tag: {
      pattern:
        /\[\/?[^\s=\]]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'"\]=]+))?(?:\s+[^\s=\]]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'"\]=]+))*\s*\]/,
      inside: {
        tag: {
          pattern: /^\[\/?[^\s=\]]+/,
          inside: {
            punctuation: /^\[\/?/
          }
        },
        'attr-value': {
          pattern: /=\s*(?:"[^"]*"|'[^']*'|[^\s'"\]=]+)/,
          inside: {
            punctuation: [
              /^=/,
              {
                pattern: /^(\s*)["']|["']$/,
                lookbehind: true
              }
            ]
          }
        },
        punctuation: /\]/,
        'attr-name': /[^\s=\]]+/
      }
    }
  }
  Prism.languages.shortcode = Prism.languages.bbcode
}
