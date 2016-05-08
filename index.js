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
function Redlock(client,option) {
  this.client = client;
  this.option = option;
}
Redlock.prototype.lock = function(resource,ttl,callback){
  var _val = _random();
  this.client.SET(resource,_val,'EX',ttl,'NX',function(err,data){
    if(!err && data === 'OK'){
      callback(null,_val);
    }else{
      callback(err || 'resource: '+resource+' is locked.');
    }
  })
}
Redlock.prototype.unlock = function(resource,value,callback){
  var that = this;
  this.client.GET(resource,function(err,data){
    if(!err && data === value){
      that.client.DEL(resource,function(err){
        callback(err);
      })
    }else{
      callback(err);
    }
  })
}
module.exports = Redlock;