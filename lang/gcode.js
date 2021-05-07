// @ts-nocheck
gcode.displayName = 'gcode'
gcode.aliases = []

/** @type {import('../core.js').Syntax} */
export default function gcode(Prism) {
  Prism.languages.gcode = {
    comment: /;.*|\B\(.*?\)\B/,
    string: {
      pattern: /"(?:""|[^"])*"/,
      greedy: true
    },
    keyword: /\b[GM]\d+(?:\.\d+)?\b/,
    property: /\b[A-Z]/,
    checksum: {
      pattern: /\*\d+/,
      alias: 'punctuation'
    },
    // T0:0:0
    punctuation: /:/
  }
}
