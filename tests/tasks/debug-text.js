var util = require('util');
var Task = require('assembly-line').Task;

function TaskDebugText() {
  this.definition = {
    task: 'debugText',
    name: 'Debug Text',
    description: 'Write text to debug.',
    type: 'debug',
    input: {
      text: {
        name: 'Text',
        type: 'string',
        required: true
      }
    },
    output: {
      text: {
        name: 'Text',
        type: 'string'
      }
    },
    nodes: []
  };

  TaskDebugText.super_.apply(this, arguments);
}
util.inherits(TaskDebugText, Task);

/**
 * 
 * @param input
 * @param input.text
 * @param cb
 */
TaskDebugText.prototype.runTask = function(input, cb){
  var output = {
    text: input.text
  };

  var logger = this.assemblyLine.getContext('logger');

  logger('debugText', output);

  return cb(null, output);
};

module.exports = TaskDebugText;
