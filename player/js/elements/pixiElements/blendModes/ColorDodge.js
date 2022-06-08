import { BlendFilter, blendFullArray, NPM_BLEND } from '@pixi/picture';
import { BLEND_MODES } from 'pixi.js';

/**
 * Blend Mode: ColorDodge
 * This blend mode is using pixi/picture to define the full shader code.
 */

// Blending code for color dodge blend mode
const COLOR_DODGE_SHADER_PART = `
vec3 B = Cb / (1.0 - Cs);
`;

// Create globally shared instance of blend filter. This is a
// good optimization if you're going to use the filter on multiple
// objects.
const COLOR_DODGE_SHADER_FULL = NPM_BLEND.replace(
  '%NPM_BLEND%',
  COLOR_DODGE_SHADER_PART
);
const colorDodgeBlendFilter = new BlendFilter({
  blendCode: COLOR_DODGE_SHADER_FULL,
});

blendFullArray[BLEND_MODES.COLOR_DODGE] = COLOR_DODGE_SHADER_FULL;
export default colorDodgeBlendFilter;
