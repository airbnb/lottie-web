attribute vec4 a_position;
uniform mat4 uMatrix;
// TODO: Look into using a vec4 for both pairs of coords
varying vec2 v_texCoord;
varying vec2 v_texCoord_mask;
attribute vec2 a_texCoord;
void main() {
	gl_Position = a_position;
	vec4 zeroToOne = a_position;
	vec4 zeroToTwo = zeroToOne * 2.0;
	vec4 clipSpace = zeroToTwo - 1.0;
	gl_Position = clipSpace;
	//gl_Position = a_position;
	v_texCoord = a_texCoord;
	v_texCoord_mask = (uMatrix * vec4(a_texCoord,1,1)).xy;
}