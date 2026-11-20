'use strict'
var refractorC = require('./c.js')
module.exports = cilkc
cilkc.displayName = 'cilkc'
cilkc.aliases = []
function cilkc(Prism) {
  Prism.register(refractorC)
  Prism.languages.cilkc = Prism.languages.insertBefore('c', 'function', {
    'parallel-keyword': {
      pattern: /\bcilk_(?:for|reducer|s(?:cope|pawn|ync))\b/,
      alias: 'keyword'
    }
  })
  Prism.languages['cilk-c'] = Prism.languages['cilkc']
}
