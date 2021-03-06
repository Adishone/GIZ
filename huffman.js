var uniqueId = 1;
function generateCharOccurencesMap(text)
{
	var charMap = {};
	text.split('').map(function(character) {
		charMap[character] = (charMap[character] || 0) + 1;
	});
	var sortable = [];
	for (var character in charMap) {
		sortable.push([character, charMap[character]]);
	}

	sortable.sort(function(a, b) {
		return a[1] - b[1];
	});
	$("#charOccurences").text("Mapa wystąpień znaków: " + JSON.stringify(sortable));
	generateTreeData(sortable);
}

function generateTreeData(sortedArray)
{
	var tempData = {};
	while (sortedArray.length > 1)
		{
			var newName = sortedArray[0][0] + sortedArray[1][0];
			var newValue = sortedArray[0][1] + sortedArray[1][1];
			sortedArray.push([newName, newValue, sortedArray[0][0], sortedArray[1][0]]);
			tempData[sortedArray[0][0]] = createNewNode(sortedArray[0], newName);
			tempData[sortedArray[1][0]] = createNewNode(sortedArray[1], newName);
			sortedArray.splice(0,2);			
			
			sortedArray.sort(function(a, b) {
			return a[1] - b[1];
			});			
		}
	var array = jsonTreeData(sortedArray, tempData);
	tempData[sortedArray[0][0]] = createNewNode(sortedArray[0], null);
	
	generatePruferSequence(tempData, tempData[sortedArray[0][0]].name, array);
}

function jsonTreeData(root, nodeData)
{
	var jsonTreeData = [
		{
			"name": root[0][0],
			"parent": "null",
			"value": root[0][1],
			"uniqueId": uniqueId,
			"children": []
		}
	]
	jsonTreeData[0].children[0] = addChild(nodeData[root[0][2]], nodeData);
	jsonTreeData[0].children[1] = addChild(nodeData[root[0][3]], nodeData);
	
	var treeDepth = countTreeDepth(jsonTreeData[0]);
	drawTree(jsonTreeData, treeDepth, "#treehuffman");
	return nodeData;
}

function addChild(child, nodeData)
{
	if (child === undefined)
		return;
	uniqueId++;
	var childNode = {};
	childNode.name = child.name;
	childNode.parent = child.parent;
	childNode.value = child.value;
	childNode.uniqueId = uniqueId;
	child.uniqueId = uniqueId;
	if (child.children)
	{
		childNode.children = [];
		childNode.children[0] = addChild(nodeData[child.children[0]], nodeData);
		if (child.children[1])
		{
			childNode.children[1] = addChild(nodeData[child.children[1]], nodeData);
		}
	}
	return childNode;
}

function countTreeDepth(node)
{
	var depth = 0;
    if (node.children) {
        node.children.forEach(function (child) {
            var tmpDepth = countTreeDepth(child);
            if (tmpDepth > depth) {
                depth = tmpDepth;
            }
        });
    }
    return 1 + depth;
}

function createNewNode(sortedNode, parent) 
{
	var newNode = {};
	newNode.name = sortedNode[0];
	newNode.value = sortedNode[1];
	newNode.parent = parent;
	if (sortedNode[2] && sortedNode[3])
		{
			newNode.children = [sortedNode[2], sortedNode[3]];
		}
	return newNode;
}

function generatePruferSequence(treeData, rootName, arrayTreeData)
{
	var pruferSequence = "";
	var charSequence = "";
	
	var leaves = _.filter(treeData, function(node) {
		return node.children == undefined;
	});
	_.forEach(leaves, function(leaf) {
		charSequence += leaf.name + " ";
	});
	arrayTreeData[rootName].uniqueId = 1;

	while (Object.keys(treeData).length > 3)
	{
		var leaves = _.filter(treeData, function(node) {
			return node.children == undefined || node.children.length == 0;
		});
		
		leaves = _.sortBy(leaves, function(node) {
		return node.uniqueId;
		});
		
		var lowestLeaf = leaves[0];
		lowestLeaf.uniqueId = arrayTreeData[lowestLeaf.parent].uniqueId;
		pruferSequence += treeData[lowestLeaf.parent].uniqueId + " ";
		
		if (treeData[lowestLeaf.parent].children[0] == lowestLeaf.name)
			treeData[lowestLeaf.parent].children.splice(0,1);
		else
			treeData[lowestLeaf.parent].children.splice(1,1);
		
		delete treeData[lowestLeaf.name];
	}
	
	var text = arrayTreeData[rootName].uniqueId +"\r\n" + pruferSequence + "\r\n" + charSequence;
	downloadFile(text);
	uniqueId = 1;
}

function readPruferSequence(text)
{
	splittedText = text.split("\n");
	var root = splittedText[0].slice(0,1);
	var pruferSequence = splittedText[1].split(" ");
	if (pruferSequence[pruferSequence.length - 1] == " " || pruferSequence[pruferSequence.length - 1] == "\r" || pruferSequence[pruferSequence.length - 1] == "")
	{
		pruferSequence.splice(pruferSequence.length - 1, 1);
	}
	evaluatePruferSequence(pruferSequence, root);
}

function evaluatePruferSequence(pruferSequence, root)
{
	//create a list of numbers from 1 to length+3
	var numberList = {};
	for (var i=1; i < pruferSequence.length + 3; i++)
	{
		numberList[i] = 0;
	}
	//count occurences of those numbers in pruferSequence
	for (var j=0; j < pruferSequence.length; j++)
	{
		if (numberList[pruferSequence[j]] != undefined)
		{
			numberList[pruferSequence[j]] = numberList[pruferSequence[j]] + 1;
		}
	}
	
	var pruferTreeData = [];
	while (pruferSequence.length > 0)
	{
		var firstInSequence = pruferSequence[0];
		var firstInNumbers = _.findKey(numberList, function(n) {
			return n == 0;
		});
		
		var alreadyInTree = _.find(pruferTreeData, function(node) {
			return node.name == firstInSequence;
		});
		var numberAlreadyInTree = _.find(pruferTreeData, function(number) {
			return number.name == firstInNumbers;
		});
		
		var node1 = {};
		var node2 = {};
		if (alreadyInTree)
		{
			alreadyInTree.children.push(parseInt(firstInNumbers));
		}
		else 
		{
			node1.name = firstInSequence;
			node1.parent = "null";
			node1.children = [];
			if (numberAlreadyInTree)
				{
					if (numberAlreadyInTree.name > firstInSequence) {
						node1.children.push(parseInt(firstInNumbers));
					} else {
						numberAlreadyInTree.children.push(parseInt(firstInSequence));
						node1.parent = numberAlreadyInTree.name;
					}
				}
			else
				{
					//node1.parent = firstInNumbers;
					node1.children.push(parseInt(firstInNumbers));
				}
			pruferTreeData.push(node1);
		}

		if (numberAlreadyInTree)
		{
			if (numberAlreadyInTree.name != root)
				numberAlreadyInTree.parent = firstInSequence;
		}
		else {
			node2.name = firstInNumbers;
			node2.parent = firstInSequence;
			node2.children = [];
			pruferTreeData.push(node2);
		}

		pruferSequence.splice(0,1);
		delete numberList[parseInt(firstInNumbers)];
		numberList[parseInt(firstInSequence)] = numberList[parseInt(firstInSequence)] - 1;
	}
		var keys = _.keys(numberList);
		var penultimate = parseInt(keys[0]);
		var last = parseInt(keys[1]);
		var penultimateInTree = _.find(pruferTreeData, function(node) {
			return node.name == penultimate;
		});
		var lastAlreadyInTree = _.find(pruferTreeData, function(number) {
			return number.name == penultimateInTree;
		});
		if (penultimateInTree)
			{
				penultimateInTree.children.push(parseInt(keys[1]));
				var newNode = {};
				newNode.name = keys[1];
				newNode.parent = penultimateInTree.name;
				newNode.children = [];
				pruferTreeData.push(newNode);
			}
		else if (lastAlreadyInTree){
			lastAlreadyInTree.parent = parseInt(keys[0]);
		}
	generatePruferJsonData(pruferTreeData);	
}

function generatePruferJsonData(data)
{
	var pruferJsonTreeData = [];
	pruferJsonTreeData[0] = _.find(data, function(node) {
		return node.parent == "null";
	});
	pruferJsonTreeData[0].children.forEach(findAndReplaceChild.bind(3, data));
	
	var pruferTreeDepth = countTreeDepth(pruferJsonTreeData[0]);
	drawTree(pruferJsonTreeData, pruferTreeDepth, "#treeprufer");
}

function findAndReplaceChild(data, item, index, children )
{
	var childFound = null;
	var childFoundIndex = null;
	for (i=0; i < data.length; i++) {
		if (data[i].name == item) {
			childFound = data[i];
			childFoundIndex = i;
		}
	}
	
	if (childFound)
		{
			children[index] = childFound;
		}
	
	if(children[index] && children[index].children.length > 0)
		{
			children[index].children.forEach(findAndReplaceChild.bind(3, data));
		}
	else
		{
			return;
		}
}