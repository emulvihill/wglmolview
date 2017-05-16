"use strict";

var gulp = require('gulp');
var connect = require('gulp-connect');
var jasmineBrowser = require('gulp-jasmine-browser');

gulp.task('jasmine', function () {
    return gulp.src(['src/**/*.js', 'spec/**/*.spec.js'])
        .pipe(jasmineBrowser.specRunner())
        .pipe(jasmineBrowser.server({port: 8888}));
});

gulp.task('connect', function () {
    connect.server({
        root: 'app',
        livereload: true
    });
});

gulp.task('html', function () {
    gulp.src('./app/*.html')
        .pipe(connect.reload());
});

gulp.task('watch', function () {
    gulp.watch(['./app/*.html'], ['html']);
});

gulp.task('default', ['connect', 'watch']);