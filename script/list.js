import fs from 'fs'
import path from 'path'
import {bail} from 'bail'
import chalk from 'chalk'
import getLoader from 'prismjs/dependencies.js'
import {camelcase} from './camelcase.js'

var components = JSON.parse(
  String(
    fs.readFileSync(path.join('node_modules', 'prismjs', 'components.json'))
  )
)

var names = getLoader(
  components,
  Object.keys(components.languages).filter((d) => d !== 'meta')
).getIds()

fs.writeFile(
  'index.js',
  [
    "import {refractor} from './core.js'",
    ...names.map(
      (lang) => 'import ' + camelcase(lang) + " from './lang/" + lang + ".js'"
    ),
    '',
    'export {refractor}',
    ...names.map((lang) => 'refractor.register(' + camelcase(lang) + ')'),
    ''
  ].join('\n'),
  done
)

function done(error) {
  bail(error)
  console.log(
    chalk.green('✓') + ' wrote `index.js` for ' + names.length + ' languages'
  )
}
