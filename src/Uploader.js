const {Component} = require('@nrg/core')
const ClientException = require('./ClientException')
const ValidationException = require('./ValidationException')
const DomainException = require('./DomainException')
const InternalException = require('./InternalException')
const UnauthorizedException = require('./UnauthorizedException')

module.exports = class extends Component {

  upload (file) {
    this.http = new XMLHttpRequest()
    this.http.upload.onprogress = (...args) => this.trigger('progress', ...args)

    return new Promise((resolve, reject) => {
      this.http.onerror = () => {
        reject(new ClientException({
          statusCode: this.http.status,
          reasonPhrase: 'Network error has occured'
        }))
      }

      this.http.onload = () => {
        const json = JSON.parse(this.http.response || '{}')

        switch (this.http.status) {
          case 200:
          case 201:
          case 204:
            return resolve(json)
          case 400:
            return reject(new DomainException(json))
          case 401:
            return reject(new UnauthorizedException(json))
          case 422:
            return reject(new ValidationException(json))
          case 500:
            return reject(new InternalException(json))
          default:
            return reject(new ClientException(json))
        }
      }

      this.http.open('POST', this.url, true)

      for (const [key, value] of Object.entries(this.headers || {})) {
        this.http.setRequestHeader(key, value)
      }

      const body = new FormData()
      for (const [key, value] of Object.entries(this.bodyParams || {})) {
        body.append(key, value)
      }
      body.append('file', file)

      this.http.send(body)
    })
  }

  abort () {
    this.http.abort()
  }
}