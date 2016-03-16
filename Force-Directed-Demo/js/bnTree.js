/*-----------Create BN Tree-----------*/
function createTree(graph, mode) {
	var root = {};
	root.area = {
		left: 0,
		top: 0,
		width: mode.canvasWidth,
		height: mode.canvasHeight
	};
	root.level = 0;
	root.particles = [];
	// Insert bodies to nodes.
	// Each node represents a region of the two dimensional space.
	// Each body represents a node in graph.
	for(var i=0; i<graph.nodes.length; i++) {
		insertToNode(graph.nodes[i], root, mode);
	}

	// Eliminate empty leaves
	emptyLeaves(root);

	// Compute the center of mass and total mass
	computeMass(root, mode);

	return root;
}

function insertToNode(particle, node, mode) {
	node.particles.push(particle);
		
	if(node.level < mode.level) {
		if(node.particles.length > 2) {
			var child = determineChild(particle, node);
			insertToNode(particle, child, mode);
		}else if(node.particles.length == 2) {					
			// Add four children
			addChildren(node);

			// Odd particle
			var childOld = determineChild(node.particles[0], node);
			childOld.particles.push(node.particles[0]);

			// New particle
			var childNew = determineChild(particle, node);
			insertToNode(particle, childNew, mode);
		}
	}
}

function determineChild(particle, node) {
	var borderV = node.area.left + node.area.width/2;
	var borderH = node.area.top + node.area.height/2;
	if(particle.pos.x < borderV) {
		if(particle.pos.y < borderH) {
			return node.children.nw;
		}else {
			return node.children.sw;
		}
	}else {
		if(particle.pos.y < borderH) {
			return node.children.ne;
		}else {
			return node.children.se;
		}
	}
}

function addChildren(node) {
	node.children = {};

	node.children.nw = {
		level: node.level+1,
		particles: [],
		area: {
			left: node.area.left,
			top: node.area.top,
			width: node.area.width/2,
			height: node.area.height/2
		}
	};
	node.children.ne = {
		level: node.level+1,
		particles: [],
		area: {
			left: node.area.left + node.area.width/2,
			top: node.area.top,
			width: node.area.width/2,
			height: node.area.height/2
		}
	};
	node.children.sw = {
		level: node.level+1,
		particles: [],
		area: {
			left: node.area.left,
			top: node.area.top + node.area.height/2,
			width: node.area.width/2,
			height: node.area.height/2
		}
	};
	node.children.se = {
		level: node.level+1,
		particles: [],
		area: {
			left: node.area.left + node.area.width/2,
			top: node.area.top + node.area.height/2,
			width: node.area.width/2,
			height: node.area.height/2
		}
	};
}

function emptyLeaves(node) {
	if(node.children) {
		for(var index in node.children) {
			if(node.children[index].particles.length == 0) {
				delete node.children[index];
			}else {
				emptyLeaves(node.children[index]);
			}
		}
	}
}

function computeMass(node, mode) {
	var cm = {"x": 0, "y": 0};
	node.cm = {"x": 0, "y": 0};
	if(node.particles.length == 1 || node.level == mode.level) {
		for(var i=0; i<node.particles.length; i++) {
			cm = vectorAdd(cm, node.particles[i].pos);
		}
		cm = vectorDivide(cm, node.particles.length);
		node.cm = cm;
		return cm;
	}else {
		var i = 0;
		for(var index in node.children) {
			var subcm = computeMass(node.children[index], mode);
			cm = vectorAdd(cm, subcm);
			i = i + 1;
		}
		cm = vectorDivide(cm, i);
		node.cm = cm;
		return cm;
	}
}


/*-----------Force Compute-----------*/
function treeForce(particle, node, mode) {
	if(node.particles.length == 1 || node.level == mode.level) {
		for(var i=0; i<node.particles.length; i++) {
			if(node.particles[i].label != particle.label) {
				particle.disp = vectorAdd(particle.disp, treeForceEuqation(particle.pos, node.particles[i].pos, 1, mode.k2));
			}
		}
	}else {
		var S = node.area.width;
		var d = vectorSubstract(particle.pos, node.cm);
		var D = vectorMagnitude(d);
	
		if(S/D < mode.theta) {
			particle.disp = vectorAdd(particle.disp, treeForceEuqation(particle.pos, node.cm, node.particles.length, mode.k2));
		}else {
			for(var index in node.children) {
				treeForce(particle, node.children[index], mode);
			}
		}
	}
}

function treeForceEuqation(pos1, pos2, mass, k2) {
	var distance = vectorSubstract(pos1, pos2);
	var magnitude = vectorMagnitude(distance);
	if (magnitude > 0) {
		var direction = vectorNormalise(distance);
		var repulsiveForce = mass * layoutRepulsionEquation(magnitude, k2);
		var disp = vectorMultiply(direction, repulsiveForce);
		return disp;
	}else if (magnitude == 0) {
		var disp = {"x": Math.random(), "y": Math.random()};
		return disp;
	}		
}