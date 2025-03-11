import fs from 'node:fs/promises'
import chalk from 'chalk'
import {all, common} from './data.js'
import {toId} from './to-id.js'

await fs.writeFile(new URL('../lib/all.js', import.meta.url), generate(all))
await fs.writeFile(
  new URL('../lib/common.js', import.meta.url),
  generate(common)
)

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
 * @param {ReadonlyArray<string>} list
 *   List of languages.
 * @returns {string}
 *   Document.
 */
function generate(list) {
  const lines = [
    '/**',
    ' * @import {',
    ' *   Grammar,',
    ' *   RefractorElement,',
    ' *   RefractorRoot,',
    ' *   Syntax,',
    ' *   Text',
    " * } from './core.js'",
    ' */'
  ]

  for (const lang of list) {
    lines.push('import ' + toId(lang) + " from '../lang/" + lang + ".js'")
  }

  lines.push("import {refractor} from './core.js'", '')

  for (const lang of list) {
    lines.push('refractor.register(' + toId(lang) + ')')
  }

  lines.push('', "export {refractor} from './core.js'", '')

  return lines.join('\n')
}
