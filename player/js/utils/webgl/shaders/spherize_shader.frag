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
	vec2 vUv_1 = toPolar(vUv);
	vUv_1.x += diagonal * sin(PI * vUv_1.x / diagonal);
	vUv_1 = fromPolar(vUv_1);

	gl_FragColor = texture2D(u_image, vUv_1);
}