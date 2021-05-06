import fs from 'fs'
import {zone} from 'mdast-zone'
import not from 'not'
import {u} from 'unist-builder'
import {isHidden} from 'is-hidden'

var pkg = JSON.parse(String(fs.readFileSync('package.json')))

export default function count() {
  return transformer
}

function transformer(tree) {
  zone(tree, 'count', replace)
}

function replace(start, nodes, end) {
  var langs = fs.readdirSync('lang').filter(not(isHidden)).length

  return [
    start,
    u('paragraph', [
      u('inlineCode', 'refractor'),
      u('text', ' is built to work with all syntaxes supported by '),
      u('linkReference', {identifier: 'Prism', referenceType: 'collapsed'}, [
        u('text', 'Prism')
      ]),
      u('text', ',\nthat’s '),
      u('linkReference', {identifier: 'names', referenceType: 'full'}, [
        u('text', langs + ' languages')
      ]),
      u('text', ' (as of '),
      u('linkReference', {identifier: 'prismjs', referenceType: 'full'}, [
        u('inlineCode', 'prism@' + pkg.dependencies.prismjs.slice(1))
      ]),
      u('text', ') and all\n'),
      u('linkReference', {identifier: 'themes', referenceType: 'collapsed'}, [
        u('text', 'themes')
      ]),
      u('text', '.')
    ]),
    end
  ]
}
