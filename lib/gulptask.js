'use strict';

var compose = require('./compose');
var extend = require('util')._extend;
var funcToString = require('function-to-string');

/**
 * Represents a task within a Gulpfile. The task can be a plain function, or a Gulp pipeline with a source, plugins, and destination.
 * @class
 */
class GulpTask {
  /**
   * Creates a new instance of a Gulp task.
   * @param {string} name - Name of the task.
   * @param {object} opts - Configuration options.
   * @returns {GulpTask} Gulp task object.
   */
  constructor(name, opts) {
    this.name = name;
    this.options = extend({
      cli: false,
      callback: false
    });
    this._src = {};
    this._pipes = [];
    this._dest = {};
    this._func = '';
    this._composition = null;
  }

  /**
   * Define the source for the Gulp stream.
   * @param {string|array} globs - Globs to pass to `gulp.src()`.
   * @param {object} opts - Options to pass to `gulp.src()`.
   * @returns {GulpTask} Gulp task object.
   */
  src(globs, opts) {
    this._src = { globs: globs, opts: opts || {} };
    return this;
  }

  /**
   * Define the destination for the Gulp stream, called at the end by piping to `gulp.dest()`.
   * @param {string|array} dir - Directory to output to.
   * @param {object} opts - Options to pass to `gulp.dest()`.
   * @returns {GulpTask} Gulp task object.
   */
  dest(dir, opts) {
    this._dest = {
      function: 'gulp.dest',
      params: [dir].concat(opts || [])
    };

    return this;
  }

  /**
   * Add a plugin to a Gulp stream within a task. The plugins are piped to in the order of calls to `.pipe()` on the task object.
   * @param {string} plugin - Plugin function to call.
   * @param {...string} args - Arguments to pass to the plugin function.
   * @returns {GulpTask} Gulp task object.
   */
  pipe(plugin) {
    let args = Array.prototype.slice.call(arguments, 1);
    this._pipes.push({
      function: plugin,
      params: args || []
    });

    return this;
  }

  /**
   * Define a Gulp task as being a plain function rather than a Gulp stream. If this function is called, anything set with `.src()`, `.dest()`, or `.pipe()` is ignored.
   * @param {function} fn - Function to copy.
   * @returns {GulpTask} Gulp task object.
   */
  func(fn) {
    if (typeof fn !== 'function') {
      throw new Error('Calls to .func() must include a function');
    }

    this._func = funcToString(fn).body;
    return this;
  }

  /**
   * Define a task as a call to `gulp.series()`.
   * @param {...string|object} tasks - Tasks to call.
   * @return {GulpTask} Gulp task object.
   */
  series() {
    let tasks = Array.prototype.slice.call(arguments, 0);
    this._composition = compose.series.apply(this, tasks);
    return this;
  }

  /**
   * Define a task as a call to `gulp.parallel()`.
   * @param {...string|object} tasks - Tasks to call.
   * @return {GulpTask} Gulp task object.
   */
  parallel() {
    let tasks = Array.prototype.slice.call(arguments, 0);
    this._composition = compose.series.apply(this, tasks);
    return this;
  }

  /**
   * Converts the Gulp task object to a string representation of a JavaScript function.
   * @returns {string} JavaScript function of Gulp task.
   */
  toString() {
    if (this._composition) return this.composeToString();

    let output = '';
    output += `function ${this.name}(${this.options.callback ? 'done' : ''}) {`;

    // Plain function tasks
    if (this._func) {
      output += this._func;
    }
    // Standard src/pipe/dest tasks
    else {
      output += `gulp.src('${this._src.globs}')`;
      let pipes = this._pipes.concat(this._dest);
      for (let i in pipes) {
        let pipe = pipes[i];
        output += `.pipe(${pipe.function}(${pipe.params.join(', ')}))\n`;
      }
    }

    output += '}';

    return output;
  }

  composeToString() {
    let func = compose.serialize(this._composition);

    if (this.options.cli) {
      return `gulp.task('${this.name}', ${func})`;
    }
    else {
      return `var ${this.name} = ${func}`;
    }
  }
}

module.exports = GulpTask;
