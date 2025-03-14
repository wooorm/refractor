// @ts-nocheck
/**
 * @import {Refractor} from '../lib/core.js'
 */
import refractorYaml from './yaml.js'
tap.displayName = 'tap'
tap.aliases = []

/** @param {Refractor} Prism */
export default function tap(Prism) {
  Prism.register(refractorYaml)
  // https://en.wikipedia.org/wiki/Test_Anything_Protocol

  Prism.languages.tap = {
    fail: /not ok[^#{\n\r]*/,
    pass: /ok[^#{\n\r]*/,
    pragma: /pragma [+-][a-z]+/,
    bailout: /bail out!.*/i,
    version: /TAP version \d+/i,
    plan: /\b\d+\.\.\d+(?: +#.*)?/,
    subtest: {
      pattern: /# Subtest(?:: .*)?/,
      greedy: true
    },
    punctuation: /[{}]/,
    directive: /#.*/,
    yamlish: {
      pattern: /(^[ \t]*)---[\s\S]*?[\r\n][ \t]*\.\.\.$/m,
      lookbehind: true,
      inside: Prism.languages.yaml,
      alias: 'language-yaml'
    }
  }
}
