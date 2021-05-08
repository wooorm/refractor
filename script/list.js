import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import {camelcase} from './camelcase.js'
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
 * @param {Array.<string>} list
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
    "import {refractor} from './core.js'",
    ...list.map(
      (lang) => 'import ' + camelcase(lang) + " from '../lang/" + lang + ".js'"
    ),
    '',
    'export {refractor}',
    ...list.map((lang) => 'refractor.register(' + camelcase(lang) + ')'),
    ''
  ].join('\n')
}
