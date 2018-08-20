const ZOOM = 2;
const CHUNK_SIZE = 50;
const MAP_SIZE = 18;

function World(context) {

    // Settings
    this.width = MAP_SIZE * CHUNK_SIZE * 2;
    this.height = MAP_SIZE * CHUNK_SIZE;
    this.context = context;

    // Chunks
    this.totalChunks = 2 * (MAP_SIZE * MAP_SIZE);
    this.renderedChunks = 0;

    // Maps
    this.elevation = [];
    this.chunks = [];
    this.maps = [
        {
            name: "elevation",
            seed: "height",
            signal: new SimplexNoise(/*"height"*/),
            layers: [
                [12, 0.0625, 0.0625],
                [10, 0.125, 0.125],
                [4, 0.25, 0.25],
                [2, 0.5, 0.5],
                [1, 1, 1],
                [0.5, 2, 2],
                [0.3, 4, 4],
                [0.12, 8, 8],
                [0.08, 16, 16],
                [0.06, 32, 32],
                [0.04, 48, 48],
            ]
        }, {
            name: "moisture",
            seed: "water",
            signal: new SimplexNoise("water"),
            layers: this.generateNoiseLayers()
        }
    ];

    // Temperature calculation
    this.baseTemperature = 50; //Temperature at equator
    this.temperatureMultiplier = 200; // (Higher is colder)
    this.temperaturHeightLossDistance = 50; // Elevation units for temperature loss
    this.temperaturHeightLossTemperature = 2; //Amount of temperature lost per elevation unit

    // Terrain Settings
    this.waterLevel = 0;
    this.snowLevel = 1000;
    this.noiseMultiplier = 255;

    // Populate map
    for (let x = 0; x < MAP_SIZE * 2; x++) {
        this.chunks[x] = [];
        for (let y = 0; y < MAP_SIZE; y++) {
            this.chunks[x][y] = null;
        }
    }

    // View Settings
    this.forceRenderView = false;
}

World.prototype.getChunkReference = function(x, y) {
    return {
        Cx: Math.floor((x) / CHUNK_SIZE), // Chunk X
        Cy: Math.floor((y) / CHUNK_SIZE), // Chunk Y
        x: (x) % CHUNK_SIZE, // Block X
        y: (y) % CHUNK_SIZE // Block Y
    }
};

World.prototype.getTemperature = function(chunkReference) {
    const elevation = this.getElevation(chunkReference);
    const latitude = this.getLatitude(chunkReference);
    return Math.floor(((latitude / (MAP_SIZE * CHUNK_SIZE)) * - this.temperatureMultiplier) - (((elevation < 0 ? 0 : elevation)
        / this.temperaturHeightLossDistance) * this.temperaturHeightLossTemperature) + this.baseTemperature);
};

World.prototype.getBiome = function(e, m, t) {

    // Ocean
    if (e < this.waterLevel) {
        if (m + (t * 2) < 0) return ICE;
        else if(e < this.waterLevel - 150) return OCEAN;
		else return COAST;
    }

    // Beach
    if (e < 50) {
        if (t < -10) return SNOW;
        if (m > 200) return ROCKY;
        return BEACH;
    }

    if (t < -5) return SNOW;

    // Low Elevation Ground
    if (e < 30) {

        // Low Temperature
        if (t < 0) {
            if (m < 100) return TUNDRA;
            return TAIGA;
        } else if (t < 15) {
            if (m < 0) return SHRUBLAND;
            if (m < 50) return GRASSLAND;
            return SWAMP;
        } else if (t < 35) {
            if (m < 0) return DESERT;
            if (m < 100) return GRASSLAND;
            return JUNGLE;
        } else return DESERT;
    }

    // Moderate Elevation
    if (e < 750) {

        // Low Temperature
        if (t < 5) {
            if (m < 100) return TUNDRA;
            return TAIGA;
        } else if (t < 15) {
            if (m < 0) return SHRUBLAND;
            if (m < 50) return GRASSLAND;
            return FOREST;
        } else if (t < 35) {
            if (m < 0) return DESERT;
            if (m < 100) return GRASSLAND;
            return JUNGLE;
        } else return DESERT;
    }

    // High Elevation
    if (e > this.snowLevel && t < 0) return SNOW;
    return ROCKY;
};

World.prototype.getTileValue = function(chunkReference) {
    return tiles[this.chunks[chunkReference.Cx][chunkReference.Cy].maps["biomes"][chunkReference.x][chunkReference.y]];
};

World.prototype.getMoisture = function(chunkReference) {
    return this.chunks[chunkReference.Cx][chunkReference.Cy].maps["moisture"][chunkReference.x][chunkReference.y];
};

World.prototype.getLatitude = function(chunkReference) {
    return Math.abs(((MAP_SIZE * CHUNK_SIZE) / 2) - (chunkReference.Cy * CHUNK_SIZE + chunkReference.y));
};

World.prototype.getElevation = function(chunkReference) {
    return this.chunks[chunkReference.Cx][chunkReference.Cy].maps["elevation"][chunkReference.x][chunkReference.y];
};

/**
 * Fibonacci layered noise generator
 * @returns {Array}
 */
World.prototype.generateNoiseLayers = function() {
    const detail = 16;
    const layers = [];
    //layers[0] = [2, 0.5, 0.5];

    // Generative Algorithm
    let temp, a = 1, b = 0;
    for (let i = 1; i < detail; i++) {
        temp = a;
        a = a + b;
        b = temp;
        layers[i-1] = [(1 / a), a, a];
    }

    return layers;
};

World.prototype.generateChunk = function(Cx, Cy) {

    // Update chunk count
    if (this.chunks[x][y] === null) {
        this.renderedChunks++;
    }

    // Generate Maps
    const xOffset = -Cx; //Determine offset by x/y position
    const yOffset = -Cy; //Determine offset by x/y position
    this.chunks[Cx][Cy] = {
        maps: {},
        image: null
    };

    for (let m in this.maps) {
        if (this.maps.hasOwnProperty(m)) {
            const map = this.maps[m];
            this.chunks[Cx][Cy].maps[map.name] = this.generateNoiseMap(map.signal, map.layers, xOffset, yOffset);
        }
    }

    // Draw Biome Map
    this.chunks[Cx][Cy].maps["biomes"] = [];
    for (let x = 0; x < CHUNK_SIZE; x++) {
        this.chunks[Cx][Cy].maps["biomes"][x] = [];
        for (let y = 0; y < CHUNK_SIZE; y++) {
            const chunkReference = {Cx, Cy, x, y};
            const elevation = this.getElevation(chunkReference);
            const moisture = this.getMoisture(chunkReference);
            const temperature = this.getTemperature(chunkReference);
            this.chunks[Cx][Cy].maps["biomes"][x][y] = this.getBiome(elevation, moisture, temperature);
        }
    }

    // Generate image
    this.chunks[Cx][Cy].image = this.renderChunkView(Cx, Cy);
    console.log("Chunk Render complete: (", Cx, ",", Cy, ")");
};

World.prototype.generateNoiseMap = function(signal, layers, xOffset, yOffset) {
    const map = [];
    const p = this.noiseMultiplier; // Output power
    for (let x = 0; x < CHUNK_SIZE; x++) {
        map[x] = [];
        for (let y = 0; y < CHUNK_SIZE; y++) {
            const uX = x * ZOOM;
            const uY = y * ZOOM;
            let e = 0;
            for (let i = 0; i < layers.length; i++) {

                // Noise output function
                e += layers[i][0] * (signal.noise2D(layers[i][1] * (uX / CHUNK_SIZE - xOffset * ZOOM), layers[i][2] * (uY / CHUNK_SIZE - yOffset * ZOOM)));
            }
            map[x][y] = Math.round(((e + 0.5) / 4) * p);
        }
    }
    return map;
};

World.prototype.renderWorldView = function(screenPosition, width, height) {
    const baseChunkReference = this.getChunkReference(screenPosition.x, screenPosition.y);
    const chunkList = [];

    // Make list of chunks within the the screen
    for (let x = baseChunkReference.Cx; x < baseChunkReference.Cx + width / CHUNK_SIZE; x++) {
        for (let y = baseChunkReference.Cy; y < baseChunkReference.Cy + height / CHUNK_SIZE; y++) {

            // Load chunks that are in view and that exist
            if (typeof this.chunks[x] !== "undefined" && typeof this.chunks[x][y] !== "undefined") {
                chunkList.push([x, y]);
            }
        }
    }

    // Draw the chunk images to the screen
    for (let i = 0; i < chunkList.length; i++) {
        const x = chunkList[i][0];
        const y = chunkList[i][1];

        // Render not yet rendered chunks
        if (this.chunks[x][y] === null && this.forceRenderView) {
            this.generateChunk(x, y);
        }

        if (this.chunks[x][y] !== null) {
            this.context.putImageData(
                this.chunks[x][y].image,
                (x < 1 ? 0 : x * CHUNK_SIZE) + screenPosition.x,
                (y < 1 ? 0 : y * CHUNK_SIZE) + screenPosition.y
            );
        }
    }
};

// Export image of the map view to be drawn in canvas
World.prototype.renderChunkView = function(Cx, Cy) {
    const image = this.context.createImageData(CHUNK_SIZE, CHUNK_SIZE);
    const data = image.data;
    for (let x = 0; x < CHUNK_SIZE; x++) {
        for (let y = 0; y < CHUNK_SIZE; y++) {

            const cell = (x + y * CHUNK_SIZE) * 4;
            const chunkReference = {Cx, Cy, x, y};
            const tile = this.getTileValue(chunkReference);

            data[cell] = tile.colour[0];
            data[cell + 1] = tile.colour[1];
            data[cell + 2] = tile.colour[2];

            //data[cell] += Math.max(0, (25 - value) * 8);
            data[cell + 3] = 255; // alpha.
        }
    }
    return image
};