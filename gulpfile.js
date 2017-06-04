// gulpfile.js
// Heavily inspired by Mike Valstar's solution:
//   http://mikevalstar.com/post/fast-gulp-browserify-babelify-watchify-react-build/
var babelify = require('babelify'),
    browserify = require('browserify'),
    buffer = require('vinyl-buffer'),
    gulp = require('gulp'),
    // gutil     = require('gulp-util'),
    connect = require('gulp-connect')
    rename = require('gulp-rename'),
    source = require('vinyl-source-stream'),
    uglify = require('gulp-uglify'),
    pump = require('pump'),
    cssnano = require('gulp-cssnano'),
    sass = require('gulp-sass'),
    sourceMaps = require('gulp-sourcemaps');
// watchify = require('watchify');
var config = {
    js: {
        src: './js/script.js', // Entry point
        outputDir: './js/built/', // Directory to save bundle to
        mapDir: './maps/', // Subdirectory to save maps to
        outputFile: 'script_built.js' // Name to use for bundle
    }
};
// This method makes it easy to use common bundling options in different tasks
function bundle(bundler) {
    "use strict";
    // Add options to add to "base" bundler passed as parameter
    bundler.bundle() // Start bundle
        .pipe(source(config.js.src)) // Entry point
        .pipe(buffer()) // Convert to gulp pipeline
        .pipe(rename(config.js.outputFile)) // Rename output from 'main.js'
        //   to 'bundle.js'
        .pipe(sourceMaps.init({
            loadMaps: false
        })) // Strip inline source maps
        .pipe(sourceMaps.write(config.js.mapDir)) // Save source maps to their
        //   own directory
        .pipe(gulp.dest(config.js.outputDir)) // Save 'bundle' to built/
}
gulp.task('bundle', function(cb) {
    "use strict";
    var bundler = browserify(config.js.src) // Pass browserify the entry point
        .transform(babelify, {
            presets: ['es2015']
        }); // Then, babelify, with ES2015 preset
    bundle(bundler); // Chain other options -- sourcemaps, rename, etc.
    cb();
});

gulp.task('sass', function(cb) {

    pump([
        gulp.src('./sass/*.scss'),
        sass(),
        cssnano(),
        rename(function (path) {path.basename = "style"}),
        gulp.dest('public/'),
        connect.reload()
    ], cb);
});

//uglify the JS only after bundle is finished
gulp.task('compressJs', ['bundle'], function () {
    "use strict";
    pump([
        gulp.src('./js/built/*.js'),
        uglify(),
        rename(function(path) {path.basename = "script"}),
        gulp.dest('./public'),
        connect.reload()
    ]);
});

// Update HTML for livereload
gulp.task('html', function() {
    return gulp.src([
        './index.html'
    ])
    .pipe(connect.reload());
});

/// start up server for live reload
gulp.task('connect', function() {
  connect.server({
    // root: 'blocGrid',
    livereload: true
  });
});

// Where gulp is watching
gulp.task('watch', function() {
    "use strict";
    gulp.watch('./js/*.js', ['bundle', 'compressJs']);
    gulp.watch('./sass/*.scss', ['bundle', 'sass']);
    gulp.watch('./*.html', ['html']);
});
gulp.task('default', ['connect', 'watch']);
