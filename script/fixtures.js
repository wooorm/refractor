import fs from 'node:fs'
import path from 'node:path'
import Prism from 'prismjs'
import {rehype} from 'rehype'
import loadLanguages from 'prismjs/components/index.js'

loadLanguages()

const root = path.join('test', 'fixtures')
const files = fs.readdirSync(root)
const processor = rehype().use({settings: {fragment: true}})
let index = -1

while (++index < files.length) {
  const name = files[index]
  const lang = name.split('-')[0]

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
