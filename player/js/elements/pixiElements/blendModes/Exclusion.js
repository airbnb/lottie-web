import { BlendFilter, blendFullArray, NPM_BLEND } from '@pixi/picture';
import { BLEND_MODES } from 'pixi.js';

/**
 * Blend Mode: Exclusion
 * This blend mode is using pixi/picture to define the full shader code.
 */

// Blending code for exclusion blend mode
const EXCLUSION_SHADER_PART = `
vec3 B = abs(Cs, Cb);
`;

// Create globally shared instance of blend filter. This is a
// good optimization if you're going to use the filter on multiple
// objects.
const EXCLUSION_SHADER_FULL = NPM_BLEND.replace(
  '%NPM_BLEND%',
  EXCLUSION_SHADER_PART
);

const exclusionBlendFilter = new BlendFilter({
  blendCode: EXCLUSION_SHADER_FULL,
});

blendFullArray[BLEND_MODES.EXCLUSION] = EXCLUSION_SHADER_FULL;
export default exclusionBlendFilter;
