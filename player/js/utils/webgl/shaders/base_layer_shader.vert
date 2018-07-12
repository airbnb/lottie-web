attribute vec4 a_position;
uniform mat4 uMatrix;
uniform mat4 localMatrix;
void main() {
	gl_Position = uMatrix * localMatrix * a_position;
}