var should = require('should');
var RedLock = require('./index');
var async = require('async');
describe('redlock',function(){
  this.timeout(5000);
  var client = require('redis').createClient(6379,'localhost');
  var redlock = new RedLock(client);
  describe('callback',function(){
    describe('test single',function(){
      var lock;
      it('#lock() not ok.',function(done){
        redlock.lock('test-resource-lock-fail',function(err,lockObj){
          should.exists(err);
          done(null);
        }) 
      });
      it('#lock() ok.',function(done){
        redlock.lock('test-resource-lock',3,function(err,lockObj){
          lock = lockObj;
          done(err);
        }) 
      });
      it('#lock() not ok.',function(done){
        redlock.lock('test-resource-lock',3,function(err,data){
          should.exists(err);
          done();
        }) 
      });
      it('#extend() ok.',function(done){
        redlock.extend(lock,3,function(err,data){
          should.not.exists(err);
          done();
        })
      });
      it('#extend() not ok by lock.',function(done){
        lock.extend(function(err,data){
          should.exists(err);
          done();
        })
      });
      it('#extend() ok by lock.',function(done){
        lock.extend(2,function(err,data){
          should.not.exists(err);
          done();
        })
      });
      it('#unlock() ok by lock.',function(done){
        lock.unlock(function(err,data){
          done(err);
        })
      });
      it('#unlock() ok.',function(done){
        redlock.unlock(lock,function(err,data){
           should.exists(err);
          done();
        })
      });
      it('#extend() not ok.',function(done){
        redlock.extend(lock,3,function(err,data){
          should.exists(err);
          done();
        })
      });
      it('#unlock() not ok.',function(done){
        redlock.unlock(lock,function(err,data){
          should.exists(err);
          done();
        })
      });
      it('#unlock() not ok, when resource expired.',function(done){
        var waterfallFnCallCount = 0;
        async.waterfall([
          function(cb){
            waterfallFnCallCount++;
            redlock.lock('test-resource-lock',1,function(err,lockObj){
              setTimeout(function(){
                cb(err,lockObj);
              },1001);
            }); 
          },
          function(lockObj,cb){
            waterfallFnCallCount++;
            redlock.lock('test-resource-lock',1,function(err,lockObj2){
              redlock.unlock(lockObj2,function(err){
                cb(err,lockObj);
              })
            })
          },
          function(lockObj,cb){
            waterfallFnCallCount++;
            redlock.unlock(lockObj,function(err,data){
              cb(err);
            })
          }
        ],function(err){
          should.exists(err);
          waterfallFnCallCount.should.be.equal(3);
          done(null);
        });
      });
    })
  });
  describe('promise',function(){
    describe('test single',function(){
      var originLock;
      it('#lock() ok.',function(done){
        redlock.lock('test-resource-lock',3).done(function(lock){
          originLock = lock;
          lock.resource.should.be.equal('test-resource-lock');
          done();
        },done) 
      });
      it('#lock() not ok.',function(done){
        redlock.lock('test-resource-lock',3).done(done,function(err){
          should.exists(err);
          done();
        }); 
      });
      it('#extend() ok.',function(done){
        redlock.extend(originLock,3).done(function(lock){
          lock.should.Object();
          done();
        },done);
      });
      it('#extend() ok by lock.',function(done){
        originLock.extend(3).done(function(lock){
          lock.should.Object();
          done();
        },done);
      });
      it('#unlock() ok.',function(done){
        redlock.unlock(originLock).done(function(lock){
          lock.should.Object();
          done();
        },done)
      });
      it('#unlock() not ok by lock.',function(done){
        originLock.unlock().done(done,function(err){
          should.exists(err);
          done();
        })
      });
      it('#extend() not ok.',function(done){
        redlock.extend(originLock,3).done(done,function(err){
          should.exists(err);
          done();
        })
      });
      it('#unlock() not ok.',function(done){
        redlock.unlock(originLock).done(done,function(err){
          should.exists(err);
          done();
        })
      });
      it('#unlock() not ok, when resource expired.',function(done){
        var waterfallFnCallCount = 0;
        async.waterfall([
          function(cb){
            waterfallFnCallCount++;
            redlock.lock('test-resource-lock',1).done(function(lockObj){
              setTimeout(function(){
                cb(null,lockObj);
              },1001);
            },cb); 
          },
          function(lockObj,cb){
            waterfallFnCallCount++;
            redlock.lock('test-resource-lock',1).done(function(lockObj2){
              redlock.unlock(lockObj2).done(function(){
                cb(null,lockObj);
              },cb);
            },cb);
          },
          function(lockObj,cb){
            waterfallFnCallCount++;
            redlock.unlock(lockObj).done(cb,cb);
          }
        ],function(err){
          should.exists(err);
          waterfallFnCallCount.should.be.equal(3);
          done(null);
        });
      });

    })
  })
})