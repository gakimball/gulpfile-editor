'use strict';

exports.series = function() {
  let tasks = Array.prototype.slice.call(arguments, 0);
  return { type: 'series', tasks: tasks };
}

exports.parallel = function() {
  let tasks = Array.prototype.slice.call(arguments, 0);
  return { type: 'parallel', tasks: tasks };
}

exports.serialize = function serialize(comp) {
  let output = '';
  let tasks = '';

  for (let i in comp.tasks) {
    let task = comp.tasks[i];

    if (typeof task === 'object') {
      tasks += serialize(task);
    }
    else {
      tasks += task;
    }

    tasks += ', ';
  }

  tasks = tasks.slice(0, -2);

  return `gulp.${comp.type}(${tasks})`;
}
