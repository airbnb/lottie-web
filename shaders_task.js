var fs = require('fs');
var watching_folder = 'player/js/utils/webgl/shaders'

fs.watch(watching_folder, (eventType, filename) => {
	var shaders_string = 'var shaders = {}\n'
	fs.readdir(watching_folder, (err, files) => {
	  files.forEach(file => {
	  	if(file.indexOf('.bkp') === -1) {
		  	var file_content = fs.readFileSync(watching_folder + '/' + file, 'utf8');
		  	shaders_string += 'shaders["' + file.replace(/\./g,'_') + '"] = ';
		  	shaders_string += '"' + file_content.replace(/\/\/.*/g, '').replace(/\r\n/g, '') + '";\n';
	  	}
	  })
	shaders_string += 'function get_shader(name) {\n'
	shaders_string += 'return shaders[name];\n';
	shaders_string += '}\n';
	fs.writeFile("player/js/utils/webgl/shader_provider.js", shaders_string, function(err) {
	    if(err) {
	        return console.log(err);
	    }
	}); 
	})
})