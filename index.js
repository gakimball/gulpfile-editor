'use strict';

var camelcase = require('camelcase');
var extend = require('util')._extend;
var funcToString = require('function-to-string');
var jsBeautify = require('js-beautify').js_beautify;

class Gulpfile {
  constructor(opts) {
    this.options = extend({
      babel: false,
      loadPlugins: false
    }, opts);

    this.requires = ['gulp'];
    this.tasks = {};
  }

  require(lib) {
    this.requires.push(lib);
    return this;
  }

  task(name) {
    this.tasks[name] = new GulpTask(name);
    return this.tasks[name];
  }

  toString() {
    var output = '';

    // Requires
    for (let i in this.requires) {
      if (this.options.loadPlugins && this.requires[i].indexOf('gulp-') === 0) continue;
      let pluginName;
      if (this.requires[i].indexOf('gulp-') === 0) {
        pluginName = camelcase(this.requires[i].replace('gulp-', ''));
      }
      else {
        pluginName = camelcase(this.requires[i]);
      }
      output += `var ${pluginName} = require('${this.requires[i]}')`;
    }

    output += '\n\n';

    // Tasks
    for (let i in this.tasks) {
      let task = this.tasks[i];
      let text = '';

      text += `function ${task.name}(${task.options.callback ? 'done' : ''}) {`;
      // Plain function tasks
      if (task._func) {
        text += task._func;
      }
      // Standard src/pipe/dest tasks
      else {
        text += `gulp.src('${task._src.globs}')`;
        let pipes = task._pipes.concat(task._dest);
        for (let i in pipes) {
          let pipe = pipes[i];
          text += `.pipe(${pipe.function}())\n`;
        }
      }
      text += '}';

      output += text + '\n\n';
    }

    return jsBeautify(output);
  }
}

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
      params: [globs]
    };
    return this;
  }

  pipe(plugin) {}

  func(fn) {
    if (typeof fn !== 'function') {
      throw new Error('Calls to .func() must include a function');
    }

    this._func = funcToString(fn).body;
    return this;
  }
}

module.exports = Gulpfile;
