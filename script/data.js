import fs from 'node:fs'
import path from 'node:path'
// @ts-expect-error: untyped.
import getLoader from 'prismjs/dependencies.js'

/** @type {{languages: Record<string, unknown>}} */
const components = JSON.parse(
  String(
    fs.readFileSync(path.join('node_modules', 'prismjs', 'components.json'))
  )
)

const allLanguages = Object.keys(components.languages).filter(
  (d) => d !== 'meta'
)

/** @type {Array<string>} */
export const all = getLoader(components, allLanguages).getIds()

/** @type {Array<string>} */
export const common = getLoader(components, [
  // These are alphabetical, but they are exported in registration order.
  // They are based on the languages that lowlight exports as common,
  // which is in turn based on what highlight.js treats as common.
  // <https://github.com/wooorm/lowlight/blob/bf79fd1/script/build-registry.js#L39>
  // <https://github.com/wooorm/lowlight/blob/main/lib/common.js>
  'arduino',
  'bash',
  'clike',
  'cpp',
  'csharp',
  'css',
  'diff',
  'go',
  'ini',
  'java',
  'javascript',
  'json',
  'kotlin',
  'less',
  'lua',
  'makefile',
  'markdown',
  'markup',
  'objectivec',
  'perl',
  'php',
  'python',
  'r',
  'regex',
  'ruby',
  'rust',
  'sass',
  'scss',
  'sql',
  'swift',
  'typescript',
  'vbnet',
  'yaml'
]).getIds()
