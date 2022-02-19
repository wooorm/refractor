import fs from 'node:fs'
import path from 'node:path'
import chalk from 'chalk'
import {toId} from './to-id.js'
import {all, common} from './data.js'

fs.writeFileSync(path.join('lib', 'all.js'), generate(all))
fs.writeFileSync(path.join('lib', 'common.js'), generate(common))

console.log(
  chalk.green('✓') + ' wrote `lib/all.js` for ' + all.length + ' languages'
)
console.log(
  chalk.green('✓') +
    ' wrote `lib/common.js` for ' +
    common.length +
    ' languages'
)

/**
 * @param {Array<string>} list
 */
function generate(list) {
  return [
    '/**',
    " * @typedef {import('./core.js').RefractorRoot} RefractorRoot",
    " * @typedef {import('./core.js').RefractorElement} RefractorElement",
    " * @typedef {import('./core.js').Text} Text",
    " * @typedef {import('./core.js').Grammar} Grammar",
    " * @typedef {import('./core.js').Syntax} Syntax",
    ' */',
    ...list.map(
      (lang) => 'import ' + toId(lang) + " from '../lang/" + lang + ".js'"
    ),
    "import {refractor} from './core.js'",
    '',
    ...list.map((lang) => 'refractor.register(' + toId(lang) + ')'),
    '',
    "export {refractor} from './core.js'",
    ''
  ].join('\n')
}
