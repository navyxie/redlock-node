var should = require('should');
var RedLock = require('./index');
describe('redlock',function(){
  var client = require('redis').createClient();
  var redlock = new RedLock(client);
  describe('test single',function(){
    var lockVal;
    it('#lock()',function(done){
      redlock.lock('test-resource-lock',3,function(err,data){
        lockVal = data;
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
      redlock.unlock('test-resource-lock',lockVal,function(err,data){
        done(err);
      })
    });
  })
})