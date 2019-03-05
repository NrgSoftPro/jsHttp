const {Value} = require('@nrg/core')
const Url = require('./Url')

module.exports = class extends Value {

  get defaults () {
    return {
      apiUrl: '/',
      prettyUrl: false,
      routeVar: 'r'
    }
  }

  createUrl (route, queryParams = {}) {
    const url = new Url(this.apiUrl)

    if (this.prettyUrl) {
      url.joinPathname(route)
    } else {
      queryParams[this.routeVar] = route
    }

    url.mergeQueryParams(queryParams)

    return url
  }
}
