nand2tetrisHdl.displayName = 'nand2tetrisHdl'
nand2tetrisHdl.aliases = []

export default function nand2tetrisHdl(Prism) {
  Prism.languages['nand2tetris-hdl'] = {
    comment: /\/\/.*|\/\*[\s\S]*?(?:\*\/|$)/,
    keyword: /\b(?:CHIP|IN|OUT|PARTS|BUILTIN|CLOCKED)\b/,
    boolean: /\b(?:true|false)\b/,
    function: /[A-Za-z][A-Za-z0-9]*(?=\()/,
    number: /\b\d+\b/,
    operator: /=|\.\./,
    punctuation: /[{}[\];(),:]/
  }
}
