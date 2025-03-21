// @ts-nocheck
/**
 * @import {Refractor} from '../lib/core.js'
 */
hoon.displayName = 'hoon'
hoon.aliases = []

/** @param {Refractor} Prism */
export default function hoon(Prism) {
  Prism.languages.hoon = {
    comment: {
      pattern: /::.*/,
      greedy: true
    },
    string: {
      pattern: /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/,
      greedy: true
    },
    constant: /%(?:\.[ny]|[\w-]+)/,
    'class-name': /@(?:[a-z0-9-]*[a-z0-9])?|\*/i,
    function: /(?:\+[-+] {2})?(?:[a-z](?:[a-z0-9-]*[a-z0-9])?)/,
    keyword:
      /\.[\^\+\*=\?]|![><:\.=\?!]|=[>|:,\.\-\^<+;/~\*\?]|\?[>|:\.\-\^<\+&~=@!]|\|[\$_%:\.\-\^~\*=@\?]|\+[|\$\+\*]|:[_\-\^\+~\*]|%[_:\.\-\^\+~\*=]|\^[|:\.\-\+&~\*=\?]|\$[|_%:<>\-\^&~@=\?]|;[:<\+;\/~\*=]|~[>|\$_%<\+\/&=\?!]|--|==/
  }
}
