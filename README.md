# assembly-line

Configurable task runner for nested tasks.

## Features

 - Define your own tasks and run them in order as sync / async process.
 - Task have defined inputs/outputs and matching dependencies.

## Install

Install the module via [npm](https://www.npmjs.com/):

```bash
$ npm install --save assembly-line
```

## Usage

### Run tasks.

```javascript
// Require the module in your code.
var AssemblyLine = require('assembly-line');

var registryPath = '/path/to/your/task/modules';
var assemblyLine = new AssemblyLine();

assemblyLine.registerTasksFromPath(registryPath, function(err, registry){
  // Provide a context var which is global to all tasks.
  assemblyLine.setContext('process', process);

  // Run the all the tasks.
  assemblyLine.runTasks({taskMode: 'async'}, tasks, {}, cb);
});
```

### Create a task

```javascript
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
```
