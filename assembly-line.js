var _ = require('lodash');
var async = require('async');
var fs = require('fs');
var path = require('path');
var Task = require('./lib/task.js');

function AssemblyLine() {
  // Storage for task definitions.
  this.taskRegistry = {};

  // Storage for contexts.
  this.contexts = {};
}

/**
 * Add a context to the assembly line.
 *
 * @param name
 * @param context
 * @returns {Boolean}
 */
AssemblyLine.prototype.setContext = function(name, context){
  this.contexts[name] = context;

  return true;
};

/**
 * Get a context from the assembly line.
 *
 * @param name
 * @returns
 */
AssemblyLine.prototype.getContext = function(name){
  return this.contexts[name];
};

/**
 * Remove a context from the assembly line.
 *
 * @param name
 * @returns {Boolean}
 */
AssemblyLine.prototype.removeContext = function(name){
  delete this.contexts[name];

  return true;
};

/**
 * Register task definitions from path.
 *
 * @param registryPath
 * @param cb
 */
AssemblyLine.prototype.registerTasksFromPath = function(registryPath, cb){
  var that = this;

  registryPath = path.resolve(registryPath);
  var registryTasks = fs.readdirSync(registryPath);

  async.each(registryTasks, function(taskKey, cb_each){
    var TaskClass = require(path.join(registryPath, taskKey));
    var taskInstance = new TaskClass();

    taskInstance.getTaskDefinition(function(err, definition){
      if (err) {
        return cb_each(err);
      }

      that.taskRegistry[definition.task] = TaskClass;

      return cb_each();
    });
  }, function(err){
    return cb(err, that.taskRegistry);
  });
};

/**
 * Run the defined tasks.
 *
 * @param runOptions
 * @param tasks
 * @param taskOptions
 * @param cb
 */
AssemblyLine.prototype.runTasks = function(runOptions, tasks, taskOptions, cb){
  var that = this;

  runOptions = _.defaults(runOptions || {}, {
    taskMode: 'async'
  });

  // Run tasks asynchronous in parallel.
  if (runOptions.taskMode === 'async') {
    async.map(tasks, function(task, cb_map){
      that.runTask(task, taskOptions, cb_map);
    }, function(err, results){
      if (err) {
        return cb(err);
      }

      if (tasks.length === 1) {
        return cb(null, results[0]);
      }

      var mergedData = that.mergeResults(results);

      return cb(null, mergedData);
    });
  }
  // Run tasks synchronous one after the other.
  else {
    async.eachSeries(tasks, function(task, cb_each){
      that.runTask(task, taskOptions, cb_each);
    }, cb);
  }
};

/**
 * Prepare task input for run.
 *
 * @param taskInstance
 * @param task
 * @param options
 * @param cb
 * @returns
 */
AssemblyLine.prototype.prepareTaskInput = function(taskInstance, task, options, cb){
  if (taskInstance.definition.inputOutputPassthrough) {
    return cb(null, options);
  }

  this.inputReplacePlaceholders(task.input, options, cb);
};

/**
 * Run a single task.
 *
 * @param task
 * @param options
 * @param cb
 */
AssemblyLine.prototype.runTask = function(task, options, cb){
  var that = this;

  var taskInstance = new this.taskRegistry[task.task]();
  taskInstance.setAssemblyLine(this);

  this.prepareTaskInput(taskInstance, task, options, function(err, input){
    if (err) {
      return cb(err);
    }

    taskInstance.runTask(input, function(err, results){
      if (err) {
        if (err === 'SkipChildTasks') {
          return cb();
        }

        return cb(err);
      }

      that.processTaskResult(task, results, function(err, results){
        if (err) {
          return cb(err);
        }

        taskInstance.processOutput(results, cb);
      });
    });
  });
};

AssemblyLine.prototype.processTaskResult = function(task, results, cb){
  var that = this;

  if (task.tasks) {
    if (_.isArray(results)) {
      async.map(results, function(options, cb_map){
        that.runTasks({}, task.tasks, options, cb_map);
      }, cb);
    }
    else {
      this.runTasks({}, task.tasks, results, cb);
    }
  }
  else {
    return cb(null, results);
  }
};

/**
 * Merge the properties of an array of objects into one object.
 *
 * @param results
 * @returns
 */
AssemblyLine.prototype.mergeResults = function(results){
  var mergedData = {};

  results.forEach(function(result){
    mergedData = _.merge(mergedData, result);
  });

  return mergedData;
};

/**
 * Replace placeholders in input with provided values.
 *
 * @param input
 * @param data
 * @param cb
 * @returns
 */
AssemblyLine.prototype.inputReplacePlaceholders = function(input, data, cb){
  // Bail out early if no input was given.
  if (!input) {
    return cb(null, input);
  }

  var that = this;

  // Don't modify original input, as this task might be run multiple times.
  input = _.clone(input);

  var targetKeys = _.keys(input);

  if (targetKeys) {
    targetKeys.forEach(function(targetKey){
      // Replace "parent" placeholders.
      input[targetKey] = that._replacePlaceholder(input[targetKey], 'parent.output.', data);

      // Replace "context" placeholders.
      input[targetKey] = that._replacePlaceholder(input[targetKey], 'context.', that.contexts);
    });
  }

  return cb(null, input);
};

/**
 * Replace placeholders in input.
 *
 * @param input
 * @param prefix
 * @param placeholders
 * @returns
 */
AssemblyLine.prototype._replacePlaceholder = function(input, prefix, placeholders){
  if (_.isString(input) && input.indexOf(prefix) !== -1) {
    var that = this;
    var placeholderKeys = _.keys(placeholders);
    var directMatch = false;

    // Replace direct matches.
    placeholderKeys.forEach(function(placeholderKey){
      var placeholder = prefix + placeholderKey;

      if (input === placeholder) {
        input = placeholders[placeholderKey];
        directMatch = true;
      }
    });

    if (!directMatch) {
      // Replace inline matches.
      _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

      var compiledTemplate = _.template(input);
      var placeholderData = {};

      _.set(placeholderData, _.trimRight(prefix, '.'), placeholders);

      input = compiledTemplate(placeholderData);
    }
  }

  return input;
};

AssemblyLine.Task = Task;
AssemblyLine.TaskErrors = {
  'SkipChildTasks': 'SkipChildTasks'
};

module.exports = AssemblyLine;
