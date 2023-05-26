import lottie from './canvas_light';
import {
  setExpressionsPlugin,
  setExpressionInterfaces,
} from '../utils/common';
import Expressions from '../utils/expressions/Expressions';
import interfacesProvider from '../utils/expressions/InterfacesProvider';
import expressionPropertyDecorator from '../utils/expressions/ExpressionPropertyDecorator';
import expressionTextPropertyDecorator from '../utils/expressions/ExpressionTextPropertyDecorator';
import CVTransformEffect from '../elements/canvasElements/effects/CVTransformEffect';
import { registerEffect } from '../elements/canvasElements/CVEffects';

// Registering expression plugin
setExpressionsPlugin(Expressions);
setExpressionInterfaces(interfacesProvider);
expressionPropertyDecorator();
expressionTextPropertyDecorator();
registerEffect(35, CVTransformEffect);

export default lottie;
