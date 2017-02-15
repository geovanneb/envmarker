// generated on 2017-02-13 using generator-chrome-extension 0.6.1
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import del from 'del';
import runSequence from 'run-sequence';
import {stream as wiredep} from 'wiredep';
var mainBowerFiles = require('gulp-main-bower-files');

const $ = gulpLoadPlugins();

gulp.task('extras', () => {
  return gulp.src([
    'app/*.*',
    'app/_locales/**',
    '!app/*.json',
    '!app/html/*.html',
    ], {
      base: 'app',
      dot: true
    }).pipe(gulp.dest('dist'));
});

function lint(files, options) {
  return () => {
    return gulp.src(files)
    .pipe($.eslint(options))
    .pipe($.eslint.format());
  };
}

gulp.task('lint', lint('app/scripts/**/*.js', {
  env: {
    es6: false
  }
}));

gulp.task("bower-files", function(){
  return gulp.src('./bower.json')
  .pipe(mainBowerFiles())
  .pipe(gulp.dest('dist/scripts/libs'));
});

gulp.task('js', () => {
  return gulp.src('app/scripts/*.js')
  .pipe($.if('*.js', $.sourcemaps.init()))
    //.pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.js', $.sourcemaps.write('.')))
    .pipe(gulp.dest('dist/scripts'));
  });

gulp.task('images', () => {
  return gulp.src('app/images/**/*')
  .pipe($.if($.if.isFile, $.cache($.imagemin({
    progressive: true,
    interlaced: true,
      // don't remove IDs from SVGs, they are often used
      // as hooks for embedding and styling
      svgoPlugins: [{cleanupIDs: false}]
    }))
  .on('error', function (err) {
    console.log(err);
    this.end();
  })))
  .pipe(gulp.dest('dist/images'));
});

gulp.task('picker-images',  () => {
  return gulp.src([
    'app/bower_components/jscolor/*.gif',
    'app/bower_components/jscolor/*.png'])
  .pipe(gulp.dest('dist/scripts/libs/jscolor'))
});

gulp.task('html',  () => {
  return gulp.src('app/html/*.html')
  .pipe($.useref({searchPath: ['.tmp', 'app', '.']}))
  .pipe($.sourcemaps.init())
  .pipe($.if('*.js', $.uglify()))
  .pipe($.if('*.css', $.cleanCss({compatibility: '*'})))
  .pipe($.sourcemaps.write())
  .pipe($.if('*.html', $.htmlmin({removeComments: true, collapseWhitespace: true})))
  .pipe(gulp.dest('dist/html'));
});

gulp.task('css',  () => {
  return gulp.src('app/styles/*.css')
  .pipe(gulp.dest('dist/styles'));
});

gulp.task('chromeManifest', () => {
  return gulp.src('app/manifest.json')
  .pipe($.chromeManifest({
    buildnumber: true,
      //background: {
      //  target: 'scripts/background.js',
      //  exclude: [
      //    'scripts/chromereload.js'
      //  ]
      //}
    }))
  .pipe($.if('*.css', $.cleanCss({compatibility: '*'})))
  .pipe($.if('*.js', $.sourcemaps.init()))
  .pipe($.if('*.js', $.uglify()))
  .pipe($.if('*.js', $.sourcemaps.write('.')))
  .pipe(gulp.dest('dist'));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('watch', ['lint'], () => {
  $.livereload.listen();

  gulp.watch([
    'app/html/*.html',
    'app/scripts/**/*.js',
    'app/images/**/*',
    'app/styles/**/*',
    'app/_locales/**/*.json'
    ]).on('change', $.livereload.reload);

  gulp.watch('app/scripts/**/*.js', ['lint']);
  gulp.watch('bower.json', ['wiredep']);
});

gulp.task('size', () => {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('wiredep', () => {
  gulp.src('app/html/*.html')
  .pipe(wiredep({
    ignorePath: /^(\.\.\/)*\.\./
  }))
  .pipe(gulp.dest('app'));
});

gulp.task('package', function () {
  var manifest = require('./dist/manifest.json');
  return gulp.src('dist/**')
  .pipe($.zip('Environment Marker-' + manifest.version + '.zip'))
  .pipe(gulp.dest('package'));
});

gulp.task('build', (cb) => {
  runSequence(
    'lint', 'chromeManifest',
    ['html', 'css', 'bower-files', 'picker-images', 'js', 'images', 'extras'],
    'size', cb);
});

gulp.task('default', ['clean'], cb => {
  runSequence('build', cb);
});
