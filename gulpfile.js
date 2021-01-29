const gulp = require("gulp");
const plumber = require("gulp-plumber");
const log = require('fancy-log');
const uglify = require("gulp-uglify-es").default;
const sourcemaps = require("gulp-sourcemaps");
const uglifycss = require("gulp-uglifycss");
const zip = require('gulp-zip');
const npmDist = require('gulp-npm-dist');
const del = require('del');

// Clean up dist folder
gulp.task('clean-dist', gulp.series(function(cb) {
  return del(["dist"], cb);
}));

// For compiling from ES6 and other JS latest code
gulp.task("js", gulp.series(() => {
  log("Gulp js task executing");
  return gulp
    .src("app/scripts/**/*.js")
    .pipe(sourcemaps.init())
    .pipe(plumber({ errorHandler: onError }))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest("dist/scripts"));
}));

// Copy html files into build for every update
gulp.task("copy-html", gulp.series(() => {
  log("Gulp copy-res task executing");
  return gulp
    .src("app/html/*")
    .pipe(plumber({ errorHandler: onError }))
    .pipe(gulp.dest("dist/html"));
}));

// Uglify CSS and copy to build
gulp.task("copy-css", gulp.series(() => {
  log("Gulp copy-res task executing");
  return gulp
    .src("app/styles/**/*.css")
    .pipe(sourcemaps.init())
    .pipe(plumber({ errorHandler: onError }))
    .pipe(
      uglifycss({
        maxLineLen: 80,
        uglifyComments: true
      })
    )
    .pipe(sourcemaps.write())
    .pipe(gulp.dest("dist/styles"));
}));

// Copy image files
gulp.task("copy-images", gulp.series(() => {
  log("Gulp copy-res task executing");
  return gulp
    .src("app/images/*")
    .pipe(plumber({ errorHandler: onError }))
    .pipe(gulp.dest("dist/images"));
}));

// Copy new manifest for every update in manifest
gulp.task("copy-manifest", gulp.series(() => {
  log("Gulp copy-res task executing");
  return gulp
    .src("app/manifest.json")
    .pipe(plumber({ errorHandler: onError }))
    .pipe(gulp.dest("dist"));
}));

// Copy _locales 
gulp.task("copy-locales", gulp.series(() => {
  log("Gulp copy-locales task executing");
  return gulp
    .src("app/_locales/**")
    .pipe(plumber({ errorHandler: onError }))
    .pipe(gulp.dest("dist/_locales"));
}));

// Copy dependencies to ./public/libs/
gulp.task('copy-libs', gulp.series(() => {
  return gulp
    .src(npmDist(), {base:'./node_modules'})
    .pipe(gulp.dest('dist/scripts/libs'));
}));

// A gulp watcher for executing above tasks
gulp.task("watch", gulp.series(() => {
  log("Gulp is watching your files :- )");
  gulp.watch("app/styles/**/*.css", gulp.series("copy-css"));
  gulp.watch("app/html/*", gulp.series("copy-html"));
  gulp.watch("app/images/*", gulp.series("copy-images"));
  gulp.watch("app/manifest.json", gulp.series("copy-manifest"));
  gulp.watch("app/_locales/**", gulp.series("copy-locales"));
  gulp.watch("app/js/*.js", gulp.series("js"));
}));

// Prepare zip
gulp.task("zip", gulp.series(() => {
  log("Gulp zip task executing");
  var manifest = require('./dist/manifest.json');
  return gulp.src('dist/*')
    .pipe(zip('Environment Marker-' + manifest.version + '.zip'))
    .pipe(gulp.dest('package'));
}));

// To run the default task. It will compile all the project and create default structure when ran '$> gulp'
gulp.task(
  "build",
  gulp.series([
    "clean-dist",
    "js",
    "copy-html",
    "copy-css",
    "copy-images",
    "copy-manifest",
    "copy-locales",
    "copy-libs"
  ]),
  () => {
    return log("++++ Build Started ++++!");
  }
);

// Prepare zip package to Chrome web store
gulp.task(
  "package",
  gulp.series([
    "build",
    "zip"
  ]),
  () => {
    return log("++++ Package Started ++++!");
  }
);

// To run the default task. It will compile all the project and create default structure when ran '$> gulp'
gulp.task(
  "default",
  gulp.series([
    "build",
    "watch"
  ]),
  () => {
    return log("++++ Gulp Started ++++!");
  }
);

// An error function. Using this function will plumber will prevent gulp to crash when error occurs
function onError(err) {
  log.error(err);
}
