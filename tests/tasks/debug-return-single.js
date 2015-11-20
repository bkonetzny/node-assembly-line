var util = require('util');
var Task = require('assembly-line').Task;

function TaskDebugReturnSingle() {
  this.definition = {
    task: 'debugReturnSingle',
    name: 'Return Single',
    description: 'Return Single results.',
    type: 'debug',
    input: {
      property: {
        name: 'Property',
        type: 'string'
      },
      value: {
        name: 'Value',
        type: 'string'
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

  TaskDebugReturnSingle.super_.apply(this, arguments);
}
util.inherits(TaskDebugReturnSingle, Task);

/**
 * 
 * @param input
 * @param input.property
 * @param input.value
 * @param cb
 */
TaskDebugReturnSingle.prototype.runTask = function(input, cb){
  var output = {};
  output[input.property] = 'Got ' + input.value + ' from previous task.'

  return cb(null, output);
};

module.exports = TaskDebugReturnSingle;
