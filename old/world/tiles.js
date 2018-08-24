const ICE = 0;
const OCEAN = 1;
const BEACH = 2;
const ROCKY = 3;
const TUNDRA = 4;
const SNOW = 5;
const SWAMP = 6;
const SHRUBLAND = 7;
const TAIGA = 8;
const GRASSLAND = 9;
const DESERT= 10;
const FOREST = 11;
const JUNGLE = 12;
const COAST = 13;
const HIGHLAND = 14;

const tiles = [
    {
        "name": "Ice",
        "colour": [240,255,255],
        "travel": 0.3,
        "sailing": 0
    }, {
        "name": "Ocean",
        "colour": [30,144,255],
        "travel": 0,
        "sailing": 1
    }, {
        "name": "Beach",
        "colour": [255,250,205],
        "travel": 0.8,
        "sailing": 0
    }, {
        "name": "Rocky",
        "colour": [112,128,144],
        "travel": 0.2,
        "sailing": 0
    }, {
        "name": "Tundra",
        "colour": [128,128,0],
        "travel": 0.6,
        "sailing": 0
    }, {
        "name": "Snow",
        "colour": [255,250,250],
        "travel": 0.2,
        "sailing": 0
    }, {
        "name": "Swamp",
        "colour": [128,128,0],
        "travel": 0.1,
        "sailing": 0
    }, {
        "name": "Shrubland",
        "colour": [189,183,107],
        "travel": 0.6,
        "sailing": 0
    }, {
        "name": "Taiga",
        "colour": [85,107,47],
        "travel": 0.5,
        "sailing": 0
    }, {
        "name": "Grassland",
        "colour": [50,205,50],
        "travel": 0.7,
        "sailing": 0
    }, {
        "name": "Desert",
        "colour": [255,228,181],
        "travel": 0.6,
        "sailing": 0
    }, {
        "name": "Forest",
        "colour": [0,100,0],
        "travel": 0.2,
        "sailing": 0
    }, {
        "name": "Jungle",
        "colour": [85,107,47],
        "travel": 0.2,
        "sailing": 0
    },{
        "name": "Coast",
        "colour": [143,200,255],
        "travel": 0.01,
        "sailing": 0.5
	}, {
        "name": "Highland",
        "colour": [82, 147, 0],
        "travel": 0.4,
        "sailing": 0
    }
];