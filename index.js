var Promise = require('bluebird');
var util = require('util');
var EventEmitter = require('events');
if(typeof EventEmitter.EventEmitter === 'function')
  EventEmitter = EventEmitter.EventEmitter;
function _randomStr(len){
  var baseString = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  len = len || 13;
  var str = '';
  for(var i = 0 ; i < len ; i++){
    str += baseString[parseInt(Math.random()*(len-1))];
  }
  return str;
}
function _random(){
  return Date.now()+_randomStr();
}

function Lock(redlock, resource, value) {
  this.redlock = redlock;
  this.resource = resource;
  this.value = value;
}
Lock.prototype.unlock = function(callback) {
  return this.redlock.unlock(this, callback);
};
Lock.prototype.extend = function(ttl, callback){
  if (typeof ttl === 'function') {
    return ttl('the first param ttl is missing.');
  }
  return this.redlock.extend(this, ttl, callback)
}
function Redlock(client,option) {
  this.client = client;
  this.option = option;
}
util.inherits(Redlock, EventEmitter);
Redlock.prototype.lock = function(resource,ttl,callback){
  var self = this;
  var _val = _random();
  return new Promise(function(resolve, reject) {
    if (typeof ttl === 'function') {
      callback = ttl;
      return reject('the first param ttl is missing.');
    }
    var lock = new Lock(self, resource, _val);
    self.client.SET(resource,_val,'EX',ttl,'NX',function(err,data){
      if(!err && data === 'OK'){
        return resolve(lock);
      }else{
        var err = err || 'resource: '+resource+' is locked.';
        self.emit('lockError', err);
        return reject(err);
      }
    })
  }).asCallback(callback);
}
Redlock.prototype.unlock = function(lock,callback){
  var self = this;
  return new Promise(function(resolve, reject) {
    if(typeof lock !== 'object') return reject('unlockError:lock is not object.');
    self.client.GET(lock.resource,function(err,data){
      if(!err && data === lock.value){
        self.client.DEL(lock.resource,function(err){
          if(err){
            self.emit('unlockError',err);
            return reject('unlockError:'+err);
          }else{
            return resolve(lock);
          }     
        })
      }else{
        self.emit('unlockError',err || 'resource:' + lock.resource + ' unable to unlock.')
        return reject('unlockError:' + err || ('resource:' + lock.resource + ' unable to unlock.'));
      }
    })
  }).asCallback(callback);
}
Redlock.prototype.extend = function(lock,ttl,callback){
  var self = this;
  return new Promise(function(resolve, reject){
    if(typeof lock !== 'object') return reject('unlockError:lock is not object.');
    self.client.GET(lock.resource,function(err,data){
      if(!err && data === lock.value){
        self.client.expire(lock.resource,ttl,function(err,data){
          if(!err && data === 1){
            return resolve(lock);
          }else{
            self.emit('extendError', err);
            return reject('extendError:'+err);
          }          
        });
      }else{
        self.emit('extendError', err);
        return reject('extendError:'+err);
      }
    })
  }).asCallback(callback);
}
module.exports = Redlock;