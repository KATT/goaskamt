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

gulp.task('fileinclude', function() {
  gulp.src(['templates/index.html'])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .on('error', function() {
      gutil.log(gutil.colors.red('## TEMPLATE MISSING OR SOMETHING ###'))
    })
    .pipe(gulp.dest('./'))
    .pipe(livereload(server))
    .pipe(notify({ message: 'File Include task complete' }));
});
gulp.task('styles', function() {
  return gulp.src([
      'library/scss/style.scss'
    ])
    .pipe(compass({
      config_file: 'library/scss/config.rb',
      css: 'library/css',
      sass: 'library/scss',
      image: 'library/img',
      style: 'compressed'
    }))
    .on('error', function() {
      gutil.log(gutil.colors.red('## CSS BE BROKEN ###'))
    })
    .pipe(gulp.dest('library/css'))
    .pipe(livereload(server))
    .pipe(notify({ message: 'Styles task complete' }));
});
gulp.task('scripts', function() {
    return gulp.src([
      'library/js/lib/jquery.velocity.js',
      'library/js/lib/jquery.velocity.ui.js',
      'library/js/*.js'
    ])
    .pipe(concat('script.js'))
    .pipe(gulp.dest('library/js/min'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('library/js/min'))
    .pipe(livereload(server))
    .pipe(notify({ message: 'Scripts task complete' }));
});
gulp.task('php', function(){
  return gulp.src(['*.php', '!functions.php'])
    .pipe(livereload(server));
});
//Default
gulp.task('default', function() {
    gulp.start('fileinclude', 'styles', 'scripts');
});
// Watch
gulp.task('watch', function() {
  // Livereload listen on default port 35729
  server.listen(35729, function (err) {
    if (err) {
      return console.log(err)
    };
    gulp.watch('templates/**/*.html', ['fileinclude']);
    gulp.watch('library/scss/**/*.scss', ['styles']);
    gulp.watch('library/js/**/*.js', ['scripts']);
  });
});