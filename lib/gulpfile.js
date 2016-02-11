'use strict';

var camelcase = require('camelcase');
var extend = require('util')._extend;
var jsBeautify = require('js-beautify').js_beautify;
var GulpTask = require('./gulptask');

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
          text += `.pipe(${pipe.function}(${pipe.params.join(', ')}))\n`;
        }
      }
      text += '}';

      output += text + '\n\n';
    }

    return jsBeautify(output);
  }
}

module.exports = Gulpfile;
