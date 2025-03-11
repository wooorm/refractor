import fs from 'node:fs/promises'
import loadLanguages from 'prismjs/components/index.js'
import Prism from 'prismjs'
import {rehype} from 'rehype'

loadLanguages()

const root = new URL('../test/fixtures/', import.meta.url)
const files = await fs.readdir(root)
const processor = rehype().use({settings: {fragment: true}})
let index = -1

while (++index < files.length) {
  const name = files[index]
  const lang = name.split('-')[0]
  const input = await fs.readFile(new URL(name + '/input.txt', root), 'utf8')

  await fs.writeFile(
    new URL(name + '/output.html', root),
    processor
      .processSync(Prism.highlight(input.trim(), Prism.languages[lang], lang))
      .toString() + '\n'
  )
}
