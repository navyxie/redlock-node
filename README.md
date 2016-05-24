simple redis lock, support promise and callback.

## usage

```js
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
