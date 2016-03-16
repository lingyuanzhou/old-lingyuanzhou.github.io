/*-----------FD Basic-----------*/
function fdBasic(graph) {
	var canvas = $("#canvas")[0];
	var k = parseFloat($('#spring').val());
	var k2 = Math.pow(k, 2);

	var times = parseFloat($('#iterations').val());
	var tstart = 0.5 * canvas.width;
	var t = tstart;

	var mode = {
		canvasWidth: canvas.width,
		canvasHeight: canvas.height,
		k: k,
		k2: k2
	};
	
	var i;
	for (i = 0; i < times; i++) {
		repulsionBasic(graph, mode.k2);
		attraction(graph, mode);
		movement(graph, t, mode);
		t = tstart * (1 - (i / times));
	}
}

/*-----------FD Grid-----------*/
function fdGrid(graph) {
	var canvas = $("#canvas")[0];
	var k = parseFloat($('#spring').val());
	var k2 = Math.pow(k, 2);
	var range = parseFloat($('#gridRange').val());

	var times = parseFloat($('#iterations').val());
	var tstart = 0.5 * canvas.width;
	var t = tstart;
	
	var mode = {
		canvasWidth: canvas.width,
		canvasHeight: canvas.height,
		k: k,
		k2: k2,
		gridRange: range
	};

	var i;
	for (i = 0; i < times; i++) {
		repulsionGrid(graph, mode);
		attraction(graph, mode);
		movement(graph, t, mode);
		t = tstart * (1 - (i / times));
	}
}

/*-----------FD Barnes-----------*/
function fdBarnes(graph) {
	var canvas = $("#canvas")[0];
	var k = parseFloat($('#spring').val());
	var k2 = Math.pow(k, 2);
	var theta = parseFloat($('#theta').val());
	var level = parseFloat($('#level').val());

	var times = parseFloat($('#iterations').val());
	var tstart = 0.5 * canvas.width;
	var t = tstart;

	var mode = {
		canvasWidth: canvas.width,
		canvasHeight: canvas.height,
		k: k,
		k2: k2,
		theta: theta,
		level: level
	};

	var i;
	for (i = 0; i < times; i++) {
		repulsionBarnes(graph, mode);
		attraction(graph, mode);
		movement(graph, t, mode);
		t = tstart * (1 - (i / times));
	}
}


/*-----------Force Compute-----------*/
function repulsionBasic(graph, k2) {
	graph.nodes.forEach(function(node) {
		node.disp.x = 0;
		node.disp.y = 0;
	});

	for(var i=0; i<graph.nodes.length; i++) {
		var v = graph.nodes[i];
		var j = i+1;
		for(j; j<graph.nodes.length; j++) {
			var u = graph.nodes[j];
			var distance = vectorSubstract(v.pos, u.pos);
			var distanceValue = vectorMagnitude(distance);
			if(distanceValue > 0) {
				var direction = vectorNormalise(distance);
				var repulsiveForce = layoutRepulsionEquation(distanceValue, k2);
				var movement = vectorMultiply(direction, repulsiveForce);
				v.disp = vectorAdd(v.disp, movement);
				u.disp = vectorSubstract(u.disp, movement);
			}else if(distanceValue == 0) {
				var direction ={
					x: Math.random(),
					y: Math.random()
				};
				v.disp = vectorAdd(v.disp, direction);
				u.disp = vectorSubstract(u.disp, direction);
			}
		}
	}
}

function repulsionGrid(graph, mode) {
	graph.nodes.forEach(function(node) {
		node.disp.x = 0;
		node.disp.y = 0;
	});

	for(var i=0; i<graph.nodes.length; i++) {
		var v = graph.nodes[i];
		var j = i+1;
		for(j; j<graph.nodes.length; j++) {
			var u = graph.nodes[j];
			var distance = vectorSubstract(v.pos, u.pos);
			var distanceValue = vectorMagnitude(distance);
			if(distanceValue < mode.gridRange && distanceValue > 0) {
				var direction = vectorNormalise(distance);
				var repulsiveForce = layoutRepulsionEquation(distanceValue, mode.k2);
				var movement = vectorMultiply(direction, repulsiveForce);
				v.disp = vectorAdd(v.disp, movement);
				u.disp = vectorSubstract(u.disp, movement);
			}else if(distanceValue == 0) {
				var direction ={
					x: Math.random(),
					y: Math.random()
				};
				v.disp = vectorAdd(v.disp, direction);
				u.disp = vectorSubstract(u.disp, direction);
			}
		}
	}
}

function repulsionBarnes(graph, mode) {
	var tree = createTree(graph, mode);

	for(var i=0; i<graph.nodes.length; i++) {
		graph.nodes[i].disp.x = 0;
		graph.nodes[i].disp.y = 0;
		treeForce(graph.nodes[i], tree, mode);
	}
}

function attraction(graph, mode) {
	graph.edges.forEach(function(edge) {
		var distance = vectorSubstract(edge.source.pos, edge.target.pos);
		var direction = vectorNormalise(distance);
		var distanceValue = vectorMagnitude(distance);
		var attractiveForce = layoutAttractionEquation(distanceValue, mode.k);
		var movement = vectorMultiply(direction, attractiveForce);

		edge.source.disp = vectorSubstract(edge.source.disp, movement);
		edge.target.disp = vectorAdd(edge.target.disp, movement);
	});
}

function movement(graph, t, mode) {
	graph.nodes.forEach(function(node) {
		var moveLength = Math.min(vectorMagnitude(node.disp), t);
		var moveDirection = vectorNormalise(node.disp); 
		var movement = vectorMultiply(moveDirection, moveLength);
		node.pos = vectorAdd(node.pos, movement);

		node.pos.x = Math.min((mode.canvasWidth), (Math.max(0, node.pos.x)));
		node.pos.y = Math.min((mode.canvasHeight), (Math.max(0, node.pos.y)));
	});
}


/*-----------Force Equations-----------*/
function layoutRepulsionEquation(x, k2) {
	var fr;
	fr = k2 / x;
	return fr;
}
function layoutAttractionEquation(x, k) {
	var fa = Math.pow(x, 2) / k;
	return fa;
}