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
var name
var lang
var baseline

while (++index < files.length) {
  name = files[index]
  lang = name.split('-')[0]

  baseline = processor.processSync(
    Prism.highlight(
      String(fs.readFileSync(path.join(root, name, 'input.txt'))).trim(),
      Prism.languages[lang],
      lang
    )
  )

  fs.writeFileSync(
    path.join(root, name, 'output.html'),
    String(baseline) + '\n'
  )
}
