import lottie from './canvas_light';
import {
  setExpressionsPlugin,
} from '../utils/common';
import Expressions from '../utils/expressions/Expressions';
import expressionPropertyDecorator from '../utils/expressions/ExpressionPropertyDecorator';

// Registering expression plugin
setExpressionsPlugin(Expressions);
expressionPropertyDecorator();

export default lottie;
