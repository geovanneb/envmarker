// gulpfile.mjs

import gulp from 'gulp';
import plumber from 'gulp-plumber';
import log from 'fancy-log';
import terser from 'gulp-terser';
import sourcemaps from 'gulp-sourcemaps';
import uglifycss from 'gulp-uglifycss';
import npmDist from 'gulp-npm-dist';
import { deleteAsync } from 'del';
import fs from 'fs/promises';  // Promise-based fs module
import fsSync from 'fs';         // For stream methods
import archiver from 'archiver'; // New zip library
import replace from 'gulp-replace';
import merge from 'merge-stream'; // Combine multiple streams
import rename from 'gulp-rename'; // For renaming files

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

// Service workers (processing firebase config)
// NOTE: Replace the placeholder BEFORE initializing sourcemaps so the sourcemap reflects the real values.
gulp.task('process-firebase-config', gulp.series(async () => {
  log('Processing Firebase configuration');
  const firebaseConfig = JSON.parse(await fs.readFile('./app/config/firebase-config.json', 'utf8'));
  
  return gulp
    .src('app/background.js')
    .pipe(plumber({ errorHandler: onError }))
    // Perform the replacement BEFORE initializing sourcemaps.
    .pipe(replace('%%FIREBASE_CONFIG%%', JSON.stringify(firebaseConfig)))
    .pipe(sourcemaps.init())
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
    .src('app/images/**/*.+(png|jpg|gif|svg)', { encoding: false })
    .pipe(plumber({ errorHandler: onError }))
    .pipe(gulp.dest('dist/images'));
}));

// Copy default manifest for Chrome build
gulp.task('copy-manifest', gulp.series(() => {
  log('Gulp copy-manifest task executing (default manifest)');
  return gulp
    .src('app/manifest.json')
    .pipe(plumber({ errorHandler: onError }))
    .pipe(gulp.dest('dist'));
}));

// NEW TASK: Copy firefox-specific manifest (manifest_firefox.json)
// Renames it to manifest.json for the build.
gulp.task('copy-firefox-manifest', gulp.series(() => {
  log('Gulp copy-firefox-manifest task executing');
  return gulp
    .src('app/manifest_firefox.json')
    .pipe(plumber({ errorHandler: onError }))
    .pipe(rename('manifest.json'))
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

// Copy dependencies to ./dist/scripts/libs/
gulp.task('copy-libs', gulp.series(() => {
  // npmDist returns paths relative to node_modules
  const libs = npmDist();
  // Remove any firebase files from the npmDist list.
  const nonFirebaseLibs = libs.filter(file => !file.includes('firebase'));
  
  // Stream for non‑Firebase libraries (preserve base paths)
  const nonFirebaseStream = gulp.src(nonFirebaseLibs, { base: './node_modules' })
    .pipe(gulp.dest('dist/scripts/libs'));
    
  // Stream for Firebase: adjust paths if necessary.
  const firebaseStream = gulp.src([
    'node_modules/firebase/firebase-app-compat.js',
    'node_modules/firebase/firebase-remote-config-compat.js'
  ])
  .pipe(gulp.dest('dist/scripts/libs/firebase'));
  
  // Merge the two streams so the task completes when both are done.
  return merge(nonFirebaseStream, firebaseStream);
}));

// NEW TASK: Copy textfit dependency to its expected location
gulp.task('copy-textfit', gulp.series(() => {
  return gulp.src('node_modules/textfit/textFit.min.js', { allowEmpty: true })
    .pipe(gulp.dest('dist/scripts/libs/textfit'));
}));

// A gulp watcher for executing above tasks
gulp.task('watch', gulp.series(() => {
  log('Gulp is watching your files :- )');
  gulp.watch('app/styles/**/*.css', gulp.series('copy-css'));
  gulp.watch('app/html/*', gulp.series('copy-html'));
  gulp.watch('app/images/*', gulp.series('copy-images'));
  gulp.watch('app/manifest.json', gulp.series('copy-manifest'));
  gulp.watch('app/manifest_firefox.json', gulp.series('copy-firefox-manifest'));
  gulp.watch('app/_locales/**', gulp.series('copy-locales'));
  gulp.watch('app/scripts/**/*.js', gulp.series('js'));
}));

// Prepare zip using archiver
gulp.task('zip', gulp.series(async () => {
  log('Gulp zip task executing');

  // Read and parse manifest.json to get version info
  const manifestContent = await fs.readFile('./dist/manifest.json', 'utf8');
  const manifest = JSON.parse(manifestContent);
  const zipFileName = `Environment Marker-${manifest.version}.zip`;

  // Ensure the package directory exists
  await fs.mkdir('package', { recursive: true });

  return new Promise((resolve, reject) => {
    const output = fsSync.createWriteStream(`package/${zipFileName}`);
    const archive = archiver('zip', { zlib: { level: 9 } }); // Maximum compression

    output.on('close', () => {
      log(`Created zip file: ${zipFileName} (${archive.pointer()} total bytes)`);
      resolve();
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);
    // Append the entire 'dist' folder into the archive
    archive.directory('dist/', false);
    archive.finalize();
  });
}));

// Standard build task (for default/Chrome build)
gulp.task('build', gulp.series(
  'clean-dist',
  'js',
  'process-firebase-config',
  'copy-html',
  'copy-css',
  'copy-images',
  'copy-manifest',     // Default manifest for Chrome
  'copy-locales',
  gulp.parallel('copy-libs', 'copy-textfit'),
  (done) => { 
    done(); // Signal completion
  }
));

// Build task for Firefox (using Firefox-specific manifest)
gulp.task('build:firefox', gulp.series(
  'clean-dist',
  'js',
  'process-firebase-config',
  'copy-html',
  'copy-css',
  'copy-images',
  'copy-firefox-manifest',   // Firefox-specific manifest
  'copy-locales',
  gulp.parallel('copy-libs', 'copy-textfit'),
  (done) => { 
    done(); // Signal completion
  }
));

// Package task for default build
gulp.task('package', gulp.series(
  'build',
  'zip',
  (done) => { 
    done(); // Signal completion
  }
));

// Package task for Firefox build
gulp.task('package:firefox', gulp.series(
  'build:firefox',
  'zip',
  (done) => { 
    done(); // Signal completion
  }
));

// Default task: build and then watch files
gulp.task('default', gulp.series(
  'build',
  'watch',
  (done) => { 
    done(); // Signal completion
  }
));
