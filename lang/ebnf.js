// @ts-nocheck
/**
 * @import {Refractor} from '../lib/core.js'
 */
ebnf.displayName = 'ebnf'
ebnf.aliases = []

/** @param {Refractor} Prism */
export default function ebnf(Prism) {
  Prism.languages.ebnf = {
    comment: /\(\*[\s\S]*?\*\)/,
    string: {
      pattern: /"[^"\r\n]*"|'[^'\r\n]*'/,
      greedy: true
    },
    special: {
      pattern: /\?[^?\r\n]*\?/,
      greedy: true,
      alias: 'class-name'
    },
    definition: {
      pattern: /^([\t ]*)[a-z]\w*(?:[ \t]+[a-z]\w*)*(?=\s*=)/im,
      lookbehind: true,
      alias: ['rule', 'keyword']
    },
    rule: /\b[a-z]\w*(?:[ \t]+[a-z]\w*)*\b/i,
    punctuation: /\([:/]|[:/]\)|[.,;()[\]{}]/,
    operator: /[-=|*/!]/
  }
}
