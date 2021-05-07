/**
 * @param {string} string
 * @returns {string}
 */
export function camelcase(string) {
  return string.replace(/-[a-z]/gi, replace)
  /**
   * @param {string} $0
   * @returns {string}
   */
  function replace($0) {
    return $0.charAt(1).toUpperCase()
  }
}
