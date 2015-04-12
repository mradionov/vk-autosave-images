'use strict';

var gulp = require('gulp'),
    rename = require('gulp-rename'),
    rimraf = require('gulp-rimraf'),
    ignore = require('gulp-ignore'),
    zip = require('gulp-zip'),
    merge = require('merge-stream'),
    browserify = require('gulp-browserify');

// remove everythng from dist folder but .gitkeep
gulp.task('clean', function () {
  return gulp.src('./dist/javascripts/*')
    .pipe(ignore('.gitkeep'))
    .pipe(rimraf());
});

// copy vendors
gulp.task('vendor', function () {
  return gulp.src('./src/javascripts/vendor/*')
    .pipe(gulp.dest('./dist/javascripts/vendor'));
});

// compile bundles to specific files
gulp.task('bundle', ['clean', 'vendor'], function () {
  // iterate over bundles and browserify them
  // use loop instead if /**/index.js because it behaves weirdly
  var bundles = ['content', 'event', 'oauth_dropbox', 'options'];
  var streams = bundles.map(function (bundle) {
    return gulp.src('./src/javascripts/bundles/' + bundle + '/index.js')
      .pipe(browserify())
      // rename index.js to the name of the bundle
      .pipe(rename({
        basename: bundle
      }))
      .pipe(gulp.dest('./dist/javascripts'));
  });

  return merge(streams);
});

// create a package for chrome webstore
gulp.task('pack', ['bundle'], function () {
  return gulp.src('./dist/**/*')
    .pipe(ignore('.gitkeep'))
    .pipe(zip('package.zip'))
    .pipe(gulp.dest('./'));
});

gulp.task('watch', function () {
  gulp.watch(['src/javascripts/**/*'], ['bundle']);
});

gulp.task('default', ['bundle']);