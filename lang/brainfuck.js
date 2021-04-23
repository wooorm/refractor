brainfuck.displayName = 'brainfuck'
brainfuck.aliases = []

export default function brainfuck(Prism) {
  Prism.languages.brainfuck = {
    pointer: {
      pattern: /<|>/,
      alias: 'keyword'
    },
    increment: {
      pattern: /\+/,
      alias: 'inserted'
    },
    decrement: {
      pattern: /-/,
      alias: 'deleted'
    },
    branching: {
      pattern: /\[|\]/,
      alias: 'important'
    },
    operator: /[.,]/,
    comment: /\S+/
  }
}
