
// include gulp
var gulp = require('gulp'); 

// include plug-ins
var uglify = require('gulp-uglify');
var usemin = require('gulp-usemin');
var replace = require('gulp-replace');
var rename = require('gulp-rename');
var wrap = require('gulp-wrap');
var gzip = require('gulp-gzip');
var concat = require('gulp-concat');
var watch = require('gulp-watch');
var cheerio = require('gulp-cheerio');
var fs = require('fs');
var htmlreplace = require('gulp-html-replace');
var eventstream = require("event-stream");
var jslint = require('gulp-jslint');
var through = require('through2');
var replace = require('gulp-replace');
var batch_replace = require('gulp-batch-replace');

var bm_version = '5.4.2';

var files = [
    {
        light: true,
        path: ''
    }
]

function customMinify(value) {
    console.log(value);
    return value;
}

var moduleWrap = fs.readFileSync("player/js/module.js", "utf8");
moduleWrap = moduleWrap.replace('/*<%= contents %>*/','<%= contents %>');
moduleWrap = moduleWrap.replace('[[BM_VERSION]]',bm_version);

gulp.task('gzipFile', function(){
  gulp.src('player/exports/render/data.json')
    .pipe(gzip({ append: false }))
    .pipe(gulp.dest('demo/'));
});

gulp.task('lint-code', function () {
    return gulp.src(['.player/js/**/*'])
            .pipe(jslint({ /* this object represents the JSLint directives being passed down */ }))
            .pipe(jslint.reporter( 'my-reporter' ));
});

gulp.task('buildPlayer', function(){
    gulp.src('./player/index.html')
        .pipe(usemin({
            js: [uglify(uglifyOptions)]
        }))
        //.pipe(wrap('(function(window){"use strict";<%= contents %>}(window));'))
        .pipe(wrap(moduleWrap))
        .pipe(gulp.dest('build/player/'));
});

gulp.task('buildUnminifiedPlayer', function(){
    gulp.src('./player/index.html')
        //.pipe(wrap('(function(window){"use strict";<%= contents %>}(window));'))
        .pipe(wrap(moduleWrap))
        .pipe(gulp.dest('build/player/lottie.min.js'));
});

gulp.task('zipPlayer',['buildPlayer','buildUnminifiedPlayer'], function(){
    gulp.src('./player/index.html')
        .pipe(usemin({
            js: [uglify(uglifyOptions)]
        }))
        //.pipe(wrap('(function(window){"use strict";<%= contents %>}(window));'))
        .pipe(wrap(moduleWrap))
        .pipe(gzip({ append: true }))
        .pipe(gulp.dest('build/player/'));
});

var srcs = [];

var demoBuiltData = '';
var uglifyOptions = {output: {ascii_only:true},toplevel:true};


gulp.task('getBuildSources', function(cb) {
    srcs.length = 0;
    gulp.src('./player/index.html')
    .pipe(cheerio(function ($, file) {
        // Each file will be run through cheerio and each corresponding `$` will be passed here.
        // `file` is the gulp file object
        // Make all h1 tags uppercase
        $('script').each(function (index, elem) {
            //console.log(elem.attribs.src);
            if(!elem.attribs['data-skip'] && elem.attribs.src){
                srcs.push('./player/'+elem.attribs.src);
            }
        });
        cb();
    }))
});

function buildVersion(excluded){
    srcs.length = 0;
    return gulp.src('./player/index.html')
        .pipe(cheerio(function ($, file) {
            $('script').each(function (index, elem) {
                //console.log(elem.attribs.src);
                if(elem.attribs.src){
                    var i, len = excluded.length;
                    var exclude = false;
                    for(i=0;i<len;i+=1){
                        if(elem.attribs[excluded[i]]){
                            exclude = true;
                        }
                    }
                    if(!exclude){
                        srcs.push('./player/'+elem.attribs.src);
                        //console.log(srcs.length);
                    }
                }
            });
        }));
}


gulp.task('buildSources', function() {
    return buildVersion(['data-skip']);
});

gulp.task('buildSources', function() {
    return buildVersion(['data-skip']);
});

gulp.task('buildLightSources', function() {
    return buildVersion(['data-skip','data-light-skip']);
});

gulp.task('buildLight',['buildLightSources'], function() {
    return gulp.src(srcs)
        .pipe(concat('lottie_light.js'))
        .pipe(wrap(moduleWrap))
        //.pipe(batch_replace(replacingMap))
        .pipe(gulp.dest('build/player/'));
});

gulp.task('buildLightMin',['buildLightSources'], function() {
    return gulp.src(srcs)
        .pipe(concat('lottie_light.min.js'))
        .pipe(wrap(moduleWrap))
        .pipe(uglify(uglifyOptions))
        //.pipe(batch_replace(replacingMap))
        .pipe(gulp.dest('build/player/'));
});

gulp.task('buildFullMin',['buildSources'], function() {
    return gulp.src(srcs)
        .pipe(concat('lottie.min.js'))
        .pipe(wrap(moduleWrap))
        .pipe(uglify(uglifyOptions))
        //.pipe(batch_replace(replacingMap))
        .pipe(gulp.dest('build/player/'));
});

gulp.task('buildFull',['buildSources'], function() {
    return gulp.src(srcs)
        .pipe(concat('lottie.js'))
        .pipe(wrap(moduleWrap))
        //.pipe(batch_replace(replacingMap))
        .pipe(gulp.dest('build/player/'));
});

gulp.task('buildAll',['buildLightMin','buildLight','buildFullMin','buildFull'], function() {
});

var replacingMap = [
    ['AnimationItem', '_a'],
    ['HBaseElement', '_b'],
    ['CVBaseElement', '_c'],
    ['SVGBaseElement', '_d'],
    ['BaseElement', '_e'],
    ['IShapeElement', '_f'],
    ['ICompElement', '_g'],
    ['IImageElement', '_h'],
    ['NullElement', '_i'],
    ['ISolidElement', '_j'],
    ['ITextElement', '_k'],
    ['BaseRenderer', '_l'],
    ['BaseRenderer', '_l'],
    ['CVCompElement', '_m'],
    ['CVContextData', '_n'],
    ['CVEffects', '_o'],
    ['CVImageElement', '_p'],
    ['CVMaskElement', '_q'],
    ['CVShapeElement', '_r'],
    ['CVSolidElement', '_s'],
    ['CVTextElement', '_t'],
    ['HBaseElement', '_u'],
    ['HCameraElement', '_v'],
    ['globalData', '_x'],
    ['HCompElement', '_w'],
    ['HImageElement', '_y'],
    ['HShapeElement', '_z'],
    ['HSolidElement', '_aa'],
    ['HTextElement', '_ab'],
    ['FrameElement', '_ac'],
    ['HierarchyElement', '_ad'],
    ['RenderableElement', '_ae'],
    ['createTransformElement', '_cp'],
    ['TransformElement', '_af'],
    ['TransformPropertyFactory', '_ag'],
    ['ShapePropertyFactory', '_ah'],
    ['PropertyFactory', '_ai'],
    ['RepeaterModifier', '_aj'],
    ['localShapeCollection', '_ak'],
    ['newShapeCollection', '_al'],
    ['ShapeCollection', '_am'],
    ['TrimModifier', '_an'],
    ['SVGRenderer', '_ao'],
    ['HybridRenderer', '_ap'],
    ['CanvasRenderer', '_aq'],
    ['TextProperty', '_ar'],
    ['ShapeModifiers', '_as'],
    ['ShapeModifier', '_at'],
    ['RoundCornersModifier', '_au'],
    ['ShapePath', '_av'],
    ['setTripleAt', '_aw'],
    ['setXYAt', '_ax'],
    ['MaskElement', '_ay'],
    ['prepareFrame', '_az'],
    ['renderFrame', '_ba'],
    ['SVGTintFilter', '_bb'],
    ['SVGFillFilter', '_bc'],
    ['SVGStrokeEffect', '_bd'],
    ['SVGTritoneFilter', '_be'],
    ['SVGProLevelsFilter', '_bf'],
    ['SVGDropShadowEffect', '_bg'],
    ['SVGMatte3Effect', '_bh'],
    ['SVGEffects', '_bi'],
    ['getTransformProperty', '_bj'],
    ['TransformProperty', '_bk'],
    ['TextAnimatorProperty', '_bl'],
    ['textAnimator_animatables', '_bn'],
    ['getProp', '_bo'],
    ['getShapeProp', '_bp'],
    ['_elements', '_bq'],
    ['elements', '_br'],
    ['renderedLettersCount', '_bs'],
    ['renderedLetters', '_bt'],
    ['renderedLetter', '_bu'],
    ['HEffects', '_bv'],
    ['layerElementParent', '_bw'],
    ['layerElement', '_bx'],
    ['baseElement', '_by'],
    ['transformedElement', '_bz'],
    ['maskedElement', '_ca'],
    ['innerElemStyle', '_cb'],
    ['innerElem', '_cc'],
    ['_thisLayerFunction', '_cd'],
    ['setGroupProperty', '_ce'],
    ['svgElement', '_cf'],
    ['currentBBox', '_cg'],
    ['firstFrame', '_ch'],
    ['RenderableDOMElement', '_ci'],
    ['SVGGradientStrokeStyleData', '_cj'],
    ['SVGGradientFillStyleData', '_ck'],
    ['filterManager', '_cl'],
    ['effectElements', '_cm'],
    ['applyToPointArray', '_cn'],
    ['dynamicProperties', '_co'],
    ['animationItem', '_cq'],
    ['fontManager', '_cr'],
    ['createTypedArray', '_cs'],
    ['createNS', '_ct'],
    ['createTag', '_cu'],
    ['createSizedArray', '_cv'],
    ['SVGTextElement', '_cw'],
    ['transformCanvas', '_cx'],
    ['triggerEvent', '_cy'],
    ['initElement', '_cz'],
    ['canvasContext', '_da'],
    ['completeLayers', '_db'],
    ['pendingElements', '_dc'],
    ['hierarchy', '_dd'],
    ['compSize', '_de'],
    ['keyframes', '_df'],
    ['getValueAtTime', '_dg'],
    ['\'float32\'', '\'_f3\''],
    ['"float32"', '\'_f3\''],
    ['renderedFrame', '_dh'],
    ['offsetTime', '_di'],
    ['stylesList', '_dj'],
]

gulp.task('buildTest',['buildSources'], function() {
    return gulp.src(srcs)
        .pipe(concat('lottie.js'))
        .pipe(wrap(moduleWrap))
        .pipe(batch_replace(replacingMap))
        /*.pipe(through.obj(function (chunk, enc, cb) {
            console.log(chunk.contents.toString('utf8')) // this should log now
            cb(null, chunk)
          }))*/
        .pipe(gulp.dest('player/'));
});