// @ts-nocheck
/**
 * @import {Refractor} from '../lib/core.js'
 */
import refractorJson from './json.js'
json5.displayName = 'json5'
json5.aliases = []

/** @param {Refractor} Prism */
export default function json5(Prism) {
  Prism.register(refractorJson)
  ;(function (Prism) {
    var string = /("|')(?:\\(?:\r\n?|\n|.)|(?!\1)[^\\\r\n])*\1/
    Prism.languages.json5 = Prism.languages.extend('json', {
      property: [
        {
          pattern: RegExp(string.source + '(?=\\s*:)'),
          greedy: true
        },
        {
          pattern:
            /(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*:)/,
          alias: 'unquoted'
        }
      ],
      string: {
        pattern: string,
        greedy: true
      },
      number:
        /[+-]?\b(?:NaN|Infinity|0x[a-fA-F\d]+)\b|[+-]?(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:[eE][+-]?\d+\b)?/
    })
  })(Prism)
}
