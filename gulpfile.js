var gulp = require('gulp'),
    gutil = require('gulp-util'),
    compass = require('gulp-compass'),
    minifycss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    livereload = require('gulp-livereload'),
    lr = require('tiny-lr'),
    fileinclude = require('gulp-file-include'),
    server = lr();


gulp.task('styles', function() {
  return gulp.src([
      'scss/style.scss'
    ])
    .pipe(compass({
      config_file: 'scss/config.rb',
      css: 'public/css',
      sass: 'scss',
      image: 'public/img',
      style: 'compressed'
    }))
    .on('error', function(e) {
      console.log(e);
      gutil.log(gutil.colors.red('## CSS BE BROKEN ###'))
    })
    .pipe(gulp.dest('public/css'))
    .pipe(livereload(server))
    .pipe(notify({ message: 'Styles task complete' }));
});

//Default
gulp.task('default', function() {
    gulp.start('styles');
});
// Watch
gulp.task('watch', function() {
  // Livereload listen on default port 35729
  server.listen(35729, function (err) {
    if (err) {
      return console.log(err)
    };
    gulp.watch('scss/**/*.scss', ['styles']);
  });
});
