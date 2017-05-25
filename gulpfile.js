"use strict";

var gulp = require("gulp");
var connect = require("gulp-connect");
var shell = require("shelljs");

gulp.task("clean", function () {
    return shell.rm("-rf", "./src/**/*.js", "./src/**/*.js.map", "./spec/**/*.js", "./spec/**/*.js.map",
        "./coverage", "./www/dist");
});

gulp.task("connect", function () {
    connect.server({
        root: "www",
        livereload: true
    });
});
