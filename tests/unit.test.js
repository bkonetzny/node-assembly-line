var assert = require('assert');

var AssemblyLine = require('../');

describe('assembly-line - unit', function(){
  var assemblyLine;

  before(function(done){
    assemblyLine = new AssemblyLine();

    done();
  });

  describe('contexts', function(){
    it('setContext', function(done){
      var success1 = assemblyLine.setContext('context1', 'foo1');
      var success2 = assemblyLine.setContext('context2', 'foo2');

      assert.ok(success1);
      assert.ok(success2);

      done();
    });

    it('getContext', function(done){
      var context1 = assemblyLine.getContext('context1');
      var context2 = assemblyLine.getContext('context2');

      assert.equal(context1, 'foo1');
      assert.equal(context2, 'foo2');

      done();
    });

    it('removeContext', function(done){
      var success1 = assemblyLine.removeContext('context1');
      var context1 = assemblyLine.getContext('context1');
      var context2 = assemblyLine.getContext('context2');

      assert.ok(success1);
      assert.ok(!context1);
      assert.equal(context2, 'foo2');

      done();
    });
  });

  describe('inputReplacePlaceholders / _replacePlaceholder', function(){
    describe('parent.output', function(){
      it('no match', function(done){
        var inputOriginal = {
          prop1: 'parent.output.test'
        };
        var data = {
          test2: 'foobar'
        };

        assemblyLine.inputReplacePlaceholders(inputOriginal, data, function(err, inputReplaced){
          assert.ok(!err);
          assert.equal(inputReplaced.prop1, 'parent.output.test');

          done();
        });
      });

      it('direct match', function(done){
        var inputOriginal = {
          prop1: 'parent.output.test'
        };
        var data = {
          test: 'foobar'
        };

        assemblyLine.inputReplacePlaceholders(inputOriginal, data, function(err, inputReplaced){
          assert.ok(!err);
          assert.equal(inputReplaced.prop1, 'foobar');

          done();
        });
      });

      it('placeholder match', function(done){
        var inputOriginal = {
          prop1: 'It is so {{parent.output.temp}} in here.'
        };
        var data = {
          temp: 'hot'
        };

        assemblyLine.inputReplacePlaceholders(inputOriginal, data, function(err, inputReplaced){
          assert.ok(!err);
          assert.equal(inputReplaced.prop1, 'It is so hot in here.');

          done();
        });
      });

      it('placeholder match (multiple / same)', function(done){
        var inputOriginal = {
          prop1: 'It is so {{parent.output.temp}} in here. Really {{parent.output.temp}}!'
        };
        var data = {
          temp: 'hot'
        };

        assemblyLine.inputReplacePlaceholders(inputOriginal, data, function(err, inputReplaced){
          assert.ok(!err);
          assert.equal(inputReplaced.prop1, 'It is so hot in here. Really hot!');

          done();
        });
      });

      it('placeholder match (multiple / different)', function(done){
        var inputOriginal = {
          prop1: 'It {{parent.output.time}} so {{parent.output.temp}} in here.'
        };
        var data = {
          time: 'was',
          temp: 'hot'
        };

        assemblyLine.inputReplacePlaceholders(inputOriginal, data, function(err, inputReplaced){
          assert.ok(!err);
          assert.equal(inputReplaced.prop1, 'It was so hot in here.');

          done();
        });
      });
    });

    describe('context', function(){
      it('no match', function(done){
        var inputOriginal = {
          prop1: 'context.test'
        };

        assemblyLine.inputReplacePlaceholders(inputOriginal, null, function(err, inputReplaced){
          assert.ok(!err);
          assert.equal(inputReplaced.prop1, 'context.test');

          done();
        });
      });

      it('direct match', function(done){
        var inputOriginal = {
          prop1: 'context.test'
        };
        assemblyLine.setContext('test', 'foobar');

        assemblyLine.inputReplacePlaceholders(inputOriginal, null, function(err, inputReplaced){
          assert.ok(!err);
          assert.equal(inputReplaced.prop1, 'foobar');

          done();
        });
      });

      it('placeholder match', function(done){
        var inputOriginal = {
          prop1: 'It is so {{context.temp}} in here.'
        };
        assemblyLine.setContext('temp', 'hot');

        assemblyLine.inputReplacePlaceholders(inputOriginal, null, function(err, inputReplaced){
          assert.ok(!err);
          assert.equal(inputReplaced.prop1, 'It is so hot in here.');

          done();
        });
      });

      it('placeholder match (multiple / same)', function(done){
        var inputOriginal = {
          prop1: 'It is so {{context.temp}} in here. Really {{context.temp}}!'
        };
        assemblyLine.setContext('temp', 'hot');

        assemblyLine.inputReplacePlaceholders(inputOriginal, null, function(err, inputReplaced){
          assert.ok(!err);
          assert.equal(inputReplaced.prop1, 'It is so hot in here. Really hot!');

          done();
        });
      });

      it('placeholder match (multiple / different)', function(done){
        var inputOriginal = {
          prop1: 'It {{context.time}} so {{context.temp}} in here.'
        };
        assemblyLine.setContext('time', 'was');
        assemblyLine.setContext('temp', 'hot');

        assemblyLine.inputReplacePlaceholders(inputOriginal, null, function(err, inputReplaced){
          assert.ok(!err);
          assert.equal(inputReplaced.prop1, 'It was so hot in here.');

          done();
        });
      });
    });
  });

  describe('tasks', function(){
    it('runTasks');
    it('prepareTaskInput');
    it('runTask');
    it('processTaskResult');
  });

  describe('utils', function(){
    it('mergeResults', function(done){
      var results = [{
        data1: 'value1',
        data2: 'value2'
      }, {
        data3: 'value3',
        data4: 'value4'
      }];

      var mergedResults = assemblyLine.mergeResults(results);

      assert.deepEqual(mergedResults, {
        data1: 'value1',
        data2: 'value2',
        data3: 'value3',
        data4: 'value4'
      });

      done();
    });

    it('registerTasksFromPath');
  });
});
