var expect = require('chai').expect;
var Gulpfile = require('..');
var series = require('../lib/compose').series;
var parallel = require('../lib/compose').parallel;
var serialize = require('../lib/compose').serialize;

describe('Gulpfile', () => {
  it('creates a new plugin instance', () => {
    var gulpfile = new Gulpfile();
    expect(gulpfile).to.be.an('object');
  });

  it('can add Gulp plugin requires', () => {
    var gulpfile = new Gulpfile();
    var g = gulpfile
      .require('run-sequence')
      .require('gulp-sass');

    expect(gulpfile.requires).to.contain('run-sequence', 'An internal array of requires is maintained');

    var output = gulpfile.toString();

    expect(output).to.contain('var gulp = require(\'gulp\')', 'Gulp is always loaded');
    expect(output).to.contain('var runSequence = require(\'run-sequence\')', 'Plugins are added as variables with the plugin name');
    expect(output).to.contain('var sass = require(\'gulp-sass\')', 'Gulp plugins are added as variables without gulp- at the beginning');
  });

  it('creates new tasks', () => {
    var gulpfile = new Gulpfile();
    var task = gulpfile.task('clean');
    expect(task).to.be.an('object');

    var output = gulpfile.toString();
    expect(output).to.contain('function clean()');
  });

  describe('watch()', () => {
    it('can define a function to run when a file changes', () => {
      var gulpfile = new Gulpfile();
      gulpfile.watch('file.html', 'task');

      var output = gulpfile.toString();
      expect(output).to.contain(`gulp.watch('file.html'`);
      expect(output).to.contain(', task)');
    });

    it('can define a task to run when a file changes', () => {
      var gulpfile = new Gulpfile();
      gulpfile.watch('file.html', '"task"');

      var output = gulpfile.toString();
      expect(output).to.contain(`, 'task')`);
    });

    it('can define a task composition to run when a file changes', () => {
      var gulpfile = new Gulpfile();
      gulpfile.watch('file.html', series('sass', 'browser.reload'));

      var output = gulpfile.toString();
      expect(output).to.contain(`gulp.series`);
    });
  });
});

describe('Gulp Task', () => {
  it('has a name and options', () => {
    var gulpfile = new Gulpfile();
    var task = gulpfile.task('clean');

    expect(task).to.be.an('object');
    expect(task.options).to.be.an('object');
  });

  it('can be represented as a function', () => {
    var gulpfile = new Gulpfile();
    gulpfile.task('clean').func(func);

    expect(gulpfile.toString()).to.contain('del');

    function func() {
      return del('dist');
    }
  });

  it('can have a source and destination', () => {
    var gulpfile = new Gulpfile();
    gulpfile.task('copy').src('src/**/*').dest('dist');
  });

  it('can have pipes to plugins', () => {
    var gulpfile = new Gulpfile();
    gulpfile.task('sass')
      .src('src/**/*')
      .pipe('sass', '{ loadPaths: "scss"}')
      .dest('dist');

    // console.log(gulpfile.toString());
  });
});

describe('Task Composition', () => {
  it('series and parallel', () => {
    var gulpfile = new Gulpfile();
    gulpfile.task('build', {cli: true})
      .series('clean', parallel('sass', 'javascript'), 'server');

    // console.log(gulpfile.toString());
  });
});
