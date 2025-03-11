/**
 * @import {PluginObj} from 'babel__core'
 */

import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import babel from '@babel/core'
import alphaSort from 'alpha-sort'
import chalk from 'chalk'
import {detab} from 'detab'
import {trimLines} from 'trim-lines'
import {all} from './data.js'
import {toId} from './to-id.js'

/** @type {{languages: Record<string, {alias: Array<string> | string, require: Array<string> | string}>}} */
const components = JSON.parse(
  await fs.readFile(
    new URL('../node_modules/prismjs/components.json', import.meta.url),
    'utf8'
  )
)

const prefix = 'refractor-'

/** @type {Array<Promise<undefined>>} */
const promises = []

for (const d of all) {
  promises.push(generate(d))
}

await Promise.all(promises)

console.log(chalk.green('✓') + ' wrote ' + promises.length + ' languages')

/**
 * @param {string} name
 *   Language name.
 * @returns {Promise<undefined>}
 *   Promise to nothing.
 */
async function generate(name) {
  const id = toId(name)
  const input = await fs.readFile(
    new URL(
      '../node_modules/prismjs/components/prism-' + name + '.js',
      import.meta.url
    ),
    'utf8'
  )

  const info = components.languages[name]
  const dependency = (
    typeof info.require === 'string' ? [info.require] : info.require || []
  ).sort(alphaSort())
  const alias = (
    typeof info.alias === 'string' ? [info.alias] : info.alias || []
  ).sort(alphaSort())

  const result = babel.transformSync(input, {plugins: [fixWrapHook]})
  assert(result, 'expected `result`')
  let code = result.code
  assert(code, 'expected `code`')

  if (id === 'markdown') {
    // A useless function only used in `markdown` for us: our `value` is
    // already text content.
    code = code.replace(
      /textContent\(env\.content\.value\)/,
      'env.content.value'
    )
  }

  const lines = [
    '// @ts-nocheck',
    '/**',
    " * @import {Syntax} from '../core.js'",
    ' */'
  ]

  for (const lang of dependency) {
    lines.push('import ' + toId(prefix + lang) + " from './" + lang + ".js'")
  }

  lines.push(
    id + ".displayName = '" + name + "'",
    id + '.aliases = ' + JSON.stringify(alias),
    '',
    '/** @type {Syntax} */',
    'export default function ' + id + '(Prism) {'
  )

  for (const lang of dependency) {
    lines.push('  Prism.register(' + toId(prefix + lang) + ');')
  }

  lines.push(trimLines(detab(code)), '}', '')

  await fs.writeFile(
    new URL('../lang/' + name + '.js', import.meta.url),
    lines.join('\n')
  )
}

/**
 * @returns {PluginObj}
 *   Babel plugin.
 */
function fixWrapHook() {
  const t = babel.types

  return {
    visitor: {
      // If a syntax is assigning `Prism.highlight` to `env.content`, we should
      // add the result to `env.content` instead of `env.content.value`.
      // This is currently only done for markdown.
      AssignmentExpression: {
        enter(path) {
          const callee = path.get('right.callee')
          if (
            'type' in callee &&
            callee.matchesPattern('Prism.highlight') &&
            path.get('left').matchesPattern('env.content')
          ) {
            // @ts-expect-error Patch custom field, handled next.
            path.get('left').node.ignoreValueSuffix = true
          }
        }
      },
      // We only perform the later changes inside `wrap` hooks, just to be safe.
      CallExpression: {
        enter(path) {
          if (!path.get('callee').matchesPattern('Prism.hooks.add')) return

          const head = path.get('arguments.0')

          if ('type' in head && head.isStringLiteral({value: 'wrap'})) {
            this.inWrapHook = true
          }
        },
        exit(path) {
          if (!path.get('callee').matchesPattern('Prism.hooks.add')) return

          const head = path.get('arguments.0')

          if ('type' in head && head.isStringLiteral({value: 'wrap'})) {
            this.inWrapHook = false
          }
        }
      },
      // If a syntax is using `env.content`, it probably expects a string value,
      // those are stored at `env.content.value`.
      MemberExpression: {
        enter(path) {
          if (
            this.inWrapHook &&
            // @ts-expect-error Patched custom field.
            !path.node.ignoreValueSuffix &&
            path.matchesPattern('env.content')
          ) {
            path.node.object = t.memberExpression(
              path.node.object,
              t.identifier('content')
            )

            if ('name' in path.node.property) {
              path.node.property.name = 'value'
            }

            path.removed = true
          }
        }
      }
    }
  }
}
