"use strict";
const gulp = require("gulp");
const stylus = require("gulp-stylus");
const pug = require("gulp-pug");
const autoprefixer = require("gulp-autoprefixer");
const clean = require("gulp-clean");
const htmlmin = require("gulp-htmlmin");
const cssmin = require("gulp-cssmin");
const rename = require("gulp-rename");
const runSequence = require("gulp-run-sequence");
const uglify = require("gulp-uglify");
const browserSync = require("browser-sync").create();
const babel = require("gulp-babel");

const cacheBust = require("./custom_modules/cache-bust.js");

const BROWSERS = ["last 2 versions", "ie >= 10"];
const BABEL_OPTIONS = {
  presets: [
    [
      "env",
      {
        targets: {
          browsers: BROWSERS
        }
      }
    ]
  ],
  plugins: ["transform-object-assign", "transform-remove-export"]
};
const SOURCE_DIR = "src/";
const BUILD_DIR = "build/";
const UI_COMPONENT_NAME = "ui-dropdown"

gulp.task("pug", function() {
 return gulp
   .src(SOURCE_DIR + "index.pug")
   .pipe(pug())
   .pipe(
     rename({
       basename: "index"
     })
   )
   .pipe(
     htmlmin({
       collapseWhitespace: true
     })
   )
   .pipe(gulp.dest(BUILD_DIR))
});

gulp.task("css", function() {
  return gulp
    .src(SOURCE_DIR + UI_COMPONENT_NAME + ".styl")
    .pipe(stylus())
    .pipe(
      rename({
        basename: "style"
      })
    )
    .pipe(
      autoprefixer({
        browsers: BROWSERS,
        cascade: false
      })
    )
    .pipe(cssmin())
    .pipe(gulp.dest(BUILD_DIR))
});

gulp.task("js", function() {
  return gulp
      .src(SOURCE_DIR + UI_COMPONENT_NAME  + ".js")
      .pipe(babel(BABEL_OPTIONS))
      .pipe(uglify())
      .pipe(
        rename({
          basename: "index"
        })
      )
      .pipe(gulp.dest(BUILD_DIR));
});

gulp.task("api", function() {
  return gulp
    .src(SOURCE_DIR + "api.js")
    .pipe(babel(BABEL_OPTIONS))
    .pipe(uglify())
    .pipe(gulp.dest(BUILD_DIR));
});

gulp.task("data", function() {
  return gulp
    .src(SOURCE_DIR + "data.json")
    .pipe(gulp.dest(BUILD_DIR));
});

gulp.task("webserver", function() {

  browserSync.init({
    server: {
      baseDir: BUILD_DIR,
    },
    port: 8090
  });
});

gulp.task("watch", function() {

  gulp.watch(
    [SOURCE_DIR + UI_COMPONENT_NAME +".styl"],
    ["css"]
  );

  gulp.watch(
    [SOURCE_DIR +"index.pug"],
    ["pug"]
  );

  gulp.watch(
    [SOURCE_DIR + UI_COMPONENT_NAME +".js"],
    ["js"]
  );

});

gulp.task("clean", function() {
  return gulp
    .src(BUILD_DIR, {
      read: false
    })
    .pipe(clean());
});

// Calculate and inject md5 hashes for script and style files
gulp.task("cache-bust", function(done) {
  cacheBust(done);
});

// Development task
gulp.task("default", function() {
  gulp.run("watch");
  gulp.run("webserver");
});

// Build task
gulp.task("build", function() {
  return runSequence(
    "clean",
    [
      "css",
      "pug",
      "js",
      "api",
      "data"
    ],
    ["cache-bust"]
  );
});







