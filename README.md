## universal-cors

**CORS middleware implementation with emphasis on configurability of dynamic origins.**

[![Build Status](https://travis-ci.org/noderaider/universal-cors.svg?branch=master)](https://travis-ci.org/noderaider/universal-cors)

[![NPM](https://nodei.co/npm/universal-cors.png?stars=true&downloads=true)](https://nodei.co/npm/universal-cors/)


## Install

`npm i -S universal-cors`


## How to use


```js
import express from 'express'
import cors, { origins } from 'universal-cors'


const app = express()

/** cors middleware to accept any pattern matching example.com subdomains */
app.use(cors({ patterns: [ /^https:\/\/.*\.example\.com/ ]}))

/** ROUTERS GO HERE */
```


## Documentation

**cors default export - middleware for auto handling preflight responses, testing dynamic origins, and attaching cors response headers when valid request occurs**

```js
cors([opts: Object]): function(req, res, next)
```

*opts*

**name**        | **type**                              | **default**   | **description**
--------        | --------                              | -----------   | ---------------
`patterns`      | `string|RegExp|Array<string|RegExp>`  | **required**  | the pattern(s) to test for cors origins, if pattern matches, the response will get valid cors response headers.
`usePreflight`  | `boolean`                             | `true`        | issues preflight responses immediately and ends request for all requests with OPTIONS method
`tracing`       | `boolean`                             | `false`       | toggles tracing for debugging purposes
`logger`        | `Object`                              | `console`     | the logger object to trace to
`loglevel`      | `string`                              | `'info'`      | the log level to use when tracing (`error`, `warn`, `info`, `trace`)



**origins export - granular origin testing functionality**

```js
origins([opts: Object]): { isOk: function(domain: string): boolean }
```

*opts*

**name**        | **type**                              | **default**   | **description**
--------        | --------                              | -----------   | ---------------
`patterns`      | `string|RegExp|Array<string|RegExp>`  | **required**  | the pattern(s) to test for cors origins, if pattern matches, the response will get valid cors response headers.
`tracing`       | `boolean`                             | `false`       | toggles tracing for debugging purposes
`logger`        | `Object`                              | `console`     | the logger object to trace to
`loglevel`      | `string`                              | `'info'`      | the log level to use when tracing (`error`, `warn`, `info`, `trace`)
