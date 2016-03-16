/*----------Yifan Hu Multilevel Method---------*/
function fdMultilevel(graph) {
	var length = graph.nodes.length;
	var G = math.zeros(length, length);
	
	graph.nodes.forEach(function(node) {
		node.neighbors.forEach(function(neighbor) {
			G.subset(math.index(node.nodeIndex, neighbor.nodeIndex), 1);
		});
	});

	var tol = 0.01;
	var X = multilevelLayout(G, tol);

	for(var i=0; i<length; i++) {
		graph.nodes[i].pos.x = X.subset(math.index(i, 0));
		graph.nodes[i].pos.y = X.subset(math.index(i, 1));
	}
}

function multilevelLayout(G, tol) {
	var matching = maximalMatching(G);
	var nextLevelN = matching.GLength - matching.length;
	var ratio = nextLevelN / matching.GLength;
	
	// Coarset Graph Layout
	if(nextLevelN < 2 || ratio>0.75) {
		// Initial Layout
		var XVectors = math.zeros(matching.GLength, 2);
		var rnd = new Srand(10);

		for(var i=0; i<matching.GLength; i++) {
			var x = rnd.randomIn(0, 730);
			var y = rnd.randomIn(0, 730);
			XVectors.subset(math.index(i, 0), x);
			XVectors.subset(math.index(i, 1), y);
		};

		XVectors = forceDirectedAlgorithm(G, XVectors, tol);

		return XVectors;
	}

	// Coarsening Phase
	// Set Up P
	var PTempory = math.zeros(matching.GLength, matching.GLength+matching.length);
	var mark = [];
	for(var i=0; i<matching.GLength; i++) {
		PTempory.subset(math.index(i, i), 1);
	}
	for(var i=0; i<matching.length; i++) {
		var edge = matching[i];
		PTempory.subset(math.index(edge[0], matching.GLength+i), 1);
		PTempory.subset(math.index(edge[1], matching.GLength+i), 1);
		mark.push(edge[0]);
		mark.push(edge[1]);
	}
	var P = math.matrix();
	for(var j=0; j<(matching.GLength+matching.length); j++) {
		if(mark.indexOf(j) == -1) {
			if(math.size(P).subset(math.index(0)) == 0) {
				P = PTempory.subset(math.index([0, matching.GLength], j));
			}else {
				P = math.concat(P,PTempory.subset(math.index([0, matching.GLength], j)));
			}
		}
	}

	// Compute Next Level nextLevelG
	var PTranspose = math.transpose(P);
	var nextLevelG = math.multiply(PTranspose, G);
	nextLevelG = math.multiply(nextLevelG, P);
	for(var k=0; k<nextLevelN; k++) {
		nextLevelG.subset(math.index(k, k), 0);
	}

	// Compute Next Level XVectors (nextLevelX)
	var nextLevelX = multilevelLayout(nextLevelG, tol);

	// Prolongation and Refinement Phase
	// Prolongate to get initial layout
	var XVectors = math.multiply(P, nextLevelX);
	XVectors = forceDirectedAlgorithm(G, XVectors, tol);
	return XVectors;
}

function maximalMatching(G) {
	var matching = [];
	var size = math.size(G);
	var length = size.subset(math.index(0));
	var mark = [];
	for(var i=0; i<length; i++) {
		if(mark.indexOf(i) == -1) {
			var vertex = G.subset(math.index(i, [0, length]));
			var index = match(vertex, length, mark);

			if(index != null) {
				var edge = [i, index];
				matching.push(edge);
				mark.push(i);
				mark.push(index);
			}
		}
	}
	matching.GLength = length;
	return matching;
}

function match(vertex, length, mark) {
	for(var i=0; i<length; i++) {
		var value = vertex.subset(math.index(0, i));
		if(value == 1 && mark.indexOf(i) == -1) {
			return i;
		}
	}
}

/*-----------Adaptive FD------------------*/
function forceDirectedAlgorithm(G, XVectors, tol) {
	var converged = false;
	step = 30;
	//var energy = Number.POSITIVE_INFINITY;

	var size = math.size(G);
	var length = size.subset(math.index(0));

	while(!converged) {
		var XOriginal = math.clone(XVectors);
		//var energyOriginal = energy;
		//energy = 0;
		
		// Compute Force
		for(var i=0; i<length; i++) {
			var force = math.zeros(1, 2);
			var XI = XVectors.subset(math.index(i, [0, 2]));

			for(var j=0; j<length; j++) {
				if(i != j) {
					var XJ = XVectors.subset(math.index(j, [0, 2]));
					if(XI.subset(math.index(0, 0)) != XJ.subset(math.index(0, 0)) && XI.subset(math.index(0, 1)) != XJ.subset(math.index(0, 1))) {
						var dist = math.subtract(XI, XJ);
						var distValue = math.square(dist);
						distValue = Math.sqrt(math.sum(distValue));

						// Compute Repulsive Force
						var fr = 900 / distValue;
						var direction = math.divide(dist, distValue);
						force = math.add(force, math.multiply(direction, fr));

						// Compute Attractive Force
						if(G.subset(math.index(i, j)) != 0) {
							var fa = -1 * Math.pow(distValue, 2) / 30;
							force = math.add(force, math.multiply(direction, fa));
						}
					}else {
						var fr = math.random([1, 2], 1, 6);
						force = math.add(force, fr);
					}
				}
			}
			
			var fnorm = math.square(force);
			fnorm = Math.sqrt(math.sum(fnorm));
			var movement = math.multiply(math.divide(force, fnorm), step);

			XI = math.add(XI, movement);
			var nodex = Math.min(730, (Math.max(0, XI.subset(math.index(0, 0)))));
			var nodey = Math.min(730, (Math.max(0, XI.subset(math.index(0, 1)))));

			XI.subset(math.index(0, 0), nodex);
			XI.subset(math.index(0, 1), nodey);

			XVectors.subset(math.index(i, [0, 2]), XI);

			//energy = energy + Math.pow(fnorm, 2);
		}

		step = 0.9 * step;
		var different = math.subtract(XVectors, XOriginal);
		different = math.square(different);
		var diff = 0;
		for(var k=0; k<length; k++) {
			var x = different.subset(math.index(k, 0));
			var y = different.subset(math.index(k, 1));
			diff = diff + Math.sqrt(x+y);
		}
		if(diff<30*tol) {
			converged = true;
		}
	}

	return XVectors;
}