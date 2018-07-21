precision mediump float;
uniform vec4 colorUniform;
varying vec2 v_texCoord;
uniform sampler2D mask_image;
void main() {
	vec4 mask_value = texture2D(mask_image, v_texCoord);
	gl_FragColor = vec4(colorUniform.rgb, mask_value.r);
}