// @ts-nocheck
nand2tetrisHdl.displayName = 'nand2tetris-hdl'
nand2tetrisHdl.aliases = []

/** @type {import('../core.js').Syntax} */
export default function nand2tetrisHdl(Prism) {
  Prism.languages['nand2tetris-hdl'] = {
    comment: /\/\/.*|\/\*[\s\S]*?(?:\*\/|$)/,
    keyword: /\b(?:CHIP|IN|OUT|PARTS|BUILTIN|CLOCKED)\b/,
    boolean: /\b(?:true|false)\b/,
    function: /\b[A-Za-z][A-Za-z0-9]*(?=\()/,
    number: /\b\d+\b/,
    operator: /=|\.\./,
    punctuation: /[{}[\];(),:]/
  }
}
