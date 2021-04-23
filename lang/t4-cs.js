import refractorT4Templating from './t4-templating.js'
import refractorCsharp from './csharp.js'
t4Cs.displayName = 't4Cs'
t4Cs.aliases = []

export default function t4Cs(Prism) {
  Prism.register(refractorT4Templating)
  Prism.register(refractorCsharp)
  Prism.languages.t4 = Prism.languages['t4-cs'] = Prism.languages[
    't4-templating'
  ].createT4('csharp')
}
