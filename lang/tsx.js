// @ts-nocheck
/**
 * @import {Refractor} from '../lib/core.js'
 */
import refractorJsx from './jsx.js'
import refractorTypescript from './typescript.js'
tsx.displayName = 'tsx'
tsx.aliases = []

/** @param {Refractor} Prism */
export default function tsx(Prism) {
  Prism.register(refractorJsx)
  Prism.register(refractorTypescript)
  ;(function (Prism) {
    var typescript = Prism.util.clone(Prism.languages.typescript)
    Prism.languages.tsx = Prism.languages.extend('jsx', typescript)

    // doesn't work with TS because TS is too complex
    delete Prism.languages.tsx['parameter']
    delete Prism.languages.tsx['literal-property']

    // This will prevent collisions between TSX tags and TS generic types.
    // Idea by https://github.com/karlhorky
    // Discussion: https://github.com/PrismJS/prism/issues/2594#issuecomment-710666928
    var tag = Prism.languages.tsx.tag
    tag.pattern = RegExp(
      /(^|[^\w$]|(?=<\/))/.source + '(?:' + tag.pattern.source + ')',
      tag.pattern.flags
    )
    tag.lookbehind = true
  })(Prism)
}
