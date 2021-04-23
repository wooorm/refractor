export function camelcase(string) {
  return string.replace(/-[a-z]/gi, replace)
  function replace($0) {
    return $0.charAt(1).toUpperCase()
  }
}
