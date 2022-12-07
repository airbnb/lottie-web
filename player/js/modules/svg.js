import lottie from './svg_light';
import {
  setExpressionsPlugin,
  setExpressionInterfaces,
} from '../utils/common';
import Expressions from '../utils/expressions/Expressions';
import interfacesProvider from '../utils/expressions/InterfacesProvider';
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

// Registering expression plugin
setExpressionsPlugin(Expressions);
setExpressionInterfaces(interfacesProvider);
expressionPropertyDecorator();
expressionTextPropertyDecorator();
registerEffect(20, SVGTintFilter, true);
registerEffect(21, SVGFillFilter, true);
registerEffect(22, SVGStrokeEffect, false);
registerEffect(23, SVGTritoneFilter, true);
registerEffect(24, SVGProLevelsFilter, true);
registerEffect(25, SVGDropShadowEffect, true);
registerEffect(28, SVGMatte3Effect, false);
registerEffect(29, SVGGaussianBlurEffect, true);

export default lottie;
