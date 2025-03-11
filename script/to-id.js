// @ts-expect-error: untyped.
import isKeyword from 'is-keyword'

/**
 * @param {string} string
 *   Input.
 * @returns {string}
 *   Output.
 */
export function toId(string) {
  const id = string.replace(/-[a-z]/gi, replace)

  return isKeyword(id) ? '$' + id : id
}

/**
 * @param {string} $0
 *   Match.
 * @returns {string}
 *   Replacement.
 */
function replace($0) {
  return $0.charAt(1).toUpperCase()
}
