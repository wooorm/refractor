// @ts-nocheck
/**
 * @import {Syntax} from '../core.js'
 */
bbcode.displayName = 'bbcode'
bbcode.aliases = ['shortcode']

/** @type {Syntax} */
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
