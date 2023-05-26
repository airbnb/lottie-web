import TransformEffect from '../../../effects/TransformEffect';
import { extendPrototype } from '../../../utils/functionExtensions';

function CVTransformEffect(effectsManager) {
  this.init(effectsManager);
}
extendPrototype([TransformEffect], CVTransformEffect);

export default CVTransformEffect;
