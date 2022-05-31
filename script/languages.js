/**
 * @typedef {import('babel__core').PluginObj} PluginObj
 */

import fs from 'node:fs'
import path from 'node:path'
import {bail} from 'bail'
import chalk from 'chalk'
import async from 'async'
import babel from '@babel/core'
import {detab} from 'detab'
import {trimLines} from 'trim-lines'
import alphaSort from 'alpha-sort'
import {all} from './data.js'
import {toId} from './to-id.js'

/** @type {{languages: Record<string, {require: string|Array<string>, alias: string|Array<string>}>}} */
const components = JSON.parse(
  String(
    fs.readFileSync(path.join('node_modules', 'prismjs', 'components.json'))
  )
)

const prefix = 'refractor-'

async.map(all, generate, (error, results) => {
  bail(error)
  console.log(
    chalk.green('✓') + ' wrote ' + (results || []).length + ' languages'
  )
})

/**
 * @param {string} name
 * @param {(error: Error|null) => void} callback
 */
function generate(name, callback) {
  const id = toId(name)

  fs.readFile(
    path.join('node_modules', 'prismjs', 'components', 'prism-' + name + '.js'),
    (error, buf) => {
      if (error) {
        return callback(error)
      }

      const info = components.languages[name]
      const dependency = (
        typeof info.require === 'string' ? [info.require] : info.require || []
      ).sort(alphaSort())
      const alias = (
        typeof info.alias === 'string' ? [info.alias] : info.alias || []
      ).sort(alphaSort())

      /** @type {string} */
      // @ts-expect-error: TS is wrong.
      const doc = babel.transformSync(String(buf), {
        plugins: [fixWrapHook]
      }).code

      fs.writeFile(
        path.join('lang', name + '.js'),
        [
          '// @ts-nocheck',
          ...dependency.map(
            (lang) =>
              'import ' + toId(prefix + lang) + " from './" + lang + ".js'"
          ),
          id + ".displayName = '" + name + "'",
          id + '.aliases = ' + JSON.stringify(alias),
          '',
          "/** @type {import('../core.js').Syntax} */",
          'export default function ' + id + '(Prism) {',
          ...dependency.map(
            (lang) => '  Prism.register(' + toId(prefix + lang) + ');'
          ),
          trimLines(detab(doc)),
          '}'
        ].join('\n'),
        callback
      )
    }
  )
}

/**
 * @returns {PluginObj}
 */
function fixWrapHook() {
  const t = babel.types

  return {
    visitor: {
      // We only perform the later changes inside `wrap` hooks, just to be safe.
      CallExpression: {
        enter(path) {
          if (!path.get('callee').matchesPattern('Prism.hooks.add')) return

          const arg = path.get('arguments.0')

          if ('type' in arg && arg.isStringLiteral({value: 'wrap'})) {
            this.inWrapHook = true
          }
        },
        exit(path) {
          if (!path.get('callee').matchesPattern('Prism.hooks.add')) return

          const arg = path.get('arguments.0')

          if ('type' in arg && arg.isStringLiteral({value: 'wrap'})) {
            this.inWrapHook = false
          }
        }
      },
      // If a syntax is assigning `Prism.highlight` to `env.content`, we should
      // add the result to `env.content` instead of `env.content.value`.
      AssignmentExpression: {
        enter(path) {
          const callee = path.get('right.callee')
          if (
            'type' in callee &&
            callee.matchesPattern('Prism.highlight') &&
            path.get('left').matchesPattern('env.content')
          ) {
            // @ts-expect-error Mutate.
            path.get('left').node.ignoreValueSuffix = true
          }
        }
      },
      // If a syntax is using `env.content`, it probably expects a string value,
      // those are stored at `env.content.value`.
      MemberExpression: {
        enter(path) {
          if (
            this.inWrapHook &&
            // @ts-expect-error Mutate.
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
