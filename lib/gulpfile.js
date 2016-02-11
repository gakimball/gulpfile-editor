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
