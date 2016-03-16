/*-------Random Graph Generator------*/
function randomGraph(level) {
    var G = {};
    G.node = [];
    for(var i=0; i<level; i++) {
        addNode(G, i);
    }
    return G;
}
function addNode(G, level) {
    if(level>0) {
        var nodeNB = Math.pow(2, level) * 8;
        var lastNodeNB = Math.pow(2, (level-1)) * 8;
        var totalNode = G.node.length;

        for(var i=0; i<nodeNB; i=i+2) {
            var count = G.node.length;
            var node1 = {
                index: count,
                neighbors: [totalNode-lastNodeNB+i/2, count+1, (i+nodeNB-1)%nodeNB+totalNode]
            };
            var node2 = {
                index: count+1,
                neighbors: [totalNode-lastNodeNB+i/2, count, (i+2)%nodeNB+totalNode, ((i+2)/2)%lastNodeNB+totalNode-lastNodeNB]
            };
            G.node[totalNode-lastNodeNB+i/2].neighbors.push(count);
            G.node[totalNode-lastNodeNB+i/2].neighbors.push(count+1);
            G.node.push(node1);
            G.node.push(node2);
        }
    }else if(level == 0) {
        for(var i=0; i<8; i++) {
            var node = {
                index: i,
                neighbors: [(i+1)%8, (i+7)%8]
            };
            G.node.push(node);
        }
    }
}