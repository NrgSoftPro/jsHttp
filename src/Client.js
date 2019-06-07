const {Value} = require('@nrg/core')
const Uploader = require('./Uploader')
const ClientException = require('./ClientException')
const ValidationException = require('./ValidationException')
const DomainException = require('./DomainException')
const InternalException = require('./InternalException')
const UnauthorizedException = require('./UnauthorizedException')

module.exports = class extends Value {

  static get services () {
    return {
      endpoint: 'endpoint',
      authControl: 'authControl'
    }
  }

  get defaults () {
    return {
      schema: 'Bearer',
      authorization: () => (`${this.schema} ${this.authControl.accessToken}`),
      headers: () => ({Authorization: this.authorization()})
    }
  }

  async post (route, data = {}, queryParams = {}, options = {}) {
    return await this.fetch(route, queryParams, {
      ...options,
      method: 'POST',
      body: data
    })
  }

  async get (route, queryParams = {}, options = {}) {
    return await this.fetch(route, queryParams, {
      ...options,
      method: 'GET'
    })
  }

  async fetch (route, queryParams = {}, request = {}) {
    const url = this.createUrl(route, queryParams)
    const options = {
      ...request,
      body: JSON.stringify(request.body || {}),
      headers: {...this.headers(), ...request.headers || {}}
    }

    const response = await fetch(url, options)

    if (204 === response.status) {
      return null
    }

    const json = await response.json()

    if (response.ok) {
      return json
    }

    switch (response.status) {
      case 400:
        throw new DomainException(json)
      case 401:
        throw new UnauthorizedException(json)
      case 422:
        throw new ValidationException(json)
      case 500:
        throw new InternalException(json)
      default:
        throw new ClientException(json)
    }
  }

  createFileUploader (route, queryParams = {}, bodyParams = {}, request = {}) {
    return this.injector.createObject(Uploader, {
      url: this.createUrl(route, queryParams),
      headers: {...this.headers(), ...request.headers || {}},
      bodyParams
    })
  }

  createUrl (route, queryParams = {}) {
    return this.endpoint.createUrl(route, queryParams)
  }
}