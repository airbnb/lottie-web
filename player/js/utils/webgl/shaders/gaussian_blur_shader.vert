attribute vec4 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
varying vec2 vUv;
void main() {
	vec4 zeroToOne = a_position / 1.0;
	vec4 zeroToTwo = zeroToOne * 2.0;
	vec4 clipSpace = zeroToTwo - 1.0;
	gl_Position = vec4(clipSpace);
	vUv = a_texCoord;
}