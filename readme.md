# refractor

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]

Lightweight, robust, elegant virtual syntax highlighting using [Prism][].
Useful for virtual DOMs and non-HTML things.
Perfect for [React][], [VDOM][], and others.

`refractor` is built to work with all syntaxes supported by \[highlight.js]\[].
There are three builds:

<!--count start-->

*   `lib/core.js` — 0 languages
*   `lib/common.js` (default) — 36 languages
*   `lib/all.js` — 271 languages

<!--count end-->

Want to use [`highlight.js`][hljs] instead?
Try [`lowlight`][lowlight]!

## Contents

*   [Install](#install)
*   [Use](#use)
*   [Demo](#demo)
*   [API](#api)
    *   [`refractor.register(syntax)`](#refractorregistersyntax)
    *   [`refractor.alias(name[, alias])`](#refractoraliasname-alias)
    *   [`refractor.highlight(value, language)`](#refractorhighlightvalue-language)
    *   [`refractor.registered(language)`](#refractorregisteredlanguage)
    *   [`refractor.listLanguages()`](#refractorlistlanguages)
*   [Browser](#browser)
*   [Plugins](#plugins)
*   [Syntaxes](#syntaxes)
*   [Related](#related)
*   [Projects](#projects)

## Install

This package is [ESM only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c):
Node 12+ is needed to use it and it must be `import`ed instead of `require`d.

[npm][]:

```sh
npm install refractor
```

[Use in the browser »][browser]

## Use

```js
import {refractor} from 'refractor'

var root = refractor.highlight('"use strict";', 'js')

console.log(root)
```

Yields:

```js
{
  type: 'root',
  children: [
    {
      type: 'element',
      tagName: 'span',
      properties: {className: ['token', 'string']},
      children: [{type: 'text', value: '"use strict"'}]
    },
    {
      type: 'element',
      tagName: 'span',
      properties: {className: ['token', 'punctuation']},
      children: [{type: 'text', value: ';'}]
    }
  ]
}
```

Which serialized with [`hast-util-to-html`][to-html] (or [`rehype`][rehype])
yields:

```html
<span class="token string">"use strict"</span><span class="token punctuation">;</span>
```

> **Tip**: Use [`hast-to-hyperscript`][to-hyperscript] to transform to other
> virtual DOMs, or DIY.

## Demo

Try out an [interactive demo (Replit)](https://replit.com/@karlhorky/official-refractor-demo#index.js)

## API

This package exports the following identifiers: `refractor`.
There is no default export.

### `refractor.register(syntax)`

Register a [syntax][].
Needed if you’re using [`refractor/core`][browser].

###### Example

```js
import {refractor} from 'refractor/core.js'
import markdown from 'refractor/lang/markdown.js'

refractor.register(markdown)

console.log(refractor.highlight('*Emphasis*', 'markdown'))
```

Yields:

```js
{
  type: 'root',
  children: [
    {type: 'element', tagName: 'span', properties: [Object], children: [Array]}
  ]
}
```

### `refractor.alias(name[, alias])`

Register a new `alias` for the `name` language.

###### Signatures

*   `alias(name, alias|list)`
*   `alias(aliases)`

###### Parameters

*   `name` (`string`) — [Name][names] of a registered language
*   `alias` (`string`) — New alias for the registered language
*   `list` (`Array.<alias>`) — List of aliases
*   `aliases` (`Object.<alias|list>`) — Map where each key is a `name` and each
    value an `alias` or a `list`

###### Example

```js
import {refractor} from 'refractor/core.js'
import markdown from 'refractor/lang/markdown.js'

refractor.register(markdown)

// refractor.highlight('*Emphasis*', 'mdown')
// ^ would throw: Error: Unknown language: `mdown` is not registered

refractor.alias({markdown: ['mdown', 'mkdn', 'mdwn', 'ron']})
refractor.highlight('*Emphasis*', 'mdown')
// ^ Works!
```

### `refractor.highlight(value, language)`

Parse `value` (`string`) according to the `language` ([name or alias][syntax])
syntax.

###### Returns

Virtual node representing the highlighted value ([`Root`][root]).

###### Example

```js
import {refractor} from 'refractor/core.js'
import css from 'refractor/lang/css.js'

refractor.register(css)
console.log(refractor.highlight('em { color: red }', 'css'))
```

Yields:

```js
{
  type: 'root',
  children: [
    {type: 'element', tagName: 'span', properties: [Object], children: [Array]},
    {type: 'text', value: ' '},
    // …
    {type: 'text', value: ' red '},
    {type: 'element', tagName: 'span', properties: [Object], children: [Array]}
  ]
}
```

### `refractor.registered(language)`

Check if a `language` ([name or alias][syntax]) is registered.

###### Example

```js
import {refractor} from 'refractor/core.js'
import markdown from 'refractor/lang/markdown.js'

console.log(refractor.registered('markdown'))

refractor.register(markdown)

console.log(refractor.registered('markdown'))
```

Yields:

```js
false
true
```

### `refractor.listLanguages()`

List all registered languages ([names and aliases][syntax]).

###### Returns

`Array.<string>`.

###### Example

```js
import {refractor} from 'refractor/core.js'
import markdown from 'refractor/lang/markdown.js'

console.log(refractor.listLanguages())

refractor.register(markdown)

console.log(refractor.listLanguages())
```

Yields:

```js
[]
[
  'markup', // Note that `markup` (a lot of xml based languages) is a dep of markdown.
  'html',
  // …
  'markdown',
  'md'
]
```

## Browser

It is not suggested to import `refractor` itself in the browser as that would
include a 500kb (187kb minzipped) of code.

Instead import `refractor/lib/core.js` and include only the needed syntaxes.
For example:

```js
import {refractor} from 'refractor/lib/core.js';
import jsx from 'refractor/lang/jsx.js'

refractor.register(jsx)

console.log(refractor.highlight('<Dropdown primary />', 'jsx'))
```

…when using esbuild this results in 35.8kB of code (14kb minzipped).

## Plugins

`refractor` does not support Prism plugins:

1.  Prism plugins often deal with the DOM, not Prism tokens
2.  Prism is made using global variables instead of a module format, so all
    syntaxes below are custom built to work so you can import just what you
    need

## Syntaxes

If you’re using `refractor/lib/core.js`, no syntaxes are included.
Checked syntaxes are included if you import `refractor` (or
`refractor/lib/common.js`).
Unchecked syntaxes are available through `refractor/lib/all.js`.

Note that Prism works as a singleton.
That means that if you register a syntax anywhere in your project, it’ll
become available everywhere!

Only these custom built syntaxes will work with `refractor` because Prism’s own
syntaxes are made to work with global variables and are not requirable.

<!--support start-->

*   [x] [`arduino`](https://github.com/wooorm/refractor/blob/main/lang/arduino.js)
*   [x] [`bash`](https://github.com/wooorm/refractor/blob/main/lang/bash.js) — alias: `shell`
*   [x] [`basic`](https://github.com/wooorm/refractor/blob/main/lang/basic.js)
*   [x] [`c`](https://github.com/wooorm/refractor/blob/main/lang/c.js)
*   [x] [`clike`](https://github.com/wooorm/refractor/blob/main/lang/clike.js)
*   [x] [`cpp`](https://github.com/wooorm/refractor/blob/main/lang/cpp.js)
*   [x] [`csharp`](https://github.com/wooorm/refractor/blob/main/lang/csharp.js) — alias: `cs`, `dotnet`
*   [x] [`css`](https://github.com/wooorm/refractor/blob/main/lang/css.js)
*   [x] [`diff`](https://github.com/wooorm/refractor/blob/main/lang/diff.js)
*   [x] [`go`](https://github.com/wooorm/refractor/blob/main/lang/go.js)
*   [x] [`ini`](https://github.com/wooorm/refractor/blob/main/lang/ini.js)
*   [x] [`java`](https://github.com/wooorm/refractor/blob/main/lang/java.js)
*   [x] [`javascript`](https://github.com/wooorm/refractor/blob/main/lang/javascript.js) — alias: `js`
*   [x] [`json`](https://github.com/wooorm/refractor/blob/main/lang/json.js) — alias: `webmanifest`
*   [x] [`kotlin`](https://github.com/wooorm/refractor/blob/main/lang/kotlin.js) — alias: `kt`, `kts`
*   [x] [`less`](https://github.com/wooorm/refractor/blob/main/lang/less.js)
*   [x] [`lua`](https://github.com/wooorm/refractor/blob/main/lang/lua.js)
*   [x] [`makefile`](https://github.com/wooorm/refractor/blob/main/lang/makefile.js)
*   [x] [`markdown`](https://github.com/wooorm/refractor/blob/main/lang/markdown.js) — alias: `md`
*   [x] [`markup`](https://github.com/wooorm/refractor/blob/main/lang/markup.js) — alias: `atom`, `html`, `mathml`, `rss`, `ssml`, `svg`, `xml`
*   [x] [`markup-templating`](https://github.com/wooorm/refractor/blob/main/lang/markup-templating.js)
*   [x] [`objectivec`](https://github.com/wooorm/refractor/blob/main/lang/objectivec.js) — alias: `objc`
*   [x] [`perl`](https://github.com/wooorm/refractor/blob/main/lang/perl.js)
*   [x] [`php`](https://github.com/wooorm/refractor/blob/main/lang/php.js)
*   [x] [`python`](https://github.com/wooorm/refractor/blob/main/lang/python.js) — alias: `py`
*   [x] [`r`](https://github.com/wooorm/refractor/blob/main/lang/r.js)
*   [x] [`regex`](https://github.com/wooorm/refractor/blob/main/lang/regex.js)
*   [x] [`ruby`](https://github.com/wooorm/refractor/blob/main/lang/ruby.js) — alias: `rb`
*   [x] [`rust`](https://github.com/wooorm/refractor/blob/main/lang/rust.js)
*   [x] [`sass`](https://github.com/wooorm/refractor/blob/main/lang/sass.js)
*   [x] [`scss`](https://github.com/wooorm/refractor/blob/main/lang/scss.js)
*   [x] [`sql`](https://github.com/wooorm/refractor/blob/main/lang/sql.js)
*   [x] [`swift`](https://github.com/wooorm/refractor/blob/main/lang/swift.js)
*   [x] [`typescript`](https://github.com/wooorm/refractor/blob/main/lang/typescript.js) — alias: `ts`
*   [x] [`vbnet`](https://github.com/wooorm/refractor/blob/main/lang/vbnet.js)
*   [x] [`yaml`](https://github.com/wooorm/refractor/blob/main/lang/yaml.js) — alias: `yml`
*   [ ] [`abap`](https://github.com/wooorm/refractor/blob/main/lang/abap.js)
*   [ ] [`abnf`](https://github.com/wooorm/refractor/blob/main/lang/abnf.js)
*   [ ] [`actionscript`](https://github.com/wooorm/refractor/blob/main/lang/actionscript.js)
*   [ ] [`ada`](https://github.com/wooorm/refractor/blob/main/lang/ada.js)
*   [ ] [`agda`](https://github.com/wooorm/refractor/blob/main/lang/agda.js)
*   [ ] [`al`](https://github.com/wooorm/refractor/blob/main/lang/al.js)
*   [ ] [`antlr4`](https://github.com/wooorm/refractor/blob/main/lang/antlr4.js) — alias: `g4`
*   [ ] [`apacheconf`](https://github.com/wooorm/refractor/blob/main/lang/apacheconf.js)
*   [ ] [`apex`](https://github.com/wooorm/refractor/blob/main/lang/apex.js)
*   [ ] [`apl`](https://github.com/wooorm/refractor/blob/main/lang/apl.js)
*   [ ] [`applescript`](https://github.com/wooorm/refractor/blob/main/lang/applescript.js)
*   [ ] [`aql`](https://github.com/wooorm/refractor/blob/main/lang/aql.js)
*   [ ] [`arff`](https://github.com/wooorm/refractor/blob/main/lang/arff.js)
*   [ ] [`asciidoc`](https://github.com/wooorm/refractor/blob/main/lang/asciidoc.js) — alias: `adoc`
*   [ ] [`asm6502`](https://github.com/wooorm/refractor/blob/main/lang/asm6502.js)
*   [ ] [`aspnet`](https://github.com/wooorm/refractor/blob/main/lang/aspnet.js)
*   [ ] [`autohotkey`](https://github.com/wooorm/refractor/blob/main/lang/autohotkey.js)
*   [ ] [`autoit`](https://github.com/wooorm/refractor/blob/main/lang/autoit.js)
*   [ ] [`avisynth`](https://github.com/wooorm/refractor/blob/main/lang/avisynth.js) — alias: `avs`
*   [ ] [`avro-idl`](https://github.com/wooorm/refractor/blob/main/lang/avro-idl.js) — alias: `avdl`
*   [ ] [`batch`](https://github.com/wooorm/refractor/blob/main/lang/batch.js)
*   [ ] [`bbcode`](https://github.com/wooorm/refractor/blob/main/lang/bbcode.js) — alias: `shortcode`
*   [ ] [`bicep`](https://github.com/wooorm/refractor/blob/main/lang/bicep.js)
*   [ ] [`birb`](https://github.com/wooorm/refractor/blob/main/lang/birb.js)
*   [ ] [`bison`](https://github.com/wooorm/refractor/blob/main/lang/bison.js)
*   [ ] [`bnf`](https://github.com/wooorm/refractor/blob/main/lang/bnf.js) — alias: `rbnf`
*   [ ] [`brainfuck`](https://github.com/wooorm/refractor/blob/main/lang/brainfuck.js)
*   [ ] [`brightscript`](https://github.com/wooorm/refractor/blob/main/lang/brightscript.js)
*   [ ] [`bro`](https://github.com/wooorm/refractor/blob/main/lang/bro.js)
*   [ ] [`bsl`](https://github.com/wooorm/refractor/blob/main/lang/bsl.js) — alias: `oscript`
*   [ ] [`cfscript`](https://github.com/wooorm/refractor/blob/main/lang/cfscript.js) — alias: `cfc`
*   [ ] [`chaiscript`](https://github.com/wooorm/refractor/blob/main/lang/chaiscript.js)
*   [ ] [`cil`](https://github.com/wooorm/refractor/blob/main/lang/cil.js)
*   [ ] [`clojure`](https://github.com/wooorm/refractor/blob/main/lang/clojure.js)
*   [ ] [`cmake`](https://github.com/wooorm/refractor/blob/main/lang/cmake.js)
*   [ ] [`cobol`](https://github.com/wooorm/refractor/blob/main/lang/cobol.js)
*   [ ] [`coffeescript`](https://github.com/wooorm/refractor/blob/main/lang/coffeescript.js) — alias: `coffee`
*   [ ] [`concurnas`](https://github.com/wooorm/refractor/blob/main/lang/concurnas.js) — alias: `conc`
*   [ ] [`coq`](https://github.com/wooorm/refractor/blob/main/lang/coq.js)
*   [ ] [`crystal`](https://github.com/wooorm/refractor/blob/main/lang/crystal.js)
*   [ ] [`cshtml`](https://github.com/wooorm/refractor/blob/main/lang/cshtml.js) — alias: `razor`
*   [ ] [`csp`](https://github.com/wooorm/refractor/blob/main/lang/csp.js)
*   [ ] [`css-extras`](https://github.com/wooorm/refractor/blob/main/lang/css-extras.js)
*   [ ] [`csv`](https://github.com/wooorm/refractor/blob/main/lang/csv.js)
*   [ ] [`cypher`](https://github.com/wooorm/refractor/blob/main/lang/cypher.js)
*   [ ] [`d`](https://github.com/wooorm/refractor/blob/main/lang/d.js)
*   [ ] [`dart`](https://github.com/wooorm/refractor/blob/main/lang/dart.js)
*   [ ] [`dataweave`](https://github.com/wooorm/refractor/blob/main/lang/dataweave.js)
*   [ ] [`dax`](https://github.com/wooorm/refractor/blob/main/lang/dax.js)
*   [ ] [`dhall`](https://github.com/wooorm/refractor/blob/main/lang/dhall.js)
*   [ ] [`django`](https://github.com/wooorm/refractor/blob/main/lang/django.js) — alias: `jinja2`
*   [ ] [`dns-zone-file`](https://github.com/wooorm/refractor/blob/main/lang/dns-zone-file.js) — alias: `dns-zone`
*   [ ] [`docker`](https://github.com/wooorm/refractor/blob/main/lang/docker.js) — alias: `dockerfile`
*   [ ] [`dot`](https://github.com/wooorm/refractor/blob/main/lang/dot.js) — alias: `gv`
*   [ ] [`ebnf`](https://github.com/wooorm/refractor/blob/main/lang/ebnf.js)
*   [ ] [`editorconfig`](https://github.com/wooorm/refractor/blob/main/lang/editorconfig.js)
*   [ ] [`eiffel`](https://github.com/wooorm/refractor/blob/main/lang/eiffel.js)
*   [ ] [`ejs`](https://github.com/wooorm/refractor/blob/main/lang/ejs.js) — alias: `eta`
*   [ ] [`elixir`](https://github.com/wooorm/refractor/blob/main/lang/elixir.js)
*   [ ] [`elm`](https://github.com/wooorm/refractor/blob/main/lang/elm.js)
*   [ ] [`erb`](https://github.com/wooorm/refractor/blob/main/lang/erb.js)
*   [ ] [`erlang`](https://github.com/wooorm/refractor/blob/main/lang/erlang.js)
*   [ ] [`etlua`](https://github.com/wooorm/refractor/blob/main/lang/etlua.js)
*   [ ] [`excel-formula`](https://github.com/wooorm/refractor/blob/main/lang/excel-formula.js) — alias: `xls`, `xlsx`
*   [ ] [`factor`](https://github.com/wooorm/refractor/blob/main/lang/factor.js)
*   [ ] [`false`](https://github.com/wooorm/refractor/blob/main/lang/false.js)
*   [ ] [`firestore-security-rules`](https://github.com/wooorm/refractor/blob/main/lang/firestore-security-rules.js)
*   [ ] [`flow`](https://github.com/wooorm/refractor/blob/main/lang/flow.js)
*   [ ] [`fortran`](https://github.com/wooorm/refractor/blob/main/lang/fortran.js)
*   [ ] [`fsharp`](https://github.com/wooorm/refractor/blob/main/lang/fsharp.js)
*   [ ] [`ftl`](https://github.com/wooorm/refractor/blob/main/lang/ftl.js)
*   [ ] [`gap`](https://github.com/wooorm/refractor/blob/main/lang/gap.js)
*   [ ] [`gcode`](https://github.com/wooorm/refractor/blob/main/lang/gcode.js)
*   [ ] [`gdscript`](https://github.com/wooorm/refractor/blob/main/lang/gdscript.js)
*   [ ] [`gedcom`](https://github.com/wooorm/refractor/blob/main/lang/gedcom.js)
*   [ ] [`gherkin`](https://github.com/wooorm/refractor/blob/main/lang/gherkin.js)
*   [ ] [`git`](https://github.com/wooorm/refractor/blob/main/lang/git.js)
*   [ ] [`glsl`](https://github.com/wooorm/refractor/blob/main/lang/glsl.js)
*   [ ] [`gml`](https://github.com/wooorm/refractor/blob/main/lang/gml.js) — alias: `gamemakerlanguage`
*   [ ] [`gn`](https://github.com/wooorm/refractor/blob/main/lang/gn.js) — alias: `gni`
*   [ ] [`graphql`](https://github.com/wooorm/refractor/blob/main/lang/graphql.js)
*   [ ] [`groovy`](https://github.com/wooorm/refractor/blob/main/lang/groovy.js)
*   [ ] [`haml`](https://github.com/wooorm/refractor/blob/main/lang/haml.js)
*   [ ] [`handlebars`](https://github.com/wooorm/refractor/blob/main/lang/handlebars.js) — alias: `hbs`
*   [ ] [`haskell`](https://github.com/wooorm/refractor/blob/main/lang/haskell.js) — alias: `hs`
*   [ ] [`haxe`](https://github.com/wooorm/refractor/blob/main/lang/haxe.js)
*   [ ] [`hcl`](https://github.com/wooorm/refractor/blob/main/lang/hcl.js)
*   [ ] [`hlsl`](https://github.com/wooorm/refractor/blob/main/lang/hlsl.js)
*   [ ] [`hoon`](https://github.com/wooorm/refractor/blob/main/lang/hoon.js)
*   [ ] [`hpkp`](https://github.com/wooorm/refractor/blob/main/lang/hpkp.js)
*   [ ] [`hsts`](https://github.com/wooorm/refractor/blob/main/lang/hsts.js)
*   [ ] [`http`](https://github.com/wooorm/refractor/blob/main/lang/http.js)
*   [ ] [`ichigojam`](https://github.com/wooorm/refractor/blob/main/lang/ichigojam.js)
*   [ ] [`icon`](https://github.com/wooorm/refractor/blob/main/lang/icon.js)
*   [ ] [`icu-message-format`](https://github.com/wooorm/refractor/blob/main/lang/icu-message-format.js)
*   [ ] [`idris`](https://github.com/wooorm/refractor/blob/main/lang/idris.js) — alias: `idr`
*   [ ] [`iecst`](https://github.com/wooorm/refractor/blob/main/lang/iecst.js)
*   [ ] [`ignore`](https://github.com/wooorm/refractor/blob/main/lang/ignore.js) — alias: `gitignore`, `hgignore`, `npmignore`
*   [ ] [`inform7`](https://github.com/wooorm/refractor/blob/main/lang/inform7.js)
*   [ ] [`io`](https://github.com/wooorm/refractor/blob/main/lang/io.js)
*   [ ] [`j`](https://github.com/wooorm/refractor/blob/main/lang/j.js)
*   [ ] [`javadoc`](https://github.com/wooorm/refractor/blob/main/lang/javadoc.js)
*   [ ] [`javadoclike`](https://github.com/wooorm/refractor/blob/main/lang/javadoclike.js)
*   [ ] [`javastacktrace`](https://github.com/wooorm/refractor/blob/main/lang/javastacktrace.js)
*   [ ] [`jexl`](https://github.com/wooorm/refractor/blob/main/lang/jexl.js)
*   [ ] [`jolie`](https://github.com/wooorm/refractor/blob/main/lang/jolie.js)
*   [ ] [`jq`](https://github.com/wooorm/refractor/blob/main/lang/jq.js)
*   [ ] [`js-extras`](https://github.com/wooorm/refractor/blob/main/lang/js-extras.js)
*   [ ] [`js-templates`](https://github.com/wooorm/refractor/blob/main/lang/js-templates.js)
*   [ ] [`jsdoc`](https://github.com/wooorm/refractor/blob/main/lang/jsdoc.js)
*   [ ] [`json5`](https://github.com/wooorm/refractor/blob/main/lang/json5.js)
*   [ ] [`jsonp`](https://github.com/wooorm/refractor/blob/main/lang/jsonp.js)
*   [ ] [`jsstacktrace`](https://github.com/wooorm/refractor/blob/main/lang/jsstacktrace.js)
*   [ ] [`jsx`](https://github.com/wooorm/refractor/blob/main/lang/jsx.js)
*   [ ] [`julia`](https://github.com/wooorm/refractor/blob/main/lang/julia.js)
*   [ ] [`keyman`](https://github.com/wooorm/refractor/blob/main/lang/keyman.js)
*   [ ] [`kumir`](https://github.com/wooorm/refractor/blob/main/lang/kumir.js) — alias: `kum`
*   [ ] [`kusto`](https://github.com/wooorm/refractor/blob/main/lang/kusto.js)
*   [ ] [`latex`](https://github.com/wooorm/refractor/blob/main/lang/latex.js) — alias: `context`, `tex`
*   [ ] [`latte`](https://github.com/wooorm/refractor/blob/main/lang/latte.js)
*   [ ] [`lilypond`](https://github.com/wooorm/refractor/blob/main/lang/lilypond.js) — alias: `ly`
*   [ ] [`liquid`](https://github.com/wooorm/refractor/blob/main/lang/liquid.js)
*   [ ] [`lisp`](https://github.com/wooorm/refractor/blob/main/lang/lisp.js) — alias: `elisp`, `emacs`, `emacs-lisp`
*   [ ] [`livescript`](https://github.com/wooorm/refractor/blob/main/lang/livescript.js)
*   [ ] [`llvm`](https://github.com/wooorm/refractor/blob/main/lang/llvm.js)
*   [ ] [`log`](https://github.com/wooorm/refractor/blob/main/lang/log.js)
*   [ ] [`lolcode`](https://github.com/wooorm/refractor/blob/main/lang/lolcode.js)
*   [ ] [`magma`](https://github.com/wooorm/refractor/blob/main/lang/magma.js)
*   [ ] [`matlab`](https://github.com/wooorm/refractor/blob/main/lang/matlab.js)
*   [ ] [`maxscript`](https://github.com/wooorm/refractor/blob/main/lang/maxscript.js)
*   [ ] [`mel`](https://github.com/wooorm/refractor/blob/main/lang/mel.js)
*   [ ] [`mermaid`](https://github.com/wooorm/refractor/blob/main/lang/mermaid.js)
*   [ ] [`mizar`](https://github.com/wooorm/refractor/blob/main/lang/mizar.js)
*   [ ] [`mongodb`](https://github.com/wooorm/refractor/blob/main/lang/mongodb.js)
*   [ ] [`monkey`](https://github.com/wooorm/refractor/blob/main/lang/monkey.js)
*   [ ] [`moonscript`](https://github.com/wooorm/refractor/blob/main/lang/moonscript.js) — alias: `moon`
*   [ ] [`n1ql`](https://github.com/wooorm/refractor/blob/main/lang/n1ql.js)
*   [ ] [`n4js`](https://github.com/wooorm/refractor/blob/main/lang/n4js.js) — alias: `n4jsd`
*   [ ] [`nand2tetris-hdl`](https://github.com/wooorm/refractor/blob/main/lang/nand2tetris-hdl.js)
*   [ ] [`naniscript`](https://github.com/wooorm/refractor/blob/main/lang/naniscript.js) — alias: `nani`
*   [ ] [`nasm`](https://github.com/wooorm/refractor/blob/main/lang/nasm.js)
*   [ ] [`neon`](https://github.com/wooorm/refractor/blob/main/lang/neon.js)
*   [ ] [`nevod`](https://github.com/wooorm/refractor/blob/main/lang/nevod.js)
*   [ ] [`nginx`](https://github.com/wooorm/refractor/blob/main/lang/nginx.js)
*   [ ] [`nim`](https://github.com/wooorm/refractor/blob/main/lang/nim.js)
*   [ ] [`nix`](https://github.com/wooorm/refractor/blob/main/lang/nix.js)
*   [ ] [`nsis`](https://github.com/wooorm/refractor/blob/main/lang/nsis.js)
*   [ ] [`ocaml`](https://github.com/wooorm/refractor/blob/main/lang/ocaml.js)
*   [ ] [`opencl`](https://github.com/wooorm/refractor/blob/main/lang/opencl.js)
*   [ ] [`openqasm`](https://github.com/wooorm/refractor/blob/main/lang/openqasm.js) — alias: `qasm`
*   [ ] [`oz`](https://github.com/wooorm/refractor/blob/main/lang/oz.js)
*   [ ] [`parigp`](https://github.com/wooorm/refractor/blob/main/lang/parigp.js)
*   [ ] [`parser`](https://github.com/wooorm/refractor/blob/main/lang/parser.js)
*   [ ] [`pascal`](https://github.com/wooorm/refractor/blob/main/lang/pascal.js) — alias: `objectpascal`
*   [ ] [`pascaligo`](https://github.com/wooorm/refractor/blob/main/lang/pascaligo.js)
*   [ ] [`pcaxis`](https://github.com/wooorm/refractor/blob/main/lang/pcaxis.js) — alias: `px`
*   [ ] [`peoplecode`](https://github.com/wooorm/refractor/blob/main/lang/peoplecode.js) — alias: `pcode`
*   [ ] [`php-extras`](https://github.com/wooorm/refractor/blob/main/lang/php-extras.js)
*   [ ] [`phpdoc`](https://github.com/wooorm/refractor/blob/main/lang/phpdoc.js)
*   [ ] [`plsql`](https://github.com/wooorm/refractor/blob/main/lang/plsql.js)
*   [ ] [`powerquery`](https://github.com/wooorm/refractor/blob/main/lang/powerquery.js) — alias: `mscript`, `pq`
*   [ ] [`powershell`](https://github.com/wooorm/refractor/blob/main/lang/powershell.js)
*   [ ] [`processing`](https://github.com/wooorm/refractor/blob/main/lang/processing.js)
*   [ ] [`prolog`](https://github.com/wooorm/refractor/blob/main/lang/prolog.js)
*   [ ] [`promql`](https://github.com/wooorm/refractor/blob/main/lang/promql.js)
*   [ ] [`properties`](https://github.com/wooorm/refractor/blob/main/lang/properties.js)
*   [ ] [`protobuf`](https://github.com/wooorm/refractor/blob/main/lang/protobuf.js)
*   [ ] [`psl`](https://github.com/wooorm/refractor/blob/main/lang/psl.js)
*   [ ] [`pug`](https://github.com/wooorm/refractor/blob/main/lang/pug.js)
*   [ ] [`puppet`](https://github.com/wooorm/refractor/blob/main/lang/puppet.js)
*   [ ] [`pure`](https://github.com/wooorm/refractor/blob/main/lang/pure.js)
*   [ ] [`purebasic`](https://github.com/wooorm/refractor/blob/main/lang/purebasic.js) — alias: `pbfasm`
*   [ ] [`purescript`](https://github.com/wooorm/refractor/blob/main/lang/purescript.js) — alias: `purs`
*   [ ] [`q`](https://github.com/wooorm/refractor/blob/main/lang/q.js)
*   [ ] [`qml`](https://github.com/wooorm/refractor/blob/main/lang/qml.js)
*   [ ] [`qore`](https://github.com/wooorm/refractor/blob/main/lang/qore.js)
*   [ ] [`qsharp`](https://github.com/wooorm/refractor/blob/main/lang/qsharp.js) — alias: `qs`
*   [ ] [`racket`](https://github.com/wooorm/refractor/blob/main/lang/racket.js) — alias: `rkt`
*   [ ] [`reason`](https://github.com/wooorm/refractor/blob/main/lang/reason.js)
*   [ ] [`rego`](https://github.com/wooorm/refractor/blob/main/lang/rego.js)
*   [ ] [`renpy`](https://github.com/wooorm/refractor/blob/main/lang/renpy.js) — alias: `rpy`
*   [ ] [`rest`](https://github.com/wooorm/refractor/blob/main/lang/rest.js)
*   [ ] [`rip`](https://github.com/wooorm/refractor/blob/main/lang/rip.js)
*   [ ] [`roboconf`](https://github.com/wooorm/refractor/blob/main/lang/roboconf.js)
*   [ ] [`robotframework`](https://github.com/wooorm/refractor/blob/main/lang/robotframework.js) — alias: `robot`
*   [ ] [`sas`](https://github.com/wooorm/refractor/blob/main/lang/sas.js)
*   [ ] [`scala`](https://github.com/wooorm/refractor/blob/main/lang/scala.js)
*   [ ] [`scheme`](https://github.com/wooorm/refractor/blob/main/lang/scheme.js)
*   [ ] [`shell-session`](https://github.com/wooorm/refractor/blob/main/lang/shell-session.js) — alias: `sh-session`, `shellsession`
*   [ ] [`smali`](https://github.com/wooorm/refractor/blob/main/lang/smali.js)
*   [ ] [`smalltalk`](https://github.com/wooorm/refractor/blob/main/lang/smalltalk.js)
*   [ ] [`smarty`](https://github.com/wooorm/refractor/blob/main/lang/smarty.js)
*   [ ] [`sml`](https://github.com/wooorm/refractor/blob/main/lang/sml.js) — alias: `smlnj`
*   [ ] [`solidity`](https://github.com/wooorm/refractor/blob/main/lang/solidity.js) — alias: `sol`
*   [ ] [`solution-file`](https://github.com/wooorm/refractor/blob/main/lang/solution-file.js) — alias: `sln`
*   [ ] [`soy`](https://github.com/wooorm/refractor/blob/main/lang/soy.js)
*   [ ] [`sparql`](https://github.com/wooorm/refractor/blob/main/lang/sparql.js) — alias: `rq`
*   [ ] [`splunk-spl`](https://github.com/wooorm/refractor/blob/main/lang/splunk-spl.js)
*   [ ] [`sqf`](https://github.com/wooorm/refractor/blob/main/lang/sqf.js)
*   [ ] [`squirrel`](https://github.com/wooorm/refractor/blob/main/lang/squirrel.js)
*   [ ] [`stan`](https://github.com/wooorm/refractor/blob/main/lang/stan.js)
*   [ ] [`stylus`](https://github.com/wooorm/refractor/blob/main/lang/stylus.js)
*   [ ] [`systemd`](https://github.com/wooorm/refractor/blob/main/lang/systemd.js)
*   [ ] [`t4-cs`](https://github.com/wooorm/refractor/blob/main/lang/t4-cs.js) — alias: `t4`
*   [ ] [`t4-templating`](https://github.com/wooorm/refractor/blob/main/lang/t4-templating.js)
*   [ ] [`t4-vb`](https://github.com/wooorm/refractor/blob/main/lang/t4-vb.js)
*   [ ] [`tap`](https://github.com/wooorm/refractor/blob/main/lang/tap.js)
*   [ ] [`tcl`](https://github.com/wooorm/refractor/blob/main/lang/tcl.js)
*   [ ] [`textile`](https://github.com/wooorm/refractor/blob/main/lang/textile.js)
*   [ ] [`toml`](https://github.com/wooorm/refractor/blob/main/lang/toml.js)
*   [ ] [`tsx`](https://github.com/wooorm/refractor/blob/main/lang/tsx.js)
*   [ ] [`tt2`](https://github.com/wooorm/refractor/blob/main/lang/tt2.js)
*   [ ] [`turtle`](https://github.com/wooorm/refractor/blob/main/lang/turtle.js) — alias: `trig`
*   [ ] [`twig`](https://github.com/wooorm/refractor/blob/main/lang/twig.js)
*   [ ] [`typoscript`](https://github.com/wooorm/refractor/blob/main/lang/typoscript.js) — alias: `tsconfig`
*   [ ] [`unrealscript`](https://github.com/wooorm/refractor/blob/main/lang/unrealscript.js) — alias: `uc`, `uscript`
*   [ ] [`uri`](https://github.com/wooorm/refractor/blob/main/lang/uri.js) — alias: `url`
*   [ ] [`v`](https://github.com/wooorm/refractor/blob/main/lang/v.js)
*   [ ] [`vala`](https://github.com/wooorm/refractor/blob/main/lang/vala.js)
*   [ ] [`velocity`](https://github.com/wooorm/refractor/blob/main/lang/velocity.js)
*   [ ] [`verilog`](https://github.com/wooorm/refractor/blob/main/lang/verilog.js)
*   [ ] [`vhdl`](https://github.com/wooorm/refractor/blob/main/lang/vhdl.js)
*   [ ] [`vim`](https://github.com/wooorm/refractor/blob/main/lang/vim.js)
*   [ ] [`visual-basic`](https://github.com/wooorm/refractor/blob/main/lang/visual-basic.js) — alias: `vb`, `vba`
*   [ ] [`warpscript`](https://github.com/wooorm/refractor/blob/main/lang/warpscript.js)
*   [ ] [`wasm`](https://github.com/wooorm/refractor/blob/main/lang/wasm.js)
*   [ ] [`wiki`](https://github.com/wooorm/refractor/blob/main/lang/wiki.js)
*   [ ] [`wolfram`](https://github.com/wooorm/refractor/blob/main/lang/wolfram.js) — alias: `mathematica`, `nb`, `wl`
*   [ ] [`wren`](https://github.com/wooorm/refractor/blob/main/lang/wren.js)
*   [ ] [`xeora`](https://github.com/wooorm/refractor/blob/main/lang/xeora.js) — alias: `xeoracube`
*   [ ] [`xml-doc`](https://github.com/wooorm/refractor/blob/main/lang/xml-doc.js)
*   [ ] [`xojo`](https://github.com/wooorm/refractor/blob/main/lang/xojo.js)
*   [ ] [`xquery`](https://github.com/wooorm/refractor/blob/main/lang/xquery.js)
*   [ ] [`yang`](https://github.com/wooorm/refractor/blob/main/lang/yang.js)
*   [ ] [`zig`](https://github.com/wooorm/refractor/blob/main/lang/zig.js)

<!--support end-->

## Related

*   [`lowlight`][lowlight] — Same, but based on [`highlight.js`][hljs]

## Projects

*   [`react-syntax-highlighter`](https://github.com/conorhastings/react-syntax-highlighter)
    — [React][] component for syntax highlighting
*   [`rehype-prism`](https://github.com/mapbox/rehype-prism)
    — Syntax highlighting in [**rehype**](https://github.com/rehypejs/rehype)
*   [`react-refractor`](https://github.com/rexxars/react-refractor)
    — Syntax highlighter for [React][]

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://github.com/wooorm/refractor/workflows/main/badge.svg

[build]: https://github.com/wooorm/refractor/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/wooorm/refractor.svg

[coverage]: https://codecov.io/github/wooorm/refractor

[downloads-badge]: https://img.shields.io/npm/dm/refractor.svg

[downloads]: https://www.npmjs.com/package/refractor

[size-badge]: https://img.shields.io/bundlephobia/minzip/refractor.svg

[size]: https://bundlephobia.com/result?p=refractor

[npm]: https://www.npmjs.com/package/refractor/tutorial

[license]: license

[author]: https://wooorm.com

[rehype]: https://github.com/rehypejs/rehype

[names]: https://prismjs.com/#languages-list

[react]: https://facebook.github.io/react/

[vdom]: https://github.com/Matt-Esch/virtual-dom

[to-hyperscript]: https://github.com/syntax-tree/hast-to-hyperscript

[to-html]: https://github.com/syntax-tree/hast-util-to-html

[browser]: #browser

[prism]: https://github.com/PrismJS/prism

[lowlight]: https://github.com/wooorm/lowlight

[hljs]: https://github.com/isagalaev/highlight.js

[root]: https://github.com/syntax-tree/hast#root

[syntax]: #syntaxes
