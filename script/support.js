'use strict';

var fs = require('fs');
var zone = require('mdast-zone');
var u = require('unist-builder');
var not = require('not');
var hidden = require('is-hidden');
var alphaSort = require('alpha-sort');
var bundled = require('./bundled');

module.exports = syntaxes;

function syntaxes() {
  return transformer;
}

function transformer(tree) {
  zone(tree, 'support', replace);
}

function replace(start, nodes, end) {
  return [
    start,
    u('list', {ordered: false}, items()),
    end
  ];
}

function items() {
  return fs
    .readdirSync('lang')
    .filter(not(hidden))
    .filter(not(core))
    .sort(sort)
    .map(one);

  function one(fp) {
    var grammar = require('../lang/' + fp);
    var content = [
      u('link', {url: 'https://github.com/wooorm/refractor/blob/master/lang/' + fp}, [
        u('inlineCode', grammar.displayName)
      ])
    ];

    if (grammar.aliases.length !== 0) {
      content.push(u('text', ' — alias: '));
      grammar.aliases.forEach(function (alias, index) {
        if (index !== 0) {
          content.push(u('text', ', '));
        }
        content.push(u('inlineCode', alias));
      });
    }

    return u('listItem', {checked: included(fp)}, [u('paragraph', content)]);
  }
}

function included(fp) {
  return bundled.indexOf(fp) !== -1;
}

function core(fp) {
  return fp === 'core.js';
}

function sort(a, b) {
  if (included(a) && !included(b)) {
    return -1;
  }

  if (!included(a) && included(b)) {
    return 1;
  }

  return alphaSort.asc(a, b);
}
