"use strict";

(function() {
	let canvas, ctx, presetSelector, currentParams, paramSection, paramControls = {}, resetButton;
	//Keep an array of trees grown
	let trees = [];
	let seeds = [];

	let mousePos = {x: 0, y: 0};

	const fps = 60, delta = 1000 / fps;

	const globalParams = {unit: 50,
						seedColor: "rgba(209, 194, 146, 1)",
						seedRadius: 1,
						gravity: 9.8,
						groundHeight: 100,
						treeBaseLevel: 50,
						skyBaseColor: "rgba(203, 233, 242, 1)",
						skyFadeColor: "rgba(140, 197, 230, 1)",
						skyGradient: undefined,
						groundBaseColor: "rgba(124, 161, 117, 1)",
						groundFadeColor: "rgba(56, 102, 48, 1)",
						groundGradient: undefined};
	const treePresets = [];
	let customPreset = {};
	let customPresetOption;

	window.addEventListener("load", function(e){
		//Initialize canvas and context
		canvas = document.querySelector("canvas");
		ctx = canvas.getContext("2d");
		paramSection = document.querySelector("section#parameters");
		resetButton = document.querySelector("input#resetButton");
		//Update canvas dimensions to be 1-to-1 with display for better graphics
		resizeCanvas();

		initTreePresets();
		initControls();
		updateControls();

		//Mouse move
		canvas.addEventListener("mousemove", function(e){
			//Keep track of mouse coordinates
			let rect = canvas.getBoundingClientRect();
			mousePos.x = e.clientX - rect.x;
			mousePos.y = e.clientY - rect.y;
		});

		//Mouse click (plant seed)
		canvas.addEventListener("click", function(e){
			let rect = canvas.getBoundingClientRect();
			let x = e.clientX - rect.x;
			let y = e.clientY - rect.y;

			if (x > 0 && x < rect.width && y > 0 && y < rect.height){
				dropSeed(x, y, currentParams);
			}
		});

		window.addEventListener("resize", function(){
			resizeCanvas();
		});

		//Preset selection
		presetSelector.addEventListener("change", function(e){
			setPreset(e.target.value);
		});

		setInterval(update, delta);

		function initControls(){
			//Reset button
			resetButton.addEventListener("click", function(){
				setPreset(presetSelector.value);
			});

			//Initialize controls
			presetSelector = document.querySelector("select#presets");
			customPresetOption = presetSelector.querySelector("option#customPreset");
			//Parameter inputs
			paramControls.trunkWidthSlider = document.querySelector("input#trunkWidthSlider");
			paramControls.trunkWidthSlider.addEventListener("change", function(e){
				currentParams.trunkWidth = e.target.value / 100 * globalParams.unit;
				updateControls();
			});

			paramControls.trunkLengthSlider = document.querySelector("input#trunkLengthSlider");
			paramControls.trunkLengthSlider.addEventListener("change", function(e){
				currentParams.trunkLength = e.target.value / 100 * globalParams.unit;
				updateControls();
			});

			paramControls.branchLengthMultiplierSlider = document.querySelector("input#branchLengthMultiplierSlider");
			paramControls.branchLengthMultiplierSlider.addEventListener("change", function(e){
				currentParams.branchLengthMultiplier = e.target.value / 100;
				updateControls();
			});
			
			paramControls.branchLengthVarianceSlider = document.querySelector("input#branchLengthVarianceSlider");
			paramControls.branchLengthVarianceSlider.addEventListener("change", function(e){
				currentParams.branchLengthVariance = e.target.value / 100;
				updateControls();
			});

			paramControls.branchWidthMultiplierSlider = document.querySelector("input#branchWidthMultiplierSlider");
			paramControls.branchWidthMultiplierSlider.addEventListener("change", function(e){
				currentParams.branchWidthMultiplier = e.target.value / 100;
				updateControls();
			});
		}

		function initTreePresets(){
			//Initialize tree parameters with canvas info so it scales for every screen
			//Broad preset
			treePresets.push({trunkColor: {r: 115, g: 106, b: 83, a: 1},
				leafColor: {r: 93, g: 186, b: 76, a:1},
				trunkLength: globalParams.unit * 2,
				trunkWidth: globalParams.unit / 2,
				branchLengthMultiplier: 0.8,
				branchLengthVariance: 0.25,
				branchWidthMultiplier: 0.75,
				branchWidthVariance: 0.05,
				maxLayers: 7,
				minLayers: 3,
				branchChance: 0.75,
				branchAngleVariance: 0.6,
				leafSize: globalParams.unit / 2,
				leafSizeVariance: 0.75,
				leafColorVariance: 0.15,
				leafBunches: 3,
				growthTime: 60,
				branchGrowthStages: 3});

			//Skinny preset
			treePresets.push({trunkColor: {r: 82, g: 70, b: 50, a: 1},
				leafColor: {r: 160, g: 212, b: 123, a:1},
				trunkLength: globalParams.unit * 2,
				trunkWidth: globalParams.unit / 3,
				branchLengthMultiplier: 0.75,
				branchLengthVariance: 0.25,
				branchWidthMultiplier: 0.75,
				branchWidthVariance: 0.05,
				maxLayers: 8,
				minLayers: 3,
				branchChance: 0.5,
				branchAngleVariance: 0.25,
				leafSize: globalParams.unit / 2,
				leafSizeVariance: 0.75,
				leafColorVariance: 0.1,
				leafBunches: 3,
				growthTime: 40,
				branchGrowthStages: 3});
			
			//Copy oak preset for custom
			customPreset = {trunkColor: {r: 115, g: 106, b: 83, a: 1},
				leafColor: {r: 93, g: 186, b: 76, a:1},
				trunkLength: globalParams.unit * 2,
				trunkWidth: globalParams.unit / 2,
				branchLengthMultiplier: 0.8,
				branchLengthVariance: 0.25,
				branchWidthMultiplier: 0.75,
				branchWidthVariance: 0.05,
				maxLayers: 7,
				minLayers: 3,
				branchChance: 0.75,
				branchAngleVariance: 0.5,
				leafSize: globalParams.unit / 2,
				leafSizeVariance: 0.75,
				leafColorVariance: 0.15,
				leafBunches: 3,
				growthTime: 60,
				branchGrowthStages: 3};

			currentParams = JSON.parse(JSON.stringify(treePresets[0]));
		}
	});

	function setPreset(value){
		switch (value){
			default:
				currentParams = JSON.parse(JSON.stringify(treePresets[0]));
				break;
			case "skinny":
				currentParams = JSON.parse(JSON.stringify(treePresets[1]));
				break;
			case "custom":
				currentParams = customPreset;
				break;
		}
		updateControls();
	}

	function updateControls(){
		paramControls.trunkLengthSlider.value = currentParams.trunkLength / globalParams.unit * 100;
		paramControls.trunkWidthSlider.value = currentParams.trunkWidth / globalParams.unit * 100;
		paramControls.branchLengthMultiplierSlider.value = currentParams.branchLengthMultiplier * 100;
		paramControls.branchLengthVarianceSlider.value = currentParams.branchLengthVariance * 100;
		paramControls.branchWidthMultiplierSlider.value = currentParams.branchWidthMultiplier * 100;

	}

	function resizeCanvas(){
		canvas.width = canvas.offsetWidth;
		canvas.height = canvas.offsetHeight;
		//Update parameters that are based on canvas size
		globalParams.unit = canvas.height / 20;
		globalParams.groundHeight = canvas.height - globalParams.unit * 3;
		globalParams.treeBaseLevel = canvas.height - globalParams.unit * 2;
		globalParams.seedRadius = globalParams.unit / 4;
		//Update sky gradient
		globalParams.skyGradient = ctx.createRadialGradient(canvas.width / 2, globalParams.groundHeight, globalParams.unit, 
				canvas.width / 2, globalParams.groundHeight, canvas.width);
		globalParams.skyGradient.addColorStop(0, globalParams.skyBaseColor);
		globalParams.skyGradient.addColorStop(1, globalParams.skyFadeColor);
		//Update ground gradient
		globalParams.groundGradient = ctx.createRadialGradient(canvas.width / 2, globalParams.treeBaseLevel, globalParams.unit, 
			canvas.width / 2, globalParams.treeBaseLevel, canvas.width);
		globalParams.groundGradient.addColorStop(0, globalParams.groundBaseColor);
		globalParams.groundGradient.addColorStop(1, globalParams.groundFadeColor);	
	}

	function update(){
		let delSeeds = [];
		for (let seed of seeds){
			updateSeed(seed);
		}
		for (let tree of trees){
			updateTree(tree);
		}
		//Remove unused seeds
		for (let seed of delSeeds){
			seeds.splice(seeds.indexOf(seed), 1);
		}

		draw();

		function updateTree(tree){
			tree.age += delta / 1000;
		}
		function updateSeed(seed){
			seed.vel += (delta * globalParams.gravity / 1000) * globalParams.unit / 20;
			seed.y += seed.vel;

			//If the seed hit the level where trees start, plant a new tree
			if (seed.y >= globalParams.treeBaseLevel){
				trees.push(createTree(seed.x, globalParams.treeBaseLevel, seed.params));
				//Add seeds to delete list to avoid modification while updating
				delSeeds.push(seed);
			}
		}
	}


	function dropSeed(x, y, params){
		seeds.push({x: x, y: y, vel: 0, params: params});
	}

	function createTree(xPos, yPos, params){
		let trunk = {branches: [], length: params.trunkLength, angle: -Math.PI / 2, x: xPos, y: yPos, width: params.trunkWidth, layer: 0};
		//trunk.push({branches: [], length: 100, angle: Math.PI / 2, x: xPos, y: yPos});
		let tree = {params: params, x: xPos, y: yPos, branches: [trunk], age: 0, layers: 0};
		generateBranches(trunk, tree);

		return tree;
	}
		function generateBranches(parentBranch, tree){
			//Make sure branch parameter is an array
			parentBranch.branches = [];
			//Generate random angles, then add the parent branch's angle to it
			let angles = csoLIB.getTwoRandomAngles(tree.params.branchAngleVariance);
			angles.a += parentBranch.angle;
			angles.b += parentBranch.angle;
			//Generate the base point of the new branches
			let x = parentBranch.x + Math.cos(parentBranch.angle) * parentBranch.length;
			let y = parentBranch.y + Math.sin(parentBranch.angle) * parentBranch.length;
			//Increment the layer
			let newLayer = parentBranch.layer + 1;
			//Update layers in params
			if (newLayer > tree.layers){
				tree.layers = newLayer;
			}
			//Create new branch objects with values
			parentBranch.branches.push({branches: [],
				 length: csoLIB.getRandomVariance(parentBranch.length * tree.params.branchLengthMultiplier, tree.params.branchLengthVariance, true),
				 angle: angles.a, x: x, y: y, layer: newLayer,
				 width: csoLIB.getRandomVariance(parentBranch.width * tree.params.branchWidthMultiplier, tree.params.branchWidthVariance, true)});
			parentBranch.branches.push({branches: [],
				length: csoLIB.getRandomVariance(parentBranch.length * tree.params.branchLengthMultiplier, tree.params.branchLengthVariance, true),
				 angle: angles.b, x: x, y: y, layer: newLayer,
				 width: csoLIB.getRandomVariance(parentBranch.width * tree.params.branchWidthMultiplier, tree.params.branchWidthVariance, true)});

			//Decide whether or not the new branches branch out. Otherwise, generate some leaves
			if (newLayer < tree.params.maxLayers && (newLayer < tree.params.minLayers || Math.random() < tree.params.branchChance)){
				for (let branch of parentBranch.branches){
					generateBranches(branch, tree);
				}
			}else{
				for (let branch of parentBranch.branches){
					let leaves = [];
					let rot = Math.PI * 2 * Math.random();
					let dTheta = Math.PI * 2 / tree.params.leafBunches;
					let x1 = branch.x + Math.cos(branch.angle) * branch.length;					
					let y1 = branch.y + Math.sin(branch.angle) * branch.length;					

					for (let i = 0; i < tree.params.leafBunches; i++){
						let radius = csoLIB.getRandomVariance(tree.params.leafSize, tree.params.leafSizeVariance, true);
						// let x = x1 + Math.cos(rot + dTheta * i) * radius;
						// let y = y1 + Math.sin(rot + dTheta * i) * radius;
						leaves.push({x: x1, y: y1, radius: radius, theta: rot + dTheta * i, 
							 colorShift: 1 + csoLIB.getRandom(-tree.params.leafColorVariance, tree.params.leafColorVariance)});
					}
					branch.leaves = leaves;
				}
			}
		}

	function draw(){
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		drawBackground();

		for (let tree of trees){
			drawTree(tree);
		}
		for (let seed of seeds){
			drawSeed(seed);
		}

		function drawBackground(){
			ctx.save();
			ctx.fillStyle = globalParams.skyGradient;
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.fillStyle = globalParams.groundGradient;
			ctx.fillRect(0, globalParams.groundHeight, canvas.width, globalParams.groundHeight);
			ctx.restore();
		}
		function drawTree(tree){
			ctx.save();
			let progress = Math.min(tree.age, tree.params.growthTime) / tree.params.growthTime;
			//Loop through and draw branches
			ctx.strokeStyle = csoLIB.compileColor(tree.params.trunkColor);
			for (let branch of tree.branches){
				drawBranch(tree, branch, progress);
			}
			//Loop through and draw leaves
			ctx.globalAlpha = 0.75;
			for (let branch of tree.branches){
				drawLeaves(tree, branch, progress);
			}
			ctx.restore();

			function drawBranch(tree, branch, progress){
				//Get what layer of branches we're drawing
				let layer = Math.floor(progress * (tree.layers + 2));
				if (branch.layer <= layer){
					let percentage = csoLIB.getStagePercentage(branch.layer, tree.layers + 2, progress);
					let length = branch.length * Math.min(1, percentage);

					ctx.lineWidth = branch.width * Math.min(1, percentage / tree.params.branchGrowthStages);
					ctx.beginPath();
					ctx.lineCap = "round";
					ctx.moveTo(branch.x, branch.y);
					let x = branch.x + Math.cos(branch.angle) * length;
					let y = branch.y + Math.sin(branch.angle) * length;
					ctx.lineTo(x, y);
					ctx.stroke();
		
					if (branch.layer < layer){
						for (let subBranch of branch.branches){
							drawBranch(tree, subBranch, progress);
						}
					}
				}
			}
			function drawLeaves(tree, branch, progress){
				let layer = Math.floor(progress * (tree.layers + 2));

				if (branch.hasOwnProperty("leaves") && layer > branch.layer){
					let percentage = Math.min(csoLIB.getStagePercentage(branch.layer + 1, tree.layers + 2, progress), 1);
					//console.log(layer + "   " + tree.layers + "   " + percentage);
					for (let leaves of branch.leaves){
						let radius = leaves.radius * percentage;
						let x = leaves.x + Math.cos(leaves.theta) * radius;
						let y = leaves.y + Math.sin(leaves.theta) * radius;
						ctx.fillStyle = csoLIB.compileColor(csoLIB.multiplyColorRGB(tree.params.leafColor, leaves.colorShift));
						ctx.beginPath();
						ctx.arc(x, y, radius, 0, Math.PI * 2);
						ctx.fill();		
					}
				}else{
					for (let subBranch of branch.branches){
						drawLeaves(tree, subBranch, progress);
					}
				}

			}
		}
		function drawSeed(seed){
			ctx.save();
			ctx.fillStyle = globalParams.seedColor;
			ctx.beginPath();
			ctx.arc(seed.x, seed.y, globalParams.seedRadius, 0, Math.PI * 2);
			ctx.fill();
			ctx.restore();
		}
	}

})();