import {
  extendPrototype,
} from '../../utils/functionExtensions';
import RenderableElement from '../helpers/RenderableElement';
import BaseElement from '../BaseElement';
import TransformElement from '../helpers/TransformElement';
import HierarchyElement from '../helpers/HierarchyElement';
import FrameElement from '../helpers/FrameElement';
import CVBaseElement from './CVBaseElement';
import RenderableDOMElement from '../helpers/RenderableDOMElement';

function CVSolidElement(data, globalData, comp) {
  this.initElement(data, globalData, comp);
}
extendPrototype([BaseElement, TransformElement, CVBaseElement, HierarchyElement, FrameElement, RenderableElement], CVSolidElement);

CVSolidElement.prototype.initElement = RenderableDOMElement.prototype.initElement;
CVSolidElement.prototype.prepareFrame = RenderableDOMElement.prototype.prepareFrame;

CVSolidElement.prototype.renderInnerContent = function () {
  // var ctx = this.canvasContext;
  this.globalData.renderer.ctxFillStyle(this.data.sc);
  // ctx.fillStyle = this.data.sc;
  this.globalData.renderer.ctxFillRect(0, 0, this.data.sw, this.data.sh);
  // ctx.fillRect(0, 0, this.data.sw, this.data.sh);
  //
};

export default CVSolidElement;
