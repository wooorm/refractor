// @ts-nocheck
/**
 * @import {Refractor} from '../lib/core.js'
 */
import refractorT4Templating from './t4-templating.js'
import refractorVbnet from './vbnet.js'
t4Vb.displayName = 't4-vb'
t4Vb.aliases = []

/** @param {Refractor} Prism */
export default function t4Vb(Prism) {
  Prism.register(refractorT4Templating)
  Prism.register(refractorVbnet)
  Prism.languages['t4-vb'] = Prism.languages['t4-templating'].createT4('vbnet')
}
