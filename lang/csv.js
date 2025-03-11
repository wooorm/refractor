// @ts-nocheck
/**
 * @import {Refractor} from '../lib/core.js'
 */
csv.displayName = 'csv'
csv.aliases = []

/** @param {Refractor} Prism */
export default function csv(Prism) {
  // https://tools.ietf.org/html/rfc4180

  Prism.languages.csv = {
    value: /[^\r\n,"]+|"(?:[^"]|"")*"(?!")/,
    punctuation: /,/
  }
}
