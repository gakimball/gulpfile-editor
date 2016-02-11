'use strict';

var camelcase = require('camelcase');
var extend = require('util')._extend;
var jsBeautify = require('js-beautify').js_beautify;
var GulpTask = require('./gulptask');

/**
 * Represents a Gulpfile, including require statements and tasks.
 * @class
 */
class Gulpfile {
  /**
   * Creates a new instance of a Gulpfile.
   * @param {object} opts - Configuration options.
   * @returns {Gulpfile} Gulpfile instnace.
   */
  constructor(opts) {
    this.options = extend({
      babel: false,
      loadPlugins: false
    }, opts);

    this.requires = ['gulp'];
    this.tasks = {};
  }

  /**
   * Add a library that should be loaded with `require()` at the top of the Gulpfile.
   * @param {string} lib - Library to require.
   * @returns {Gulpfile} Gulpfile instance.
   */
  require(lib) {
    this.requires.push(lib);
    return this;
  }

  /**
   * Get a task from the Gulpfile. If a task with the given name doesn't exist, it will be created.
   * @param {string} name - Name of task to get or create.
   * @param {GulpTask} Task instance.
   */
  task(name, opts) {
    if (!this.tasks[name]) {
      this.tasks[name] = new GulpTask(name, opts || {});
    }
    return this.tasks[name];
  }

  /**
   * Converts the Gulpfile object to JavaScript code as a string.
   * @returns {string} JavaScript code for a Gulpfile.
   */
  toString() {
    var output = '';

    // Requires
    for (let i in this.requires) {
      if (this.options.loadPlugins && this.requires[i].indexOf('gulp-') === 0) continue;
      output += writeRequire(this.requires[i]);
    }

    output += '\n\n';

    // Tasks
    for (let i in this.tasks) {
      output += this.tasks[i].toString() + '\n\n';
    }

    return jsBeautify(output);
  }
}

module.exports = Gulpfile;

/**
 * Converts a plugin name into a Node `require()` statement with variable assignment.
 * @param {string} req - Library to require.
 * @private
 */
function writeRequire(req) {
  let pluginName;
  if (req.indexOf('gulp-') === 0) {
    pluginName = camelcase(req.replace('gulp-', ''));
  }
  else {
    pluginName = camelcase(req);
  }

  return `var ${pluginName} = require('${req}')`;
}
