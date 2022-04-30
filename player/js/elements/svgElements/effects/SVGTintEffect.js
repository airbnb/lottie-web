import createNS from '../../../utils/helpers/svg_elements';
import SVGComposableEffect from './SVGComposableEffect';
import {
  extendPrototype,
} from '../../../utils/functionExtensions';

function SVGTintFilter(filter, filterManager, elem, id, source) {
  this.filterManager = filterManager;
  var feColorMatrix = createNS('feColorMatrix');
  feColorMatrix.setAttribute('type', 'matrix');
  feColorMatrix.setAttribute('color-interpolation-filters', 'linearRGB');
  feColorMatrix.setAttribute('values', '0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0 0 0 1 0');
  feColorMatrix.setAttribute('result', id + '_tint_1');
  filter.appendChild(feColorMatrix);
  feColorMatrix = createNS('feColorMatrix');
  feColorMatrix.setAttribute('type', 'matrix');
  feColorMatrix.setAttribute('color-interpolation-filters', 'sRGB');
  feColorMatrix.setAttribute('values', '1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0');
  feColorMatrix.setAttribute('result', id + '_tint_2');
  filter.appendChild(feColorMatrix);
  this.matrixFilter = feColorMatrix;
  var feMerge = this.createMergeNode(
    id,
    [
      source,
      id + '_tint_1',
      id + '_tint_2',
    ]
  );
  filter.appendChild(feMerge);
}
extendPrototype([SVGComposableEffect], SVGTintFilter);

SVGTintFilter.prototype.renderFrame = function (forceRender) {
  if (forceRender || this.filterManager._mdf) {
    var colorBlack = this.filterManager.effectElements[0].p.v;
    var colorWhite = this.filterManager.effectElements[1].p.v;
    var opacity = this.filterManager.effectElements[2].p.v / 100;
    this.matrixFilter.setAttribute('values', (colorWhite[0] - colorBlack[0]) + ' 0 0 0 ' + colorBlack[0] + ' ' + (colorWhite[1] - colorBlack[1]) + ' 0 0 0 ' + colorBlack[1] + ' ' + (colorWhite[2] - colorBlack[2]) + ' 0 0 0 ' + colorBlack[2] + ' 0 0 0 ' + opacity + ' 0');
  }
};

export default SVGTintFilter;
