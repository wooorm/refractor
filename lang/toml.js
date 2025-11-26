// @ts-nocheck
/**
 * @import {Refractor} from '../lib/core.js'
 */
toml.displayName = 'toml'
toml.aliases = []

/** @param {Refractor} Prism */
export default function toml(Prism) {
  ;(function (Prism) {
    var key = /(?:[\w-]+|'[^'\n\r]*'|"(?:\\.|[^\\"\r\n])*")/.source
    var dottedKey = key + '(?:\\s*\\.\\s*' + key + ')*'

    Prism.languages.toml = {
      comment: {
        pattern: /#.*/,
        greedy: true
      },
      table: {
        // keep entire table header (including brackets) as one token to avoid split spans
        pattern: RegExp(
          '^[\\t ]*\\[\\[?\\s*' + dottedKey + '\\s*\\]\\]?[ \\t]*(?:\\r?\\n)?',
          'm'
        ),
        greedy: true,
        alias: 'class-name'
      },
      key: {
        pattern: RegExp('(^[\\t ]*|[{,]\\s*)' + dottedKey + '(?=\\s*=)', 'm'),
        lookbehind: true,
        greedy: true,
        alias: 'property'
      },
      string: {
        pattern:
          /"""(?:\\[\s\S]|[^\\])*?"""|'''[\s\S]*?'''|'[^'\n\r]*'|"(?:\\.|[^\\"\r\n])*"/,
        greedy: true
      },
      date: [
        {
          // Offset Date-Time, Local Date-Time, Local Date
          pattern:
            /\b\d{4}-\d{2}-\d{2}(?:[T\s]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?)?\b/i,
          alias: 'number'
        },
        {
          // Local Time
          pattern: /\b\d{2}:\d{2}:\d{2}(?:\.\d+)?\b/,
          alias: 'number'
        }
      ],
      number:
        /(?:\b0(?:x[\da-zA-Z]+(?:_[\da-zA-Z]+)*|o[0-7]+(?:_[0-7]+)*|b[10]+(?:_[10]+)*))\b|[-+]?\b\d+(?:_\d+)*(?:\.\d+(?:_\d+)*)?(?:[eE][+-]?\d+(?:_\d+)*)?\b|[-+]?\b(?:inf|nan)\b/,
      boolean: /\b(?:false|true)\b/,
      punctuation: /[.,=\[\]{}]/
    }
  })(Prism)
}
