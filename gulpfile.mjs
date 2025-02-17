// gulpfile.mjs

import gulp from 'gulp';
import plumber from 'gulp-plumber';
import log from 'fancy-log';
import terser from 'gulp-terser'; // Updated import
import sourcemaps from 'gulp-sourcemaps';
import uglifycss from 'gulp-uglifycss';
import zip from 'gulp-zip';
import npmDist from 'gulp-npm-dist';
import { deleteAsync } from 'del'; // Correct named import
import fs from 'fs/promises'; // ESM-compatible fs module
import replace from 'gulp-replace';

// Error handling function
function onError(err) {
  log.error(err);
}

// Clean up dist folder
gulp.task('clean-dist', gulp.series(async () => {
  await deleteAsync(['dist']);
}));

// For compiling from ES6 and other JS latest code
gulp.task('js', gulp.series(() => {
  log('Gulp js task executing');
  return gulp
    .src('app/scripts/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(plumber({ errorHandler: onError }))
    .pipe(terser()) // Use terser instead of uglify
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/scripts'));
}));

// Service workers
gulp.task('process-firebase-config', gulp.series(async () => {
  log('Processing Firebase configuration');
  const firebaseConfig = JSON.parse(await fs.readFile('./app/config/firebase-config.json', 'utf8'));
  
  return gulp
    .src('app/background.js')
    .pipe(sourcemaps.init())
    .pipe(plumber({ errorHandler: onError }))
    .pipe(replace('%%FIREBASE_CONFIG%%', JSON.stringify(firebaseConfig)))
    .pipe(terser())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'));
}));

// Copy html files into build for every update
gulp.task('copy-html', gulp.series(() => {
  log('Gulp copy-html task executing');
  return gulp
    .src('app/html/*')
    .pipe(plumber({ errorHandler: onError }))
    .pipe(gulp.dest('dist/html'));
}));

// Uglify CSS and copy to build
gulp.task('copy-css', gulp.series(() => {
  log('Gulp copy-css task executing');
  return gulp
    .src('app/styles/**/*.css')
    .pipe(sourcemaps.init())
    .pipe(plumber({ errorHandler: onError }))
    .pipe(
      uglifycss({
        maxLineLen: 80,
        uglifyComments: true
      })
    )
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/styles'));
}));

// Copy image files
gulp.task('copy-images', gulp.series(() => {
  log('Gulp copy-images task executing');
  return gulp
    .src('app/images/**/*.+(png|jpg|gif|svg)', {encoding: false})
    .pipe(plumber({ errorHandler: onError }))
    .pipe(gulp.dest('dist/images'));
}));

// Copy new manifest for every update in manifest
gulp.task('copy-manifest', gulp.series(() => {
  log('Gulp copy-manifest task executing');
  return gulp
    .src('app/manifest.json')
    .pipe(plumber({ errorHandler: onError }))
    .pipe(gulp.dest('dist'));
}));

// Copy _locales 
gulp.task('copy-locales', gulp.series(() => {
  log('Gulp copy-locales task executing');
  return gulp
    .src('app/_locales/**')
    .pipe(plumber({ errorHandler: onError }))
    .pipe(gulp.dest('dist/_locales'));
}));

// Copy dependencies to ./public/libs/
gulp.task('copy-libs', gulp.series(() => {
  return gulp
    .src(npmDist(), { base: './node_modules' })
    .pipe(gulp.dest('dist/scripts/libs'));
}));

// A gulp watcher for executing above tasks
gulp.task('watch', gulp.series(() => {
  log('Gulp is watching your files :- )');
  gulp.watch('app/styles/**/*.css', gulp.series('copy-css'));
  gulp.watch('app/html/*', gulp.series('copy-html'));
  gulp.watch('app/images/*', gulp.series('copy-images'));
  gulp.watch('app/manifest.json', gulp.series('copy-manifest'));
  gulp.watch('app/_locales/**', gulp.series('copy-locales'));
  gulp.watch('app/js/*.js', gulp.series('js'));
}));

// Prepare zip
gulp.task('zip', gulp.series(async () => {
  log('Gulp zip task executing');
  
  // Read and parse manifest.json using fs/promises
  const manifestContent = await fs.readFile('./dist/manifest.json', 'utf8');
  const manifest = JSON.parse(manifestContent);
  
  return gulp.src('dist/**/*')
    .pipe(zip(`Environment Marker-${manifest.version}.zip`))
    .pipe(gulp.dest('package'));
}));

// Build task
gulp.task('build', gulp.series(
  'clean-dist',
  'js',
  'process-firebase-config',
  'copy-html',
  'copy-css',
  'copy-images',
  'copy-manifest',
  'copy-locales',
  'copy-libs',
  (done) => { // Accept the 'done' callback
    done(); // Signal completion
  }
));

// Package task
gulp.task('package', gulp.series(
  'build',
  'zip',
  (done) => { // Accept the 'done' callback
    done(); // Signal completion
  }
));

// Default task
gulp.task('default', gulp.series(
  'build',
  'watch',
  (done) => { // Accept the 'done' callback
    done(); // Signal completion
  }
));
