// @ts-nocheck
/**
 * @import {Refractor} from '../lib/core.js'
 */
import refractorJavascript from './javascript.js'
n4js.displayName = 'n4js'
n4js.aliases = ['n4jsd']

/** @param {Refractor} Prism */
export default function n4js(Prism) {
  Prism.register(refractorJavascript)
  Prism.languages.n4js = Prism.languages.extend('javascript', {
    // Keywords from N4JS language spec: https://numberfour.github.io/n4js/spec/N4JSSpec.html
    keyword:
      /\b(?:Array|any|boolean|break|case|catch|class|const|constructor|continue|debugger|declare|default|delete|do|else|enum|export|extends|false|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|module|new|null|number|package|private|protected|public|return|set|static|string|super|switch|this|throw|true|try|typeof|var|void|while|with|yield)\b/
  })
  Prism.languages.insertBefore('n4js', 'constant', {
    // Annotations in N4JS spec: https://numberfour.github.io/n4js/spec/N4JSSpec.html#_annotations
    annotation: {
      pattern: /@+\w+/,
      alias: 'operator'
    }
  })
  Prism.languages.n4jsd = Prism.languages.n4js
}
