module.exports = class {

  constructor (data) {
    this.data = data
  }

  get statusCode () {
    return this.data.statusCode
  }

  get reasonPhrase () {
    return this.data.reasonPhrase
  }

  get details () {
    return this.data.details || {}
  }

  get debugInfo () {
    return this.data.debugInfo || {}
  }
}