import fs from 'fs'
import path from 'path'
import {bail} from 'bail'
import chalk from 'chalk'
import not from 'not'
import {isHidden} from 'is-hidden'
import {camelcase} from './camelcase.js'

var bundled = JSON.parse(
  String(fs.readFileSync(path.join('script', 'bundled.json')))
)

fs.readdir('lang', ondir)

function ondir(error, paths) {
  bail(error)

  var names = paths
    .filter(not(isHidden))
    .filter(not(included))
    .map((d) => path.basename(d, path.extname(d)))

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
}

function included(fp) {
  return bundled.includes(fp)
}
