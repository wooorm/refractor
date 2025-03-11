// To do: Old export names, remove next major.
/**
 * @typedef {import('./lib/core.js').RefractorRoot} RefractorRoot
 * @typedef {import('./lib/core.js').RefractorElement} RefractorElement
 * @typedef {import('hast').Text} Text
 */

// Old and new names:
/**
 * @typedef {import('prismjs').Grammar} Grammar
 * @typedef {import('./lib/core.js').Syntax} Syntax
 */

// New names:
/**
 * @typedef {import('./lib/core.js').RefractorRoot} Root
 */

export {refractor} from './lib/common.js'
