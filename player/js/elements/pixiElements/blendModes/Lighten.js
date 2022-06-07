import { BlendFilter, blendFullArray, NPM_BLEND } from '@pixi/picture';
import { BLEND_MODES } from 'pixi.js';

/**
 * Blend Mode: Lighten
 * This blend mode is using pixi/picture to define the full shader code.
 */

// Blending code for lighten blend mode
const LIGHTEN_SHADER_PART = `
vec3 B = max(Cs, Cb);
`;

// Create globally shared instance of blend filter. This is a
// good optimization if you're going to use the filter on multiple
// objects.
const LIGHTEN_SHADER_FULL = NPM_BLEND.replace('%NPM_BLEND%', LIGHTEN_SHADER_PART);
const lightenBlendFilter = new BlendFilter({
  blendCode: LIGHTEN_SHADER_FULL,
});

blendFullArray[BLEND_MODES.LIGHTEN] = LIGHTEN_SHADER_FULL;
export default lightenBlendFilter;
