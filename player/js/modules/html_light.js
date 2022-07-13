import lottie from './main';
import { ShapeModifiers } from '../utils/shapes/ShapeModifiers';
import TrimModifier from '../utils/shapes/TrimModifier';
import PuckerAndBloatModifier from '../utils/shapes/PuckerAndBloatModifier';
import RepeaterModifier from '../utils/shapes/RepeaterModifier';
import RoundCornersModifier from '../utils/shapes/RoundCornersModifier';
import ZigZagModifier from '../utils/shapes/ZigZagModifier';
import OffsetPathModifier from '../utils/shapes/OffsetPathModifier';
import HybridRenderer from '../renderers/HybridRenderer';
import {
  registerRenderer,
} from '../renderers/renderersManager';

// Registering renderers
registerRenderer('html', HybridRenderer);

// Registering shape modifiers
ShapeModifiers.registerModifier('tm', TrimModifier);
ShapeModifiers.registerModifier('pb', PuckerAndBloatModifier);
ShapeModifiers.registerModifier('rp', RepeaterModifier);
ShapeModifiers.registerModifier('rd', RoundCornersModifier);
ShapeModifiers.registerModifier('zz', ZigZagModifier);
ShapeModifiers.registerModifier('op', OffsetPathModifier);

export default lottie;
