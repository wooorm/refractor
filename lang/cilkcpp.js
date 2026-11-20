'use strict'
var refractorCpp = require('./cpp.js')
module.exports = cilkcpp
cilkcpp.displayName = 'cilkcpp'
cilkcpp.aliases = []
function cilkcpp(Prism) {
  Prism.register(refractorCpp)
  Prism.languages.cilkcpp = Prism.languages.insertBefore('cpp', 'function', {
    'parallel-keyword': {
      pattern: /\bcilk_(?:for|reducer|s(?:cope|pawn|ync))\b/,
      alias: 'keyword'
    }
  })
  Prism.languages['cilk-cpp'] = Prism.languages['cilkcpp']
  Prism.languages['cilk'] = Prism.languages['cilkcpp']
}
