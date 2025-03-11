import fs from 'node:fs/promises'
import {toHtml} from 'hast-util-to-html'
import {fromHtml} from 'hast-util-from-html'
import loadLanguages from 'prismjs/components/index.js'
import Prism from 'prismjs'

loadLanguages()

const root = new URL('../test/fixtures/', import.meta.url)
const files = await fs.readdir(root)

for (const name of files) {
  const lang = name.split('-')[0]
  const input = await fs.readFile(new URL(name + '/input.txt', root), 'utf8')

  await fs.writeFile(
    new URL(name + '/output.html', root),
    toHtml(
      fromHtml(Prism.highlight(input.trim(), Prism.languages[lang], lang), {
        fragment: true
      })
    ) + '\n'
  )
}
