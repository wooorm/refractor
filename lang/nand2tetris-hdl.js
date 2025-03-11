// @ts-nocheck
/**
 * @import {Syntax} from '../core.js'
 */
nand2tetrisHdl.displayName = 'nand2tetris-hdl'
nand2tetrisHdl.aliases = []

/** @type {Syntax} */
export default function nand2tetrisHdl(Prism) {
  Prism.languages['nand2tetris-hdl'] = {
    comment: /\/\/.*|\/\*[\s\S]*?(?:\*\/|$)/,
    keyword: /\b(?:BUILTIN|CHIP|CLOCKED|IN|OUT|PARTS)\b/,
    boolean: /\b(?:false|true)\b/,
    function: /\b[A-Za-z][A-Za-z0-9]*(?=\()/,
    number: /\b\d+\b/,
    operator: /=|\.\./,
    punctuation: /[{}[\];(),:]/
  }
}
