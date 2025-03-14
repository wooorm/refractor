// @ts-nocheck
/**
 * @import {Refractor} from '../lib/core.js'
 */
import refractorMarkup from './markup.js'
xmlDoc.displayName = 'xml-doc'
xmlDoc.aliases = []

/** @param {Refractor} Prism */
export default function xmlDoc(Prism) {
  Prism.register(refractorMarkup)
  ;(function (Prism) {
    /**
     * If the given language is present, it will insert the given doc comment grammar token into it.
     *
     * @param {string} lang
     * @param {any} docComment
     */
    function insertDocComment(lang, docComment) {
      if (Prism.languages[lang]) {
        Prism.languages.insertBefore(lang, 'comment', {
          'doc-comment': docComment
        })
      }
    }
    var tag = Prism.languages.markup.tag
    var slashDocComment = {
      pattern: /\/\/\/.*/,
      greedy: true,
      alias: 'comment',
      inside: {
        tag: tag
      }
    }
    var tickDocComment = {
      pattern: /'''.*/,
      greedy: true,
      alias: 'comment',
      inside: {
        tag: tag
      }
    }
    insertDocComment('csharp', slashDocComment)
    insertDocComment('fsharp', slashDocComment)
    insertDocComment('vbnet', tickDocComment)
  })(Prism)
}
