simple redis lock, support promise and callback.

[![Build Status via Travis CI](https://travis-ci.org/navyxie/redlock-node.svg?branch=master)](https://travis-ci.org/navyxie/redlock-node)

## usage

```js
var RedLock = require('redlock-node');
var client = require('redis').createClient('port','host');
var redlock = new RedLock(client);
var lock;

`callback`:

//lock
/**
*params:
*    @string: resource key
*    @number: lock second
*    @function: callback
*/
redlock.lock('test-resource-lock',3,function(err,lockInstance){
  lock = lockInstance;
  done(err);
});
//unlock
redlock.unlock(lock,function(err,data){
  done(err);
});

//extend 
redlock.extend(lock,2,function(err,data){
  done(err);
}); 

`promise`:

redlock.lock('test-resource-lock-promise',3).done(
  function(lock){
    //todo
    redlock.unlock(lock);
  },
  function(){
  }
) 
```

## test
```js
//test
npm test

//code coverage

npm run cov
```

## code coverage

```html
=============================== Coverage summary ===============================
Statements   : 96.83% ( 183/189 )
Branches     : 83.33% ( 30/36 )
Functions    : 100% ( 77/77 )
Lines        : 97.86% ( 183/187 )
================================================================================
```