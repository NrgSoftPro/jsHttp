const arrayToObject = Symbol()

const self = class {

  static stringify (object, prefix) {
    const str = []

    for (let [property, value] of Object.entries(object)) {
      const key = prefix ? prefix + '[' + property + ']' : property

      if (Array.isArray(value)) {
        value = self[arrayToObject](value, true)
      }

      str.push(typeof value === 'object' ? self.stringify(value, key) :
        encodeURIComponent(key) + '=' + encodeURIComponent(value))
    }

    return str.join('&')
  }

  static parse (str, array) {
    let strArr = String(str).replace(/^&/, '').replace(/&$/, '').split('&')
    let sal = strArr.length
    let i, j, ct, p, lastObj, obj, chr, tmp, key, value, postLeftBracketPos, keys, keysLen

    for (i = 0; i < sal; i++) {
      tmp = strArr[i].split('=')
      key = decodeURIComponent(tmp[0])
      value = (tmp.length < 2) ? '' : decodeURIComponent(tmp[1])

      while (key.charAt(0) === ' ') {
        key = key.slice(1)
      }

      if (key.indexOf('\x00') > -1) {
        key = key.slice(0, key.indexOf('\x00'))
      }

      if (key && key.charAt(0) !== '[') {
        keys = []
        postLeftBracketPos = 0

        for (j = 0; j < key.length; j++) {
          if (key.charAt(j) === '[' && !postLeftBracketPos) {
            postLeftBracketPos = j + 1
          } else if (key.charAt(j) === ']') {
            if (postLeftBracketPos) {
              if (!keys.length) {
                keys.push(key.slice(0, postLeftBracketPos - 1))
              }

              keys.push(key.substr(postLeftBracketPos, j - postLeftBracketPos))
              postLeftBracketPos = 0

              if (key.charAt(j + 1) !== '[') {
                break
              }
            }
          }
        }

        if (!keys.length) {
          keys = [key]
        }

        for (j = 0; j < keys[0].length; j++) {
          chr = keys[0].charAt(j)

          if (chr === ' ' || chr === '.' || chr === '[') {
            keys[0] = keys[0].substr(0, j) + '_' + keys[0].substr(j + 1)
          }

          if (chr === '[') {
            break
          }
        }

        obj = array
        for (j = 0, keysLen = keys.length; j < keysLen; j++) {
          key = keys[j].replace(/^['"]/, '').replace(/['"]$/, '')
          lastObj = obj
          if ((key === '' || key === ' ') && j !== 0) {
            ct = -1
            for (p in obj) {
              if (obj.hasOwnProperty(p)) {
                if (+p > ct && p.match(/^\d+$/g)) {
                  ct = +p
                }
              }
            }
            key = ct + 1
          }

          if (Object(obj[key]) !== obj[key]) {
            obj[key] = {}
          }

          obj = obj[key]
        }

        lastObj[key] = value
      }
    }
  }

  static [arrayToObject] (arr, recursively) {
    const obj = {}

    arr.forEach((value, i) => {
      if (recursively && Array.isArray(value)) {
        value = self[arrayToObject](value, recursively)
      }
      obj[i] = value
    })

    return obj
  }
}

module.exports = self