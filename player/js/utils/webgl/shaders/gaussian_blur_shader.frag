precision mediump float;
uniform sampler2D u_image;
uniform float weights[100];
uniform int blurriness;
varying vec2 vUv;

vec4 calculateColorSum(vec2 onePixel) {
	// vec4 colorSum = vec4(0.0, 0.0, 0.0, 1.0);
	vec4 colorSum = vec4(0.0, 0.0, 0.0, 1.0);
	// vec4 colorSum = texture2D(u_image, vUv);
	for(int i = 0; i < 50; i += 1) {
		if(i >= blurriness / 2) {
			return colorSum;
		}
		colorSum += texture2D(u_image, vUv + onePixel * vec2(-1 * ((blurriness / 2) - i), 0)) * weights[i];
		colorSum += texture2D(u_image, vUv + onePixel * vec2(1 * ((blurriness / 2) - i), 0)) * weights[i];

		// colorSum += vec4(0.0, 1.0, 0.0, 1.0) * weights[i];
		// colorSum += vec4(0.0, 1.0, 0.0, 1.0) * weights[i];
		// colorSum += texture2D(u_image, vUv) * weights[i];
		// colorSum += texture2D(u_image, vUv + onePixel * vec2(1 * ((blurriness / 2) - i), 0)) * weights[i];
		/* vec4 texturePoint = texture2D(u_image, vUv);
		if(texturePoint.r == 1.0) {
			colorSum = vec4(0.0, 0.0, 1.0, 1.0);
		} */
	}
	return colorSum;
}

void main() {
	vec2 u_textureSize = vec2(1200.0 * 2.5, 600.0 * 2.5);
	vec2 onePixel = vec2(1.0, 0.0) / u_textureSize;
	gl_FragColor = calculateColorSum(onePixel);
	// gl_FragColor = texture2D(u_image, vUv);
}