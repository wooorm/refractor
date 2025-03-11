// @ts-nocheck
/**
 * @import {Syntax} from '../core.js'
 */
oz.displayName = 'oz'
oz.aliases = []

/** @type {Syntax} */
export default function oz(Prism) {
  Prism.languages.oz = {
    comment: {
      pattern: /\/\*[\s\S]*?\*\/|%.*/,
      greedy: true
    },
    string: {
      pattern: /"(?:[^"\\]|\\[\s\S])*"/,
      greedy: true
    },
    atom: {
      pattern: /'(?:[^'\\]|\\[\s\S])*'/,
      greedy: true,
      alias: 'builtin'
    },
    keyword:
      /\$|\[\]|\b(?:_|at|attr|case|catch|choice|class|cond|declare|define|dis|else(?:case|if)?|end|export|fail|false|feat|finally|from|fun|functor|if|import|in|local|lock|meth|nil|not|of|or|prepare|proc|prop|raise|require|self|skip|then|thread|true|try|unit)\b/,
    function: [
      /\b[a-z][A-Za-z\d]*(?=\()/,
      {
        pattern: /(\{)[A-Z][A-Za-z\d]*\b/,
        lookbehind: true
      }
    ],
    number:
      /\b(?:0[bx][\da-f]+|\d+(?:\.\d*)?(?:e~?\d+)?)\b|&(?:[^\\]|\\(?:\d{3}|.))/i,
    variable: /`(?:[^`\\]|\\.)+`/,
    'attr-name': /\b\w+(?=[ \t]*:(?![:=]))/,
    operator:
      /:(?:=|::?)|<[-:=]?|=(?:=|<?:?)|>=?:?|\\=:?|!!?|[|#+\-*\/,~^@]|\b(?:andthen|div|mod|orelse)\b/,
    punctuation: /[\[\](){}.:;?]/
  }
}
