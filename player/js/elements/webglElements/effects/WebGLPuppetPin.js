function WPuppetPinEffect(filterManager, elem) {

	// build the grid out of triangles: try 1 / 10
	// define index buffer as pointers to vertices
	// calculate vertices positions on each frame
	//// try warping and mapping texture correctly
	// TODO: look into geometry instancing
	// interpolate on the graphics card
	// 

	// setup network of masses and springs

	var gl = elem.globalData.canvasContext;
    var vsh = get_shader('puppet_pin_shader_vert');
    var fsh = get_shader('puppet_pin_shader_frag');

    var vertexShader = WebGLProgramFactory.createShader(gl, gl.VERTEX_SHADER, vsh);
    var fragmentShader = WebGLProgramFactory.createShader(gl, gl.FRAGMENT_SHADER, fsh);
    this.program = WebGLProgramFactory.createProgram(gl, vertexShader, fragmentShader);

    this.positionAttributeLocation = gl.getAttribLocation(this.program, "a_position");
    gl.enableVertexAttribArray(this.positionAttributeLocation);
    this.texcoordLocation = gl.getAttribLocation(this.program, "a_texCoord");
    gl.enableVertexAttribArray(this.texcoordLocation);
    this.positionBuffer = gl.createBuffer();

    this.filterManager = filterManager;
    this.gl = gl;
    this.elem = elem;

    this.MASSES_PER_ROW = 20;

    this.particles = [];
    var i, j, len = this.MASSES_PER_ROW;
    var restingLength = 1 / (this.MASSES_PER_ROW - 1);
    //restingLength /= 20;
    for(j = 0; j < len ; j += 1) {
        for(i = 0; i < len ; i += 1) {
            var p = new WPuppetPinParticle(i / (len - 1), j / (len - 1), this.particles);
            this.particles.push(p);
            // Connect left and right
            if ( i > 0 ) { p.addSpring(this.particles.length - 2, restingLength) }
            if ( i < len - 1 ) { p.addSpring(this.particles.length, restingLength) }
            // Connect up and down
            if ( j > 0 ) { p.addSpring(this.particles.length - 1 - len, restingLength) }
            if ( j < len - 1 ) { p.addSpring(this.particles.length - 1 + len, restingLength) }
            // Diagonal springs
            var diagonal = Math.SQRT2 * restingLength; 
            if ( i > 0 && j > 0) { p.addSpring(this.particles.length - 2 - len, diagonal) }
            if ( i < len - 1 && j > 0) { p.addSpring(this.particles.length - len, diagonal) }
            if ( i > 0 && j < len - 1) { p.addSpring(this.particles.length - 2 + len, diagonal) }
            if ( i < len - 1 && j < len - 1) { p.addSpring(this.particles.length + len, diagonal) }
        }   
    }
    this.positions = createTypedArray('float32', this.particles.length * 12);
    this.particles[0].fixed = true;
    //this.particles[this.MASSES_PER_ROW - 1].fixed = true;
    //this.particles[this.MASSES_PER_ROW * this.MASSES_PER_ROW - 1].fixed = true;
    //this.particles[this.MASSES_PER_ROW * this.MASSES_PER_ROW - this.MASSES_PER_ROW].fixed = true;

    var texture_positions = [];
    var i, j, len = (this.MASSES_PER_ROW - 1);
    for(j = 0; j < len; j += 1) {
        for(i = 0; i < len; i += 1) {
            /*texture_positions.push(Math.random());
            texture_positions.push(Math.random());
            texture_positions.push(Math.random());
            texture_positions.push(Math.random());
            texture_positions.push(Math.random());
            texture_positions.push(Math.random());
            texture_positions.push(Math.random());
            texture_positions.push(Math.random());
            texture_positions.push(Math.random());
            texture_positions.push(Math.random());
            texture_positions.push(Math.random());
            texture_positions.push(Math.random());*/
            texture_positions.push(i/len);
            texture_positions.push(j/len);
            texture_positions.push((i+1)/len);
            texture_positions.push(j/len);
            texture_positions.push(i/len);
            texture_positions.push((j+1)/len);
            texture_positions.push((i+1)/len);
            texture_positions.push(j/len);
            texture_positions.push((i+1)/len);
            texture_positions.push((j+1)/len);
            texture_positions.push(i/len);
            texture_positions.push((j+1)/len);
        }   
    }
    this.texture_positions = new Float32Array(texture_positions);
    this.textureBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.texture_positions, gl.STATIC_DRAW);
}

function WPuppetPinParticle(x, y, particles) {
    this.startPosition = [x, y];
    this.fixedPosition = [x, y];
    this.position = [x, y];
    this.previous = [x, y];
    
    this.force = [0, 0];
    this.springs = [];
    this.particles = particles;
    this.fixed = false;

    var TIMESTEP = 1800 / 1000;
    this.TIMESTEP_SQ = TIMESTEP * TIMESTEP;
    this.DRAG = TIMESTEP * TIMESTEP;
    var DAMPING = 0.03;
    this.DRAG = 1 - DAMPING;
}

WPuppetPinParticle.prototype.reset = function() {
  this.position[0] = this.previous[0] = this.startPosition[0];
  this.position[1] = this.previous[1] = this.startPosition[1];
};

WPuppetPinParticle.prototype.addSpring = function(target, restingLength) {
  this.springs.push({
    target: target,
    restingLength: restingLength
  });
}

WPuppetPinParticle.prototype.integrate = function(force) {
  if ( this.fixed ) {
    // Direction in which we move
    var newPosition = [this.fixedPosition[0] - this.position[0],
                       this.fixedPosition[1] - this.position[1]];

    // Normalize our step
    var delta = Math.sqrt(newPosition[0] * newPosition[0] +
                          newPosition[1] * newPosition[1]);
    if ( delta < 0.0001 ) {
      return;
    }
    newPosition[0] /= delta;
    newPosition[1] /= delta;

    // Cap step to limit
    var limit = 0.0001 * this.TIMESTEP_SQ;
    delta = Math.min(delta, limit);
    newPosition[0] *= delta;
    newPosition[1] *= delta;

    // Update
    newPosition[0] += this.position[0];
    newPosition[1] += this.position[1];
  } else {
    var newPosition = [this.position[0] - this.previous[0],
                       this.position[1] - this.previous[1]];

    newPosition[0] *= this.DRAG;
    newPosition[1] *= this.DRAG;
    newPosition[0] += this.position[0];
    newPosition[1] += this.position[1];
    newPosition[0] += this.TIMESTEP_SQ * force[0];
    newPosition[1] += this.TIMESTEP_SQ * force[1];
  }

  this.previous[0] = this.position[0];
  this.previous[1] = this.position[1];
  this.position[0] = newPosition[0];
  this.position[1] = newPosition[1];
}

WPuppetPinParticle.prototype.distanceTo = function(other) {
  var deltaX = this.position[0] - other.position[0];
  var deltaY = this.position[1] - other.position[1];
  return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}

WPuppetPinParticle.prototype.resolveForce = function() {
  var F = this.force;
  F[0] = 0;
  F[1] = 0;
  var k = 0.1; // Spring constant
  for(var s = 0; s < this.springs.length; s += 1) {
    var spring = this.springs[s];
    var other = this.particles[spring.target];
    var D = this.distanceTo(other);
    var extension = D - spring.restingLength;
    var force = -k * extension;
    F[0] += force * (this.position[0] - other.position[0]) / D;
    F[1] += force * (this.position[1] - other.position[1]) / D;
  }

  return F;
}

WPuppetPinEffect.prototype.simulationStep = function(){
    // Sweeping across particles, calculate forces
    var i, len = this.particles.length, particles;
    var maxForce = 0;
    for(i = 0; i < len; i += 1) {
        particle = this.particles[i];
        if (!particle.fixed) {
          var F = particle.resolveForce();
          var magnitude = Math.sqrt(F[0] * F[0] + F[1] * F[1]);
          if ( magnitude > maxForce ) {
            maxForce = magnitude;
          }
        }
    }
      
    // Apply forces and update positions
    for(i = 0; i < len; i += 1) {
        particle = this.particles[i];
        //if (!particle.fixed) {
          particle.integrate(particle.force);
        //}
    }

  return maxForce;
}

WPuppetPinEffect.prototype.renderFrame = function(forceRender, buffer){
    console.log('renderFrame')
    var i, len = this.particles.length;
    for(i = 0; i < len; i += 1) {
        //this.particles[i].reset();
    }
    this.particles[0].fixedPosition[0] = global_options.spring_force;
    this.particles[0].fixedPosition[1] = global_options.spring_force;

    var effectElements = this.filterManager.effectElements;
    var gl = this.gl;
    this.gl.useProgram(this.program);

    //POSITION
    var positions = [];
    //var size = 1 / this.MASSES_PER_ROW;

    for(i = 0; i < 1000; i += 1) {
      var maxForce = this.simulationStep();
      if ( maxForce < 0.000001 ) {
        break;
      }
    }

    var len = this.MASSES_PER_ROW;
    var _count = 0;
    var particle,next_x_particle,next_y_particle,next_x_y_particle;
    for(var j = 0; j < len - 1; j += 1) {
        for(i = 0; i < len - 1; i += 1) {
            particle = this.particles[j * len + i];
            next_x_particle = this.particles[j * len + i + 1];
            next_y_particle = this.particles[(j + 1) * len + i];
            next_x_y_particle = this.particles[(j + 1) * len + i + 1];
            
            this.positions[_count++] = particle.position[0];
            this.positions[_count++] = particle.position[1];
            this.positions[_count++] = next_x_particle.position[0];
            this.positions[_count++] = next_x_particle.position[1];
            this.positions[_count++] = next_y_particle.position[0];
            this.positions[_count++] = next_y_particle.position[1];
            this.positions[_count++] = next_x_particle.position[0];
            this.positions[_count++] = next_x_particle.position[1];
            this.positions[_count++] = next_x_y_particle.position[0];
            this.positions[_count++] = next_x_y_particle.position[1];
            this.positions[_count++] = next_y_particle.position[0];
            this.positions[_count++] = next_y_particle.position[1];
        }   
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(this.positionAttributeLocation);
    gl.vertexAttribPointer(this.positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    //TEXTURE
    gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);
    gl.enableVertexAttribArray(this.texcoordLocation);
    gl.vertexAttribPointer(this.texcoordLocation, 2, gl.FLOAT, false, 0, 0);
    //DRAWING
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6 * (this.MASSES_PER_ROW - 1) * (this.MASSES_PER_ROW - 1));
    gl.bindBuffer(gl.ARRAY_BUFFER, this.elem.globalData.positionBuffer);
};
