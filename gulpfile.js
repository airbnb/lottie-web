
// include gulp
var gulp = require('gulp'); 

// include plug-ins
var uglify = require('gulp-uglify');
var usemin = require('gulp-usemin');
var replace = require('gulp-replace');
var wrap = require('gulp-wrap');
var gzip = require('gulp-gzip');
var concat = require('gulp-concat');
var watch = require('gulp-watch');
var jshint = require('gulp-jshint');
var rename = require('gulp-rename');

gulp.task('gzipFile', function(){
  gulp.src('player/exports/render/data.json')
    .pipe(gzip({ append: false }))
    .pipe(gulp.dest('demo/'));
});

gulp.task('lint', function() {
    return gulp.src('player/js/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('buildPlayer', function(){
    gulp.src('./player/index.html')
        .pipe(usemin({
            js: [uglify()]
        }))
        //.pipe(wrap('(function(window){"use strict";<%= contents %>}(window));'))
        //.pipe(wrap('(function(window){<%= contents %>}(window));'))
        .pipe(gulp.dest('build/player/'));
});

gulp.task('zipPlayer',['buildPlayer'], function(){
    gulp.src('./player/index.html')
        .pipe(usemin({
            js: [uglify()]
        }))
        //.pipe(wrap('(function(window){"use strict";<%= contents %>}(window));'))
        .pipe(wrap('(function(window){<%= contents %>}(window));'))
        .pipe(gzip({ append: true }))
        .pipe(gulp.dest('build/player/'));
});


var extensionSource = './extension';
var extensionDestination = '../../../../Users/Deeandra/AppData/Roaming/Adobe/CEP/extensions/bodymovin';
gulp.task('watch-extension', function() {
    gulp.src(extensionSource + '/**/*', {base: extensionSource})
        .pipe(watch(extensionSource, {base: extensionSource}))
        .pipe(gulp.dest(extensionDestination));
});


gulp.task('copy-extension', function() {
    gulp.src(extensionSource+'/**/*')
        .pipe(gulp.dest(extensionDestination));
});