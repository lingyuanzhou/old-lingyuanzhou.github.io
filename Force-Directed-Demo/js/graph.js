/*-----------Graph-----------*/
function createGraph(data, graph) {
	var source = $('#source').val();
	var target = $('#target').val();

	graph.nodes = [];
	graph.edges = [];

	var nodesArray = [];
	var edgesArray = [];
	var nodesC = [];
	var edgesC = [];

	var nodeCount = 0;
	var edgeCount = 0;

	var rnd = new Srand(10);
	var canvas = $('#canvas')[0];

	if(graph.nodeC) {
		var nodeC = $('#nodeCValue').val();
	}
	if(graph.edgeC) {
		var edgeC = $('#edgeCValue').val();
	}

	for(var i=0; i<data.length; i++) {
		var line = data[i];
		var sLabel = line[source];
		var tLabel = line[target];
		var nodeLabel = [sLabel, tLabel];
		var edgeLabel = sLabel + '->' + tLabel;

		var index = [];

		nodeLabel.forEach(function(label) {
			if(nodesArray[label] == null){
				nodesArray[label] = nodeCount;
				nodesC.push(parseFloat(line[nodeC]));
				var x = rnd.randomIn(0, canvas.width);
				var y = rnd.randomIn(0, canvas.height);
				var node = {
					label: label,
					pos: {x:x,y:y},
					disp: {x:0,y:0}
				};
				graph.nodes.push(node);
				index.push(nodeCount);

				nodeCount++;
			}else {
				index.push(nodesArray[label]);
				nodesC[nodesArray[label]] += parseFloat(line[nodeC]);
			}
		});

		if(edgesArray[edgeLabel] == null){
			edgesArray[edgeLabel] = edgeCount;
			edgesC.push(parseFloat(line[edgeC]));
			var edge = {
				source: graph.nodes[index[0]],
				target: graph.nodes[index[1]],
				label: edgeLabel
			};
			graph.edges.push(edge);

			graph.nodes[index[0]].tag = "source";
			graph.nodes[index[1]].tag = "target";

			edgeCount++;
		}else {
			edgesC[edgesArray[edgeLabel]] += parseFloat(line[edgeC]);
		}
	}
	
	if(graph.nodeC) {
		for(var i=0; i<graph.nodes.length; i++) {
			graph.nodes[i].nodeC = nodesC[i];
		}
		graph.maxNodeC = Math.max.apply(Math, nodesC);
	}
	if(graph.edgeC) {
		for(var i=0; i<graph.edges.length; i++) {
			graph.edges[i].edgeC = edgesC[i];
		}
		graph.maxEdgeC = Math.max.apply(Math, edgesC);
	}
}

/*-----------Vector-----------*/
vectorAdd = function(v1, v2) {
	var result = {
		"x": (v1.x + v2.x),
		"y": (v1.y + v2.y)
	};
	return result;
};

vectorSubstract = function(v1, v2) {
	var result = {
		"x": (v1.x - v2.x),
		"y": (v1.y - v2.y)
	};
	return result;
};

vectorMultiply = function(v, n) {
	var result = {
		"x": (v.x * n),
		"y": (v.y * n)
	};
	return result;
};

vectorDivide = function(v, n) {
	var result = {
		"x": ((v.x / n) || 0),
		"y": ((v.y / n) || 0)
	};
	return result;
};

vectorMagnitude = function(v) {
	var x = v.x * v.x;
	var y = v.y * v.y;
	var result = Math.sqrt(x + y);
	return result;
};

vectorNormalise = function(v) {
	var x = v.x * v.x;
	var y = v.y * v.y;
	var magnitude = Math.sqrt(x + y);

	var result = {
		"x": ((v.x / magnitude) || 0),
		"y": ((v.y / magnitude) || 0)
	};
	return result;
};

/*-----------Render-----------*/
function render(graph) {
	var canvas = $("#canvas")[0];
	var ctx = canvas.getContext("2d");
	ctx.clearRect ( 0 , 0 , canvas.width, canvas.height );

	var nodeSize = parseFloat($('#nodeSize').val());
	var edgeThickness = parseFloat($('#edgeThickness').val());

	var scolor = $('#scolor').css('background-color');
	var tcolor = $('#tcolor').css('background-color');
	var ecolor = $('#ecolor').css('background-color');

	if(graph.edgeC) {
		graph.edges.forEach(function(edge) {
			ctx.beginPath();
			ctx.moveTo(edge.source.pos.x, edge.source.pos.y);
			ctx.lineTo(edge.target.pos.x, edge.target.pos.y);
			ctx.lineWidth = edgeThickness*edge.edgeC/graph.maxEdgeC;
			ctx.strokeStyle = ecolor;
			ctx.stroke();
		});
	}else {
		graph.edges.forEach(function(edge) {
			ctx.beginPath();
			ctx.moveTo(edge.source.pos.x, edge.source.pos.y);
			ctx.lineTo(edge.target.pos.x, edge.target.pos.y);
			ctx.lineWidth = edgeThickness;
			ctx.strokeStyle = ecolor;
			ctx.stroke();
		});
	}
	
	if(graph.nodeC) {
		graph.nodes.forEach(function(node) {
			ctx.beginPath();
			ctx.arc(node.pos.x,node.pos.y,node.nodeC*nodeSize/graph.maxNodeC,0,2*Math.PI);
			if(node.tag == "source") {
				ctx.strokeStyle = scolor;
				ctx.fillStyle = scolor;
			}else if(node.tag == "target") {
				ctx.strokeStyle = tcolor;
				ctx.fillStyle = tcolor;
			}
			ctx.fill();
			ctx.stroke();
		});
	}else {
		graph.nodes.forEach(function(node) {
			ctx.beginPath();
			ctx.arc(node.pos.x,node.pos.y,nodeSize,0,2*Math.PI);
			if(node.tag == "source") {
				ctx.strokeStyle = scolor;
				ctx.fillStyle = scolor;
			}else if(node.tag == "target") {
				ctx.strokeStyle = tcolor;
				ctx.fillStyle = tcolor;
			}
			ctx.fill();
			ctx.stroke();
		});
	}
	
}