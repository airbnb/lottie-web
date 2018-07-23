precision mediump float;
uniform sampler2D original_image;
uniform sampler2D mask_image;
varying vec2 v_texCoord;
void main() {
	vec4 original_vec = texture2D(original_image, v_texCoord);
	vec4 mask_vec = texture2D(mask_image, v_texCoord);
	//gl_FragColor = texture2D(original_image, v_texCoord);
	//gl_FragColor = vec4(texture2D(u_image, v_texCoord).rgb,0.5);
	//gl_FragColor = mix(original_vec,mask_vec,0.5);
	//gl_FragColor = vec4(original_vec.rgb,mask_vec.a * original_vec.a);
	// gl_FragColor = vec4(original_vec.rgb, 0.25);
	gl_FragColor = vec4(1.0,0.0,0.0,0.75);
}