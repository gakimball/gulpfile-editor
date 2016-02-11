var expect = require('chai').expect;
var Gulpfile = require('..');

describe('Gulpfile', function() {
  it('creates a new plugin instance', function() {
    var gulpfile = new Gulpfile();
    expect(gulpfile).to.be.an('object');
  });

  it('can add Gulp plugin requires', function() {
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

  it('can add non-Gulp plugin requires', function() {
  })
});
