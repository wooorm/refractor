ini.displayName = 'ini'
ini.aliases = []

export default function ini(Prism) {
  Prism.languages.ini = {
    comment: /^[ \t]*[;#].*$/m,
    selector: /^[ \t]*\[.*?\]/m,
    constant: /^[ \t]*[^\s=]+?(?=[ \t]*=)/m,
    'attr-value': {
      pattern: /=.*/,
      inside: {
        punctuation: /^[=]/
      }
    }
  }
}
