function OffsetPathModifier(){
}
extendPrototype([ShapeModifier], OffsetPathModifier);

OffsetPathModifier.prototype.initModifierProperties = function(elem, data) {
    this.amount = PropertyFactory.getProp(elem, data.a, 0, null, this);
    this.lineJoin = data.lj;
    this.getValue = this.processKeys;
};

OffsetPathModifier.prototype.addPathToCommands = function(path, transformers, level, commands) {
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

OffsetPathModifier.prototype.transformPoint = function(point, transformers, level) {
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

OffsetPathModifier.prototype.addShapeToCommands = function(shape, transformers, level, commands) {
	var i, len = shape.paths._length;
	for(i = 0; i < len; i += 1) {
		this.addPathToCommands(shape.paths.shapes[i], transformers, level, commands);
	}
}

OffsetPathModifier.prototype.removeInnerShape = function(commands) {
	var i = 0, len = commands.length;
	while(false && i < len) {
		if(commands[i][0] === 5) {
			commands.length = i + 1;
			break;
		}
		i += 1;
	}
	return commands;
}

OffsetPathModifier.prototype.processShapes = function(_isFirstFrame) {
    var shapePaths;
    var i, len = this.shapes.length;
    var amount = this.amount.v;
    if(amount === 0){
		return;
    }
	var commands = [];
	var skPath, offsettedSkPath;

	for(i = 0; i < len; i += 1) {
		shapeData = this.shapes[i];
		if(!(!shapeData.shape._mdf && !this._mdf && !_isFirstFrame)){
			shape = shapeData.shape;
			commands.length = 0;
			this.addShapeToCommands(shape, shapeData.data.transformers, shapeData.data.lvl, commands);

			skPath = skpaths_factory.createFromCommands(commands);
			if(amount < 0) {
				skPath = skPath.op(skPath, Module.PathOp.UNION);
				// skPath = skpaths_factory.replaceFromBooleanOperation(skPath, skPath, Module.PathOp.UNION);
			}
			var joinType, strokeCap;
			switch(this.lineJoin) {
				case 2:
				joinType = Module.StrokeJoin.ROUND;
				strokeCap = Module.StrokeCap.ROUND;
				break;
				default: 
				joinType = Module.StrokeJoin.MITER;
				strokeCap = Module.StrokeCap.BUTT;
				break;
			}
			if(commands[commands.length - 1][0] === 5) {
				var clonedSkPath = skpaths_factory.createFromCommands(skPath.toCmds());
				skPath = skPath.stroke({width: Math.abs(amount) * 2, join: joinType, cap: strokeCap});
				let operation = amount < 0 ? Module.PathOp.REVERSE_DIFFERENCE : Module.PathOp.UNION;
				skPath = skPath
					.op(clonedSkPath, operation)
					.simplify();
				clonedSkPath.delete();
			} else {
				skPath = skPath
				.stroke({width: Math.abs(amount) * 2, join: joinType, cap: strokeCap})
				// .op(Module.PathOp.UNION)
				skPath.setFillType(Module.FillType.EVENODD);
				skPath = skPath.simplify();
			}
		  	commands = skPath.toCmds();
			skPath.delete();
		  	// commands.length = 44;
			//skPath.destroy();
	        localShapeCollection = shapeData.localShapeCollection;
	        localShapeCollection.releaseShapes();
	        localShapeCollection = this.createPathFromCommands(commands, localShapeCollection);
	        shapeData.shape._mdf = true;
		}
        shapeData.shape.paths = shapeData.localShapeCollection;
	}

    if(!this.dynamicProperties.length){
        this._mdf = false;
    }
};

OffsetPathModifier.prototype.createPathFromCommands = function(commands, localShapeCollection) {

	var i, len;
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
  		} else if(command[0] === 2) {
			prev_command = commands[i - 1];
			new_path.setXYAt(command[3], command[4], 'v', node_index, false);
			var cp1_x = prev_command[prev_command.length - 2] + 2 / 3 * (command[1] - prev_command[prev_command.length - 2])
			var cp1_y = prev_command[prev_command.length - 1] + 2 / 3 * (command[2] - prev_command[prev_command.length - 1])
			var cp2_x = command[3] + 2 / 3 * (command[1] - command[3])
			var cp2_y = command[4] + 2 / 3 * (command[2] - command[4])

			new_path.setXYAt(cp1_x, cp1_y, 'o',node_index - 1, false);
			new_path.setXYAt(cp2_x, cp2_y, 'i', node_index, false);
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

ShapeModifiers.registerModifier('op', OffsetPathModifier);