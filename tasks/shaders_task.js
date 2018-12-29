var fs = require('fs');
var watching_folder = 'player/js/utils/webgl/shaders'
var templates_folder = 'player/js/utils/webgl/templates'
var strip_comments = false;
var join_lines = false;
var add_shader_name = true;

fs.watch(watching_folder, (eventType, filename) => {
	var shaders_string = 'var shaders = {}\n'
	fs.readdir(watching_folder, (err, files) => {
	  files.forEach(file => {
	  	if(!file.match(/\.vert$/) && !file.match(/\.frag$/)) {
        // Only process .vert and .frag files
        return;
      }
	  	if(file.indexOf('.bkp') === -1) {
		  	var file_content = fs.readFileSync(watching_folder + '/' + file, 'utf8');
		  	shaders_string += 'shaders["' + file.replace(/\./g,'_') + '"] = "';
        if (add_shader_name) {
          shaders_string += '// ' + file + '\\n';
        }
        if (strip_comments) {
          file_content = file_content.replace(/\/\/.*/g, '');
        }
        var line_separator = join_lines ? '' : '\\n';
		  	shaders_string += file_content.replace(/\r\n/g, line_separator).replace(/\n/g, line_separator) + '";\n';
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



fs.watch(templates_folder, (eventType, filename) => {
	var shaders_string = 'var shaders = {}\n'
	fs.readdir(templates_folder, (err, files) => {
	  files.forEach(file => {
	  	if(!file.match(/\.vert$/) && !file.match(/\.frag$/)) {
        // Only process .vert and .frag files
        return;
      }
	  	if(file.indexOf('.bkp') === -1) {
		  	var file_content = fs.readFileSync(watching_folder + '/' + file, 'utf8');
		  	shaders_string += 'shaders["' + file.replace(/\./g,'_') + '"] = "';
        if (add_shader_name) {
          shaders_string += '// ' + file + '\\n';
        }
        if (strip_comments) {
          file_content = file_content.replace(/\/\/.*/g, '');
        }
        var line_separator = join_lines ? '' : '\\n';
		  	shaders_string += file_content.replace(/\r\n/g, line_separator).replace(/\n/g, line_separator) + '";\n';
	  	}
	  })
	shaders_string += 'function get_shader(name) {\n'
	shaders_string += 'return shaders[name];\n';
	shaders_string += '}\n';
	fs.writeFile("player/js/utils/webgl/template_shader_provider.js", shaders_string, function(err) {
	    if(err) {
	        return console.log(err);
	    }
	}); 
	})
})