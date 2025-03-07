var gulp = require('gulp');
var gutil = require('gulp-util');

var sourcemaps = require('gulp-sourcemaps');

var less = require('gulp-less');
var path = require('path');

var nunjucks = require('gulp-nunjucks');
var htmlmin = require('gulp-htmlmin');
var concat = require('gulp-concat');


function compileLess() {
    return gulp.src('./static/stylesheets/style.less')
        .pipe(sourcemaps.init())
        .pipe(less()).on('error', function (err) {
            gutil.log(err.message);
        })
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./static/stylesheets'));
}

function compileNunjucks() {
    return gulp.src('./templates/shared/**/*.jinja2')
        .pipe(htmlmin())
        .pipe(nunjucks()).on('error', function (err) {
            gutil.log(err.message);
        })
        .pipe(sourcemaps.write())
        .pipe(concat('templates.js'))
        .pipe(gulp.dest('./static/js/templates'));
}

function watchFiles() {
    gulp.watch('./static/stylesheets/**/*.less', compileLess);
    gulp.watch('./templates/shared/**/*.jinja2', compileNunjucks);
}

// Export tasks
gulp.task('less', compileLess);
gulp.task('nunjucks', compileNunjucks);
gulp.task('watch', watchFiles);
gulp.task('default', gulp.series(gulp.parallel(compileLess, compileNunjucks), watchFiles));
