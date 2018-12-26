function IShapeElement(){
}

IShapeElement.prototype = {
    addShapeToModifiers: function(data) {
        var i, len = this.shapeModifiers.length;
        for(i=0;i<len;i+=1){
            this.shapeModifiers[i].addShape(data);
        }
    },
    isShapeInAnimatedModifiers: function(data) {
        var i = 0, len = this.shapeModifiers.length;
        while(i < len) {
            if(this.shapeModifiers[i].isAnimatedWithShape(data)) {
                return true;
            }
        }
        return false;
    },
    renderModifiers: function() {
        if(!this.shapeModifiers.length){
            return;
        }
        var i, len = this.shapes.length;
        for(i=0;i<len;i+=1){
            this.shapes[i].sh.reset();
        }

        len = this.shapeModifiers.length;
        for(i=len-1;i>=0;i-=1){
            this.shapeModifiers[i].processShapes(this._isFirstFrame);
        }
    },
    lcEnum: {
        '1': 'butt',
        '2': 'round',
        '3': 'square'
    },
    ljEnum: {
        '1': 'miter',
        '2': 'round',
        '3': 'bevel'
    },
    searchProcessedElement: function(elem){
        var elements = this.processedElements;
        var i = 0, len = elements.length;
        while (i < len) {
            if (elements[i].elem === elem) {
                return elements[i].pos;
            }
            i += 1;
        }
        return 0;
    },
    addProcessedElement: function(elem, pos){
        var elements = this.processedElements;
        var i = elements.length;
        while(i) {
            i -= 1;
            if (elements[i].elem === elem) {
                elements[i].pos = pos;
                return;
            }
        }
        elements.push(new ProcessedElement(elem, pos));
    },
    prepareFrame: function(num) {
        this.prepareRenderableFrame(num);
        this.prepareProperties(num, this.isInRange);
    },
    calculateBoundingBox: function(itemsData, boundingBox) {
        var i, len = itemsData.length, path;
        for(i = 0; i < len; i += 1) {
            if(itemsData[i] && itemsData[i].sh) {
                this.calculateShapeBoundingBox(itemsData[i], boundingBox)
            } else if(itemsData[i] && itemsData[i].it) {
                this.calculateBoundingBox(itemsData[i].it, boundingBox)
            }
        }
    },
    calculateShapeBoundingBox: function(item, boundingBox) {
        var shape = item.sh.v;
        var transformers = item.transformers;
        var i, len = shape._length, vPoint, oPoint, nextIPoint, nextVPoint, bounds;
        if (len <= 1) {
            return;
        }
        for (i = 0; i < len - 1; i += 1) {
            vPoint = this.getTransformedPoint(transformers, shape.v[i]);
            oPoint = this.getTransformedPoint(transformers, shape.o[i]);
            nextIPoint = this.getTransformedPoint(transformers, shape.i[i + 1]);
            nextVPoint = this.getTransformedPoint(transformers, shape.v[i + 1]);
            this.checkBounds(vPoint, oPoint, nextIPoint, nextVPoint, boundingBox);
        }
        if(shape.c) {
            vPoint = this.getTransformedPoint(transformers, shape.v[i]);
            oPoint = this.getTransformedPoint(transformers, shape.o[i]);
            nextIPoint = this.getTransformedPoint(transformers, shape.i[0]);
            nextVPoint = this.getTransformedPoint(transformers, shape.v[0]);
            this.checkBounds(vPoint, oPoint, nextIPoint, nextVPoint, boundingBox);
        }
    },
    checkBounds: function(vPoint, oPoint, nextIPoint, nextVPoint, boundingBox) {
        this.getBoundsOfCurve(vPoint, oPoint, nextIPoint, nextVPoint);
        var bounds = this.shapeBoundingBox;
        boundingBox.x = bm_min(bounds.left, boundingBox.x);
        boundingBox.xMax = bm_max(bounds.right, boundingBox.xMax);
        boundingBox.y = bm_min(bounds.top, boundingBox.y);
        boundingBox.yMax = bm_max(bounds.bottom, boundingBox.yMax);
    },
    getTransformedPoint: function(transformers, point) {
        var i, len = transformers.length;
        for(i = 0; i < len; i += 1) {
            point = transformers[i].mProps.v.applyToPointArray(point[0], point[1], 0);
        }
        return point;
    },
    getBoundsOfCurve: function(p0, p1, p2, p3) {
        var bounds = [[p0[0],p3[0]], [p0[1],p3[1]]];

        for (var a, b, c, t, b2ac, t1, t2, i = 0; i < 2; ++i) {

          b = 6 * p0[i] - 12 * p1[i] + 6 * p2[i];
          a = -3 * p0[i] + 9 * p1[i] - 9 * p2[i] + 3 * p3[i];
          c = 3 * p1[i] - 3 * p0[i];

          b = b | 0;
          a = a | 0;
          c = c | 0;

          if (a === 0) {

            if (b === 0) {
              continue;
            }

            t = -c / b;

            if (0 < t && t < 1) {
              bounds[i].push(this.calculateF(t,p0,p1,p2,p3,i));
            }
            continue;
          }

          b2ac = b * b - 4 * c * a;

          if (b2ac < 0) {
            continue;
          }

          t1 = (-b + bm_sqrt(b2ac))/(2 * a);
          if (0 < t1 && t1 < 1) bounds[i].push(this.calculateF(t1,p0,p1,p2,p3,i));

          t2 = (-b - bm_sqrt(b2ac))/(2 * a);
          if (0 < t2 && t2 < 1) bounds[i].push(this.calculateF(t2,p0,p1,p2,p3,i));

        }

        this.shapeBoundingBox.left = bm_min.apply(null, bounds[0]);
        this.shapeBoundingBox.top = bm_min.apply(null, bounds[1]);
        this.shapeBoundingBox.right = bm_max.apply(null, bounds[0]);
        this.shapeBoundingBox.bottom = bm_max.apply(null, bounds[1]);
    },
    calculateF: function(t, p0, p1, p2, p3, i) {
    return bm_pow(1-t, 3) * p0[i]
        + 3 * bm_pow(1-t, 2) * t * p1[i]
        + 3 * (1-t) * bm_pow(t, 2) * p2[i]
        + bm_pow(t, 3) * p3[i];
    },
    shapeBoundingBox: {
        left:0,
        right:0,
        top:0,
        bottom:0,
    },
    tempBoundingBox: {
        x:0,
        xMax:0,
        y:0,
        yMax:0,
        width:0,
        height:0
    }
};