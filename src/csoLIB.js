"use strict";

(function() {
	const csoLIB = {
		getRandomVariance(base, variance, percent){
			//If percent is true, vary the base by a percentage of the base
			if (percent){
				return base + (variance * base * Math.random());
			}else{
				return Math.random() * variance + base;
			}
		},
		getRandom(max){
			return max * Math.random();
		},
		getRandom(min, max){
			return Math.min(min, max) + (Math.abs(max - min) * Math.random());
		},
		getTwoRandomAngles(variation){
			return {a: (variation * Math.random()), b: (-variation * Math.random())};
		},
		randomShiftColor(color, variance){
			return {r: this.getRandomVariance(color.r, variance, true),
					g: this.getRandomVariance(color.g, variance, true),
					b: this.getRandomVariance(color.b, variance, true),
					a: this.getRandomVariance(color.a, variance, true)};
		},
		multiplyColor(color, variance){
			return {r: color.r * variance,
					g: color.g * variance,
					b: color.b * variance,
					a: color.a * variance};
		},
		multiplyColorRGB(color, variance){
			return {r: color.r * variance,
					g: color.g * variance,
					b: color.b * variance,
					a: 1};
		},
		compileColor(color){
			return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
		}
	};

	if (window){
        window["csoLIB"] = csoLIB;
    }else{
        throw "'window' not defined";
    }
})();