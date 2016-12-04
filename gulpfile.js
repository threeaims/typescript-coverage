var gulp     = require("gulp"),
    istanbul = require("gulp-istanbul"),
    jasmine  = require("gulp-jasmine"),
    runSequence = require("run-sequence"),
    shell = require("gulp-shell"),
    sourcemaps = require("gulp-sourcemaps"),
    ts = require("gulp-typescript");
    tslint = require("gulp-tslint"),
 
gulp.task("default", ["watch"]);

gulp.task("lint", function() {
  return gulp.src(["./src/*.ts", "./src/**/*.ts"])
  .pipe(tslint({
      formatter: "verbose",
      configuration: "tslint.json",
  }))
  .pipe(tslint.report({
      // Don"t fail just on lint errors
      emitError: false
  }));
});

gulp.task("watch", ["test"], function() {
  gulp.watch(["src/**/*.ts", "src/*.ts"], ["test"]);
});

gulp.task("test", function (done) {
  runSequence("typescript", "test-unit", "cover-unit", "test-e2e", "cover-e2e", "lint", done);
});

gulp.task("typescript", function() {
  return gulp.src(["src/*.ts", "src/**/*.ts"])
  .pipe(sourcemaps.init())
  .pipe(ts({
      target: "es6",
      module: "commonjs",
  }))
  .pipe(sourcemaps.write())
  .pipe(gulp.dest("build"));
});

gulp.task("test-unit", function (done) {
  return gulp.src(["build/*.js", "build/**/*.js", "!build/*.spec.js", "!build/**/*.spec.js"])
    .pipe(istanbul({includeUntested: true}))
    .on("finish", function (done) {
        return gulp.src(["build/*.spec.js", "!build/e2e.spec.js", "./build/**/*.spec.js"])
          .pipe(jasmine({verbose: true}))
          .on("error", function (err) {
              // done(err);
          })
          .pipe(istanbul.writeReports({
            dir: "./build/unit-test-coverage",
            reporters: [ "json" ],
            reportOpts: { dir: "./build/unit-test-coverage"}
          }));
    });
});

gulp.task("cover-unit", shell.task([
  "./node_modules/.bin/remap-istanbul -b src -i ./build/unit-test-coverage/coverage-final.json -o ./build/unit-test-coverage/remapped/coverage.json",
  "./node_modules/.bin/istanbul report --root   ./build/unit-test-coverage/remapped text",
  // "./node_modules/.bin/istanbul report --root   ./build/unit-test-coverage/remapped html",
 {
  env: { FORCE_COLOR: true }
}));

gulp.task("test-e2e", function (done) {
  return gulp.src(["./build/*.js", "./build/**/*.js", "!build/*.spec.js", "!build/**/*.spec.js"])
    .pipe(istanbul({includeUntested: true}))
    .on("finish", function () {
        gulp.src(["./build/e2e.spec.js"])
          .pipe(jasmine({verbose: true}))
          .on("error", function (err) {
              // done(err);
          })
          .pipe(istanbul.writeReports({
          dir: "./build/e2e-test-coverage",
          reporters: [ "json" ],
          reportOpts: { dir: "./build/e2e-test-coverage"}
        }));
    });
});

gulp.task("cover-e2e", shell.task([
  "./node_modules/.bin/remap-istanbul -b src -i ./build/e2e-test-coverage/coverage-final.json -o ./build/e2e-test-coverage/remapped/coverage.json",
  "./node_modules/.bin/istanbul report --root   ./build/e2e-test-coverage/remapped text",
  // "./node_modules/.bin/istanbul report --root   ./build/e2e-test-coverage/remapped html",
 {
  env: { FORCE_COLOR: true }
}));
