// @ts-expect-error: untyped.
import isKeyword from 'is-keyword'

/**
 * @param {string} string
 * @returns {string}
 */
export function toId(string) {
  const id = string.replace(/-[a-z]/gi, replace)

  return isKeyword(id) ? '$' + id : id
}

/**
 * @param {string} $0
 * @returns {string}
 */
function replace($0) {
  return $0.charAt(1).toUpperCase()
}
