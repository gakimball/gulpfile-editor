'use strict';

var camelcase = require('camelcase');
var extend = require('util')._extend;

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

    return output;
  }
}

class GulpTask {
  constructor(name) {
    this.name = name;
  }

  src(globs) {}

  dest(globs) {}

  pipe(plugin) {}

  func(fn) {}
}

module.exports = Gulpfile;
