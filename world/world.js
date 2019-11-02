function World(context) {

    // Settings
    this.width = MAP_SIZE * CHUNK_SIZE * 2;
    this.height = MAP_SIZE * CHUNK_SIZE;
    this.context = context;
    this.status = "Idle";

    // Chunks
    this.totalChunks = 2 * (MAP_SIZE * MAP_SIZE);
    this.renderedChunks = 0;
    this.chunksDrawn = 0;

    // Maps
    this.seed = Math.random();
    console.log("World seed:", this.seed);
    this.elevation = [];
    this.chunks = [];
    this.maps = [
        {
            name: "elevation",
            seed: "height",
            signal: new SimplexNoise(this.seed),
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
            ]
        }, {
            name: "moisture",
            seed: "water",
            signal: new SimplexNoise("water"),
            layers: this.generateNoiseLayersFibonacci()
        }
    ];

    // Temperature calculation
    this.baseTemperature = 50; //Temperature at equator
    this.temperatureMultiplier = 150; // (Higher is colder)
    this.temperaturHeightLossDistance = 100; // Elevation units for temperature loss
    this.temperaturHeightLossTemperature = 2; //Amount of temperature lost per elevation unit

    // Terrain Settings
    this.scale = 4;
    this.waterLevel = 0;
    this.noiseMultiplier = 400;
    this.iceSpread= 4;

    // Populate map
    for (let x = 0; x < MAP_SIZE * 2; x++) {
        this.chunks[x] = [];
        for (let y = 0; y < MAP_SIZE; y++) {
            this.chunks[x][y] = null;
        }
    }

    // View Settings
    this.forceRenderView = false;
    this.overDraw = true;
}

/**
 * Get the chunk reference for any given tile
 * @param x - X Co-ordinate
 * @param y - Y Co-ordinate
 * @returns {{Cx: number, Cy: number, x: number, y: number}}
 */
World.prototype.getChunkReference = function(x, y) {
    return {
        Cx: Math.floor((x) / CHUNK_SIZE), // Chunk X
        Cy: Math.floor((y) / CHUNK_SIZE), // Chunk Y
        x: (x) % CHUNK_SIZE, // Block X
        y: (y) % CHUNK_SIZE // Block Y
    }
};

/**
 * Get temperature of the chunk reference
 * @param chunkReference
 * @returns {number}
 */
World.prototype.getTemperature = function(chunkReference) {
    const elevation = this.getElevation(chunkReference) - this.waterLevel;
    const latitude = this.getLatitude(chunkReference);
    return Math.floor(((latitude / (MAP_SIZE * CHUNK_SIZE)) * - this.temperatureMultiplier) - (((elevation < 0 ? 0 : elevation)
        / this.temperaturHeightLossDistance) * this.temperaturHeightLossTemperature) + this.baseTemperature);
};

/**
 * Function to generate the biome value based on elevation, moisture and temperature
 */
World.prototype.getBiomeValue = function(chunkReference) {
    const e = this.getElevation(chunkReference);
    const m = this.getMoisture(chunkReference);
    const t = this.getTemperature(chunkReference);

    // Ocean
    if (e < this.waterLevel) {
        if (m + (t * this.iceSpread) < 0) return ICE;
        else if (e < this.waterLevel - 150) return OCEAN;
        else return COAST;
    }

    // Beach
    if (e <  50) { //TODO: Adjust elevation for water level
        if (t < -10) return SNOW;
        if (m > 200) return ROCKY;
        return BEACH;
    }

    if (t < 0) return SNOW;

    // Low Elevation Ground
    if (e < 750) {

        // Low Temperature
        if (t < 5) {
            if (m < 100) return TUNDRA;
            return TAIGA;
        } else if (t < 20) {
            if (m < 0) return SHRUBLAND;
            if (m < 100) return GRASSLAND;
            return SWAMP;
        } else if (t < 35) {
            if (m < 0) return DESERT;
            if (m < 100) return GRASSLAND;
            return JUNGLE;
        } else return DESERT;
    }

    // Moderate Elevation
    if (e < 1500) {

        // Low Temperature
        if (t < 5) {
            if (m < 0) return ROCKY;
            return TUNDRA;
        } else if (t < 15) {
            if (m < 0) return TUNDRA;
            if (m < 50) return GRASSLAND;
            return FOREST;
        } else if (t < 35) {
            if (m < 50) return DESERT;
            if (m < 100) return HIGHLAND;
        } else return DESERT;
    }

    // High Elevation
    return ROCKY;
};

/**
 * Get the moisture value for a specific chunk reference
 * @param chunkReference
 * @returns {*}
 */
World.prototype.getMoisture = function(chunkReference) {
    return this.chunks[chunkReference.Cx][chunkReference.Cy].maps["moisture"][chunkReference.x][chunkReference.y];
};

/**
 * Get the latitude value for a specific chunk reference
 * @param chunkReference
 * @returns {number}
 */
World.prototype.getLatitude = function(chunkReference) {
    return Math.abs(((MAP_SIZE * CHUNK_SIZE) / 2) - (chunkReference.Cy * CHUNK_SIZE + chunkReference.y));
};

/**
 * Get the elevation value for a specific chunk reference
 * @param chunkReference
 * @returns {*}
 */
World.prototype.getElevation = function(chunkReference) {
    return this.chunks[chunkReference.Cx][chunkReference.Cy].maps["elevation"][chunkReference.x][chunkReference.y];
};

/**
 * Fibonacci layered noise generator
 * @returns {Array}
 */
World.prototype.generateNoiseLayersFibonacci = function() {
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

/**
 * Generate a new chunk from noise maps
 * @param Cx
 * @param Cy
 */
World.prototype.generateChunk = function(Cx, Cy) {

    // Update chunk count
    this.renderedChunks++;

    // Generate Maps
    const xOffset = -Cx; //Determine offset by x/y position
    const yOffset = -Cy; //Determine offset by x/y position
    this.chunks[Cx][Cy] = {
        maps: {
            biomes: null,
            travel: null,
            roads: null
        },
        image: null
    };

    for (let m in this.maps) {
        if (this.maps.hasOwnProperty(m)) {
            const map = this.maps[m];
            this.chunks[Cx][Cy].maps[map.name] = this.generateNoiseMap(map.signal, map.layers, xOffset, yOffset);
        }
    }

    // Generate image
    this.chunks[Cx][Cy].imageData = this.renderChunkView(Cx, Cy);
};

/**
 * Generate a noise map for a given chunk
 * @param signal
 * @param layers
 * @param xOffset
 * @param yOffset
 * @returns {Array}
 */
World.prototype.generateNoiseMap = function(signal, layers, xOffset, yOffset) {
    const map = [];
    const p = this.noiseMultiplier; // Output power
    for (let x = 0; x < CHUNK_SIZE; x++) {
        map[x] = [];
        for (let y = 0; y < CHUNK_SIZE; y++) {
            const uX = x * this.scale;
            const uY = y * this.scale;
            let e = 0;
            for (let i = 0; i < layers.length; i++) {

                // Noise output function
                e += layers[i][0] * (signal.noise2D(layers[i][1] * (uX / CHUNK_SIZE - xOffset * this.scale), layers[i][2] * (uY / CHUNK_SIZE - yOffset * this.scale)));
            }
            map[x][y] = Math.round(((e + 0.5) / 4) * p);
        }
    }
    return map;
};

/**
 * Render visible chunks to canvas
 * @param screenPosition
 * @param width
 * @param height
 */
World.prototype.renderWorldView = function(screenPosition, width, height) {

    // Get screen boundaries
    const TLChunkReference = this.getChunkReference(screenPosition.x, screenPosition.y);
    const TRChunkReference = this.getChunkReference(screenPosition.x + width, screenPosition.y);
    const BLChunkReference = this.getChunkReference(screenPosition.x + width, screenPosition.y + height);
    const chunkList = [];

    // Make list of chunks within the screen boundaries
    for (let x = TLChunkReference.Cx; x < TRChunkReference.Cx + (this.overDraw ? 1 : 0); x++) {
        for (let y = TLChunkReference.Cy; y < BLChunkReference.Cy + (this.overDraw ? 1 : 0); y++) {

            // Load chunks that are in view and that exist
            if (typeof this.chunks[x] !== "undefined" && typeof this.chunks[x][y] !== "undefined") {
                chunkList.push([x, y]);
            }
        }
    }

    // Draw the chunk images to the screen
    this.chunksDrawn = 0;
    for (let i = 0; i < chunkList.length; i++) {
        const x = chunkList[i][0];
        const y = chunkList[i][1];

        // Render not yet rendered chunks
        if (this.chunks[x][y] === null && this.forceRenderView) {
            this.generateChunk(x, y);
        }

        if (this.chunks[x][y] !== null) {
            this.chunksDrawn++;
            this.context.drawImage(
                this.chunks[x][y].image,
                x * CHUNK_SIZE - screenPosition.x,
                y * CHUNK_SIZE - screenPosition.y
            );
        }
    }
};

/**
 * Render view of specified chunk
 * @param Cx
 * @param Cy
 * @returns {ImageData}
 */
World.prototype.renderChunkView = function(Cx, Cy) {
    const canvas = document.getElementById("chunk");
    const context = canvas.getContext("2d");
    const image = this.context.createImageData(CHUNK_SIZE, CHUNK_SIZE);
    const data = image.data;
    for (let x = 0; x < CHUNK_SIZE; x++) {
        for (let y = 0; y < CHUNK_SIZE; y++) {
            const cell = (x + y * CHUNK_SIZE) * 4;
            const chunkReference = {Cx, Cy, x, y};
            const tile = tiles[this.getBiomeValue(chunkReference)];
            data[cell] = tile.colour[0];
            data[cell + 1] = tile.colour[1];
            data[cell + 2] = tile.colour[2];
            data[cell + 3] = 255;
        }
    }

    context.putImageData(image, 0, 0);
    this.chunks[x][y].image = new Image();
    this.chunks[x][y].image.src = canvas.toDataURL();
    return image;
};