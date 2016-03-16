/*----------Yifan Hu Multilevel Method---------*/
function fdMulti(graph) {
	var length = graph.nodes.length;
	var spring = parseFloat($('#spring').val());

	var G = new Matrix();
	G.zeros(length, length);
	G.level = 0;
	G.spring = spring;

	var Weight = new Matrix();
	Weight.ones(length, 1);
	
	graph.nodes.forEach(function(node) {
		node.neighbors.forEach(function(neighbor) {
			G.matrix[node.nodeIndex][neighbor.nodeIndex] = 1;
			G.matrix[neighbor.nodeIndex][node.nodeIndex] = 1;
		});
	});

	var tol = 0.01;
	var XVectors = multilevelLayout(G, Weight, tol);
	for(var i=0;i<graph.nodes.length;i++){
		graph.nodes[i].pos.x = XVectors[i].pos.x;
		graph.nodes[i].pos.y = XVectors[i].pos.y;
	}
	
	//renderM(G, XVectors);
}

function multilevelLayout(G, Weight, tol) {	
	var matching = maximalMatching(G, Weight);
	var nextLevelN = G.matrix.length - matching.length;
	var ratio = nextLevelN / G.matrix.length;
	var mode = "EC"; 

	if(ratio > 0.75) {
		var P = mivs(G);
		nextLevelN = P.column;
		ratio = nextLevelN / G.matrix.length;
		mode = "MIVS";
	}
	
	// Coarset Graph Layout
	if(nextLevelN < 2 ) {
		// Initial Layout
		var XVectors = [];
		
		var rnd = new Srand(10);

		var centerX = 730/2;
		var centerY = 730/2;
		var randomRange = G.spring;
	
		for(var i=0; i<G.row; i++) {
			XVectors[i] = {};
			XVectors[i].pos = {};
			XVectors[i].disp = {x: 0, y: 0};			
			
			var x = rnd.randomIn(centerX - randomRange/2, centerX + randomRange/2);
			var y = rnd.randomIn(centerY - randomRange/2, centerY + randomRange/2);

			XVectors[i].pos.x = x;
			XVectors[i].pos.y = y;
		};
		//renderM(G, XVectors);
		forceDirectedAlgorithm(G, XVectors, Weight, tol);
		//renderM(G, XVectors);
		return XVectors;
	}

	switch(mode) {
		case "MIVS":
			var P = mivs(G);
			nextLevelN = P.column;
			P.transpose();
			var nextLevelG = P.multiply(G);
			var nextLevelWeight = P.multiply(Weight);
			P.transpose();
			nextLevelG = nextLevelG.multiply(P);
			nextLevelG.level = G.level + 1;
			for(var k=0; k<nextLevelN; k++) {
				nextLevelG.matrix[k][k] = 0;
			}		
			break;	
		case "EC":
			var PTempory = new Matrix();
			PTempory.zeros(G.matrix.length, G.matrix.length+matching.length);
			var mark = [];
			for(var i=0; i<G.matrix.length; i++) {
				PTempory.matrix[i][i] = 1;
			}
			for(var i=0; i<matching.length; i++) {
				var edge = matching[i];
				PTempory.matrix[edge.s][G.matrix.length+i] = 1;
				PTempory.matrix[edge.t][G.matrix.length+i] = 1;
				mark.push(edge.s);
				mark.push(edge.t);
			}
			PTempory.transpose();

			var P = new Matrix();
			for(var j=0; j<(G.matrix.length+matching.length); j++) {
				if(mark.indexOf(j) == -1) {
					P.matrix.push(PTempory.matrix[j]);
				}
			}

			P.row = nextLevelN;
			P.column = G.row;

			var nextLevelG = P.multiply(G);
			var nextLevelWeight = P.multiply(Weight);
			P.transpose();
			nextLevelG = nextLevelG.multiply(P);
			nextLevelG.level = G.level + 1;
			for(var k=0; k<nextLevelN; k++) {
				nextLevelG.matrix[k][k] = 0;
			}
			break;
	}
	nextLevelG.spring = G.spring * Math.sqrt(7/4);

	// Compute Next Level XVectors (nextLevelX)
	var nextLevelX = multilevelLayout(nextLevelG, nextLevelWeight, tol);

	// Prolongation and Refinement Phase
	// Prolongate to get initial layout
	var XVectors = P.multiplyXV(nextLevelX);
	
	//renderM(G, XVectors);
	forceDirectedAlgorithm(G, XVectors, Weight, tol);
	//renderM(G, XVectors);
	
	return XVectors;
}

function maximalMatching(G, Weight) {
	var matching = [];
	var length = G.matrix.length;
	var mark = {};

	for(var i=0; i<length; i++) {
		var tags = "node" + i;
		if(mark[tags] == null) {
			var vertex = G.matrix[i];
			var index = match(vertex, length, mark, Weight);

			if(index != null) {
				var edge = {s: i, t: index};
				matching.push(edge);
				mark[tags] = i;
				var tagt = "node" + index;
				mark[tagt] = index;
			}
		}
	}

	return matching;
}

function match(vertex, length, mark, Weight) {
	var list = [];
	var w = [];
	for(var i=0; i<length; i++) {
		var value = vertex[i];
		var tag = "node" + i;
		if(value > 0 && mark[tag] == null) {
			list.push(i);
			w.push(Weight.matrix[i][0]);
		}
	}
	var v = Math.min.apply(Math, w);
	var p = w.indexOf(v);
	return list[p];
}

function mivs(G) {
	// Initialization
	var length = G.row;
	var Vc = [];
	var Vu = [];
	var deg = [];

	var queue = [];
	for(var i=0; i<length; i++) {
		var degree = 0;
		for(var j=0; j<length; j++) {
			if(G.matrix[i][j] != 0) {
				degree++;
			}
		}
		Vu[i] = degree;
		deg[i] = 0;
	}

	while(queue.length < length) {
		var value = Math.max.apply(Math, Vu);
		var index = Vu.indexOf(value);
		var vertex = [index, value];
		Vc.push(vertex);
		queue.push(index);

		for(var k=0; k<length; k++) {
			if(G.matrix[index][k] != 0) {
				deg[k] = deg[k] + 1;
				if(Vu[k] != -1) {
					var neighbor = k;
					queue.push(k);
					Vu[k] = -1;
					for(var l=0; l<length; l++) {
						if(G.matrix[k][l] != 0 && Vu[l] != -1) {
							Vu[l] = Vu[l] + 1;
						}
					}
				}
			}
		}
		Vu[index] = -1;
	}
	var P = new Matrix();
	P.zeros(length, Vc.length);
	for(var i=0; i<Vc.length; i++) {
		var indexV = Vc[i][0];
		P.matrix[indexV][i] = 1;
		for(var j=0; j<length; j++) {
			if(G.matrix[indexV][j] != 0) {
				var degreeV = deg[j];
				P.matrix[j][i] = 1 / degreeV;
			}
		}
	}

	return P;
}
/*-----------Adaptive FD------------------*/
function forceDirectedAlgorithm(G, XVectors, Weight, tol) {
	//var converged = false;
	var converged = 0;
	var length = G.row;
	var count = 0;

	var canvas = $("#canvas")[0];
	var k = G.spring;
	var k2 = Math.pow(k, 2);

	var tstart = 0.5 * canvas.width;
	
	if(G.level != 0) {
		var tolG = k*tol;
		var t = k;
		//var ratio = 10;
	}else {
		var tolG = tol*k;
		var t = k;
		//var ratio = 5;
	}
	var ratio = 3 + G.level*3;
	//var ratio = 10;

	//var t = k;

	var mode = {
		canvasWidth: canvas.width,
		canvasHeight: canvas.height,
		k: k,
		k2: k2
	};
	
	/*while(!converged) {
		var tree = createTreeG(XVectors, Weight, mode);
		fdRepulsiveForce(G, XVectors, k2, Weight, tree, mode);
		fdAttractiveForce(G, XVectors, k, Weight);
		var diff = fdMovement(XVectors, t, mode);
		if(count%ratio == 0) {
			renderM(G, XVectors);
		}
		t = 0.9*t;
		count++;
		if(diff<k*tol) {
			converged = true;
		}
	}*/
	//renderM(G, XVectors);
	while(converged != 1) {
		converged = 1;
		//var difference = 0;
		var tree = createTreeG(XVectors, Weight, mode);
		for(var i=0; i<length; i++) {
			fdRepulsiveForceS(i, G, XVectors, k2, Weight, tree, mode);
			//fdRepulsiveForceS(i, G, XVectors, k2, Weight);
			fdAttractiveForceS(i, G, XVectors, k);
			var diff = fdMovementS(i, XVectors, t, mode);

			if(diff>tolG) {
				converged = 0;
			}
			//difference = difference + diff;
		}
		
		if(count%ratio == 0) {
			//renderM(G, XVectors);
		}

		t = 0.9*t;
		count++;
				
	}
	//renderM(G, XVectors);
}

function fdRepulsiveForce(G, XVectors, k2, Weight, tree, mode) {
	XVectors.forEach(function(node) {
		node.disp.x = 0;
		node.disp.y = 0;
		//treeForceG(node, tree, mode);
	});

	var rnd = new Srand(20);
	var spring = Math.sqrt(k2, 2);
	
	for(var i=0; i<XVectors.length; i++) {
		var v = XVectors[i];
		//var j = i+1;
		for(var j=0; j<XVectors.length; j++) {
			if(i != j) {
				var u = XVectors[j];
				var distance = vectorSubstract(v.pos, u.pos);
				var distanceValue = vectorMagnitude(distance);
				if(distanceValue > 0) {
				//if(distanceValue > 0 && distanceValue < R) {
					var direction = vectorNormalise(distance); 
					var repulsiveForce = layoutRepulsionEquation(distanceValue, k2);
					//repulsiveForce = 0.2*repulsiveForce * Weight.matrix[i][0] * Weight.matrix[j][0];
					repulsiveForce = 0.2*repulsiveForce * Weight.matrix[i][0] * Weight.matrix[j][0];
					//repulsiveForce = 0.2 * repulsiveForce * Weight.matrix[i][0];
					var movement = vectorMultiply(direction, repulsiveForce);
					v.disp = vectorAdd(v.disp, movement);
					//u.disp = vectorSubstract(u.disp, movement);
				}else if(distanceValue == 0) {
					var direction ={
						x: rnd.randomIn(0, 0.001*spring),
						y: rnd.randomIn(0, 0.001*spring)
						//x: rnd.randomIn(0, 1),
						//y: rnd.randomIn(0, 1)
					};
					//var movement = vectorMultiply(direction, 0.001*spring);
					//v.pos = vectorAdd(v.pos, movement);
					v.disp = vectorAdd(v.disp, direction);
					//u.disp = vectorSubstract(u.disp, direction);
				}
			}
		}
	}
}
function fdAttractiveForce(G, XVectors, k, Weight) {
	var length = G.matrix.length;

	for(var i=0; i<length; i++) {
		var j = i + 1;
		for(j; j<length; j++) {
			if(G.matrix[i][j] != 0) {
				var source = XVectors[i];
				var target = XVectors[j];

				var distance = vectorSubstract(source.pos, target.pos);
				var direction = vectorNormalise(distance);
				var distanceValue = vectorMagnitude(distance);
				var attractiveForce = layoutAttractionEquation(distanceValue, k);
				//attractiveForce = attractiveForce * Weight.matrix[i][0];
				var movement = vectorMultiply(direction, attractiveForce);

				source.disp = vectorSubstract(source.disp, movement);
				target.disp = vectorAdd(target.disp, movement);
			}
		}
	}
}

function fdMovement(XVectors, t, mode) {
	var difference = 0;
	for(var i=0; i<XVectors.length; i++) {
		var node = XVectors[i];
		var moveLength = Math.min(vectorMagnitude(node.disp), t);
		var moveDirection = vectorNormalise(node.disp); 
		var movement = vectorMultiply(moveDirection, moveLength);

		var originalX = node.pos.x;
		var originalY = node.pos.y;

		node.pos = vectorAdd(node.pos, movement);

		node.pos.x = Math.min((mode.canvasWidth), (Math.max(0, node.pos.x)));
		node.pos.y = Math.min((mode.canvasHeight), (Math.max(0, node.pos.y)));

		var length = Math.pow((originalX - node.pos.x), 2) + Math.pow((originalY - node.pos.y), 2);
		length = Math.sqrt(length, 2);
		difference = difference + length;
	}
	return difference;
}

function fdRepulsiveForceS(index, G, XVectors, k2, Weight, tree, mode) {
	XVectors[index].disp.x = 0;
	XVectors[index].disp.y = 0;

	/*var rnd = new Srand(10);
	var spring = Math.sqrt(k2, 2);
	
	for(var i=0; i<XVectors.length; i++) {
		if(i != index) {
			var v = XVectors[index];
			var u = XVectors[i];
			var distance = vectorSubstract(v.pos, u.pos);
			var distanceValue = vectorMagnitude(distance);
			if(distanceValue > 0) {
			//if(distanceValue > 0 && distanceValue < R) {
				var direction = vectorNormalise(distance);
				var repulsiveForce = layoutRepulsionEquation(distanceValue, k2);
				repulsiveForce = 0.2 * repulsiveForce * Weight.matrix[index][0] * Weight.matrix[i][0];
				//repulsiveForce = 0.2 * repulsiveForce * Weight.matrix[index][0];
				var movement = vectorMultiply(direction, repulsiveForce);
				v.disp = vectorAdd(v.disp, movement);
			}else if(distanceValue == 0) {
				var direction = {
					x: rnd.randomIn(0, 0.001*spring),
					y: rnd.randomIn(0, 0.001*spring)
					//x: Math.random()*0.001*spring,
					//y: Math.random()*0.001*spring
				};
				v.disp = vectorAdd(v.disp, direction);
			}
		}
	}*/
	treeForceG(XVectors[index], tree, mode);
}
function fdAttractiveForceS(index, G, XVectors, k) {
	var length = G.column;

	for(var i=0; i<length; i++) {
		if(i != index) {
			if(G.matrix[index][i] != 0) {
				var source = XVectors[index];
				var target = XVectors[i];

				var distance = vectorSubstract(source.pos, target.pos);
				var direction = vectorNormalise(distance);
				var distanceValue = vectorMagnitude(distance);
				var attractiveForce = layoutAttractionEquation(distanceValue, k);
				var movement = vectorMultiply(direction, attractiveForce);

				source.disp = vectorSubstract(source.disp, movement);
			}
		}
	}
}

function fdMovementS(index, XVectors, t, mode) {
	var difference = 0;

	var node = XVectors[index];
	var moveLength = Math.min(vectorMagnitude(node.disp), t);
	var moveDirection = vectorNormalise(node.disp); 
	var movement = vectorMultiply(moveDirection, moveLength);

	var originalX = node.pos.x;
	var originalY = node.pos.y;

	node.pos = vectorAdd(node.pos, movement);

	node.pos.x = Math.min((mode.canvasWidth), (Math.max(0, node.pos.x)));
	node.pos.y = Math.min((mode.canvasHeight), (Math.max(0, node.pos.y)));

	var length = Math.pow((originalX - node.pos.x), 2) + Math.pow((originalY - node.pos.y), 2);
	length = Math.sqrt(length, 2);
	difference = difference + length;

	return difference;
}
