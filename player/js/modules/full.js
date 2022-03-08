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
// SVG effects
import { registerEffect } from '../elements/svgElements/SVGEffects';
import SVGTintFilter from '../elements/svgElements/effects/SVGTintEffect';
import SVGFillFilter from '../elements/svgElements/effects/SVGFillFilter';
import SVGStrokeEffect from '../elements/svgElements/effects/SVGStrokeEffect';
import SVGTritoneFilter from '../elements/svgElements/effects/SVGTritoneFilter';
import SVGProLevelsFilter from '../elements/svgElements/effects/SVGProLevelsFilter';
import SVGDropShadowEffect from '../elements/svgElements/effects/SVGDropShadowEffect';
import SVGMatte3Effect from '../elements/svgElements/effects/SVGMatte3Effect';
import SVGGaussianBlurEffect from '../elements/svgElements/effects/SVGGaussianBlurEffect';

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

// Registering svg effects
registerEffect(20, SVGTintFilter, true);
registerEffect(21, SVGFillFilter, true);
registerEffect(22, SVGStrokeEffect, false);
registerEffect(23, SVGTritoneFilter, true);
registerEffect(24, SVGProLevelsFilter, true);
registerEffect(25, SVGDropShadowEffect, true);
registerEffect(28, SVGMatte3Effect, false);
registerEffect(29, SVGGaussianBlurEffect, true);

export default lottie;
