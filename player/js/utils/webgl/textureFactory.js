var textureFactory = (function () {
	var texture_count = 0;
	return function(gl) {
		var texture = gl.createTexture();
		//gl.activeTexture(gl['TEXTURE' + texture_count++]);
	    gl.bindTexture(gl.TEXTURE_2D, texture);
	    // Set the parameters so we can render any size image.
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	    return texture;
	}
}())