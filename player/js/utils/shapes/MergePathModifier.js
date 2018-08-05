function MergePathModifier(){
}
extendPrototype([ShapeModifier], MergePathModifier);

MergePathModifier.prototype.initModifierProperties = function(elem, data) {
    this.styles = [];
    this.caches = [];
    this.lStr = '';
    var shapeProperty = ShapePropertyFactory.getShapeProp(this,{ks:{a:0,k:{v:[[0,0]],i:[[0,0]],o:[[0,0]],c:true}}},4);
    this.sh = shapeProperty;
    this.merge_mode = data.mm;
    //this.transformers = transformers;
    //this.lvl = level;

	switch(data.mm) {
		case 2:
			this.mode = Module.PathOp.UNION;
			break;
		case 3:
			this.mode = Module.PathOp.DIFFERENCE;
			//merge_mode = Module.PathOp.REVERSE_DIFFERENCE;
			break;
		case 4:
			this.mode = Module.PathOp.INTERSECT;
			break;
		case 5:
			this.mode = Module.PathOp.XOR;
			break;
		default:
			this.mode = 'none';
	}
    this.getValue = this.processKeys;
};

MergePathModifier.prototype.setTransformData = function(transformers, level) {
	this.transformers = transformers;
	this.level = level;
}

MergePathModifier.prototype.setAsAnimated = function() {
    this._isAnimated = true;
}

MergePathModifier.prototype.transformPoint = function(point, transformers, level) {
	var matrix;

    var iterations = level - this.level;
    var k = transformers.length-1;

    while(iterations) {
		matrix = transformers[k].mProps.v;
		point = matrix.applyToPointArray(point[0], point[1], 0);
        iterations --;
        k --;
    }
	return point;
}

MergePathModifier.prototype.addPathToCommands = function(path, transformers, level, commands) {
	var i, len = path._length;
	var pt1, pt2, pt3;
	pt1 = this.transformPoint(path.v[0], transformers, level);
	commands.push([Module.MOVE_VERB, pt1[0], pt1[1]]);
	for(i = 0; i < len - 1; i += 1) {
		pt1 = this.transformPoint(path.o[i], transformers, level);
		pt2 = this.transformPoint(path.i[i + 1], transformers, level);
		pt3 = this.transformPoint(path.v[i + 1], transformers, level);
		commands.push([Module.CUBIC_VERB, pt1[0], pt1[1], pt2[0], pt2[1], pt3[0], pt3[1]]);
	}
	if(path.c) {
		pt1 = this.transformPoint(path.o[len - 1], transformers, level);
		pt2 = this.transformPoint(path.i[0], transformers, level);
		pt3 = this.transformPoint(path.v[0], transformers, level);
		commands.push([Module.CUBIC_VERB, pt1[0], pt1[1], pt2[0], pt2[1], pt3[0], pt3[1]]);
		commands.push([Module.CLOSE_VERB]);
	}
}

// _PAPER_FUNCTION
MergePathModifier.prototype.addPathToCommands_PAPER_FUNCTION = function(path, transformers, level, paper_path) {
	var i, len = path._length;
	var pt1, pt2, pt3;
	var segment;
	for(i = 0; i < len; i += 1) {
		pt1 = this.transformPoint(path.v[i], transformers, level);
		pt2 = this.transformPoint(path.i[i], transformers, level);
		pt3 = this.transformPoint(path.o[i], transformers, level);
		segment = new paper.Segment(new paper.Point(pt1[0],pt1[1])
			, new paper.Point(pt2[0] - pt1[0], pt2[1] - pt1[1])
			, new paper.Point(pt3[0] - pt1[0], pt3[1] - pt1[1]))
		paper_path.add(segment);
	}
	if(path.c) {
		paper_path.closed = true;
	}
	return paper_path
}

MergePathModifier.prototype.floatTypedArrayFrom2D = function(arr) {
	// expects 2d array where index 0 is verb and index 1-n are args
	var len = 0, cmd, c, ii, jj;
	for (ii = 0; ii < arr.length; ii += 1) {
	  len += arr[ii].length;
	}

	var ta = new Float32Array(len);
	var i = 0;
	for (ii = 0; ii < arr.length; ii += 1) {
	  for (jj = 0; jj < arr[ii].length; jj += 1) {
	    ta[i] = arr[ii][jj];
	    i++;
	  }
	}

	var retVal = Module._malloc(ta.length * ta.BYTES_PER_ELEMENT);
	Module.HEAPF32.set(ta, retVal / ta.BYTES_PER_ELEMENT);
	return [retVal, len];
}

MergePathModifier.prototype.SkPathFromCmdTyped = function(cmdArr) {
	var typedArrayFrom2D = this.floatTypedArrayFrom2D(cmdArr);
	var cmd = typedArrayFrom2D[0];
	var len = typedArrayFrom2D[1];
	var path = Module.FromCmds(cmd, len);
	Module._free(cmd);
	return path;
}

MergePathModifier.prototype.addShapeToCommands = function(shape, transformers, level, commands) {
	var i, len = shape.paths._length;
	for(i = 0; i < len; i += 1) {
		this.addPathToCommands(shape.paths.shapes[i], transformers, level, commands);
	}
}

// _PAPER_FUNCTION
MergePathModifier.prototype.addShapeToCommands_PAPER_FUNCTION = function(shape, transformers, level) {
	var paper_path = new paper.Path();
	var i, len = shape.paths._length;
	for(i = 0; i < len; i += 1) {
		this.addPathToCommands_PAPER_FUNCTION(shape.paths.shapes[i], transformers, level, paper_path);
	}
	return paper_path;
}

MergePathModifier.prototype.getPath = function(shapes) {
	var commands = [];
	var i = 0, len = shapes.length;
	var builder = new Module.SkOpBuilder();
	var skPath;
	var current_shape_merge_mode;
	var merge_mode = this.mode;
	var isFirstShape = false;
	var shapeData, shape;
	for(i = len - 1; i >= 0; i -= 1) {
		shapeData = shapes[i];
		shape = shapeData.shape;
		this.addShapeToCommands(shape, shapeData.data.transformers, shapeData.data.lvl, commands);
		if(merge_mode !== 'none') {
			if(!isFirstShape && (merge_mode === Module.PathOp.DIFFERENCE || merge_mode === Module.PathOp.REVERSE_DIFFERENCE || merge_mode === Module.PathOp.INTERSECT)) {
				current_shape_merge_mode = Module.PathOp.UNION;
			} else {
				current_shape_merge_mode = merge_mode;
			}
			if(commands.length) {
				isFirstShape = true;
				skPath = this.SkPathFromCmdTyped(commands);
				builder.add(skPath, current_shape_merge_mode);
				skPath.delete();
				commands.length = 0;
			}
		}
        shape.paths = shapeData.localShapeCollection;
	}
	if(merge_mode === 'none') {
    	skPath = this.SkPathFromCmdTyped(commands);
	} else {
    	skPath = builder.resolve();
    	builder.delete();
	}
  	commands = skPath.toCmds();
	skPath.delete();
	return commands;
}

MergePathModifier.prototype.PathToCommands = function(path, commands) {
	var segments = path.segments;
	if(!segments.length) {
		return;
	}
	var i, len = segments.length;
	var pt1, pt2, pt3, prev_pt;
	pt1 = segments[0].point;
	commands.push([0,pt1.x, pt1.y]);
	for(i = 1; i < len; i += 1) {
		prev_pt = segments[i - 1].point;
		pt1 = segments[i - 1].handleOut;
		pt2 = segments[i].handleIn;
		pt3 = segments[i].point;
		commands.push([4,prev_pt.x + pt1.x, prev_pt.y + pt1.y,pt3.x + pt2.x, pt3.y + pt2.y,pt3.x, pt3.y]);
	}
	prev_pt = segments[len - 1].point;
	pt1 = segments[len - 1].handleOut;
	pt2 = segments[0].handleIn;
	pt3 = segments[0].point;
	commands.push([4,prev_pt.x + pt1.x, prev_pt.y + pt1.y,pt3.x + pt2.x, pt3.y + pt2.y,pt3.x, pt3.y]);
	commands.push([5]);
}

MergePathModifier.prototype.toCmds = function(path) {
	var commands = [];
	if(path.children) {
		var i, len = path.children.length;
		for(i = 0; i < len; i += 1) {
			this.PathToCommands(path.children[i], commands);
		}
	} else {
		this.PathToCommands(path, commands);
	}
	return commands;
	//console.log(commands)
}

// _PAPER_FUNCTION
MergePathModifier.prototype.getPath_PAPER_FUNCTION = function(shapes) {
	var paper_path = [];
	var i = 0, len = shapes.length;
	var skPath;
	var current_shape_merge_mode;
	var merge_mode = this.mode;
	var isFirstShape = false;
	var prev_path;
	for(i = len - 1; i >= 0; i -= 1) {
		shapeData = shapes[i];
		shape = shapeData.shape;
		paper_path = this.addShapeToCommands_PAPER_FUNCTION(shape, shapeData.data.transformers, shapeData.data.lvl);
		if(prev_path) {
			if(this.merge_mode === 2) {
				prev_path = prev_path.unite(paper_path);
			} else {
				prev_path = prev_path.intersect(paper_path);
			}
		} else if(paper_path.segments.length) {
			prev_path = paper_path;
		}
        shape.paths = shapeData.localShapeCollection;
	}
	return this.toCmds(prev_path);
}

MergePathModifier.prototype.processShapes = function(_isFirstFrame) {
	paper.project.activeLayer.removeChildren();
	var commands = [];
	var i = 0, len = this.shapes.length;
	var shapeData, shape, skPath;

	var hasNewShapes = false;
	while(i < len) {
		if(this.shapes[i].shape._mdf) {
			hasNewShapes = true;
			break;
		}
		i += 1;
	}

	if(!hasNewShapes && !_isFirstFrame) {
		this.sh._mdf = false;
		for(i = 0; i < len; i += 1) {
			shapeData = this.shapes[i];
        	shapeData.shape.paths = shapeData.localShapeCollection;
		}
	} else {
		if(window.global_properties.use_paper_library) {
			commands = this.getPath_PAPER_FUNCTION(this.shapes);
		} else {
			commands = this.getPath(this.shapes);
		}
		var shapeData = this.sh;
		var localShapeCollection = shapeData.localShapeCollection;
		localShapeCollection = this.createPathFromCommands(commands, localShapeCollection);
	  	shapeData._mdf = true;
	    shapeData.paths = shapeData.localShapeCollection;
	}
}


MergePathModifier.prototype.createPathFromCommands = function(commands, localShapeCollection) {

	var i, len;
	var shapeData = this.sh;
	var localShapeCollection = shapeData.localShapeCollection;
    localShapeCollection.releaseShapes();
  	var i, len = commands.length;
  	var new_path;
  	var node_index = 0;
	var hasClosedPath = false;
	var command, prev_command;
  	for(i = 0; i < len; i += 1) {
  		command = commands[i];
  		if(command[0] === 0) {
  			if(new_path) {
  				if(!hasClosedPath) {
  					prev_command = commands[i - 1];
					new_path.setXYAt(prev_command[prev_command.length - 2], prev_command[prev_command.length - 1], 'o', new_path._length - 1, false);
  				}
  				localShapeCollection.addShape(new_path);
  			}
			hasClosedPath = false;
  			node_index = 0;
			new_path = shape_pool.newElement();
			new_path.setXYAt(command[1], command[2], 'v', node_index, false);
			new_path.setXYAt(command[1], command[2], 'i', node_index, false);
			node_index += 1;
  		} else if(command[0] === 1) {
			prev_command = commands[i - 1];
			new_path.setXYAt(command[1], command[2], 'v', node_index, false);
			new_path.setXYAt(prev_command[prev_command.length - 2], prev_command[prev_command.length - 1], 'o',node_index - 1, false);
			new_path.setXYAt(command[1], command[2], 'i', node_index, false);
			node_index += 1;
  		} else if(command[0] === 4) {
			new_path.setXYAt(command[5], command[6], 'v', node_index, false);
			new_path.setXYAt(command[1], command[2], 'o', node_index - 1, false);
			new_path.setXYAt(command[3], command[4], 'i', node_index, false);
			node_index += 1;
  		} else if(command[0] === 5) {
			prev_command = commands[i - 1];
			new_path.c = true;
			new_path.setXYAt(prev_command[prev_command.length - 2], prev_command[prev_command.length - 1], 'o', node_index - 1, false);
			node_index += 1;
			hasClosedPath = true;
  		}
  	}
	if(new_path) {
		if(!hasClosedPath) {
			prev_command = commands[i - 1];
			new_path.setXYAt(prev_command[prev_command.length - 2], prev_command[prev_command.length - 1], 'o', new_path._length - 1, false);
		}
		localShapeCollection.addShape(new_path);
	}
	return localShapeCollection;
}


ShapeModifiers.registerModifier('mm', MergePathModifier);