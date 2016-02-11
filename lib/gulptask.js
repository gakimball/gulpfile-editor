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
}

module.exports = GulpTask;
