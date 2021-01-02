'use strict'

var fs = require('fs')
var bail = require('bail')
var chalk = require('chalk')
var not = require('not')
var hidden = require('is-hidden')
var bundled = require('./bundled')

fs.readdir('lang', ondir)

function ondir(error, paths) {
  bail(error)

  paths = paths.filter(not(hidden)).filter(not(included)).map(load)

  fs.writeFile(
    'index.js',
    [
      "'use strict';",
      '',
      "var refractor = require('./core.js');",
      '',
      'module.exports = refractor;',
      '',
      paths.join('\n'),
      ''
    ].join('\n'),
    done
  )

  function done(error) {
    bail(error)
    console.log(
      chalk.green('✓') + ' wrote `index.js` for ' + paths.length + ' languages'
    )
  }
}

function load(lang) {
  return "refractor.register(require('./lang/" + lang + "'));"
}

function included(fp) {
  return bundled.indexOf(fp) !== -1
}
