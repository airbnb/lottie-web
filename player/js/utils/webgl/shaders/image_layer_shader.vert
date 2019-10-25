attribute vec3 a_position;
uniform mat4 uMatrix;
uniform mat4 localMatrix;
varying vec2 v_texCoord;
void main() {
	gl_Position = uMatrix * localMatrix * vec4(a_position, 1);
	v_texCoord = a_position.xy;
}