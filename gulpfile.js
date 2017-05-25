"use strict";

var gulp = require("gulp");
var connect = require("gulp-connect");
var shell = require("shelljs");

gulp.task("clean", function () {
    return shell.rm("-rf", "./src/**/*.js", "./src/**/*.js.map", "./spec/**/*.js", "./spec/**/*.js.map",
        "./coverage", "./target");
});

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
