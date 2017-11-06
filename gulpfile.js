
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

var bm_version = '4.13.0';

var files = [
    {
        light: true,
        path: ''
    }
]
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
        .pipe(gulp.dest('build/player/bodymovin.min.js'));
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
var uglifyOptions = {output: {ascii_only:true}};


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
        .pipe(uglify(uglifyOptions))
        .pipe(gulp.dest('build/player/'));
});

gulp.task('buildFullMin',['buildSources'], function() {
    return gulp.src(srcs)
        .pipe(concat('bodymovin.min.js'))
        .pipe(wrap(moduleWrap))
        .pipe(uglify(uglifyOptions))
        .pipe(gulp.dest('build/player/'));
});

gulp.task('buildFull',['buildSources'], function() {
    return gulp.src(srcs)
        .pipe(concat('bodymovin.js'))
        .pipe(wrap(moduleWrap))
        .pipe(gulp.dest('build/player/'));
});

gulp.task('buildAll',['buildLightMin','buildLight','buildFullMin','buildFull'], function() {
});