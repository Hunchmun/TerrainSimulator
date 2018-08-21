function Game() {

    // Game loop variables
    this.fps = 0;

    // Setup world
    this.world = new World(canvas.getContext("2d"));

    // Game state
    this.state = 0;

    this.mapPosition = {
        x: 0,
        y: 0
    };

    this.mousePressed = false;

    this.mousePosition = {
        x: 0,
        y: 0
    };

    this.lastMouseClickPosition = {
        x: 0,
        y: 0
    };
}

Game.prototype.update = function(elapsed) {

    // Calculate FPS
    this.fps = 1000 / elapsed;

    // Generate world 1 chunk per loop
    if (x < MAP_SIZE * 2) {
        this.world.status = "Generating: (" + x + ", " + y + ")";
        this.world.generateChunk(x, y);
        x++;
    } else if (y < MAP_SIZE - 1) {
        this.world.status = "Generating: (" + x + ", " + y + ")";
        x = 0;
        y++;
        this.world.generateChunk(x, y);
    } else {
        this.world.status = "Idle";
    }
};

Game.prototype.draw = function() {

    // Reset context
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    this.drawText("FPS: " + Math.round(this.fps), {x: 20, y: 30}, "#FFFFFF");
    this.world.renderWorldView(this.mapPosition, canvas.width, canvas.height);

    context.clearRect(10, 10, 175, 300);
    this.drawGrid(CHUNK_SIZE, CHUNK_SIZE / 2);

    this.drawText("Mouse X: " + this.mousePosition.x, {x: 20, y: 40}, "#FFFFFF");
    this.drawText("Mouse Y: " + this.mousePosition.y, {x: 20, y: 50}, "#FFFFFF");

    // Elevation Inspector
    const chunkReference = this.world.getChunkReference(this.mousePosition.x + this.mapPosition.x, this.mousePosition.y + this.mapPosition.y);

    try {
        this.drawText("Chunk X: " + chunkReference.Cx, {x: 20, y: 70}, "#FFFFFF");
        this.drawText("Chunk Y: " + chunkReference.Cy, {x: 20, y: 80}, "#FFFFFF");
        this.drawText("Tile X: " + chunkReference.x, {x: 20, y: 90}, "#FFFFFF");
        this.drawText("Tile Y: " + chunkReference.y, {x: 20, y: 100}, "#FFFFFF");

        const elevation = this.world.getElevation(chunkReference);
        this.drawText("Elevation: " + elevation, {x: 20, y: 150}, "#FFFFFF");

        const moisture = this.world.getMoisture(chunkReference);
        this.drawText("Moisture: " + moisture, {x: 20, y: 160}, "#FFFFFF");

        const latitude = this.world.getLatitude(chunkReference);
        this.drawText("Latitude: " + latitude, {x: 20, y: 170}, "#FFFFFF");

        const temperature = this.world.getTemperature(chunkReference);
        this.drawText("Temperature: " + temperature, {x: 20, y: 180}, "#FFFFFF");

        const biome = this.world.getBiomeValue(chunkReference);
        this.drawText("Biome: " + biome + " (" + tiles[biome].name + ")", {x: 20, y: 190}, "#FFFFFF");

        const travelValue = this.world.getTravelValue(chunkReference);
        this.drawText("Travel Value: " + travelValue, {x: 20, y: 200}, "#FFFFFF");

        const sailingValue = this.world.getSailingValue(chunkReference);
        this.drawText("Sailing Value: " + sailingValue, {x: 20, y: 210}, "#FFFFFF");

    } catch (e) {
        console.error(e);
    }

    this.drawText("Map Offset X: " + this.mapPosition.x, {x: 20, y: 120}, "#FFFFFF");
    this.drawText("Map Offset Y: " + this.mapPosition.y, {x: 20, y: 130}, "#FFFFFF");

    this.drawText("Chunks Rendered: " + (this.world.renderedChunks + "/" + this.world.totalChunks), {x: 20, y: 230}, "#FFFFFF");
    this.drawText("Chunks Drawn: " + this.world.chunksDrawn, {x: 20, y: 240}, "#FFFFFF");

    this.drawText("Status: " + this.world.status, {x: 20, y: 270}, "#FFFFFF");
};

Game.prototype.input = function(type, evt) {
    switch(type) {
        case "mousemove": {
            this.mousePosition = this.getMousePosition(canvas, evt);
            this.mouseDrag();
        } break;
        case "mousedown": {
            this.mousePressed = true;
        } break;
        case "mouseup": {
            this.mousePressed = false;
        } break;
        case "keypress": {
            let code = evt.keyCode;
            switch (code) {
                //case 27: throw new Error("Game terminated by user"); break//Escape
                case 37: this.mapPosition.x -= 50; break; //Left key
                case 38: this.mapPosition.y -= 50; break; //Up key
                case 39: this.mapPosition.x += 50; break; //Right key
                case 40: this.mapPosition.y += 50; break; //Down key
                case 82: this.mapPosition.y = 0; this.mapPosition.x = 0; break; //Reset Map Position
                default: console.log("Keypress Event:", code); //Everything else
            }
        } break;
        default: {
            // Missed event
        }
    }
};

Game.prototype.getMousePosition = function(canvas, evt) {
    let rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
};

Game.prototype.drawText = function(str, position, colour) {
    const context = canvas.getContext("2d");
    context.fillStyle = colour || "#00FF00";
    context.fillText(str, position.x, position.y);
    context.closePath();
};

Game.prototype.drawGrid = function(major, minor) {
    const context = canvas.getContext("2d");
    minor = minor || 10;
    major = major || minor * 5;

    context.lineWidth = 0.25;
    context.strokeStyle = "#00FF00";
    context.fillStyle = "#009900";
    context.stroke();

    for (let x = 0; x < canvas.width; x += minor) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, canvas.height);
        context.lineWidth = (x % major == 0) ? 0.5 : 0.25;
        if (x % 50 == 0) {
            context.fillText(x, x, 10);
        }
        context.stroke();
    }

    for (let y = 0; y < canvas.height; y += minor) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(canvas.width, y);
        context.lineWidth = (y % major == 0) ? 0.5 : 0.25;
        if (y % 50 == 0) {
            context.fillText(y, 0, y + 10);
        }
        context.stroke();
    }
    context.closePath();
};

Game.prototype.mouseDrag = function() {
    if (this.mousePressed) {
        this.mapPosition.x -= (this.mousePosition.x - this.lastMouseClickPosition.x);
        this.mapPosition.y -= (this.mousePosition.y - this.lastMouseClickPosition.y);
    }
    this.lastMouseClickPosition = this.mousePosition;
};