// @ts-nocheck
/**
 * @import {Refractor} from '../lib/core.js'
 */
pcaxis.displayName = 'pcaxis'
pcaxis.aliases = ['px']

/** @param {Refractor} Prism */
export default function pcaxis(Prism) {
  Prism.languages.pcaxis = {
    string: /"[^"]*"/,
    keyword: {
      pattern:
        /((?:^|;)\s*)[-A-Z\d]+(?:\s*\[[-\w]+\])?(?:\s*\("[^"]*"(?:,\s*"[^"]*")*\))?(?=\s*=)/,
      lookbehind: true,
      greedy: true,
      inside: {
        keyword: /^[-A-Z\d]+/,
        language: {
          pattern: /^(\s*)\[[-\w]+\]/,
          lookbehind: true,
          inside: {
            punctuation: /^\[|\]$/,
            property: /[-\w]+/
          }
        },
        'sub-key': {
          pattern: /^(\s*)\S[\s\S]*/,
          lookbehind: true,
          inside: {
            parameter: {
              pattern: /"[^"]*"/,
              alias: 'property'
            },
            punctuation: /^\(|\)$|,/
          }
        }
      }
    },
    operator: /=/,
    tlist: {
      pattern:
        /TLIST\s*\(\s*\w+(?:(?:\s*,\s*"[^"]*")+|\s*,\s*"[^"]*"-"[^"]*")?\s*\)/,
      greedy: true,
      inside: {
        function: /^TLIST/,
        property: {
          pattern: /^(\s*\(\s*)\w+/,
          lookbehind: true
        },
        string: /"[^"]*"/,
        punctuation: /[(),]/,
        operator: /-/
      }
    },
    punctuation: /[;,]/,
    number: {
      pattern: /(^|\s)\d+(?:\.\d+)?(?!\S)/,
      lookbehind: true
    },
    boolean: /NO|YES/
  }
  Prism.languages.px = Prism.languages.pcaxis
}
