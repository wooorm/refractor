'use strict';

var fs = require('fs');
var zone = require('mdast-zone');
var u = require('unist-builder');
var not = require('not');
var hidden = require('is-hidden');
var pkg = require('../package.json');

module.exports = count;

function count() {
  return transformer;
}

function transformer(tree) {
  zone(tree, 'count', replace);
}

function replace(start, nodes, end) {
  var langs = fs.readdirSync('lang').filter(not(hidden)).length;

  return [
    start,
    u('paragraph', [
      u('inlineCode', 'refractor'),
      u('text', ' is built to work with all syntaxes supported by '),
      u('linkReference', {identifier: 'prism', referenceType: 'collapsed'}, [u('text', 'Prism')]),
      u('text', ',\nthat’s '),
      u('linkReference', {identifier: 'names', referenceType: 'full'}, [u('text', langs + ' languages')]),
      u('text', ' (as of '),
      u('linkReference', {identifier: 'prismjs', referenceType: 'full'}, [u('text', 'prism@' + pkg.dependencies.prismjs.slice(1))]),
      u('text', ') and all\n7 '),
      u('linkReference', {identifier: 'themes', referenceType: 'collapsed'}, [u('text', 'themes')]),
      u('text', '.')
    ]),
    end
  ];
}
