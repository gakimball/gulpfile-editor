'use strict';

var extend = require('util')._extend;
var funcToString = require('function-to-string');

class GulpTask {
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
  }

  src(globs, opts) {
    this._src = { globs: globs, opts: opts || {} };
    return this;
  }

  dest(globs, opts) {
    this._dest = {
      function: 'gulp.dest',
      params: [globs].concat(opts || [])
    };

    return this;
  }

  pipe(plugin) {
    let args = Array.prototype.slice.call(arguments, 1);
    this._pipes.push({
      function: plugin,
      params: args || []
    });

    return this;
  }

  func(fn) {
    if (typeof fn !== 'function') {
      throw new Error('Calls to .func() must include a function');
    }

    this._func = funcToString(fn).body;
    return this;
  }

  toString() {
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
}

module.exports = GulpTask;
