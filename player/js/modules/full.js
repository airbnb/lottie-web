import lottie from './main';
import {
  setExpressionsPlugin,
} from '../utils/common';
import { ShapeModifiers } from '../utils/shapes/ShapeModifiers';
import TrimModifier from '../utils/shapes/TrimModifier';
import PuckerAndBloatModifier from '../utils/shapes/PuckerAndBloatModifier';
import RepeaterModifier from '../utils/shapes/RepeaterModifier';
import RoundCornersModifier from '../utils/shapes/RoundCornersModifier';
import CanvasRenderer from '../renderers/CanvasRenderer';
import HybridRenderer from '../renderers/HybridRenderer';
import SVGRenderer from '../renderers/SVGRenderer';
import {
  registerRenderer,
} from '../renderers/renderersManager';
import Expressions from '../utils/expressions/Expressions';
import expressionPropertyDecorator from '../utils/expressions/ExpressionPropertyDecorator';
import expressionTextPropertyDecorator from '../utils/expressions/ExpressionTextPropertyDecorator';

// Registering renderers
registerRenderer('canvas', CanvasRenderer);
registerRenderer('html', HybridRenderer);
registerRenderer('svg', SVGRenderer);

// Registering shape modifiers
ShapeModifiers.registerModifier('tm', TrimModifier);
ShapeModifiers.registerModifier('pb', PuckerAndBloatModifier);
ShapeModifiers.registerModifier('rp', RepeaterModifier);
ShapeModifiers.registerModifier('rd', RoundCornersModifier);

// Registering expression plugin
setExpressionsPlugin(Expressions);
expressionPropertyDecorator();
expressionTextPropertyDecorator();

export default lottie;
