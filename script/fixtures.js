import fs from 'node:fs/promises'
import Prism from 'prismjs'
import {rehype} from 'rehype'
import loadLanguages from 'prismjs/components/index.js'

/* eslint-disable no-await-in-loop */

loadLanguages()

const root = new URL('../test/fixtures/', import.meta.url)
const files = await fs.readdir(root)
const processor = rehype().use({settings: {fragment: true}})
let index = -1

while (++index < files.length) {
  const name = files[index]
  const lang = name.split('-')[0]

  await fs.writeFile(
    new URL(name + '/output.html', root),
    String(
      processor.processSync(
        Prism.highlight(
          String(await fs.readFile(new URL(name + '/input.txt', root))).trim(),
          Prism.languages[lang],
          lang
        )
      )
    ) + '\n'
  )
}

/* eslint-enable no-await-in-loop */
