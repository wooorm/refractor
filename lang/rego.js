// @ts-nocheck
/**
 * @import {Refractor} from '../lib/core.js'
 */
rego.displayName = 'rego'
rego.aliases = []

/** @param {Refractor} Prism */
export default function rego(Prism) {
  // https://www.openpolicyagent.org/docs/latest/policy-reference/

  Prism.languages.rego = {
    comment: /#.*/,
    property: {
      pattern:
        /(^|[^\\.])(?:"(?:\\.|[^\\"\r\n])*"|`[^`]*`|\b[a-z_]\w*\b)(?=\s*:(?!=))/i,
      lookbehind: true,
      greedy: true
    },
    string: {
      pattern: /(^|[^\\])"(?:\\.|[^\\"\r\n])*"|`[^`]*`/,
      lookbehind: true,
      greedy: true
    },
    keyword:
      /\b(?:as|default|else|import|not|null|package|set(?=\s*\()|some|with)\b/,
    boolean: /\b(?:false|true)\b/,
    function: {
      pattern: /\b[a-z_]\w*\b(?:\s*\.\s*\b[a-z_]\w*\b)*(?=\s*\()/i,
      inside: {
        namespace: /\b\w+\b(?=\s*\.)/,
        punctuation: /\./
      }
    },
    number: /-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/i,
    operator: /[-+*/%|&]|[<>:=]=?|!=|\b_\b/,
    punctuation: /[,;.\[\]{}()]/
  }
}
