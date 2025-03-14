// @ts-nocheck
/**
 * @import {Refractor} from '../lib/core.js'
 */
$false.displayName = 'false'
$false.aliases = []

/** @param {Refractor} Prism */
export default function $false(Prism) {
  ;(function (Prism) {
    /**
     * Based on the manual by Wouter van Oortmerssen.
     *
     * @see {@link https://github.com/PrismJS/prism/issues/2801#issue-829717504}
     */
    Prism.languages['false'] = {
      comment: {
        pattern: /\{[^}]*\}/
      },
      string: {
        pattern: /"[^"]*"/,
        greedy: true
      },
      'character-code': {
        pattern: /'(?:[^\r]|\r\n?)/,
        alias: 'number'
      },
      'assembler-code': {
        pattern: /\d+`/,
        alias: 'important'
      },
      number: /\d+/,
      operator: /[-!#$%&'*+,./:;=>?@\\^_`|~ßø]/,
      punctuation: /\[|\]/,
      variable: /[a-z]/,
      'non-standard': {
        pattern: /[()<BDO®]/,
        alias: 'bold'
      }
    }
  })(Prism)
}
