precision mediump float;
uniform sampler2D u_image;
varying vec2 vUv;
uniform float angle;
uniform float radius;
uniform vec2 center;

vec2 fromPolar( vec2 uv ) {
  uv = vec2( uv.x * cos( uv.y ), uv.x * sin( uv.y ) );
  return uv + vec2( 0.5 ) + center;
}
vec2 toPolar( vec2 uv ) {
  uv -= vec2( 0.5 ) + center;
  return vec2( length( uv ), atan( uv.y, uv.x ));  
}

float diagonal = 1.4142; //sqrt(pow(0.5, 2.0) + pow(0.5, 2.0)) * 2.0;

void main() {
	vec2 vUv_1 = toPolar(vUv);
	if(vUv_1.x < diagonal * radius) {
		float perc = vUv_1.x / (diagonal * radius);
		perc = (cos(perc * 3.141592) + 1.0) / 2.0;
		vUv_1.y += radians(-angle * perc);
	}
	vec2 cart_vUv_1 = fromPolar(vUv_1);
	if(cart_vUv_1.x < 0.0 || cart_vUv_1.x > 1.0 || cart_vUv_1.y < 0.0 || cart_vUv_1.y > 1.0) {
		discard;
	} else {
		gl_FragColor = texture2D(u_image, cart_vUv_1);
	}
}