// ************** Generate the tree diagram	 *****************
function drawTree(treeData, treeDepth, divId) {
var margin = {top: 40, right: 40, bottom: 20, left: 40},
	width = 1200;
	height = 100*treeDepth;

var tree = d3.layout.tree()
	.size([1200, 100*treeDepth]);

var diagonal = d3.svg.diagonal()
	.projection(function(d) { return [d.x, d.y]; });

	$(divId).empty();

var svg = d3.select(divId).append("svg")
	.attr("width", width + margin.right + margin.left)
	.attr("height", height + margin.top + margin.bottom)
  .append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

root = treeData[0];
  
update(root, tree, svg, diagonal);
}

function update(source, tree, svg, diagonal) {

  var i = 0;
  // Compute the new tree layout.
  var nodes = tree.nodes(root).reverse(),
	  links = tree.links(nodes);

  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.y = d.depth * 100; });

  // Declare the nodes…
  var node = svg.selectAll("g.node")
	  .data(nodes, function(d) { return d.id || (d.id = ++i); });

  // Enter the nodes.
  var nodeEnter = node.enter().append("g")
	  .attr("class", "node")
	  .attr("transform", function(d) { 
		  return "translate(" + d.x + "," + d.y + ")"; });

  nodeEnter.append("circle")
	  .attr("r", 10)
	  .style("fill", "#fff");

  nodeEnter.append("text")
	  .attr("y", function(d) { 
		  return d.children || d._children ? -18 : 18; })
	  .attr("dy", ".35em")
	  .attr("text-anchor", "middle")
	  .text(function(d) { return d.name + (d.value != undefined ? "|" + d.value : "") + (d.uniqueId != undefined ? "|" + d.uniqueId : ""); })
	  .style("fill-opacity", 1);

  // Declare the links…
  var link = svg.selectAll("path.link")
	  .data(links, function(d) { return d.target.id; });

  // Enter the links.
  link.enter().insert("path", "g")
	  .attr("class", "link")
	  .attr("d", diagonal);

}