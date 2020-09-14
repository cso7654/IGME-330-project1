"use strict";

//(function() {
	let canvas, ctx;
	//Keep an array of trees grown
	let trees = [];

	let mousePos = {x: 0, y: 0};

	const fps = 60, delta = 1000 / fps;

	let paramList = [];

	window.addEventListener("load", function(e){
		//Initialize canvas and context
		canvas = document.querySelector("canvas");
		//Update canvas dimensions to be 1-to-1 with display for better graphics
		canvas.width = canvas.offsetWidth;
		canvas.height = canvas.offsetHeight;
		ctx = canvas.getContext("2d");

		//Initialize tree parameters with canvas info so it scales for every screen
		paramList.push({trunkColor: {r: 82, g: 70, b: 50, a: 1},
					leafColor: {r: 85, g: 173, b:81, a:1},
					trunkLength: canvas.height / 10,
					branchLengthMultiplier: 0.75,
					branchLengthVariance: 0.25,
					branchWidthMultiplier: 0.75,
					branchWidthVariance: 0.05,
					maxLayers: 5,
					minLayers: 3,
					branchChance: 0.75,
					branchAngleVariance: 0.5,
					leafSize: canvas.height / 30,
					leafSizeVariance: 0.75,
					leafColorVariance: 0.1,
					leafBunches: 3});

		//Mouse move
		canvas.addEventListener("mousemove", function(e){
			//Keep track of mouse coordinates
			let rect = canvas.getBoundingClientRect();
			mousePos.x = e.clientX - rect.x;
			mousePos.y = e.clientY - rect.y;
		});

		trees.push(createTree(500, 500));

		setInterval(update, 1000 / fps);
	});

	function update(){
		draw();

		for (let tree of trees){
			updateTree(tree);
		}
	}
		function updateTree(tree){
			tree.branches[0]
		}

	function createTree(xPos, yPos){
		let trunk = {branches: [], length: 100, angle: -Math.PI / 2, x: xPos, y: yPos, width: canvas.height / 25, layer: 0};
		//trunk.push({branches: [], length: 100, angle: Math.PI / 2, x: xPos, y: yPos});
		generateBranches(trunk, paramList[0]);
		let tree = {type:"oak", params: paramList[0], x: xPos, y: yPos, branches: [trunk]};

		return tree;
	}
		function generateBranches(parentBranch, treeParams){
			//Make sure branch parameter is an array
			parentBranch.branches = [];
			//Generate random angles, then add the parent branch's angle to it
			let angles = csoLIB.getTwoRandomAngles(treeParams.branchAngleVariance);
			angles.a += parentBranch.angle;
			angles.b += parentBranch.angle;
			//Generate the base point of the new branches
			let x = parentBranch.x + Math.cos(parentBranch.angle) * parentBranch.length;
			let y = parentBranch.y + Math.sin(parentBranch.angle) * parentBranch.length;
			//Increment the layer
			let newLayer = parentBranch.layer + 1;
			//Create new branch objects with values
			parentBranch.branches.push({branches: [],
				 length: csoLIB.getRandomVariance(parentBranch.length * treeParams.branchLengthMultiplier, treeParams.branchLengthVariance, true),
				 angle: angles.a, x: x, y: y, layer: newLayer,
				 width: csoLIB.getRandomVariance(parentBranch.width * treeParams.branchWidthMultiplier, treeParams.branchWidthVariance, true)});
			parentBranch.branches.push({branches: [],
				length: csoLIB.getRandomVariance(parentBranch.length * treeParams.branchLengthMultiplier, treeParams.branchLengthVariance, true),
				 angle: angles.b, x: x, y: y, layer: newLayer,
				 width: csoLIB.getRandomVariance(parentBranch.width * treeParams.branchWidthMultiplier, treeParams.branchWidthVariance, true)});

			//Decide whether or not the new branches branch out. Otherwise, generate some leaves
			if (newLayer < treeParams.maxLayers && (newLayer < treeParams.minLayers || Math.random() < treeParams.branchChance)){
				for (let branch of parentBranch.branches){
					generateBranches(branch, treeParams);
				}
			}else{
				for (let branch of parentBranch.branches){
					let leaves = [];
					let rot = Math.PI * 2 * Math.random();
					let dTheta = Math.PI * 2 / treeParams.leafBunches;
					let x1 = branch.x + Math.cos(branch.angle) * branch.length;					
					let y1 = branch.y + Math.sin(branch.angle) * branch.length;					

					for (let i = 0; i < treeParams.leafBunches; i++){
						let radius = csoLIB.getRandomVariance(treeParams.leafSize, treeParams.leafSizeVariance, true);
						let x = x1 + Math.cos(rot + dTheta * i) * radius;
						let y = y1 + Math.sin(rot + dTheta * i) * radius;
						leaves.push({x: x, y: y, radius: radius,
							 colorShift: 1 + csoLIB.getRandom(-treeParams.leafColorVariance, treeParams.leafColorVariance)});
					}
					branch.leaves = leaves;
				}
			}
		}

	function draw(){
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		for (let tree of trees){
			drawTree(tree);
		}

	}
		function drawTree(tree){
			ctx.save();
			//Loop through and draw branches
			ctx.strokeStyle = csoLIB.compileColor(tree.params.trunkColor);
			for (let branch of tree.branches){
				drawBranch(branch);
			}
			//Loop through and draw leaves
			ctx.globalAlpha = 0.75;
			for (let branch of tree.branches){
				drawLeaves(branch, tree.params);
			}
			ctx.restore();
		}
			function drawBranch(branch){
				ctx.lineWidth = branch.width;
				ctx.beginPath();
				ctx.lineCap = "round";
				ctx.moveTo(branch.x, branch.y);
				let x = branch.x + Math.cos(branch.angle) * branch.length;
				let y = branch.y + Math.sin(branch.angle) * branch.length;
				ctx.lineTo(x, y);
				ctx.stroke();
	
				for (let subBranch of branch.branches){
					drawBranch(subBranch);
				}
			}
			function drawLeaves(branch, params){
				if (branch.hasOwnProperty("leaves")){
					for (let leaves of branch.leaves){
						ctx.fillStyle = csoLIB.compileColor(csoLIB.multiplyColorRGB(params.leafColor, leaves.colorShift));
						ctx.beginPath();
						ctx.arc(leaves.x, leaves.y, leaves.radius, 0, Math.PI * 2);
						ctx.fill();		
					}
				}else{
					for (let subBranch of branch.branches){
						drawLeaves(subBranch, params);
					}
				}
			}

//})();