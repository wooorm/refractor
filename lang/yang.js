// @ts-nocheck
/**
 * @import {Refractor} from '../lib/core.js'
 */
yang.displayName = 'yang'
yang.aliases = []

/** @param {Refractor} Prism */
export default function yang(Prism) {
  Prism.languages.yang = {
    // https://tools.ietf.org/html/rfc6020#page-34
    // http://www.yang-central.org/twiki/bin/view/Main/YangExamples
    comment: /\/\*[\s\S]*?\*\/|\/\/.*/,
    string: {
      pattern: /"(?:[^\\"]|\\.)*"|'[^']*'/,
      greedy: true
    },
    keyword: {
      pattern: /(^|[{};\r\n][ \t]*)[a-z_][\w.-]*/i,
      lookbehind: true
    },
    namespace: {
      pattern: /(\s)[a-z_][\w.-]*(?=:)/i,
      lookbehind: true
    },
    boolean: /\b(?:false|true)\b/,
    operator: /\+/,
    punctuation: /[{};:]/
  }
}
