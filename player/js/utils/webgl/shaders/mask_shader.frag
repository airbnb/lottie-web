precision mediump float;
uniform sampler2D original_image;
uniform sampler2D mask_image;
varying vec2 v_texCoord;
void main() {
	vec4 original_color = texture2D(original_image, v_texCoord);
	vec4 mask_color = texture2D(mask_image, v_texCoord);
	gl_FragColor = vec4(original_color.rgb, mask_color.a * original_color.a);
}