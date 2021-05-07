import fs from 'fs'
import path from 'path'
import {zone} from 'mdast-zone'
import {u} from 'unist-builder'

var pkg = JSON.parse(String(fs.readFileSync('package.json')))

var {languages} = JSON.parse(
  String(
    fs.readFileSync(path.join('node_modules', 'prismjs', 'components.json'))
  )
)

var langs = Object.keys(languages).filter((d) => d !== 'meta').length

export default function count() {
  return transformer
}

function transformer(tree) {
  zone(tree, 'count', replace)
}

function replace(start, nodes, end) {
  return [
    start,
    u('paragraph', [
      u('inlineCode', 'refractor'),
      u('text', ' is built to work with all syntaxes supported by '),
      u('linkReference', {identifier: 'Prism'}, [u('text', 'Prism')]),
      u('text', ',\nthat’s '),
      u('linkReference', {identifier: 'names'}, [
        u('text', langs + ' languages')
      ]),
      u('text', ' (as of '),
      u('linkReference', {identifier: 'prismjs'}, [
        u('inlineCode', 'prism@' + pkg.dependencies.prismjs.slice(1))
      ]),
      u('text', ') and all\n'),
      u('linkReference', {identifier: 'themes'}, [u('text', 'themes')]),
      u('text', '.')
    ]),
    end
  ]
}
