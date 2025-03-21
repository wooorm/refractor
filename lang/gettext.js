// @ts-nocheck
/**
 * @import {Refractor} from '../lib/core.js'
 */
gettext.displayName = 'gettext'
gettext.aliases = ['po']

/** @param {Refractor} Prism */
export default function gettext(Prism) {
  Prism.languages.gettext = {
    comment: [
      {
        pattern: /# .*/,
        greedy: true,
        alias: 'translator-comment'
      },
      {
        pattern: /#\..*/,
        greedy: true,
        alias: 'extracted-comment'
      },
      {
        pattern: /#:.*/,
        greedy: true,
        alias: 'reference-comment'
      },
      {
        pattern: /#,.*/,
        greedy: true,
        alias: 'flag-comment'
      },
      {
        pattern: /#\|.*/,
        greedy: true,
        alias: 'previously-untranslated-comment'
      },
      {
        pattern: /#.*/,
        greedy: true
      }
    ],
    string: {
      pattern: /(^|[^\\])"(?:[^"\\]|\\.)*"/,
      lookbehind: true,
      greedy: true
    },
    keyword: /^msg(?:ctxt|id|id_plural|str)\b/m,
    number: /\b\d+\b/,
    punctuation: /[\[\]]/
  }
  Prism.languages.po = Prism.languages.gettext
}
