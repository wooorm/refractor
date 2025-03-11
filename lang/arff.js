// @ts-nocheck
/**
 * @import {Refractor} from '../lib/core.js'
 */
arff.displayName = 'arff'
arff.aliases = []

/** @param {Refractor} Prism */
export default function arff(Prism) {
  Prism.languages.arff = {
    comment: /%.*/,
    string: {
      pattern: /(["'])(?:\\.|(?!\1)[^\\\r\n])*\1/,
      greedy: true
    },
    keyword: /@(?:attribute|data|end|relation)\b/i,
    number: /\b\d+(?:\.\d+)?\b/,
    punctuation: /[{},]/
  }
}
