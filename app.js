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
    if (events.canvasEvents.hasOwnProperty(i)) {
        const event = events.canvasEvents;
        if (event[i].hasOwnProperty(i)) {
            console.log("Registered", event[i]);
            canvas.addEventListener(event[i], function (evt) {
                game.input(event[i], evt);
            }, false);
        }
    }
}

// Sliders
const scaleSlider = document.getElementById("scale");
const scaleOutput = document.getElementById("scaleValue");
scaleOutput.innerHTML = scaleSlider.value;
scaleSlider.oninput = function () {
    scaleOutput.innerHTML = this.value;
    game.world.scale = this.value;
};

const noiseMultiSlider = document.getElementById("noiseMulti");
const noiseMultiOutput = document.getElementById("noiseMultiValue");
noiseMultiOutput.innerHTML = noiseMultiSlider.value;
noiseMultiSlider.oninput = function () {
    noiseMultiOutput.innerHTML = this.value;
    game.world.noiseMultiplier = this.value * 10;
};

const layer1Slider = document.getElementById("layer1");
const layer1Output = document.getElementById("layer1Value");
layer1Output.innerHTML = layer1Slider.value;
layer1Slider.oninput = function () {
    layer1Output.innerHTML = this.value;
    game.world.maps[0].layers[0][0] = parseFloat(this.value);
};

const layer2Slider = document.getElementById("layer2");
const layer2Output = document.getElementById("layer2Value");
layer2Output.innerHTML = layer2Slider.value;
layer2Slider.oninput = function () {
    layer2Output.innerHTML = this.value;
    game.world.maps[0].layers[1][0] = parseFloat(this.value);
};

const layer3Slider = document.getElementById("layer3");
const layer3Output = document.getElementById("layer3Value");
layer3Output.innerHTML = layer3Slider.value;
layer3Slider.oninput = function () {
    layer3Output.innerHTML = this.value;
    game.world.maps[0].layers[2][0] = parseFloat(this.value /10);
};

const layer4Slider = document.getElementById("layer4");
const layer4Output = document.getElementById("layer4Value");
layer4Output.innerHTML = layer4Slider.value;
layer4Slider.oninput = function () {
    layer4Output.innerHTML = this.value;
    game.world.maps[0].layers[3][0] = parseFloat(this.value /10);
};

const layer5Slider = document.getElementById("layer5");
const layer5Output = document.getElementById("layer5Value");
layer5Output.innerHTML = layer5Slider.value;
layer5Slider.oninput = function () {
    layer5Output.innerHTML = this.value;
    game.world.maps[0].layers[4][0] = parseFloat(this.value / 10);
};

const layer6Slider = document.getElementById("layer6");
const layer6Output = document.getElementById("layer6Value");
layer6Output.innerHTML = layer6Slider.value;
layer6Slider.oninput = function () {
    layer6Output.innerHTML = this.value;
    game.world.maps[0].layers[5][0] = parseFloat(this.value / 10);
};

const layer7Slider = document.getElementById("layer7");
const layer7Output = document.getElementById("layer7Value");
layer7Output.innerHTML = layer7Slider.value;
layer7Slider.oninput = function () {
    layer7Output.innerHTML = this.value;
    game.world.maps[0].layers[6][0] = parseFloat(this.value / 10);
};

const layer8Slider = document.getElementById("layer8");
const layer8Output = document.getElementById("layer8Value");
layer8Output.innerHTML = layer8Slider.value;
layer8Slider.oninput = function () {
    layer8Output.innerHTML = this.value;
    game.world.maps[0].layers[7][0] = parseFloat(this.value / 1000);
};

const layer9Slider = document.getElementById("layer9");
const layer9Output = document.getElementById("layer9Value");
layer9Output.innerHTML = layer9Slider.value;
layer9Slider.oninput = function () {
    layer9Output.innerHTML = this.value;
    game.world.maps[0].layers[8][0] = parseFloat(this.value / 1000);
};

const layer10Slider = document.getElementById("layer10");
const layer10Output = document.getElementById("layer10Value");
layer10Output.innerHTML = layer10Slider.value;
layer10Slider.oninput = function () {
    layer10Output.innerHTML = this.value;
    game.world.maps[0].layers[9][0] = parseFloat(this.value / 1000);
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
    game.world.temperatureMultiplier = parseInt(this.value * 10);
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
