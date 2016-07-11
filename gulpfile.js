
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

var bm_version = '4.3.1';
                  //(function (root, factory) { if(typeof define === "function" && define.amd) { define( factory); } else if(typeof module === "object" && module.exports) { module.exports = factory(); } else { root.bodymovin = factory(); } }(window, function() {<%= contents %>var bodymovinjs = {}; function play(animation){ animationManager.play(animation); } function pause(animation){ animationManager.pause(animation); } function togglePause(animation){ animationManager.togglePause(animation); } function setSpeed(value,animation){ animationManager.setSpeed(value, animation); } function setDirection(value,animation){ animationManager.setDirection(value, animation); } function stop(animation){ animationManager.stop(animation); } function moveFrame(value){ animationManager.moveFrame(value); } function searchAnimations(){ if(standalone === true){ animationManager.searchAnimations(animationData,standalone, renderer); }else{ animationManager.searchAnimations(); } } function registerAnimation(elem){ return animationManager.registerAnimation(elem); } function resize(){ animationManager.resize(); } function start(){ animationManager.start(); } function goToAndStop(val,isFrame, animation){ animationManager.goToAndStop(val,isFrame, animation); } function setSubframeRendering(flag){ subframeEnabled = flag; } function loadAnimation(params){ if(standalone === true){ params.animationData = JSON.parse(animationData); } return animationManager.loadAnimation(params); } function destroy(animation){ return animationManager.destroy(animation); } function setQuality(value){ if(typeof value === 'string'){ switch(value){ case 'high': defaultCurveSegments = 200; break; case 'medium': defaultCurveSegments = 50; break; case 'low': defaultCurveSegments = 10; break; } }else if(!isNaN(value) && value > 1){ defaultCurveSegments = value; } if(defaultCurveSegments >= 50){ roundValues(false); }else{ roundValues(true); } } function installPlugin(type,plugin){ if(type==='expressions'){ expressionsPlugin = plugin; } } function getFactory(name){ if(name === 'propertyFactory'){ return PropertyFactory; } } bodymovinjs.play = play; bodymovinjs.pause = pause; bodymovinjs.togglePause = togglePause; bodymovinjs.setSpeed = setSpeed; bodymovinjs.setDirection = setDirection; bodymovinjs.stop = stop; bodymovinjs.moveFrame = moveFrame; bodymovinjs.searchAnimations = searchAnimations; bodymovinjs.registerAnimation = registerAnimation; bodymovinjs.loadAnimation = loadAnimation; bodymovinjs.setSubframeRendering = setSubframeRendering; bodymovinjs.resize = resize; bodymovinjs.start = start; bodymovinjs.goToAndStop = goToAndStop; bodymovinjs.destroy = destroy; bodymovinjs.setQuality = setQuality; bodymovinjs.installPlugin = installPlugin; bodymovinjs.__getFactory = getFactory; bodymovinjs.version = '4.1.9'; function checkReady(){ if (document.readyState === "complete") { clearInterval(readyStateCheckInterval); searchAnimations(); } } function getQueryVariable(variable) { var vars = queryString.split('&'); for (var i = 0; i < vars.length; i++) { var pair = vars[i].split('='); if (decodeURIComponent(pair[0]) == variable) { return decodeURIComponent(pair[1]); } } } var standalone = '__[STANDALONE]__'; var animationData = '__[ANIMATIONDATA]__'; var renderer = ''; if(standalone) { var scripts = document.getElementsByTagName('script'); var index = scripts.length - 1; var myScript = scripts[index]; var queryString = myScript.src.replace(/^[^\?]+\??/,''); renderer = getQueryVariable('renderer'); } var readyStateCheckInterval = setInterval(checkReady, 100); return bodymovinjs; }));
  var moduleWrap = '(function (root, factory) { if(typeof define === "function" && define.amd) { define( factory); } else if(typeof module === "object" && module.exports) { module.exports = factory(); } else { root.bodymovin = factory(); } }(window, function() {<%= contents %>var bodymovinjs = {}; function play(animation){ animationManager.play(animation); } function pause(animation){ animationManager.pause(animation); } function togglePause(animation){ animationManager.togglePause(animation); } function setSpeed(value,animation){ animationManager.setSpeed(value, animation); } function setDirection(value,animation){ animationManager.setDirection(value, animation); } function stop(animation){ animationManager.stop(animation); } function moveFrame(value){ animationManager.moveFrame(value); } function searchAnimations(){ if(standalone === true){ animationManager.searchAnimations(animationData,standalone, renderer); }else{ animationManager.searchAnimations(); } } function registerAnimation(elem){ return animationManager.registerAnimation(elem); } function resize(){ animationManager.resize(); } function start(){ animationManager.start(); } function goToAndStop(val,isFrame, animation){ animationManager.goToAndStop(val,isFrame, animation); } function setSubframeRendering(flag){ subframeEnabled = flag; } function loadAnimation(params){ if(standalone === true){ params.animationData = JSON.parse(animationData); } return animationManager.loadAnimation(params); } function destroy(animation){ return animationManager.destroy(animation); } function setQuality(value){ if(typeof value === \'string\'){ switch(value){ case \'high\': defaultCurveSegments = 200; break; case \'medium\': defaultCurveSegments = 50; break; case \'low\': defaultCurveSegments = 10; break; } }else if(!isNaN(value) && value > 1){ defaultCurveSegments = value; } if(defaultCurveSegments >= 50){ roundValues(false); }else{ roundValues(true); } } function installPlugin(type,plugin){ if(type===\'expressions\'){ expressionsPlugin = plugin; } } function getFactory(name){ switch(name){ case "propertyFactory": return PropertyFactory;case "shapePropertyFactory": return ShapePropertyFactory; case "matrix": return Matrix; } } bodymovinjs.play = play; bodymovinjs.pause = pause; bodymovinjs.togglePause = togglePause; bodymovinjs.setSpeed = setSpeed; bodymovinjs.setDirection = setDirection; bodymovinjs.stop = stop; bodymovinjs.moveFrame = moveFrame; bodymovinjs.searchAnimations = searchAnimations; bodymovinjs.registerAnimation = registerAnimation; bodymovinjs.loadAnimation = loadAnimation; bodymovinjs.setSubframeRendering = setSubframeRendering; bodymovinjs.resize = resize; bodymovinjs.start = start; bodymovinjs.goToAndStop = goToAndStop; bodymovinjs.destroy = destroy; bodymovinjs.setQuality = setQuality; bodymovinjs.installPlugin = installPlugin; bodymovinjs.__getFactory = getFactory; bodymovinjs.version = \''+bm_version+'\'; function checkReady(){ if (document.readyState === "complete") { clearInterval(readyStateCheckInterval); searchAnimations(); } } function getQueryVariable(variable) { var vars = queryString.split(\'&\'); for (var i = 0; i < vars.length; i++) { var pair = vars[i].split(\'=\'); if (decodeURIComponent(pair[0]) == variable) { return decodeURIComponent(pair[1]); } } } var standalone = \'__[STANDALONE]__\'; var animationData = \'__[ANIMATIONDATA]__\'; var renderer = \'\'; if(standalone) { var scripts = document.getElementsByTagName(\'script\'); var index = scripts.length - 1; var myScript = scripts[index]; var queryString = myScript.src.replace(/^[^\\?]+\\??/,\'\'); renderer = getQueryVariable(\'renderer\'); } var readyStateCheckInterval = setInterval(checkReady, 100); return bodymovinjs; }));  ';
//var moduleWrap = '(function (root, factory) { if(typeof define === "function" && define.amd) { define( factory); } else if(typeof module === "object" && module.exports) { module.exports = factory(); } else { root.bodymovin = factory(); } }(window, function() {<%= contents %>var bodymovinjs = {}; function play(animation){ animationManager.play(animation); } function pause(animation){ animationManager.pause(animation); } function togglePause(animation){ animationManager.togglePause(animation); } function setSpeed(value,animation){ animationManager.setSpeed(value, animation); } function setDirection(value,animation){ animationManager.setDirection(value, animation); } function stop(animation){ animationManager.stop(animation); } function moveFrame(value){ animationManager.moveFrame(value); } function searchAnimations(){ if(standalone === true){ animationManager.searchAnimations(animationData,standalone, renderer); }else{ animationManager.searchAnimations(); } } function registerAnimation(elem){ return animationManager.registerAnimation(elem); } function resize(){ animationManager.resize(); } function start(){ animationManager.start(); } function goToAndStop(val,isFrame, animation){ animationManager.goToAndStop(val,isFrame, animation); } function setSubframeRendering(flag){ subframeEnabled = flag; } function loadAnimation(params){ if(standalone === true){ params.animationData = JSON.parse(animationData); } return animationManager.loadAnimation(params); } function destroy(animation){ return animationManager.destroy(animation); } function setQuality(value){ if(typeof value === \'string\'){ switch(value){ case \'high\': defaultCurveSegments = 200; break; case \'medium\': defaultCurveSegments = 50; break; case \'low\': defaultCurveSegments = 10; break; } }else if(!isNaN(value) && value > 1){ defaultCurveSegments = value; } if(defaultCurveSegments >= 50){ roundValues(false); }else{ roundValues(true); } } bodymovinjs.play = play; bodymovinjs.pause = pause; bodymovinjs.togglePause = togglePause; bodymovinjs.setSpeed = setSpeed; bodymovinjs.setDirection = setDirection; bodymovinjs.stop = stop; bodymovinjs.moveFrame = moveFrame; bodymovinjs.searchAnimations = searchAnimations; bodymovinjs.registerAnimation = registerAnimation; bodymovinjs.loadAnimation = loadAnimation; bodymovinjs.setSubframeRendering = setSubframeRendering; bodymovinjs.resize = resize; bodymovinjs.start = start; bodymovinjs.goToAndStop = goToAndStop; bodymovinjs.destroy = destroy; bodymovinjs.setQuality = setQuality; bodymovinjs.version = \''+bm_version+'\'; function checkReady(){ if (document.readyState === "complete") { clearInterval(readyStateCheckInterval); searchAnimations(); } } function getQueryVariable(variable) { var vars = queryString.split(\'&\'); for (var i = 0; i < vars.length; i++) { var pair = vars[i].split(\'=\'); if (decodeURIComponent(pair[0]) == variable) { return decodeURIComponent(pair[1]); } } } var standalone = \'__[STANDALONE]__\'; var animationData = \'__[ANIMATIONDATA]__\'; var renderer = \'\'; if(standalone) { var scripts = document.getElementsByTagName(\'script\'); var index = scripts.length - 1; var myScript = scripts[index]; var queryString = myScript.src.replace(/^[^\\?]+\\??/,\'\'); renderer = getQueryVariable(\'renderer\'); } var readyStateCheckInterval = setInterval(checkReady, 100); return bodymovinjs; })); ';
var expressionsModuleWrap = '(function () {var PropertyFactory = bodymovin.__getFactory("propertyFactory");var Matrix = bodymovin.__getFactory("matrix");var ShapePropertyFactory = bodymovin.__getFactory("shapePropertyFactory");var degToRads = Math.PI/180;<%= contents %>}());';
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
        .pipe(wrap(moduleWrap))
        .pipe(gulp.dest('build/player/'));
});
gulp.task('buildExpressionModule', function(){
    gulp.src('./player/expressions.html')
        .pipe(usemin({
            js: [uglify()]
        }))
        //.pipe(wrap('(function(window){"use strict";<%= contents %>}(window));'))
        .pipe(wrap(expressionsModuleWrap))
        .pipe(gulp.dest('build/player/'));
});

gulp.task('buildReducedPlayer', function(){
    gulp.src('./player/index.html')
        .pipe(usemin({
            js: [uglify()]
        }))
        //.pipe(wrap('(function(window){"use strict";<%= contents %>}(window));'))
        .pipe(wrap(moduleWrap))
        .pipe(gulp.dest('build/player/'));
});

gulp.task('zipPlayer',['buildPlayer'], function(){
    gulp.src('./player/index.html')
        .pipe(usemin({
            js: [uglify()]
        }))
        //.pipe(wrap('(function(window){"use strict";<%= contents %>}(window));'))
        .pipe(wrap(moduleWrap))
        .pipe(gzip({ append: true }))
        .pipe(gulp.dest('build/player/'));
});

gulp.task('zipSVGPlayer',[], function(){
    gulp.src('./player/svg.html')
        .pipe(usemin({
            js: [uglify()]
        }))
        //.pipe(wrap('(function(window){"use strict";<%= contents %>}(window));'))
        .pipe(wrap(moduleWrap))
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