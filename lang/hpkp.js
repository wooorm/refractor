// @ts-nocheck
/**
 * @import {Refractor} from '../lib/core.js'
 */
hpkp.displayName = 'hpkp'
hpkp.aliases = []

/** @param {Refractor} Prism */
export default function hpkp(Prism) {
  /**
   * Original by Scott Helme.
   *
   * Reference: https://scotthelme.co.uk/hpkp-cheat-sheet/
   */

  Prism.languages.hpkp = {
    directive: {
      pattern:
        /\b(?:includeSubDomains|max-age|pin-sha256|preload|report-to|report-uri|strict)(?=[\s;=]|$)/i,
      alias: 'property'
    },
    operator: /=/,
    punctuation: /;/
  }
}
