'use strict';

module.exports = json;
json.displayName = 'json';
json.aliases = ['jsonp'];
function json(Prism) {
  Prism.languages.json = {
    property: /"(?:\\.|[^\\"])*"(?=\s*:)/gi,
    string: /"(?!:)(?:\\.|[^\\"])*"(?!:)/g,
    number: /\b-?(0x[\dA-Fa-f]+|\d*\.?\d+([Ee][+-]?\d+)?)\b/g,
    punctuation: /[{}[\]);,]/g,
    operator: /:/g,
    boolean: /\b(true|false)\b/gi,
    null: /\bnull\b/gi
  };
  Prism.languages.jsonp = Prism.languages.json;
}
