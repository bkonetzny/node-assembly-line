var util = require('util');
var Task = require('assembly-line').Task;

var _ = require('lodash');

function TaskDebugReturnMultiple() {
  this.definition = {
    task: 'debugReturnMultiple',
    name: 'Return Multiple',
    description: 'Return multiple results.',
    type: 'debug',
    input: {
      count: {
        name: 'Count',
        type: 'integer'
      }
    },
    output: {
      data: {
        name: 'Data',
        type: 'string'
      }
    },
    nodes: []
  };

  TaskDebugReturnMultiple.super_.apply(this, arguments);
}
util.inherits(TaskDebugReturnMultiple, Task);

/**
 * 
 * @param input
 * @param input.count
 * @param cb
 */
TaskDebugReturnMultiple.prototype.runTask = function(input, cb){
  input = _.defaults(input || {}, {
    count: 3
  });

  var output = [];
  var range = _.range(input.count);

  range.forEach(function(idx){
    output.push({
      data: 'output' + (idx + 1)
    });
  });

  return cb(null, output);
};

module.exports = TaskDebugReturnMultiple;
