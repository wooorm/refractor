// @ts-nocheck
/**
 * @import {Refractor} from '../lib/core.js'
 */
editorconfig.displayName = 'editorconfig'
editorconfig.aliases = []

/** @param {Refractor} Prism */
export default function editorconfig(Prism) {
  Prism.languages.editorconfig = {
    // https://editorconfig-specification.readthedocs.io
    comment: /[;#].*/,
    section: {
      pattern: /(^[ \t]*)\[.+\]/m,
      lookbehind: true,
      alias: 'selector',
      inside: {
        regex: /\\\\[\[\]{},!?.*]/,
        // Escape special characters with '\\'
        operator: /[!?]|\.\.|\*{1,2}/,
        punctuation: /[\[\]{},]/
      }
    },
    key: {
      pattern: /(^[ \t]*)[^\s=]+(?=[ \t]*=)/m,
      lookbehind: true,
      alias: 'attr-name'
    },
    value: {
      pattern: /=.*/,
      alias: 'attr-value',
      inside: {
        punctuation: /^=/
      }
    }
  }
}
