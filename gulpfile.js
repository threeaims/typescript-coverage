var gulp     = require("gulp"),
    istanbul = require("gulp-istanbul"),
    jasmine  = require("gulp-jasmine"),
    runSequence = require("run-sequence"),
    shell = require("gulp-shell"),
    sourcemaps = require("gulp-sourcemaps"),
    ts = require("gulp-typescript"),
    tslint = require("gulp-tslint");
 
var failures = [];

gulp.task("default", ["watch"]);

gulp.task("report", function() {
    if (failures.length) {
        console.log(failures);
    }
})

gulp.task("report-and-fail", function() {
    if (failures.length) {
        console.log(failures);
        process.exit(1);
    }
})

gulp.task("lint", function() {
  return gulp.src(["./src/*.ts", "./src/**/*.ts"])
  .pipe(tslint({
      formatter: "verbose",
      configuration: "tslint.json",
  }))
  .pipe(tslint.report({
      emitError: process.argv[2] === 'watch' ? false: true,
  }))
});

gulp.task("watch", ["test-watch"], function() {
  gulp.watch(["src/**/*.ts", "src/*.ts"], ["test-watch"]);
});

gulp.task("dist", function() {
  return gulp.src(['build/*.js', 'build/**/*.js', '!build/*.spec.js', '!build/**/*.spec.js'])
  .pipe(gulp.dest('dest'));
});

gulp.task("test", function (done) {
  runSequence("typescript", "cover-unit", "cover-e2e", "lint", "dist", "report-and-fail", done);
});

gulp.task("test-watch", function (done) {
  runSequence("typescript", "cover-unit", "cover-e2e", "lint", "dist", "report", done);
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

gulp.task("test-unit", function () {
  return gulp.src(["build/*.js", "build/**/*.js", "!build/*.spec.js", "!build/**/*.spec.js"])
    .pipe(istanbul({includeUntested: true}))
    .on("finish", function (done) {
        return gulp.src(["build/*.spec.js", "!build/e2e.spec.js", "./build/**/*.spec.js"])
          .pipe(jasmine({verbose: true}))
          .on('error', () => {
              failures.push('test-unit');
          })
          .pipe(istanbul.writeReports({
            dir: "./build/unit-test-coverage",
            reporters: [ "json" ],
            reportOpts: { dir: "./build/unit-test-coverage"}
          }));
    });
});

gulp.task("cover-unit", ["test-unit"], shell.task([
  "./node_modules/.bin/remap-istanbul -b src -i ./build/unit-test-coverage/coverage-final.json -o ./build/unit-test-coverage/remapped/coverage.json",
  "./node_modules/.bin/istanbul report --root   ./build/unit-test-coverage/remapped text",
  // "./node_modules/.bin/istanbul report --root   ./build/unit-test-coverage/remapped html",
], {
  env: { FORCE_COLOR: true }
}));

gulp.task("test-e2e", function () {
  return gulp.src(["./build/*.js", "./build/**/*.js", "!build/*.spec.js", "!build/**/*.spec.js"])
    .pipe(istanbul({includeUntested: true}))
    .on("finish", function () {
        gulp.src(["./build/e2e.spec.js"])
          .pipe(jasmine({verbose: true}))
          .on('error', () => {
              failures.push('test-e2e');
          })
          .pipe(istanbul.writeReports({
            dir: "./build/e2e-test-coverage",
            reporters: [ "json" ],
            reportOpts: { dir: "./build/e2e-test-coverage"}
          }));
    });
});

gulp.task("cover-e2e", ["test-e2e"], shell.task([
  "./node_modules/.bin/remap-istanbul -b src -i ./build/e2e-test-coverage/coverage-final.json -o ./build/e2e-test-coverage/remapped/coverage.json",
  "./node_modules/.bin/istanbul report --root   ./build/e2e-test-coverage/remapped text",
  // "./node_modules/.bin/istanbul report --root   ./build/e2e-test-coverage/remapped html",
], {
  env: { FORCE_COLOR: true }
}));
