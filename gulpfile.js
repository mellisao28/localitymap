// including plugins
var gulp = require('gulp')
, minifyHtml = require("gulp-minify-html")
, minifyCss = require("gulp-minify-css")
, uglify = require("gulp-uglify")
, jshint = require("gulp-jshint");
 
// minify html
gulp.task('minify-html', function () {
    gulp.src('src/*.html') // path to your files
    .pipe(minifyHtml())
    .pipe(gulp.dest('dist'));
});

// minify css
gulp.task('minify-css', function () {
    gulp.src('src/css/*.css') // path to your file
    .pipe(minifyCss())
    .pipe(gulp.dest('dist/css'));
});

 
// minify js
gulp.task('minify-js', function () {
    gulp.src('src/js/*.js') // path to your files
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'));
});

// js lint
gulp.task('jsLint', function () {
    gulp.src('./JavaScript/*.js') // path to your files
    .pipe(jshint())
    .pipe(jshint.reporter()); // Dump results
});