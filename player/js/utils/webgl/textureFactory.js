var textureFactory = (function () {
	var texture_count = 0;
	return function(glContext) {
		var texture = glContext.createTexture();
		//gl.activeTexture(gl['TEXTURE' + texture_count++]);
	    glContext.bindTexture(glContext.TEXTURE_2D, texture);
	    // Set the parameters so we can render any size image.
	    glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_WRAP_S, glContext.CLAMP_TO_EDGE);
	    glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_WRAP_T, glContext.CLAMP_TO_EDGE);
	    glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_MIN_FILTER, glContext.LINEAR);
	    glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_MAG_FILTER, glContext.LINEAR);
	    return texture;
	}
}())