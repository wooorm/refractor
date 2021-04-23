import refractorRuby from './ruby.js'
import refractorMarkupTemplating from './markup-templating.js'
erb.displayName = 'erb'
erb.aliases = []

export default function erb(Prism) {
  Prism.register(refractorRuby)
  Prism.register(refractorMarkupTemplating)
  ;(function (Prism) {
    Prism.languages.erb = Prism.languages.extend('ruby', {})
    Prism.languages.insertBefore('erb', 'comment', {
      delimiter: {
        pattern: /^<%=?|%>$/,
        alias: 'punctuation'
      }
    })
    Prism.hooks.add('before-tokenize', function (env) {
      var erbPattern = /<%=?(?:[^\r\n]|[\r\n](?!=begin)|[\r\n]=begin\s[\s\S]*?^=end)+?%>/gm
      Prism.languages['markup-templating'].buildPlaceholders(
        env,
        'erb',
        erbPattern
      )
    })
    Prism.hooks.add('after-tokenize', function (env) {
      Prism.languages['markup-templating'].tokenizePlaceholders(env, 'erb')
    })
  })(Prism)
}
