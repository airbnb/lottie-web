precision mediump float;
uniform sampler2D u_image;
varying vec2 vUv;
uniform float angle;
uniform float radius;
uniform vec2 center;

vec2 fromPolar( vec2 uv ) {
  uv = vec2( uv.x * cos( uv.y ), uv.x * sin( uv.y ) );
  return uv + vec2( 0.5 );
}
vec2 toPolar( vec2 uv ) {
  uv -= vec2( 0.5 );
  return vec2( length( uv ), atan( uv.y, uv.x ));  
}

void main() {
	vec2 vUv_1 = toPolar(vUv);
	float perc = 0.0;
	if(vUv_1.x < radius) {
		perc = vUv_1.x / radius;
		perc = perc * 2.0;
		vUv_1.y += radians(-angle * perc);
	}
	vec2 cart_vUv_1 = fromPolar(vUv_1);
	if(vUv_1.x > 0.6) {
		gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
	} else {
    	gl_FragColor = texture2D(u_image, cart_vUv_1);
	}
}