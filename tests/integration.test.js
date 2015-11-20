var _ = require('lodash');
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var yaml = require('yamljs');

var AssemblyLine = require('../');
var registryPath = path.resolve(__dirname + '/tasks/');
var specPath = path.resolve(__dirname + '/specs/');
var specs = fs.readdirSync(specPath);

specs.forEach(testSuite);

function testSuite(specName) {
describe('assembly-line - integration - ' + specName, function(){
  it('runTasks', function(done){
    var taskSpec = fs.readFileSync(path.join(specPath, specName), {encoding: 'utf8'});
    var spec = yaml.parse(taskSpec);

    var assemblyLine = new AssemblyLine();

    assemblyLine.registerTasksFromPath(registryPath, function(err, registry){
      var logger = console.log;

      assemblyLine.setContext('logger', logger);

      assemblyLine.runTasks({}, spec.tasks, {}, function(err, results){
        assert.ok(!err);
        assert.ok(_.isArray(results))

        done();
      });
    });
  });
});
}
