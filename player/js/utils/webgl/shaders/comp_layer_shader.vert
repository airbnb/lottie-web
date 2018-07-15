attribute vec4 a_position;
uniform mat4 uMatrix;
uniform mat4 localMatrix;
varying vec2 v_texCoord;
attribute vec2 a_texCoord;
void main() {
	gl_Position = uMatrix * localMatrix * a_position;
	v_texCoord = a_texCoord;
}