import lottie from './canvas';
import CanvasRenderer from '../renderers/CanvasRenderer';

// Monkey patch some methods to work correctly with Worker
CanvasRenderer.prototype.updateContainerSize = function () {
  console.log('resize with override');
};

export default lottie;
