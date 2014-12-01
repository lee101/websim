var gulp = require('gulp');
var gutil = require('gulp-util');

var sourcemaps = require('gulp-sourcemaps');

var less = require('gulp-less');
var path = require('path');

var nunjucks = require('gulp-nunjucks');
var htmlmin = require('gulp-htmlmin');
var concat = require('gulp-concat');


gulp.task('less', function () {
    gulp.src('./static/stylesheets/style.less')
        .pipe(sourcemaps.init())
        .pipe(less()).on('error', function (err) {
            gutil.log(err.message);
        })
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./static/stylesheets'));
});

gulp.task('nunjucks', function () {
    gulp.src('./templates/shared/**/*.jinja2')
        .pipe(htmlmin())
        .pipe(nunjucks()).on('error', function (err) {
            gutil.log(err.message);
        })
        .pipe(sourcemaps.write())
        .pipe(concat('templates.js'))
        .pipe(gulp.dest('./static/js/templates'));
});

gulp.task('watch', function () {
    gulp.watch('./static/stylesheets/**/*.less', ['less']);
    gulp.watch('./templates/shared/**/*.jinja2', ['nunjucks']);
});

gulp.task('default', function () {
    gulp.start('watch', 'less', 'nunjucks');
});
