/**
 * Controls the number of tiles/pixels per chunk
 * Optimal = 100
 * @type {number}
 */
const CHUNK_SIZE = 100;

/**
 * Size of the map, height in chunks (Width is 2x map size)
 * Small = 9
 * Medium = 36
 * Large = 128
 * @type {number}
 */
const MAP_SIZE = 6;

const events = {
    windowEvents: [
        "keydown" //TODO: Fix this
    ],
    canvasEvents: [
        "mousedown",
        "mouseup",
        "mousemove",
        "keydown",
        "mouseout"
    ]
};

// Create world
const canvas = document.getElementById("dashboard");
const game = new Game(canvas.getContext("2d"));

let x = 0, y = 0; //TODO: Elegant way of chunk loading + loading screen

let previous = null;
function loop(timestamp) {
    if (!previous) previous = timestamp;
    const elapsed = timestamp - previous;
    game.update(elapsed);
    game.draw();
    previous = timestamp;
    window.requestAnimationFrame(loop);
}

// Register canvas events
for (let i in events.canvasEvents) {
    const event = events.canvasEvents;
    if (event[i].hasOwnProperty(i)) {
        console.log("Registered", event[i]);
        canvas.addEventListener(event[i], function (evt) {
            game.input(event[i], evt);
        }, false);
    }
}

// Sliders
const scaleSlider = document.getElementById("scale");
const scaleOutput = document.getElementById("scaleValue");
scaleOutput.innerHTML = scaleSlider.value;
scaleSlider.oninput = function () {
    scaleOutput.innerHTML = (this.value / 10);
    game.world.scale = (this.value / 10);
};

const noiseMultiSlider = document.getElementById("noiseMulti");
const noiseMultiOutput = document.getElementById("noiseMultiValue");
noiseMultiOutput.innerHTML = noiseMultiSlider.value;
noiseMultiSlider.oninput = function () {
    noiseMultiOutput.innerHTML = this.value;
    game.world.noiseMultiplier = this.value;
};

const waterLevelSlider = document.getElementById("waterLevel");
const waterLevelOutput = document.getElementById("waterLevelValue");
waterLevelOutput.innerHTML = waterLevelSlider.value;
waterLevelSlider.oninput = function () {
    waterLevelOutput.innerHTML = this.value;
    game.world.waterLevel = this.value;
};

const iceMultiSlider = document.getElementById("iceMulti");
const iceMultiOutput = document.getElementById("iceMultiValue");
iceMultiOutput.innerHTML = iceMultiSlider.value;
iceMultiSlider.oninput = function () {
    iceMultiOutput.innerHTML = this.value;
    game.world.iceSpread = this.value;
};

const baseTempSlider = document.getElementById("baseTemp");
const baseTempOutput = document.getElementById("baseTempValue");
baseTempOutput.innerHTML = baseTempSlider.value;
baseTempSlider.oninput = function () {
    baseTempOutput.innerHTML = this.value;
    game.world.baseTemperature = parseInt(this.value);
};

const tempMultiplierSlider = document.getElementById("tempMultiplier");
const tempMultiplierOutput = document.getElementById("tempMultiplierValue");
tempMultiplierOutput.innerHTML = tempMultiplierSlider.value;
tempMultiplierSlider.oninput = function () {
    tempMultiplierOutput.innerHTML = this.value;
    game.world.temperatureMultiplier = parseInt(this.value);
};

const tempElevationSlider = document.getElementById("tempElevation");
const tempElevationOutput = document.getElementById("tempElevationValue");
tempElevationOutput.innerHTML = tempElevationSlider.value;
tempElevationSlider.oninput = function () {
    tempElevationOutput.innerHTML = this.value / 10;
    game.world.temperaturHeightLossTemperature = parseFloat(this.value / 10);
};


//TODO: Deprecate
function keypress(e) {
    game.input("keypress", e);
}

//TODO: Deprecate
window.addEventListener('keydown', keypress, false);
window.requestAnimationFrame(loop);
