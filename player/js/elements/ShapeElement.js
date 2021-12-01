import ProcessedElement from './helpers/shapes/ProcessedElement';

function IShapeElement() {
}

IShapeElement.prototype = {
  addShapeToModifiers: function (data) {
    var i;
    var len = this.shapeModifiers.length;
    for (i = 0; i < len; i += 1) {
      this.shapeModifiers[i].addShape(data);
    }
  },
  isShapeInAnimatedModifiers: function (data) {
    var i = 0;
    var len = this.shapeModifiers.length;
    while (i < len) {
      if (this.shapeModifiers[i].isAnimatedWithShape(data)) {
        return true;
      }
    }
    return false;
  },
  renderModifiers: function () {
    if (!this.shapeModifiers.length) {
      return;
    }
    var i;
    var len = this.shapes.length;
    for (i = 0; i < len; i += 1) {
      this.shapes[i].sh.reset();
    }

    len = this.shapeModifiers.length;
    var shouldBreakProcess;
    for (i = len - 1; i >= 0; i -= 1) {
      shouldBreakProcess = this.shapeModifiers[i].processShapes(this._isFirstFrame);
      // workaround to fix cases where a repeater resets the shape so the following processes get called twice
      // TODO: find a better solution for this
      if (shouldBreakProcess) {
        break;
      }
    }
  },

  searchProcessedElement: function (elem) {
    var elements = this.processedElements;
    var i = 0;
    var len = elements.length;
    while (i < len) {
      if (elements[i].elem === elem) {
        return elements[i].pos;
      }
      i += 1;
    }
    return 0;
  },
  addProcessedElement: function (elem, pos) {
    var elements = this.processedElements;
    var i = elements.length;
    while (i) {
      i -= 1;
      if (elements[i].elem === elem) {
        elements[i].pos = pos;
        return;
      }
    }
    elements.push(new ProcessedElement(elem, pos));
  },
  prepareFrame: function (num) {
    this.prepareRenderableFrame(num);
    this.prepareProperties(num, this.isInRange);
  },
};

export default IShapeElement;
