precision mediump float;
uniform sampler2D u_image;
varying vec2 v_texCoord;
uniform vec2 u_textureSize;
uniform float color_amount;
uniform vec4 whiteToColor;
uniform vec4 blackToColor;

void main() {
    vec4 textureValue = texture2D(u_image, v_texCoord);
    float saturation = (textureValue.r + textureValue.g + textureValue.b) / 3.0;
    vec4 textureMapped = blackToColor + (whiteToColor - blackToColor) * saturation;
    gl_FragColor = mix(textureValue, textureMapped, color_amount);
}