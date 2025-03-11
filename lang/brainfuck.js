// @ts-nocheck
/**
 * @import {Refractor} from '../lib/core.js'
 */
brainfuck.displayName = 'brainfuck'
brainfuck.aliases = []

/** @param {Refractor} Prism */
export default function brainfuck(Prism) {
  Prism.languages.brainfuck = {
    pointer: {
      pattern: /<|>/,
      alias: 'keyword'
    },
    increment: {
      pattern: /\+/,
      alias: 'inserted'
    },
    decrement: {
      pattern: /-/,
      alias: 'deleted'
    },
    branching: {
      pattern: /\[|\]/,
      alias: 'important'
    },
    operator: /[.,]/,
    comment: /\S+/
  }
}
