import TransformEffect from '../../../effects/TransformEffect';
import { extendPrototype } from '../../../utils/functionExtensions';

function SVGTransformEffect(_, filterManager) {
  this.init(filterManager);
}

extendPrototype([TransformEffect], SVGTransformEffect);

export default SVGTransformEffect;
