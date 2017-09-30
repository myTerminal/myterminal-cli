/* global require */

var gulp = require('gulp'),
    watch = require('gulp-watch'),
    uglify = require('gulp-uglify');

gulp.task('scripts', function () {
    return gulp.src([
        'src/**/*.js'
    ])
        .pipe(uglify())
        .pipe(gulp.dest('bin'));
});

gulp.task('scripts-debug', function () {
    return gulp.src([
        'src/**/*.js'
    ])
        .pipe(gulp.dest('bin'));
});

gulp.task('default', ['scripts']);

gulp.task('debug', ['scripts-debug']);

gulp.task('develop', function() {
    gulp.watch([
        'src/**/*.js'
    ], [
        'scripts-debug'
    ]);
});
