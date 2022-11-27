import lottie from './canvas_light';
import {
  setExpressionsPlugin,
  setExpressionInterfaces,
} from '../utils/common';
import Expressions from '../utils/expressions/Expressions';
import interfacesProvider from '../utils/expressions/InterfacesProvider';
import expressionPropertyDecorator from '../utils/expressions/ExpressionPropertyDecorator';
import expressionTextPropertyDecorator from '../utils/expressions/ExpressionTextPropertyDecorator';

// Registering expression plugin
setExpressionsPlugin(Expressions);
setExpressionInterfaces(interfacesProvider);
expressionPropertyDecorator();
expressionTextPropertyDecorator();

export default lottie;
