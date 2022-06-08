import { BlendFilter, blendFullArray, NPM_BLEND } from '@pixi/picture';
import { BLEND_MODES } from 'pixi.js';

// Currently not supported by BodyMovin
/**
 * Blend Mode: LinearBurn
 * This blend mode is using pixi/picture to define the full shader code.
 */

// Blending code for linear burn blend mode
const LINEAR_BURN_SHADER_PART = `
vec3 B = Cb + Cs - 1.0;
`;

// Create globally shared instance of blend filter. This is a
// good optimization if you're going to use the filter on multiple
// objects.
const LINEAR_BURN_SHADER_FULL = NPM_BLEND.replace(
  '%NPM_BLEND%',
  LINEAR_BURN_SHADER_PART
);
const linearBurnBlendFilter = new BlendFilter({
  blendCode: LINEAR_BURN_SHADER_FULL,
});

blendFullArray[BLEND_MODES.LINEAR_BURN] = LINEAR_BURN_SHADER_FULL;
export default linearBurnBlendFilter;
