precision mediump float;
uniform sampler2D u_image;
varying vec2 vUv;

vec2 fromPolar( vec2 uv ) {
  uv = vec2( uv.x * cos( uv.y ), uv.x * sin( uv.y ) );
  return uv + vec2( 0.5 );
}
vec2 toPolar( vec2 uv ) {
  uv -= vec2( 0.5 );
  return vec2( length( uv ), atan( uv.y, uv.x ));  
}


//sqrt(pow(0.5,2) + pow(0.5,2)) * 2
float diagonal = 1.4142;
float PI = 3.141592;
float wave_width = 9.0;
float wave_height = 0.008;

void main() {
	vec2 vUv_1 = vUv;
	vUv_1 = toPolar(vUv_1);
	float angle = (vUv_1.y + PI) * 180.0 / PI;
	float segment = mod(angle, wave_width);
	float segment_perc = segment / wave_width;
	vUv_1.x += wave_height * sin(PI * segment_perc);
	//vUv_1.x += vUv_1.x;
	vec2 cart_vUv_1 = fromPolar(vUv_1);
	if(cart_vUv_1.x < 0.0 || cart_vUv_1.x > 1.0 || cart_vUv_1.y < 0.0 || cart_vUv_1.y > 1.0) {
		discard;
	}
	if(segment_perc < 0.5) {
	}

	gl_FragColor = texture2D(u_image, cart_vUv_1);
}