import { BlendFilter, blendFullArray, NPM_BLEND } from '@pixi/picture';
import { BLEND_MODES } from 'pixi.js';

/**
 * Blend Mode: ColorBurn
 * This blend mode is using pixi/picture to define the full shader code.
 */

// Blending code for color burn blend mode
const COLOR_BURN_SHADER_PART = `
vec3 B = 1.0 - (1.0 - Cb) / Cs;
`;

// Create globally shared instance of blend filter. This is a
// good optimization if you're going to use the filter on multiple
// objects.
const COLOR_BURN_SHADER_FULL = NPM_BLEND.replace(
  '%NPM_BLEND%',
  COLOR_BURN_SHADER_PART
);
const colorBurnBlendFilter = new BlendFilter({
  blendCode: COLOR_BURN_SHADER_FULL,
});

blendFullArray[BLEND_MODES.COLOR_BURN] = COLOR_BURN_SHADER_FULL;
export default colorBurnBlendFilter;
