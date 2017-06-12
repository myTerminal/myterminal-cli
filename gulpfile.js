/* global require */

var gulp = require('gulp'),
    watch = require('gulp-watch'),
    uglify = require('gulp-uglify');

gulp.task('scripts-main', function () {
    return gulp.src([
        'src/index.js'
    ]).pipe(uglify())
        .pipe(gulp.dest('bin'));
});

gulp.task('scripts-main-debug', function () {
    return gulp.src([
        'src/index.js'
    ]).pipe(gulp.dest('bin'));
});

gulp.task('scripts-legacy', function () {
    return gulp.src([
        'src/index-legacy.js'
    ]).pipe(uglify())
        .pipe(gulp.dest('bin'));
});

gulp.task('scripts-legacy-debug', function () {
    return gulp.src([
        'src/index-legacy.js'
    ]).pipe(gulp.dest('bin'));
});

gulp.task('scripts', [
    'scripts-main',
    'scripts-legacy'
]);

gulp.task('scripts-debug', [
    'scripts-main-debug',
    'scripts-legacy-debug'
]);

gulp.task('default', ['scripts']);

gulp.task('debug', ['scripts-debug']);

gulp.task('develop', function() {
    gulp.watch([
        'src/index.js'
    ], [
        'scripts-main-debug'
    ]);

    gulp.watch([
        'src/index-legacy.js'
    ], [
        'scripts-legacy-debug'
    ]);
});
