var shaders = {}
shaders["base_effect_shader_vert"] = "attribute vec4 a_position;varying vec2 v_texCoord;attribute vec2 a_texCoord;void main() {	vec4 zeroToOne = a_position / 1.0;	vec4 zeroToTwo = zeroToOne * 2.0;	vec4 clipSpace = zeroToTwo - 1.0;	gl_Position = vec4(clipSpace);	v_texCoord = a_texCoord;}";
shaders["base_layer_shader_vert"] = "attribute vec4 a_position;uniform mat4 uMatrix;uniform mat4 localMatrix;void main() {	gl_Position = uMatrix * localMatrix * a_position;}";
shaders["image_layer_shader_frag"] = "precision mediump float;uniform sampler2D u_image;varying vec2 v_texCoord;void main() {	gl_FragColor = texture2D(u_image, v_texCoord);}";
shaders["image_layer_shader_vert"] = "attribute vec4 a_position;uniform mat4 uMatrix;uniform mat4 localMatrix;varying vec2 v_texCoord;attribute vec2 a_texCoord;void main() {	gl_Position = uMatrix * localMatrix * a_position;	v_texCoord = a_texCoord;}";
shaders["solid_layer_shader_frag"] = "precision mediump float;uniform vec4 colorUniform;void main() {	gl_FragColor = colorUniform;}";
shaders["tint_shader_frag"] = "precision mediump float;uniform sampler2D u_image;varying vec2 v_texCoord;uniform vec2 u_textureSize;uniform float color_amount;uniform vec4 whiteToColor;uniform vec4 blackToColor;void main() {    vec4 textureValue = texture2D(u_image, v_texCoord);    float saturation = (textureValue.r + textureValue.g + textureValue.b) / 3.0;    vec4 textureMapped = blackToColor + (whiteToColor - blackToColor) * saturation;    gl_FragColor = mix(textureValue, textureMapped, color_amount);}";
function get_shader(name) {
return shaders[name];
}
