
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
  gulp.src('player/exports/render/data.js')
  //gulp.src('build/player/bodymovin.js')
    .pipe(gzip({ append: false }))
    .pipe(gulp.dest('demo/'));
});

gulp.task('lint', function() {
    return gulp.src('player/js/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
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
        //.pipe(gulp.dest('/Program Files/Adobe/Adobe After Effects CS6/Support Files/Scripts/ScriptUI Panels'))
        .pipe(gulp.dest('/Program Files/Adobe/Adobe After Effects CC 2015/Support Files/Scripts/ScriptUI Panels'))
});

  gulp.task('watch', function () {
    gulp.watch('./parser/*.js',['joinModules']);
});

gulp.task('buildPlayer', function(){
    gulp.src('./player/index.html')
        .pipe(usemin({
            js: [uglify()]
        }))
        //.pipe(wrap('(function(window){"use strict";<%= contents %>}(window));'))
        .pipe(wrap('(function(window){<%= contents %>}(window));'))
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

gulp.task('buildCanvasPlayer', function(){
    gulp.src([
            'player/js/main.js',
            'player/js/3rd_party/transformation-matrix.js',
            'player/js/utils/MatrixManager.js',
            'player/js/utils/animationFramePolyFill.js',
            'player/js/utils/common.js',
            'player/js/utils/canvasPolyFill.js',
            'player/js/utils/functionExtensions.js',
            'player/js/utils/bez.js',
            'player/js/utils/DataManager.js',
            'player/js/renderers/CanvasRenderer.js',
            'player/js/mask.js',
            'player/js/elements/canvasElements/CVBaseElement.js',
            'player/js/elements/canvasElements/CVCompElement.js',
            'player/js/elements/canvasElements/CVImageElement.js',
            'player/js/elements/canvasElements/CVShapeElement.js',
            'player/js/elements/canvasElements/CVShapeItemElement.js',
            'player/js/elements/canvasElements/CVSolidElement.js',
            'player/js/elements/canvasElements/CVTextElement.js',
            'player/js/elements/canvasElements/CVMaskElement.js',
            'player/js/animation/AnimationManager.js',
            'player/js/animation/AnimationItem.js',
            'player/js/module.js'
        ])
        .pipe(concat('canvasPlayer.js', {newLine: '\r\n'}))
        .pipe(uglify())
        .pipe(wrap('(function(window){"use strict";<%= contents %>}(window));'))
        .pipe(gulp.dest('build/player/'));
});

gulp.task('gzipPlayer', function(){
    gulp.src('./player/index.html')
        .pipe(usemin({
            js: [uglify()]
        }))
        .pipe(wrap('(function(window){"use strict";<%= contents %>}(window));'))
        .pipe(gzip({ append: true }))
        .pipe(gulp.dest('build/'));
});

gulp.task('concatPlayer', function() {
    gulp.src([
            'player/js/main.js',
            'player/js/3rd_party/transformation-matrix.js',
            'player/js/3rd_party/canvasPoly.js',
            'player/js/utils/MatrixManager.js',
            'player/js/utils/animationFramePolyFill.js',
            'player/js/utils/common.js',
            'player/js/utils/canvasPolyFill.js',
            'player/js/utils/functionExtensions.js',
            'player/js/utils/bez.js',
            'player/js/utils/DataManager.js',
            'player/js/renderers/SVGRenderer.js',
            'player/js/renderers/CanvasRenderer.js',
            'player/js/mask.js',
            'player/js/elements/BaseElement.js',
            'player/js/elements/CompElement.js',
            'player/js/elements/ImageElement.js',
            'player/js/elements/ShapeElement.js',
            'player/js/elements/ShapeItemElement.js',
            'player/js/elements/SolidElement.js',
            'player/js/elements/TextElement.js',
            'player/js/elements/canvasElements/CVBaseElement.js',
            'player/js/elements/canvasElements/CVCompElement.js',
            'player/js/elements/canvasElements/CVImageElement.js',
            'player/js/elements/canvasElements/CVShapeElement.js',
            'player/js/elements/canvasElements/CVShapeItemElement.js',
            'player/js/elements/canvasElements/CVSolidElement.js',
            'player/js/elements/canvasElements/CVTextElement.js',
            'player/js/elements/canvasElements/CVMaskElement.js',
            'player/js/animation/AnimationManager.js',
            'player/js/animation/AnimationItem.js',
            'player/js/module.js'
        ])
        .pipe(concat('concat.js', {newLine: '\r\n'}))
        .pipe(wrap('\r\n(function(){\r\n\'use strict\';\r\n<%= contents %>\r\n}());'))
        .pipe(gulp.dest('build/player/'))
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