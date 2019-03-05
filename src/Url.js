const url = require('url')
const QueryString = require('./QueryString')

module.exports = class {

  constructor (href) {
    const props = url.parse(href)

    this.protocol = props.protocol
    this.auth = props.auth
    this.hostname = props.hostname
    this.port = props.port
    this.pathname = props.pathname
    this.query = props.query
    this.hash = props.hash
  }

  get search () {
    return `?${this.query}`
  }

  get queryParams () {
    const params = {}
    if (this.query) {
      QueryString.parse(this.query, params)
    }

    return params
  }

  joinPathname (path) {
    this.pathname = url.resolve(this.pathname.replace(/\/$/g, ''), path.replace(/^\//g, ''))
  }

  mergeQueryParams (params) {
    this.query = QueryString.stringify({...this.queryParams, ...params})
  }

  toString () {
    return url.format(this)
  }
}
