
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

var bm_version = '4.4.27';

var files = [
    {
        light: true,
        path: ''
    }
]

                  //(function (root, factory) { if(typeof define === "function" && define.amd) { define( factory); } else if(typeof module === "object" && module.exports) { module.exports = factory(); } else { root.bodymovin = factory(); } }(window, function() {<%= contents %>var bodymovinjs = {}; function play(animation){ animationManager.play(animation); } function pause(animation){ animationManager.pause(animation); } function togglePause(animation){ animationManager.togglePause(animation); } function setSpeed(value,animation){ animationManager.setSpeed(value, animation); } function setDirection(value,animation){ animationManager.setDirection(value, animation); } function stop(animation){ animationManager.stop(animation); } function moveFrame(value){ animationManager.moveFrame(value); } function searchAnimations(){ if(standalone === true){ animationManager.searchAnimations(animationData,standalone, renderer); }else{ animationManager.searchAnimations(); } } function registerAnimation(elem){ return animationManager.registerAnimation(elem); } function resize(){ animationManager.resize(); } function start(){ animationManager.start(); } function goToAndStop(val,isFrame, animation){ animationManager.goToAndStop(val,isFrame, animation); } function setSubframeRendering(flag){ subframeEnabled = flag; } function loadAnimation(params){ if(standalone === true){ params.animationData = JSON.parse(animationData); } return animationManager.loadAnimation(params); } function destroy(animation){ return animationManager.destroy(animation); } function setQuality(value){ if(typeof value === 'string'){ switch(value){ case 'high': defaultCurveSegments = 200; break; case 'medium': defaultCurveSegments = 50; break; case 'low': defaultCurveSegments = 10; break; } }else if(!isNaN(value) && value > 1){ defaultCurveSegments = value; } if(defaultCurveSegments >= 50){ roundValues(false); }else{ roundValues(true); } } function installPlugin(type,plugin){ if(type==='expressions'){ expressionsPlugin = plugin; } } function getFactory(name){ if(name === 'propertyFactory'){ return PropertyFactory; } } bodymovinjs.play = play; bodymovinjs.pause = pause; bodymovinjs.togglePause = togglePause; bodymovinjs.setSpeed = setSpeed; bodymovinjs.setDirection = setDirection; bodymovinjs.stop = stop; bodymovinjs.moveFrame = moveFrame; bodymovinjs.searchAnimations = searchAnimations; bodymovinjs.registerAnimation = registerAnimation; bodymovinjs.loadAnimation = loadAnimation; bodymovinjs.setSubframeRendering = setSubframeRendering; bodymovinjs.resize = resize; bodymovinjs.start = start; bodymovinjs.goToAndStop = goToAndStop; bodymovinjs.destroy = destroy; bodymovinjs.setQuality = setQuality; bodymovinjs.installPlugin = installPlugin; bodymovinjs.__getFactory = getFactory; bodymovinjs.version = '4.1.9'; function checkReady(){ if (document.readyState === "complete") { clearInterval(readyStateCheckInterval); searchAnimations(); } } function getQueryVariable(variable) { var vars = queryString.split('&'); for (var i = 0; i < vars.length; i++) { var pair = vars[i].split('='); if (decodeURIComponent(pair[0]) == variable) { return decodeURIComponent(pair[1]); } } } var standalone = '__[STANDALONE]__'; var animationData = '__[ANIMATIONDATA]__'; var renderer = ''; if(standalone) { var scripts = document.getElementsByTagName('script'); var index = scripts.length - 1; var myScript = scripts[index]; var queryString = myScript.src.replace(/^[^\?]+\??/,''); renderer = getQueryVariable('renderer'); } var readyStateCheckInterval = setInterval(checkReady, 100); return bodymovinjs; }));
  var moduleWrap = '(function (root, factory) { if(typeof define === "function" && define.amd) { define( factory); } else if(typeof module === "object" && module.exports) { module.exports = factory(); } else { root.bodymovin = factory(); } }(window, function() {<%= contents %>var bodymovinjs = {}; function play(animation){ animationManager.play(animation); } function pause(animation){ animationManager.pause(animation); } function togglePause(animation){ animationManager.togglePause(animation); } function setSpeed(value,animation){ animationManager.setSpeed(value, animation); } function setDirection(value,animation){ animationManager.setDirection(value, animation); } function stop(animation){ animationManager.stop(animation); } function moveFrame(value){ animationManager.moveFrame(value); } function searchAnimations(){ if(standalone === true){ animationManager.searchAnimations(animationData,standalone, renderer); }else{ animationManager.searchAnimations(); } } function registerAnimation(elem){ return animationManager.registerAnimation(elem); } function resize(){ animationManager.resize(); } function start(){ animationManager.start(); } function goToAndStop(val,isFrame, animation){ animationManager.goToAndStop(val,isFrame, animation); } function setSubframeRendering(flag){ subframeEnabled = flag; } function loadAnimation(params){ if(standalone === true){ params.animationData = JSON.parse(animationData); } return animationManager.loadAnimation(params); } function destroy(animation){ return animationManager.destroy(animation); } function setQuality(value){ if(typeof value === \'string\'){ switch(value){ case \'high\': defaultCurveSegments = 200; break; case \'medium\': defaultCurveSegments = 50; break; case \'low\': defaultCurveSegments = 10; break; } }else if(!isNaN(value) && value > 1){ defaultCurveSegments = value; } if(defaultCurveSegments >= 50){ roundValues(false); }else{ roundValues(true); } } function installPlugin(type,plugin){ if(type===\'expressions\'){ expressionsPlugin = plugin; } } function getFactory(name){ switch(name){ case "propertyFactory": return PropertyFactory;case "shapePropertyFactory": return ShapePropertyFactory; case "matrix": return Matrix; } } bodymovinjs.play = play; bodymovinjs.pause = pause; bodymovinjs.togglePause = togglePause; bodymovinjs.setSpeed = setSpeed; bodymovinjs.setDirection = setDirection; bodymovinjs.stop = stop; bodymovinjs.moveFrame = moveFrame; bodymovinjs.searchAnimations = searchAnimations; bodymovinjs.registerAnimation = registerAnimation; bodymovinjs.loadAnimation = loadAnimation; bodymovinjs.setSubframeRendering = setSubframeRendering; bodymovinjs.resize = resize; bodymovinjs.start = start; bodymovinjs.goToAndStop = goToAndStop; bodymovinjs.destroy = destroy; bodymovinjs.setQuality = setQuality; bodymovinjs.installPlugin = installPlugin; bodymovinjs.__getFactory = getFactory; bodymovinjs.version = \''+bm_version+'\'; function checkReady(){ if (document.readyState === "complete") { clearInterval(readyStateCheckInterval); searchAnimations(); } } function getQueryVariable(variable) { var vars = queryString.split(\'&\'); for (var i = 0; i < vars.length; i++) { var pair = vars[i].split(\'=\'); if (decodeURIComponent(pair[0]) == variable) { return decodeURIComponent(pair[1]); } } } var standalone = \'__[STANDALONE]__\'; var animationData = \'__[ANIMATIONDATA]__\'; var renderer = \'\'; if(standalone) { var scripts = document.getElementsByTagName(\'script\'); var index = scripts.length - 1; var myScript = scripts[index]; var queryString = myScript.src.replace(/^[^\\?]+\\??/,\'\'); renderer = getQueryVariable(\'renderer\'); } var readyStateCheckInterval = setInterval(checkReady, 100); return bodymovinjs; }));  ';
//var moduleWrap = '(function (root, factory) { if(typeof define === "function" && define.amd) { define( factory); } else if(typeof module === "object" && module.exports) { module.exports = factory(); } else { root.bodymovin = factory(); } }(window, function() {<%= contents %>var bodymovinjs = {}; function play(animation){ animationManager.play(animation); } function pause(animation){ animationManager.pause(animation); } function togglePause(animation){ animationManager.togglePause(animation); } function setSpeed(value,animation){ animationManager.setSpeed(value, animation); } function setDirection(value,animation){ animationManager.setDirection(value, animation); } function stop(animation){ animationManager.stop(animation); } function moveFrame(value){ animationManager.moveFrame(value); } function searchAnimations(){ if(standalone === true){ animationManager.searchAnimations(animationData,standalone, renderer); }else{ animationManager.searchAnimations(); } } function registerAnimation(elem){ return animationManager.registerAnimation(elem); } function resize(){ animationManager.resize(); } function start(){ animationManager.start(); } function goToAndStop(val,isFrame, animation){ animationManager.goToAndStop(val,isFrame, animation); } function setSubframeRendering(flag){ subframeEnabled = flag; } function loadAnimation(params){ if(standalone === true){ params.animationData = JSON.parse(animationData); } return animationManager.loadAnimation(params); } function destroy(animation){ return animationManager.destroy(animation); } function setQuality(value){ if(typeof value === \'string\'){ switch(value){ case \'high\': defaultCurveSegments = 200; break; case \'medium\': defaultCurveSegments = 50; break; case \'low\': defaultCurveSegments = 10; break; } }else if(!isNaN(value) && value > 1){ defaultCurveSegments = value; } if(defaultCurveSegments >= 50){ roundValues(false); }else{ roundValues(true); } } bodymovinjs.play = play; bodymovinjs.pause = pause; bodymovinjs.togglePause = togglePause; bodymovinjs.setSpeed = setSpeed; bodymovinjs.setDirection = setDirection; bodymovinjs.stop = stop; bodymovinjs.moveFrame = moveFrame; bodymovinjs.searchAnimations = searchAnimations; bodymovinjs.registerAnimation = registerAnimation; bodymovinjs.loadAnimation = loadAnimation; bodymovinjs.setSubframeRendering = setSubframeRendering; bodymovinjs.resize = resize; bodymovinjs.start = start; bodymovinjs.goToAndStop = goToAndStop; bodymovinjs.destroy = destroy; bodymovinjs.setQuality = setQuality; bodymovinjs.version = \''+bm_version+'\'; function checkReady(){ if (document.readyState === "complete") { clearInterval(readyStateCheckInterval); searchAnimations(); } } function getQueryVariable(variable) { var vars = queryString.split(\'&\'); for (var i = 0; i < vars.length; i++) { var pair = vars[i].split(\'=\'); if (decodeURIComponent(pair[0]) == variable) { return decodeURIComponent(pair[1]); } } } var standalone = \'__[STANDALONE]__\'; var animationData = \'__[ANIMATIONDATA]__\'; var renderer = \'\'; if(standalone) { var scripts = document.getElementsByTagName(\'script\'); var index = scripts.length - 1; var myScript = scripts[index]; var queryString = myScript.src.replace(/^[^\\?]+\\??/,\'\'); renderer = getQueryVariable(\'renderer\'); } var readyStateCheckInterval = setInterval(checkReady, 100); return bodymovinjs; })); ';
var expressionsModuleWrap = '(function () {var PropertyFactory = bodymovin.__getFactory("propertyFactory");var Matrix = bodymovin.__getFactory("matrix");var ShapePropertyFactory = bodymovin.__getFactory("shapePropertyFactory");var degToRads = Math.PI/180;<%= contents %>}());';
gulp.task('gzipFile', function(){
  gulp.src('player/exports/render/data.json')
    .pipe(gzip({ append: false }))
    .pipe(gulp.dest('demo/'));
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

gulp.task('buildUnminifiedPlayer', function(){
    gulp.src('./player/index.html')
        //.pipe(wrap('(function(window){"use strict";<%= contents %>}(window));'))
        .pipe(wrap(moduleWrap))
        .pipe(gulp.dest('build/player/bodymovin.min.js'));
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

gulp.task('zipPlayer',['buildPlayer','buildUnminifiedPlayer'], function(){
    gulp.src('./player/index.html')
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

gulp.task('tmp', function() {
    var fileContent = fs.readFileSync("./extension/jsx/initializer.jsx", "utf8");
    var jsxBuild = '';
    fileContent.toString().split('\n').forEach(function (line) {
        //console.log(line);
        var reg = /evalFile.*'(.*)'/g;
        var executedRegex = reg.exec(line);
        if(executedRegex){
            var path = executedRegex[1];
            var jsxfileContent = fs.readFileSync("./extension/jsx/"+path, "utf8");
            jsxBuild += ';\n' +  jsxfileContent.toString();
        }
    });
    jsxBuild = '(function(){\n'+jsxBuild+'\n}())';
    return fs.writeFile('./extension/jsx/build.jsx', jsxBuild);
});

var srcs = [];
var demoBuiltData = '';


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

gulp.task('buildLightSources', function() {
    return buildVersion(['data-skip','data-light-skip']);
});

gulp.task('buildLight',['buildLightSources'], function() {
    return gulp.src(srcs)
        .pipe(concat('bodymovin_light.js'))
        .pipe(wrap(moduleWrap))
        .pipe(gulp.dest('build/player/'));
});

gulp.task('buildLightMin',['buildLightSources'], function() {
    return gulp.src(srcs)
        .pipe(concat('bodymovin_light.min.js'))
        .pipe(wrap(moduleWrap))
        .pipe(uglify())
        .pipe(gulp.dest('build/player/'));
});

gulp.task('buildFullMin',['buildSources'], function() {
    return gulp.src(srcs)
        .pipe(concat('bodymovin.min.js'))
        .pipe(wrap(moduleWrap))
        .pipe(uglify())
        .pipe(gulp.dest('build/player/'));
});

gulp.task('createExtensionZipAsset',['buildSources'], function() {
    return gulp.src(srcs)
        .pipe(concat('bm.js'))
        .pipe(wrap(moduleWrap))
        .pipe(uglify())
        .pipe(gzip({ append: true }))
        .pipe(gulp.dest('extension/assets/player/'));
});

gulp.task('buildFull',['buildSources'], function() {
    return gulp.src(srcs)
        .pipe(concat('bodymovin.js'))
        .pipe(wrap(moduleWrap))
        .pipe(gulp.dest('build/player/'));
});

gulp.task('createExtensionStandAlone',['buildSources'], function() {
    return gulp.src(srcs)
        .pipe(concat('standalone.js'))
        .pipe(wrap(moduleWrap))
        .pipe(uglify())
        .pipe(gulp.dest('extension/assets/player/'));
});

gulp.task('createExtensionAsset',['buildSources'], function() {
    return gulp.src(srcs)
        .pipe(concat('bm.js'))
        .pipe(wrap(moduleWrap))
        .pipe(uglify())
        .pipe(gulp.dest('extension/assets/player/'));
});

gulp.task('buildDemoData',['buildSources'], function() {

    function saveToVar() {
        // you're going to receive Vinyl files as chunks
        function transform(file, cb) {
            // read and modify file contents
            demoBuiltData = String(file.contents);

            cb(null, file);
        }
        return eventstream.map(transform);
    }

    return gulp.src(srcs)
        .pipe(concat('tmp.js'))
        .pipe(wrap(moduleWrap))
        .pipe(uglify())
        .pipe(saveToVar());
});


gulp.task('replaceDemoData',['buildDemoData'], function() {
    //htmlreplace;
    return gulp.src('extension/assets/player/demo.html')
        .pipe(htmlreplace({
            scripto:{
                src: demoBuiltData,
                tpl: '<!-- build:scripto --><script>%s</script><!-- endbuild -->'
            }
        }))
        .pipe(gulp.dest('extension/assets/player/'));
});



gulp.task('buildDemoData',['buildSources'], function() {

    function saveToVar() {
        // you're going to receive Vinyl files as chunks
        function transform(file, cb) {
            // read and modify file contents
            demoBuiltData = String(file.contents);

            cb(null, file);
        }
        return eventstream.map(transform);
    }

    return gulp.src(srcs)
        .pipe(concat('tmp.js'))
        .pipe(wrap(moduleWrap))
        .pipe(uglify())
        .pipe(saveToVar());
});


gulp.task('createExtensionLibrary',['buildSources'], function() {

    function replaceCustomValues() {
        // you're going to receive Vinyl files as chunks
        function transform(file, cb) {
            // read and modify file contents
            var contents = String(file.contents);

            var regex = /"function".*(.)\.bodymovin/;
            var regexExec = regex.exec(contents);
            contents = contents.replace(regex,regexExec[1] + '.bm');
            file.contents = new Buffer(contents);
            demoBuiltData = String(file.contents);

            cb(null, file);
        }
        return eventstream.map(transform);
    }

    return gulp.src(srcs)
        .pipe(concat('bm.js'))
        .pipe(wrap(moduleWrap))
        .pipe(uglify())
        .pipe(replaceCustomValues())
        .pipe(gulp.dest('extension/js/libs/'));
});

gulp.task('createExtensionFiles',['createExtensionAsset','createExtensionStandAlone','createExtensionZipAsset','replaceDemoData','createExtensionLibrary'], function() {
    return null;
});

gulp.task('buildAll',['buildLightMin','buildLight','buildFullMin','buildFull','createExtensionFiles'], function() {
});