simple redis lock.

## usage

```js
var client = require('redis').createClient();
var redlock = new RedLock(client);
//lock
redlock.lock('test-resource-lock',3,function(err,data){
  lockVal = data;
  done(err);
});
//unlock
redlock.unlock('test-resource-lock',lockVal,function(err,data){
  done(err);
}) 
```