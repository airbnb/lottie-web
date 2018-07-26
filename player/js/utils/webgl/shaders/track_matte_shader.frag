precision mediump float;
uniform sampler2D original_image;
uniform sampler2D mask_image;
uniform float matte_type;
varying vec2 v_texCoord;
varying vec2 v_texCoord_mask;
void main() {
	vec4 original_vec = texture2D(original_image, v_texCoord);
	vec4 mask_vec = texture2D(mask_image, v_texCoord_mask);
	//vec4 mask_vec = texture2D(mask_image, v_texCoord_mask);
	float multiplier;
	if(v_texCoord_mask.x < 0.0 || v_texCoord_mask.y < 0.0 || v_texCoord_mask.x > 1.0 || v_texCoord_mask.y > 1.0) {
		if(matte_type == 1.0 || matte_type == 3.0 || matte_type == 4.0) {
			multiplier = 0.0;
		} else if(matte_type == 2.0) {
			multiplier = 1.0;
		}
	} else {
		if(matte_type == 1.0) {
			multiplier = mask_vec.a;
		} else if(matte_type == 2.0) {
			multiplier = 1.0 - mask_vec.a;
		} else if(matte_type == 3.0) {
			multiplier = (mask_vec.r + mask_vec.g + mask_vec.b) / 3.0;
			//multiplier = 0.2126*mask_vec.r + 0.7152*mask_vec.g + 0.0722*mask_vec.b;
			//multiplier = 0.299*mask_vec.r + 0.587*mask_vec.g + 0.114*mask_vec.b;
			// multiplier = 0.33*mask_vec.r + 0.5*mask_vec.g + 0.16*mask_vec.b;
		}  else if(matte_type == 4.0) {
			multiplier = 1.0 - (mask_vec.r + mask_vec.g + mask_vec.b) / 3.0;
		} 
		//gl_FragColor = mask_vec;
	}
	gl_FragColor = vec4(original_vec.rgb,multiplier * original_vec.a);
	// gl_FragColor = texture2D(mask_image, v_texCoord);
	//gl_FragColor = vec4(texture2D(u_image, v_texCoord).rgb,0.5);
	//gl_FragColor = mix(original_vec,mask_vec,0.5);
	// gl_FragColor = vec4(original_vec.rgb, 0.25);
	//gl_FragColor = vec4(1.0,0.0,0.0,0.75);
}