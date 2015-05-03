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
if (CanvasRenderingContext2D.prototype.ellipse == undefined) {
    CanvasRenderingContext2D.prototype.ellipse = function(x, y, radiusX, radiusY, rotation, startAngle, endAngle, antiClockwise) {
        this.save();
        this.translate(x, y);
        this.rotate(rotation);
        this.scale(radiusX, radiusY);
        this.arc(0, 0, 1, startAngle, endAngle, antiClockwise);
        this.restore();
    }
}

if (typeof Path2D !== 'function' || typeof Path2D.prototype.addPath !== 'function' || typeof Path2D.prototype.ellipse !== 'function') {
    (function() {

        // Include the SVG path parser.
        //= svgpath.js

        function Path_(arg) {
            this.ops_ = [];
            if (arg == undefined) {
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
        };

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
                this.ops_.push({type: name, args: Array.prototype.slice.call(arguments, 0)});
            };
        }

        // Add simple_mapping methods to Path2D.
        for (var i=0; i<simple_mapping.length; i++) {
            var name = simple_mapping[i];
            Path_.prototype[name] = createFunction(name);
        }

        Path_.prototype['addPath'] = function(path, tr) {
            var hasTx = false;
            if (tr) {
                hasTx = true;
                this.ops_.push({type: 'save', args: []});
                this.ops_.push({type: 'transform', args: [tr.a, tr.b, tr.c, tr.d, tr.e, tr.f]});
            }
            this.ops_ = this.ops_.concat(path.ops_);
            if (hasTx) {
                this.ops_.push({type: 'restore', args: []});
            }
        }

        var original_fill = CanvasRenderingContext2D.prototype.fill;
        var original_stroke = CanvasRenderingContext2D.prototype.stroke;
        var original_clip = CanvasRenderingContext2D.prototype.clip;

        // Replace methods on CanvasRenderingContext2D with ones that understand Path2D.
        CanvasRenderingContext2D.prototype.fill = function(arg) {
            if (arg instanceof Path_) {
                this.beginPath();
                for (var i = 0, len = arg.ops_.length; i < len; i++) {
                    var op = arg.ops_[i];
                    CanvasRenderingContext2D.prototype[op.type].apply(this, op.args);
                }
                original_fill.apply(this, Array.prototype.slice.call(arguments, 1));
            } else {
                original_fill.apply(this, arguments);
            }
        }

        CanvasRenderingContext2D.prototype.stroke = function(arg) {
            if (arg instanceof Path_) {
                this.beginPath();
                for (var i = 0, len = arg.ops_.length; i < len; i++) {
                    var op = arg.ops_[i];
                    CanvasRenderingContext2D.prototype[op.type].apply(this, op.args);
                }
                original_stroke.call(this);
            } else {
                original_stroke.call(this);
            }
        }

        CanvasRenderingContext2D.prototype.clip = function(arg) {
            if (arg instanceof Path_) {
                // Note that we don't save and restore the context state, since the
                // clip region is part of the state. Not really a problem since the
                // HTML 5 spec doesn't say that clip(path) doesn't affect the current
                // path.
                this.beginPath();
                for (var i = 0, len = arg.ops_.length; i < len; i++) {
                    var op = arg.ops_[i];
                    CanvasRenderingContext2D.prototype[op.type].apply(this, op.args);
                }
                original_clip.apply(this, Array.prototype.slice.call(arguments, 1));
            } else {
                original_clip.apply(this, arguments);
            }
        }

        // Set up externs.
        Path2D = Path_;
    })();
}