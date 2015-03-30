
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

gulp.task('gzipFile', function(){
  gulp.src('demo/mcangel/anim/data.json')
  //gulp.src('build/player/bodymovin.js')
    .pipe(gzip({ append: false }))
    .pipe(gulp.dest('demo/'));
});

gulp.task('buildParser', function() {
    gulp.src([
            'parser/polyfills.js',
            'parser/global.js',
            'parser/AssetsManager.js',
            'parser/AsyncManager.js',
            'parser/DOMAnimationManager.js',
            'parser/EffectsParser.js',
            'parser/EffectsStrokeParser.js',
            'parser/extras.js',
            'parser/RQManager.js',
            'parser/LayerConverter.js',
            'parser/ShapesParser.js',
            'parser/CompConverter.js',
            'parser/UI.js'
        ])
        .pipe(concat('bodymovin_parser.jsx', {newLine: '\r\n'}))
        .pipe(wrap('var Gtlym = {};var bodymovinWindow = this;\r\n(function(){\r\n<%= contents %>\r\n}());'))
        .pipe(gulp.dest('build/parser/'))
});

gulp.task('joinModules', function() {
    gulp.src([
            'parser/polyfills.js',
            'parser/global.js',
            'parser/AssetsManager.js',
            'parser/AsyncManager.js',
            'parser/DOMAnimationManager.js',
            'parser/EffectsParser.js',
            'parser/EffectsStrokeParser.js',
            'parser/extras.js',
            'parser/RQManager.js',
            'parser/LayerConverter.js',
            'parser/ShapesParser.js',
            'parser/CompConverter.js',
            'parser/UI.js'
        ])
        .pipe(concat('bodymovin_parser.jsx', {newLine: '\r\n'}))
        .pipe(wrap('var Gtlym = {};var bodymovinWindow = this;\r\n(function(){\r\n<%= contents %>\r\n}());'))
        .pipe(gulp.dest('/Program Files/Adobe/Adobe After Effects CS6/Support Files/Scripts/ScriptUI Panels'))
});

  gulp.task('watch', function () {
    gulp.watch('./parser/*.js',['joinModules']);
});

gulp.task('buildPlayer', function(){
    gulp.src('./player/index.html')
        .pipe(usemin({
            js: [uglify()]
        }))
        .pipe(wrap('(function(window){"use strict";<%= contents %>}(window));'))
        .pipe(gulp.dest('build/player/'));
});

gulp.task('gzipPlayer', function(){
    gulp.src('./player/index.html')
        .pipe(usemin({
            js: [uglify()]
        }))
        .pipe(wrap('(function(window){<%= contents %>}(window));'))
        .pipe(gzip({ append: true }))
        .pipe(gulp.dest('build/'));
});