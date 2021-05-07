import fs from 'fs'
import path from 'path'
import Prism from 'prismjs'
import rehype from 'rehype'
import loadLanguages from 'prismjs/components/index.js'

loadLanguages()

var root = path.join('test', 'fixtures')
var files = fs.readdirSync(root)
var processor = rehype().use({settings: {fragment: true}})
var index = -1
/** @type {string} */
var name
/** @type {string} */
var lang

while (++index < files.length) {
  name = files[index]
  lang = name.split('-')[0]

  fs.writeFileSync(
    path.join(root, name, 'output.html'),
    String(
      processor.processSync(
        Prism.highlight(
          String(fs.readFileSync(path.join(root, name, 'input.txt'))).trim(),
          Prism.languages[lang],
          lang
        )
      )
    ) + '\n'
  )
}
