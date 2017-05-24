"use strict";

var gulp = require("gulp");
var connect = require("gulp-connect");
var jasmineBrowser = require("gulp-jasmine-browser");
var gulp = require("gulp");
var shell = require("shelljs");

gulp.task("compile", function () {
    return shell.exec("tsc --outFile target/wglmolview.js");
});

gulp.task("connect", function () {
    connect.server({
        root: "app",
        livereload: true
    });
});

gulp.task("html", function () {
    gulp.src("./app/*.html")
        .pipe(connect.reload());
});

gulp.task("watch", function () {
    gulp.watch(["./app/*.html"], ["html"]);
});

gulp.task("default", ["connect", "watch"]);