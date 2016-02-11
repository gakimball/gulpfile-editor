# Gulpfile Editor

Node library to programmatically generate a Gulpfile. Yeoman has one for Grunt, why can't Gulp have one?

Not on npm yet. Tests be shaky.

## Usage

Create a Gulpfile:

```js
var Gulpfile = require('gulpfile-editor');

var gulpfile = new Gulpfile();
```

Add required Node libraries:

```js
// Gulp itself is required automatically
gulpfile
  .require('gulp-sass')
  .require('gulp-uglify')
```

Add a task:

```js
gulpfile.task('sass');
```

Define a task with a source and destination:

```js
gulpfile.task('copy')
  .src('src/assets/**/*')
  .dest('dist/assets');
```

Define a task with plugins in the middle:

```js
gulpfile.task('sass')
  .src('scss/app.scss')
  .pipe('sass', '{ loadPaths: "bower_components" }')
  .dest('css');
```

Define a task that's a plain function:

```js
gulpfile.task('clean')
  .func(function() {
    return del('dist');
  });
```

Define a task that uses serial or parallel composition:

```js
// Use the standalone series and parallel to compose further
var series = require('gulpfile-editor').series;
var parallel = require('gulpfile-editor').parallel;

gulpfile.task('default').series('clean', 'build', 'server');
gulpfile.task('build').parallel('sass', 'javascript');
```

Define files to watch:

```js
gulpfile
  .watch('scss/**/*', 'sass')
  .watch('js/**/*', 'js');
```

Print your Gulpfile and write it to disk:

```js
var output = gulpfile.toString();

fs.writeFile('gulpfile.js', output);
```
