import createTag from './html_elements';
import createNS from './svg_elements';
import featureSupport from '../featureSupport';

var lumaLoader = (function () {
  var id = '__lottie_element_luma_buffer';
  var lumaBuffer = null;
  var lumaBufferCtx = null;
  var svg = null;

  // This alternate solution has a slight delay before the filter is applied, resulting in a flicker on the first frame.
  // Keeping this here for reference, and in the future, if offscreen canvas supports url filters, this can be used.
  // For now, neither of them work for offscreen canvas, so canvas workers can't support the luma track matte mask.
  // Naming it solution 2 to mark the extra comment lines.
  /*
  var svgString = [
    '<svg xmlns="http://www.w3.org/2000/svg">',
    '<filter id="' + id + '">',
    '<feColorMatrix type="matrix" color-interpolation-filters="sRGB" values="',
    '0.3, 0.3, 0.3, 0, 0, ',
    '0.3, 0.3, 0.3, 0, 0, ',
    '0.3, 0.3, 0.3, 0, 0, ',
    '0.3, 0.3, 0.3, 0, 0',
    '"/>',
    '</filter>',
    '</svg>',
  ].join('');
  var blob = new Blob([svgString], { type: 'image/svg+xml' });
  var url = URL.createObjectURL(blob);
  */

  function createLumaSvgFilter() {
    var _svg = createNS('svg');
    var fil = createNS('filter');
    var matrix = createNS('feColorMatrix');
    fil.setAttribute('id', id);
    matrix.setAttribute('type', 'matrix');
    matrix.setAttribute('color-interpolation-filters', 'sRGB');
    matrix.setAttribute('values', '0.3, 0.3, 0.3, 0, 0, 0.3, 0.3, 0.3, 0, 0, 0.3, 0.3, 0.3, 0, 0, 0.3, 0.3, 0.3, 0, 0');
    fil.appendChild(matrix);
    _svg.appendChild(fil);
    _svg.setAttribute('id', id + '_svg');
    if (featureSupport.svgLumaHidden) {
      _svg.style.display = 'none';
    }
    return _svg;
  }

  function loadLuma() {
    if (!lumaBuffer) {
      svg = createLumaSvgFilter();
      document.body.appendChild(svg);
      lumaBuffer = createTag('canvas');
      lumaBufferCtx = lumaBuffer.getContext('2d');
      // lumaBufferCtx.filter = `url('${url}#__lottie_element_luma_buffer')`; // part of solution 2
      lumaBufferCtx.filter = 'url(#' + id + ')';
      lumaBufferCtx.fillStyle = 'rgba(0,0,0,0)';
      lumaBufferCtx.fillRect(0, 0, 1, 1);
    }
  }

  function getLuma(canvas) {
    if (!lumaBuffer) {
      loadLuma();
    }
    lumaBuffer.width = canvas.width;
    lumaBuffer.height = canvas.height;
    // lumaBufferCtx.filter = `url('${url}#__lottie_element_luma_buffer')`; // part of solution 2
    lumaBufferCtx.filter = 'url(#' + id + ')';
    return lumaBuffer;
  }
  return {
    load: loadLuma,
    get: getLuma,
  };
});

function createCanvas(width, height) {
  if (featureSupport.offscreenCanvas) {
    return new OffscreenCanvas(width, height);
  }
  var canvas = createTag('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

const assetLoader = (function () {
  return {
    loadLumaCanvas: lumaLoader.load,
    getLumaCanvas: lumaLoader.get,
    createCanvas: createCanvas,
  };
}());

export default assetLoader;
