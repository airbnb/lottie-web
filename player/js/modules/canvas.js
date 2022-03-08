import lottie from './canvas_light';
import {
  setExpressionsPlugin,
} from '../utils/common';
import Expressions from '../utils/expressions/Expressions';
import expressionPropertyDecorator from '../utils/expressions/ExpressionPropertyDecorator';
import expressionTextPropertyDecorator from '../utils/expressions/ExpressionTextPropertyDecorator';

// Registering expression plugin
setExpressionsPlugin(Expressions);
expressionPropertyDecorator();
expressionTextPropertyDecorator();

export default lottie;
