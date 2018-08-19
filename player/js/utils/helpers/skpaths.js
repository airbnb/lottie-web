var skpaths_factory = (function() {
	var ob = {
		createFromCommands: createFromCommands
	}

	function createFromCommands(cmdArr) {
		var typedArrayFrom2D = floatTypedArrayFrom2D(cmdArr);
		var cmd = typedArrayFrom2D[0];
		var len = typedArrayFrom2D[1];
		var path = Module.FromCmds(cmd, len);
		Module._free(cmd);
		return path;
	}

	function floatTypedArrayFrom2D(arr) {
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

	return ob
}())

function WASMPath(path) {
	this.path = path;
}

WASMPath.prototype = {
	stroke: function(amount, joinType, strokeCap) {
		var path = this.path.stroke(amount, joinType, strokeCap);
		return new WASMPath(path);
	},

	strokeAndReplace: function(amount, joinType, strokeCap) {
		var wasmPath = this.stroke(amount, joinType, strokeCap);
		this.destroy();
		return wasmPath;
	},

	simplify: function(originalPath) {
		var path = this.path.simplify();
		return new WASMPath(path);
	},


	simplifyAndReplace: function() {
		var wasmPath = this.simplify();
		this.destroy();
		return wasmPath;
	},

	op: function(operation, operatingPath) {
		var path = this.path.op(operatingPath.path, operation);
		return new WASMPath(path);
	},

	opAndReplace: function(operation, operatingPath) {
		if(!operatingPath) {
			operatingPath = this;
		}
		var wasmPath = this.op(operation, operatingPath);
		this.destroy();
		operatingPath.destroy();
		return wasmPath;
	},

	destroy: function() {
		if(this.path) {
			this.path.delete();
			this.path = null;
		}
	},

	setFillType: function(fill_type) {
		this.path.setFillType(fill_type);
		return this;
	},

	toCmds: function() {
		if(this.path) {
			return this.path.toCmds();
		}
		return this;
	}
}