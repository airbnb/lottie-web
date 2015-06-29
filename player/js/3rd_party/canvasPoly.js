/**
 * Copyright 2014 Google Inc. All rights reserved.
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 *
 * @fileoverview Description of this file.
 *
 * A polyfill for HTML Canvas features, including
 * Path2D support.
 */
if (CanvasRenderingContext2D.prototype.ellipse === undefined) {
    CanvasRenderingContext2D.prototype.ellipse = function(x, y, radiusX, radiusY, rotation, startAngle, endAngle, antiClockwise) {
        this.save();
        this.translate(x, y);
        this.rotate(rotation);
        this.scale(radiusX, radiusY);
        this.arc(0, 0, 1, startAngle, endAngle, antiClockwise);
        this.restore();
    };
}
var BM_Path2D;
function BM_CanvasRenderingContext2D(renderer){
    this.renderer = renderer;
}
(function() {

    var canvasPrototype = CanvasRenderingContext2D.prototype;

    var bm_canvasPrototype = BM_CanvasRenderingContext2D.prototype;

    function Path_(arg) {
        this.ops_ = [];
        if (arg === undefined) {
            return;
        }
        if (typeof arg == 'string') {
            try {
                this.ops_ = parser.parse(arg);
            } catch(e) {
                // Treat an invalid SVG path as an empty path.
            }
        } else if (arg.hasOwnProperty('ops_')) {
            this.ops_ = arg.ops_.slice(0);
        } else {
            throw 'Error: ' + typeof arg + 'is not a valid argument to Path';
        }
    }

    // TODO(jcgregorio) test for arcTo and implement via something.


    // Path methods that map simply to the CanvasRenderingContext2D.
    var simple_mapping = [
        'closePath',
        'moveTo',
        'lineTo',
        'quadraticCurveTo',
        'bezierCurveTo',
        'rect',
        'arc',
        'arcTo',
        'ellipse'
    ];

    function createFunction(name) {
        return function() {
            var i, len = arguments.length;
            var args = [];
            for(i=0;i<len;i+=1){
                args.push(arguments[i]);
            }
            this.ops_.push({type: name, args: args});
        };
    }

    // Add simple_mapping methods to Path2D.
    for (var i=0; i<simple_mapping.length; i++) {
        var name = simple_mapping[i];
        Path_.prototype[name] = createFunction(name);
    }

    Path_.prototype.addPath = function(path, tr) {
        var hasTx = false;
        if (tr && (tr[0] != 1 || tr[1] !== 0 || tr[2] !== 0 || tr[3] != 1 || tr[4] !== 0 || tr[5] !== 0)) {

            hasTx = true;
            this.ops_.push({type: 'save', args: []});
            this.ops_.push({type: 'transform', args: [tr[0], tr[1], tr[2], tr[3], tr[4], tr[5]]});
        }
        this.ops_ = this.ops_.concat(path.ops_);
        if (hasTx) {
            this.ops_.push({type: 'restore', args: []});
        }
    };

    var original_fill = canvasPrototype.fill;
    var original_stroke = canvasPrototype.stroke;
    var original_clip = canvasPrototype.clip;

    // Replace methods on CanvasRenderingContext2D with ones that understand Path2D.
    bm_canvasPrototype.fill = function(arg) {
        if (arg instanceof Path_) {
            this.renderer.canvasContext.beginPath();
            for (var i = 0, len = arg.ops_.length; i < len; i++) {
                var op = arg.ops_[i];
                if(op.type == 'transform'){
                    this.renderer.ctxTransform(op.args);
                }else if(op.type == 'save'){
                    this.renderer.save();
                }else if(op.type == 'restore'){
                    this.renderer.restore();
                }else{
                    this.renderer.canvasContext[op.type].apply(this.renderer.canvasContext, op.args);
                }
            }
            len = arguments.length;
            var args = [];
            for(i=1;i<len;i+=1){
                args.push(arguments[i]);
            }
            original_fill.apply(this.renderer.canvasContext, args);
        } else {
            original_fill.apply(this.renderer.canvasContext, arguments);
        }
    };

    bm_canvasPrototype.stroke = function(arg) {
        if (arg instanceof Path_) {
            this.renderer.canvasContext.beginPath();
            for (var i = 0, len = arg.ops_.length; i < len; i++) {
                var op = arg.ops_[i];
                this.renderer.canvasContext[op.type].apply(this.renderer.canvasContext, op.args);
            }
            original_stroke.call(this.renderer.canvasContext);
        } else {
            original_stroke.call(this.renderer.canvasContext);
        }
    };

    bm_canvasPrototype.clip = function(arg) {
        if (arg instanceof Path_) {
            this.renderer.canvasContext.beginPath();
            for (var i = 0, len = arg.ops_.length; i < len; i++) {
                var op = arg.ops_[i];
                this.renderer.canvasContext[op.type].apply(this.renderer.canvasContext, op.args);
            }
            len = arguments.length;
            var args = [];
            for(i=1;i<len;i+=1){
                args.push(arguments[i]);
            }
            original_clip.apply(this.renderer.canvasContext, args);
        } else {
            original_clip.apply(this.renderer.canvasContext, arguments);
        }
    };

    // Set up externs.
    BM_Path2D = Path_;
})();