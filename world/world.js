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
    this.elevation = [];
    this.chunks = [];
    this.maps = [
        {
            name: "elevation",
            seed: "height",
            signal: new SimplexNoise("height"),
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
            layers: this.generateNoiseLayersFibonacci()
        }
    ];

    // Temperature calculation
    this.baseTemperature = 50; //Temperature at equator
    this.temperatureMultiplier = 150; // (Higher is colder)
    this.temperaturHeightLossDistance = 100; // Elevation units for temperature loss
    this.temperaturHeightLossTemperature = 2; //Amount of temperature lost per elevation unit

    // Terrain Settings
    this.waterLevel = 0;
    this.snowLevel = 1000;
    this.noiseMultiplier = 400;
    this.iceMultiplier = 4; //(Lower is more)

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
    const elevation = this.getElevation(chunkReference);
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
        if (m + (t * this.iceMultiplier) < 0) return ICE;
        else if (e < this.waterLevel - 150) return OCEAN;
        else return COAST;
    }

    // Beach
    if (e < 50) {
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
    if (e > this.snowLevel && t < 0) return SNOW;
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
    if (this.chunks[x][y] === null) {
        this.renderedChunks++;
    }

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
    this.chunks[Cx][Cy].image = this.renderChunkView(Cx, Cy);
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
            this.context.putImageData(
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

            //data[cell] += Math.max(0, (25 - value) * 8);
            data[cell + 3] = 255; // alpha.
        }
    }

    return image;
};

/**
 * Returns ID of the given tile chunk reference
 * @param chunkReference
 * @returns {number}
 */
World.prototype.getTileId = function(chunkReference) {
    const coord = this.getTilePosition(chunkReference);
    return  (1 + ( coord[1] * CHUNK_SIZE + coord[0]));
};

/**
 * Returns global tile position coordinate from chunk reference
 * @param chunkReference
 * @returns {[*,*]}
 */
World.prototype.getTilePosition = function(chunkReference) {
    return [chunkReference.Cx * CHUNK_SIZE + chunkReference.x, chunkReference.Cy * CHUNK_SIZE + chunkReference.y];
};

/**
 * A Star implementation of a route between two tiles
 * @param CRStart
 * @param CREnd
 */
World.prototype.routeTo = function(CRStart, CREnd) {

    let counter = 0;

    function euclideanDistance(Point, Goal) {
        // diagonals are considered a little farther than cardinal directions
        // diagonal movement using Euclide (AC = sqrt(AB^2 + BC^2))
        // where AB = x2 - x1 and BC = y2 - y1 and AC will be [x3, y3]
        return Math.sqrt(Math.pow(Point[0] - Goal[0], 2) + Math.pow(Point[1] - Goal[1], 2));
    }

    function getNeighbours(self, node) {
        const normalCost = 1;
        const diagonalCost = 1.4;
        const arr = [];
        for (let x = node.co[0] - 1; x < node.co[0] + 2; x++) {
            for (let y = node.co[1] - 1; y < node.co[1] + 2; y++) {

                // If Valid
                if (x >= 0 && y >= 0) {

                    // And not self
                    if (x !== node.co[0] || y !== node.co[1]) {

                        // If traversable
                        const neighbour = formatNode(self, self.getChunkReference(x, y));
                        const biome = self.getBiomeValue(neighbour.cr);
                        const tile = tiles[biome];

                        if (tile.travel > 0) {
                            // If Diagonal
                            if (x !== node.co[0] && y !== node.co[1]) {
                                neighbour.g = node.g + diagonalCost;
                            } else {
                                neighbour.g = node.g + normalCost;
                            }

                            // Save history
                            neighbour.parent = node;
                            arr.push(neighbour);
                        }
                    }
                }
            }
        }
        return arr;
    }

    function constructPath(node) {
        const path = [ node ];
        while (node.parent) {
            node = node.parent;
            path.push(node);
        }
        console.log("Path?", path);
        return path
    }

    function formatNode(self, chunkReference) {
        return {
            cr: chunkReference,                             // Chunk Reference
            co: self.getTilePosition(chunkReference),       // Global Co-ordinates [x, y]
            id: self.getTileId(chunkReference),             // Tile ID
            f: null,
            g: null,
            h: null
        }
    }

    function nodeInList(list, node) {
        for (let i = 0; i < list.length; i++) {
            if (list[i].id === node.id) return i;
        } return -1;
    }

    const open = [];
    const closed = [];

    const start = formatNode(this, CRStart);
    const end = formatNode(this, CREnd);

    start.g = 0;
    start.h = euclideanDistance(start.co, end.co);
    start.f = start.g + start.h;
    console.log("Start F Score:", start.f);

    open.push(start);

    while (open.length > 0) {
        //console.log(open);
        counter++;

        if (counter > 10000) {
            throw new Error("Infinite Loop: A* Path Finder");
        } else {

            // Find lowest F
            let current = null, index;
            for (let i = 0; i < open.length; i++) {
                if (open.hasOwnProperty(i)) {
                    if (current === null || current.f > open[i].f) {
                        current = open[i];
                        index = i;
                    }
                }
            }

            // We've arrived?
            if (current.id === end.id) return constructPath(current);
            //console.log("Current node:", current.co[0], current.co[1]);

            // Remove current node from open list
            open.splice(index, 1); // might not be removing from open list
            //console.log(nodeInList(open, current) > -1 ? "WARNING: Current node not removed from open list!" : "Current node removed from open!", index);

            // Add current to closed list
            closed.push(current);
            // Calculate neighbours
            const neighbours = getNeighbours(this, current);
            for (let i = 0; i < neighbours.length; i++) {

                const neighbour = neighbours[i];

                // Neighbour NOT in closed list
                if (nodeInList(closed, neighbours[i]) === -1) {
                    neighbour.h = euclideanDistance(neighbour.co, end.co);
                    neighbour.f = neighbour.g + neighbour.h;

                    // Neighbour NOT in open list
                    if (nodeInList(open, neighbour) === -1) {
                        open.push(neighbour);
                    } else {
                        const openNeighbour = neighbour;
                        if (neighbour.g < openNeighbour.g) {
                            openNeighbour.g = neighbour.g;
                            openNeighbour.parent = neighbour.parent;
                        }
                    }
                }
            }
        }
    }
    return false;
};

World.prototype.getTravelValue = function(chunkReference) {
    const populatedRoads = this.chunks[chunkReference.Cx][chunkReference.Cy].maps["roads"];
    return tiles[this.getBiomeValue(chunkReference)].travel
        + (populatedRoads !== null ? this.chunks[chunkReference.Cx][chunkReference.Cy].maps["roads"][chunkReference.x][chunkReference.y] : 0);
};

World.prototype.getSailingValue = function(chunkReference) {
    return tiles[this.getBiomeValue(chunkReference)].sailing;
};
