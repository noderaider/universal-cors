import rewire from 'rewire'
const should = require('chai').should()

describe('lib', () => {
  const lib = rewire('../lib')
  const cors = lib.default
  const { origins } = lib

  describe('origins', () => {
    it('should exist', () => should.exist(origins))
    it('should be a function', () => origins.should.be.a('function'))
    it('should throw for no input', () => (() => origins()).should.throw())
    it('should return an object with function isOk for single non-regex pattern', () => {
      const result = origins({ patterns: 'http://www.cors.com' })
      should.exist(result)
      result.should.be.an('object')
      result.should.have.property('isOk')
                        .that.is.a('function')
    })
    it('should return an object with function isOk for non-regex patterns array', () => {
      const result = origins({ patterns: ['http://www.cors.com', 'https://someexample.com'] })
      should.exist(result)
      result.should.be.an('object')
      result.should.have.property('isOk')
                        .that.is.a('function')
    })
    it('should return an object with function isOk for single regex pattern', () => {
      const result = origins({ patterns: /^http:\/\/.*\.cors\.com/i })
      should.exist(result)
      result.should.be.an('object')
      result.should.have.property('isOk')
                        .that.is.a('function')
    })
    it('should return an object with function isOk for regex patterns array', () => {
      const result = origins({ patterns: [/^http:\/\/.*\.cors\.com/i, /^http:\/\/.*\.someexample\.com/i] })
      should.exist(result)
      result.should.be.an('object')
      result.should.have.property('isOk')
                        .that.is.a('function')
    })
  })

  describe('cors', () => {
    it('should exist', () => should.exist(cors))
    it('should be a function', () => cors.should.be.a('function'))
    it('should throw for no input', () => (() => cors()).should.throw())
    it('should return a function for single non-regex pattern', () => cors({ patterns: 'http://www.cors.com' }).should.be.a('function'))
    it('should return a function for non-regex patterns array', () => cors({ patterns: ['http://www.cors.com', 'https://someexample.com'] }).should.be.a('function'))
    it('should return a function for single regex pattern', () => cors({ patterns: /^http:\/\/.*\.cors\.com/i }).should.be.a('function'))
    it('should return a function for regex patterns array', () => cors({ patterns: [/^http:\/\/.*\.cors\.com/i, /^http:\/\/.*\.someexample\.com/i] }).should.be.a('function'))
  })

})
