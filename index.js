function _random(){
  return Math.random().toString(36).slice(2);
}
function Redlock(client,option) {
  this.client = client;
  this.option = option;
}
Redlock.prototype.lock = function(resource,ttl,callback){
  var _randomStr = _random();
  this.client.SET(resource,_randomStr,'EX',ttl,'NX',function(err,data){
    if(!err && data === 'OK'){
      callback(null,_randomStr);
    }else{
      callback(err || data);
    }
  })
}
Redlock.prototype.unlock = function(resource,value,callback){
  var that = this;
  this.client.GET(resource,function(err,data){
    if(!err && data === value){
      that.client.DEL(resource,function(err,data){
        callback(err);
      })
    }else{
      callback(err);
    }
  })
}
module.exports = Redlock;