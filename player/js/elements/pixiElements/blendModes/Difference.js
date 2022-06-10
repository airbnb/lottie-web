import { BlendFilter, blendFullArray, NPM_BLEND } from '@pixi/picture';
import { BLEND_MODES } from 'pixi.js';

/**
 * Blend Mode: Difference
 * This blend mode is using pixi/picture to define the full shader code.
 */

// Blending code for difference blend mode
const DIFFERENCE_SHADER_PART = `
vec3 B = abs(Cs, Cb);
`;

// Create globally shared instance of blend filter. This is a
// good optimization if you're going to use the filter on multiple
// objects.
const DIFFERENCE_SHADER_FULL = NPM_BLEND.replace(
  '%NPM_BLEND%',
  DIFFERENCE_SHADER_PART
);

const differenceBlendFilter = new BlendFilter({
  blendCode: DIFFERENCE_SHADER_FULL,
});

blendFullArray[BLEND_MODES.DIFFERENCE] = DIFFERENCE_SHADER_FULL;
export default differenceBlendFilter;
