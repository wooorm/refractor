var isKeyword = require('is-keyword')

module.exports = toId

function toId(string) {
  const id = string.replace(/-[a-z]/gi, replace)

  return isKeyword(id) ? '$' + id : id

  function replace($0) {
    return $0.charAt(1).toUpperCase()
  }
}
