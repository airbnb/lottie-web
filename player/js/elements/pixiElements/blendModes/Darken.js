import { BlendFilter, blendFullArray, NPM_BLEND } from '@pixi/picture';
import { BLEND_MODES } from 'pixi.js';

/**
 * Blend Mode: Darken
 * This blend mode is using pixi/picture to define the full shader code.
 */

// Blending code for darken blend mode
const DARKEN_SHADER_PART = `
vec3 B = min(Cs, Cb);
`;

// Create globally shared instance of blend filter. This is a
// good optimization if you're going to use the filter on multiple
// objects.
const DARKEN_SHADER_FULL = NPM_BLEND.replace('%NPM_BLEND%', DARKEN_SHADER_PART);

const darkenBlendFilter = new BlendFilter({
  blendCode: DARKEN_SHADER_FULL,
});

blendFullArray[BLEND_MODES.DARKEN] = DARKEN_SHADER_FULL;
export default darkenBlendFilter;
