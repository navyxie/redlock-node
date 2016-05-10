var should = require('should');
var RedLock = require('./index');
describe('redlock',function(){
  this.timeout(5000);
  var client = require('redis').createClient(6380,'localhost');
  var redlock = new RedLock(client);
  describe('test single',function(){
    var lock;
    it('#lock()',function(done){
      redlock.lock('test-resource-lock',3,function(err,lockObj){
        lock = lockObj;
        done(err);
      }) 
    });
    it('#lock()',function(done){
      redlock.lock('test-resource-lock',3,function(err,data){
        should.exists(err);
        done();
      }) 
    });
    it('#unlock()',function(done){
      redlock.unlock(lock,function(err,data){
        done(err);
      })
    });
  })
})