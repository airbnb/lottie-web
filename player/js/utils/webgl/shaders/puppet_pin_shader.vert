attribute vec4 a_position;
varying vec2 v_texCoord;
attribute vec2 a_texCoord;
void main() {
	vec4 zeroToOne = a_position / 1.0;
	vec4 zeroToTwo = zeroToOne * 2.0;
	vec4 clipSpace = zeroToTwo - 1.0;
	gl_Position = vec4(clipSpace);
	v_texCoord = a_texCoord;
}