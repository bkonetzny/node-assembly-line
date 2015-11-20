function Task() {
  this.definition = this.definition || {};
  this.assemblyLine = null;
}

Task.prototype.setAssemblyLine = function(assemblyLine){
  this.assemblyLine = assemblyLine;
};

Task.prototype.getTaskDefinition = function(cb){
  return cb(null, this.definition);
};

/**
 * 
 * @param input
 * @param cb
 */
Task.prototype.runTask = function(input, cb){
  return cb(null, input);
};

/**
 * 
 * @param output
 * @param cb
 */
Task.prototype.processOutput = function(output, cb){
  return cb(null, output);
};

module.exports = Task;
