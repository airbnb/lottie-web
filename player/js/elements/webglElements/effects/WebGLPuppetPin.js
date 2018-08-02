function WPuppetPinEffect(filterManager, elem) {

	// build the grid out of triangles: try 1 / 10
	// define index buffer as pointers to vertices
	// calculate vertices positions on each frame
	//// try warping and mapping texture correctly
	// TODO: look into geometry instancing
	// interpolate on the graphics card
	// TODO: look for  ARAP ("as rigid as possible") deformation algorithms

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

    this.MASSES_PER_ROW = 10;

    // Define the mass-spring network
    this.particles = [];
    var i, j, len = this.MASSES_PER_ROW;
    var restingLength = 1 / (this.MASSES_PER_ROW - 1); // Spacing between masses
    //restingLength *= 0.9;
    for(j = 0; j < len ; j += 1) {
        for(i = 0; i < len ; i += 1) {
            // Creating a a mass at a given location, not connecting yet
            var p = new WPuppetPinParticle(i / (len - 1), j / (len - 1), this.particles);
            this.particles.push(p);

            // Create connections to neighbours (above, below, left & right and diagonals)
            // 8 springs in total. Provide their resting length on creation
            // TODO we are assuming all springs have the same spring constant. Should try
            // to give diagonal spring a different spring constant to adjust how material
            // behaves
         
            // Connect left and right
            if ( i > 0 ) { p.addSpring(this.particles.length - 2, restingLength) }
            if ( i < len - 1 ) { p.addSpring(this.particles.length, restingLength) }
            // Connect up and down
            if ( j > 0 ) { p.addSpring(this.particles.length - 1 - len, restingLength) }
            if ( j < len - 1 ) { p.addSpring(this.particles.length - 1 + len, restingLength) }

            // Diagonal springs (sqrt2 assumes square network)
            var diagonal = Math.SQRT2 * restingLength; 
            if ( i > 0 && j > 0) { p.addSpring(this.particles.length - 2 - len, diagonal) }
            if ( i < len - 1 && j > 0) { p.addSpring(this.particles.length - len, diagonal) }
            if ( i > 0 && j < len - 1) { p.addSpring(this.particles.length - 2 + len, diagonal) }
            if ( i < len - 1 && j < len - 1) { p.addSpring(this.particles.length + len, diagonal) }

            // Possible to add more springs to simulate other forces, e.g. shearing forces
            // E.g. connect a mass to a mass two rows below/across
        }   
    }

    // Create array to hold vertices.
    // One square per segment, 2 triangles per square, 3 2D vertices per triangle
    var n = (len - 1) * (len - 1); 
    this.positions = createTypedArray('float32', n * 12);
    
    // To add constraints we fix certain masses so that forces do not move them
    this.particles[1 * this.MASSES_PER_ROW + 1].fixed = true;
    //this.particles[this.MASSES_PER_ROW - 1].fixed = true;
    //this.particles[this.MASSES_PER_ROW * this.MASSES_PER_ROW - 1].fixed = true;
    this.particles[this.MASSES_PER_ROW * this.MASSES_PER_ROW - this.MASSES_PER_ROW - 1 - 1 * this.MASSES_PER_ROW].fixed = true;

    // Map texture coordinates to the masses. This has the same number of elements as the positions array
    // but does not update based on the particles
    var texture_positions = [];
    var i, j, len = (this.MASSES_PER_ROW - 1);
    for(j = 0; j < len; j += 1) {
        for(i = 0; i < len; i += 1) {
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

// Model for a particle
function WPuppetPinParticle(x, y, particles) {
    this.startPosition = [x, y]; // Stored to enable reseting the particle
    this.fixedPosition = [x, y]; // If fixed, desired location of particle
    this.position = [x, y]; // Current position
    this.previous = [x, y]; // Previous position, used for Verlet integration
    
    this.force = [0, 0]; // Used to store sum of all forces on particle
    this.springs = []; // list of springs, defined as: indices to other particles, and resting length
    this.particles = particles;
    this.fixed = false; // When a particle is fixed, forces do not move but it slowly moves towards fixedPosition

    // Variables for physics simulation
    var TIMESTEP = 1800 / 1000;
    this.TIMESTEP_SQ = TIMESTEP * TIMESTEP; // A smaller timestep will be more accurate but run slower
    var DAMPING = 0.03; // Damping factor allows simulation to settle down, removing oscillations
    this.DRAG = 1 - DAMPING; // Drag force slows down particle, acting as friction
}

// Reset moves particle back to starting point
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
    // When we are fixed, just move particle towards its fixedPosition, ignoring all force
    // We need to do this in gradual steps to avoid tearing apart the network
    // Analogy is we want to walk towards a wall in fixed steps
    
    // Direction in which we move as a vector from position to fixedPosition
    var newPosition = [this.fixedPosition[0] - this.position[0],
                       this.fixedPosition[1] - this.position[1]];

    // Get distance from position to fixedPosition
    var delta = Math.sqrt(newPosition[0] * newPosition[0] +
                          newPosition[1] * newPosition[1]);
    if ( delta < 0.0001 ) {
      // If we are close to the fixed position, exit early indicating we didn't move
      return 0;
    }
  
    // Normalize our direction
    newPosition[0] /= delta;
    newPosition[1] /= delta;

    // Set the length of direction to a limit (or delta if it is smaller)
    var limit = 0.0001 * this.TIMESTEP_SQ;
    delta = Math.min(delta, limit);
    newPosition[0] *= delta;
    newPosition[1] *= delta;

    // Get our new position by adding step to our old position
    newPosition[0] += this.position[0];
    newPosition[1] += this.position[1];
  } else {
    // Perform Verlet integration
    // https://en.wikipedia.org/wiki/Verlet_integration
    var newPosition = [this.position[0] - this.previous[0],
                       this.position[1] - this.previous[1]];

    // Drag parameter slows us down
    newPosition[0] *= this.DRAG;
    newPosition[1] *= this.DRAG;
    newPosition[0] += this.position[0];
    newPosition[1] += this.position[1];

    // Sum of all forces on particle changes our position
    // This part assumes the particle has mass of 1
    newPosition[0] += this.TIMESTEP_SQ * force[0];
    newPosition[1] += this.TIMESTEP_SQ * force[1];
  }

  // Save off the current position for next frame in previous
  this.previous[0] = this.position[0];
  this.previous[1] = this.position[1];

  // Update our position to our newPosition
  this.position[0] = newPosition[0];
  this.position[1] = newPosition[1];

  // Return the distance moved to enable to detect when network is stationary
  var deltaX = this.position[0] - this.previous[0];
  var deltaY = this.position[1] - this.previous[1];
  return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}

WPuppetPinParticle.prototype.distanceTo = function(other) {
  var deltaX = this.position[0] - other.position[0];
  var deltaY = this.position[1] - other.position[1];
  return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}

// Calculates the total force on a particle due to all connected springs
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
    for(i = 0; i < len; i += 1) {
        particle = this.particles[i];
        if (!particle.fixed) {
          particle.resolveForce();
        }
    }
      
    var maxDistance = 0;
    // Apply forces and update positions
    for(i = 0; i < len; i += 1) {
        particle = this.particles[i];
        var d = particle.integrate(particle.force);

        // Keep track of the maximum distance moved by any particle
        if ( d > maxDistance ) {
          maxDistance = d;
        }
    }

  return maxDistance;
}

WPuppetPinEffect.prototype.renderFrame = function(forceRender, buffer){
    // Reset the state of the particles first so network has no "memory"
    var i, len = this.particles.length;
    for(i = 0; i < len; i += 1) {
        this.particles[i].reset();
    }

    // Update one of the constraints for testing
    this.particles[1 * this.MASSES_PER_ROW + 1].fixedPosition[0] = global_options.spring_force;
    this.particles[1 * this.MASSES_PER_ROW + 1].fixedPosition[1] = global_options.spring_force;

    var effectElements = this.filterManager.effectElements;
    var gl = this.gl;
    this.gl.useProgram(this.program);

    //POSITION
    var positions = [];
    //var size = 1 / this.MASSES_PER_ROW;

    // Now that we have all constraints in place we run network until we find a solution
    for(i = 0; i < 10000; i += 1) {
      var maxDistance = this.simulationStep();
      if ( maxDistance < 0.000001 ) {
        break;
      }
    }
    // TODO handle case we don't find solution

    // Map vertices from the particles
    // TODO investigate using an indexed geometry, which in effect would
    // allow us to directly upload the particles array
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
