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

if (typeof Path2D !== 'function' || typeof Path2D.prototype.addPath !== 'function' || typeof Path2D.prototype.ellipse !== 'function') {
    (function() {

        var canvasPrototype = CanvasRenderingContext2D.prototype;

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
            if (tr && (tr.a != 1 || tr.b != 0 || tr.c != 0 || tr.d != 1 || tr.e != 0 || tr.f != 0)) {

                hasTx = true;
                this.ops_.push({type: 'save', args: []});
                this.ops_.push({type: 'transform', args: [tr.a, tr.b, tr.c, tr.d, tr.e, tr.f]});
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
        canvasPrototype.fill = function(arg) {
            if (arg instanceof Path_) {
                this.beginPath();
                for (var i = 0, len = arg.ops_.length; i < len; i++) {
                    var op = arg.ops_[i];
                    canvasPrototype[op.type].apply(this, op.args);
                }
                len = arguments.length;
                var args = [];
                for(i=1;i<len;i+=1){
                    args.push(arguments[i]);
                }
                original_fill.apply(this, args);
            } else {
                original_fill.apply(this, arguments);
            }
        };

        canvasPrototype.stroke = function(arg) {
            if (arg instanceof Path_) {
                this.beginPath();
                for (var i = 0, len = arg.ops_.length; i < len; i++) {
                    var op = arg.ops_[i];
                    canvasPrototype[op.type].apply(this, op.args);
                }
                original_stroke.call(this);
            } else {
                original_stroke.call(this);
            }
        };

        canvasPrototype.clip = function(arg) {
            if (arg instanceof Path_) {
                this.beginPath();
                for (var i = 0, len = arg.ops_.length; i < len; i++) {
                    var op = arg.ops_[i];
                    canvasPrototype[op.type].apply(this, op.args);
                }
                len = arguments.length;
                var args = [];
                for(i=1;i<len;i+=1){
                    args.push(arguments[i]);
                }
                original_clip.apply(this, args);
            } else {
                original_clip.apply(this, arguments);
            }
        };

        // Set up externs.
        Path2D = Path_;
    })();
}