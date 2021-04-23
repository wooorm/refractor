import refractorT4Templating from './t4-templating.js'
import refractorVbnet from './vbnet.js'
t4Vb.displayName = 't4Vb'
t4Vb.aliases = []

export default function t4Vb(Prism) {
  Prism.register(refractorT4Templating)
  Prism.register(refractorVbnet)
  Prism.languages['t4-vb'] = Prism.languages['t4-templating'].createT4('vbnet')
}
