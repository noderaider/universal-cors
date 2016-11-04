'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.origins = origins;
exports.default = cors;
var should = require('chai').should();

var normalizePattern = function normalizePattern(pattern) {
  return pattern instanceof RegExp ? pattern : new RegExp(pattern);
};

var originDoesNotMatch = function originDoesNotMatch(origin) {
  return 'Origin [' + origin + '] did not match acceptable patterns. Request has been rejected.';
};
var originDoesNotExist = 'Origin did not exist. Request has been rejected.';

var FAILURE_STATUS = { code: 403,
  message: '403 Forbidden'
};

var getError = function getError(req) {
  return req.headers.origin ? { message: originDoesNotMatch(req.headers.origin),
    code: 10
  } : { message: originDoesNotExist,
    code: 11
  };
};

var handleFailure = function handleFailure(req, res) {
  res.writeHead(FAILURE_STATUS.code);
  res.end(JSON.stringify({ message: FAILURE_STATUS.message,
    errors: [getError(req)]
  }));
};

function origins() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      patterns = _ref.patterns,
      _ref$tracing = _ref.tracing,
      tracing = _ref$tracing === undefined ? false : _ref$tracing,
      _ref$logger = _ref.logger,
      logger = _ref$logger === undefined ? console : _ref$logger,
      _ref$logLevel = _ref.logLevel,
      logLevel = _ref$logLevel === undefined ? 'debug' : _ref$logLevel;

  should.exist(patterns, 'universal-cors requires CORS origin "patterns" argument property to be passed. "patterns" can be a string, an array of string, a regex, or an array of regex.');
  var log = function log() {
    return tracing ? logger[logLevel].apply(logger, arguments) : function () {};
  };
  patterns = Array.isArray(patterns) ? patterns.map(normalizePattern) : [normalizePattern(patterns)];
  var isOk = function isOk(req) {
    if (!req.headers.origin) return true;
    return patterns.some(function (pattern) {
      if (pattern.test(req.headers.origin)) {
        log('origin [%s] matches pattern [%s]', req.headers.origin, pattern);
        return true;
      } else {
        return false;
      }
    });
  };
  return { isOk: isOk };
}

function cors() {
  var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      patterns = _ref2.patterns,
      _ref2$preflight = _ref2.preflight,
      preflight = _ref2$preflight === undefined ? function (req) {} : _ref2$preflight,
      _ref2$tracing = _ref2.tracing,
      tracing = _ref2$tracing === undefined ? false : _ref2$tracing,
      _ref2$logger = _ref2.logger,
      logger = _ref2$logger === undefined ? console : _ref2$logger,
      _ref2$logLevel = _ref2.logLevel,
      logLevel = _ref2$logLevel === undefined ? 'debug' : _ref2$logLevel;

  var log = function log() {
    return tracing ? logger[logLevel].apply(logger, arguments) : function () {};
  };

  var _origins = origins({ patterns: patterns, tracing: tracing, logger: logger, logLevel: logLevel }),
      isOk = _origins.isOk;

  return function (req, res) {
    var next = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function () {
      log('proxy middleware executed');
    };

    if (req.method === 'OPTIONS' && preflight) {
      res.writeHead(200, preflight(req));
      res.end();
      log('preflight 200 response sent');
    } else {
      try {
        var resolvedOrigin = req.headers.origin || req.headers.host;
        if (!resolvedOrigin) log('no resolved origin, bypassing cors ok check');
        if (resolvedOrigin && isOk(req)) {
          /** Cors ok, write the appropriate headers. */
          if (req.headers.origin) {
            res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
            log('proxy +origin [%s], method [%s]', req.headers.host, req.method);
          } else if (req.headers.host) {
            log('proxy +host [%s], method [%s]', req.headers.host, req.method);
          }
          res.setHeader('Access-Control-Allow-Credentials', true);
        } else {
          /** Cors not ok, do not write the appropriate headers. */
          if (req.headers.origin) {
            logger.error('proxy -origin [%s], method [%s]', req.headers.host, req.method);
          } else {
            log('proxy -host [%s], method [%s]', req.headers.host, req.method);
          }
        }
      } catch (err) {
        logger.error('unexpected cors error', err);
      } finally {
        next();
      }
    }
  };
}