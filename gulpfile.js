var gulp = require('gulp');

var sourcemaps = require('gulp-sourcemaps');

var less = require('gulp-less');
var path = require('path');

gulp.task('less', function () {
    gulp.src('./static/stylesheets/style.less')
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./static/stylesheets'));
});

gulp.task('watch', function () {
    gulp.watch('./static/stylesheets/**/*.less', ['less']);
});

gulp.task('default', function () {
    gulp.start('watch', 'less');
});
