const should = require('chai').should()

const normalizePattern = pattern => pattern instanceof RegExp ? pattern : new RegExp(pattern)


const originDoesNotMatch = origin => `Origin [${origin}] did not match acceptable patterns. Request has been rejected.`
const originDoesNotExist = 'Origin did not exist. Request has been rejected.'


const FAILURE_STATUS =  { code: 403
                        , message: '403 Forbidden'
                        }

const getError = req => {
  return req.headers.origin ? { message: originDoesNotMatch(req.headers.origin)
                              , code: 10
                              }
                            : { message: originDoesNotExist
                              , code: 11
                              }
}


const handleFailure = (req, res) => {
  res.writeHead(FAILURE_STATUS.code)
  res.end (JSON.stringify({ message: FAILURE_STATUS.message
                          , errors: [ getError(req) ]
                          }))
}

export function origins({ patterns, tracing = false, logger = console, logLevel = 'debug' } = {}) {
  should.exist(patterns, 'universal-cors requires CORS origin "patterns" argument property to be passed. "patterns" can be a string, an array of string, a regex, or an array of regex.')
  const log = (...args) => tracing ? logger[logLevel](...args) : () => {}
  patterns = Array.isArray(patterns) ? patterns.map(normalizePattern) : [normalizePattern(patterns)]
  const isOk = req => {
    if(!req.headers.origin)
      return true
    return patterns.some(pattern => {
      if(pattern.test(req.headers.origin)) {
        log('origin [%s] matches pattern [%s]', req.headers.origin, pattern)
        return true
      } else {
        return false
      }
    })
  }
  return { isOk }
}


export default function cors({ patterns, preflight = req => {}, tracing = false, logger = console, logLevel = 'debug' } = {}) {
  const log = (...args) => tracing ? logger[logLevel](...args) : () => {}
  const { isOk } = origins({ patterns, tracing, logger, logLevel })

  return (req, res, next = () => { log('proxy middleware executed') }) => {
    if(req.method === 'OPTIONS' && preflight) {
      res.writeHead(200, preflight(req))
      res.end()
      log('preflight 200 response sent')
    } else {
      try {
        const resolvedOrigin = req.headers.origin || req.headers.host
        if(!resolvedOrigin)
          log('no resolved origin, bypassing cors ok check')
        if(resolvedOrigin && isOk(req)) {
          /** Cors ok, write the appropriate headers. */
          if(req.headers.origin) {
	    res.setHeader('Access-Control-Allow-Origin', req.headers.origin)
            log('proxy +origin [%s], method [%s]', req.headers.host, req.method)
          } else if(req.headers.host) {
            log('proxy +host [%s], method [%s]', req.headers.host, req.method)
          }
          res.setHeader('Access-Control-Allow-Credentials', true)
        } else {
        /** Cors not ok, do not write the appropriate headers. */
          if(req.headers.origin) {
            logger.error('proxy -origin [%s], method [%s]', req.headers.host, req.method)
          } else {
            log('proxy -host [%s], method [%s]', req.headers.host, req.method)
          }
	}
      } catch(err) {
        logger.error('unexpected cors error', err)
      } finally {
        next()
      }
    }
  }
}
