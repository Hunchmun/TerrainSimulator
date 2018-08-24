function Game() {

    // Setup world
    this.world = new World(canvas.getContext("2d"));

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

    this.zoom = 1;
}

Game.prototype.update = function(elapsed) {

    // Generate world 1 chunk per loop
    if (x < MAP_SIZE * 2) {
        this.world.status = "Generating: (" + x + ", " + y + ")";
        this.world.generateChunk(x, y);
        x++;
    } else if (y < MAP_SIZE - 1) {
        x = 0;
        y++;
    } else {
        this.world.status = "Idle";
    }
};

Game.prototype.draw = function() {

    // Reset context
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.scale(1 * this.zoom, 1 * this.zoom);
    this.world.renderWorldView(this.mapPosition, canvas.width, canvas.height, this.zoom);
    context.scale(1 / this.zoom, 1 / this.zoom);

    context.clearRect(10, 5, 150, 120);

    // Elevation Inspector
    const chunkReference = this.world.getChunkReference((Math.floor(this.mousePosition.x * this.zoom) + this.mapPosition.x), (Math.floor(this.mousePosition.y * this.zoom) + this.mapPosition.y));

    this.drawText("Status: " + this.world.status, {x: 20, y: 20}, "#FFFFFF");

    try {

        const elevation = this.world.getElevation(chunkReference);
        this.drawText("Elevation: " + elevation, {x: 20, y: 40}, "#FFFFFF");

        const moisture = this.world.getMoisture(chunkReference);
        this.drawText("Moisture: " + moisture, {x: 20, y: 50}, "#FFFFFF");

        const latitude = this.world.getLatitude(chunkReference);
        this.drawText("Latitude: " + latitude, {x: 20, y: 60}, "#FFFFFF");

        const temperature = this.world.getTemperature(chunkReference);
        this.drawText("Temperature: " + temperature, {x: 20, y: 70}, "#FFFFFF");

        const biome = this.world.getBiomeValue(chunkReference);
        this.drawText("Biome: " + biome + " (" + tiles[biome].name + ")", {x: 20, y: 80}, "#FFFFFF");
    } catch (e) {
        console.error(e);
    }

    this.drawText("Chunks Rendered: " + (this.world.renderedChunks + "/" + this.world.totalChunks), {x: 20, y: 100}, "#FFFFFF");
    this.drawText("Chunks Drawn: " + this.world.chunksDrawn, {x: 20, y: 110}, "#FFFFFF");
    this.drawText("Zoom: " + this.zoom, {x: 20, y: 120}, "#FFFFFF");
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
        case "mouseout": {
            this.mousePressed = false;
        }  break;
        case "keypress": {
            let code = evt.keyCode;
            switch (code) {
                //case 27: throw new Error("Game terminated by user"); break//Escape
                case 37: this.mapPosition.x -= 50; break; //Left key
                case 38: this.mapPosition.y -= 50; break; //Up key
                case 39: this.mapPosition.x += 50; break; //Right key
                case 40: this.mapPosition.y += 50; break; //Down key
                case 82: this.mapPosition.y = 0; this.mapPosition.x = 0; break; //Reset Map Position
                    // zoom
                case 187: { // IN
                    this.zoom = (this.zoom >= 5 ? 5 : this.zoom + 0.1);
                } break;
                case 189: { // OUT
                    this.zoom = (this.zoom <= 0.1 ? 0.1 : this.zoom - 0.1);
                } break;
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

Game.prototype.mouseDrag = function() {
    if (this.mousePressed) {
        this.mapPosition.x -= (this.mousePosition.x - this.lastMouseClickPosition.x);
        this.mapPosition.y -= (this.mousePosition.y - this.lastMouseClickPosition.y);
    }
    this.lastMouseClickPosition = this.mousePosition;
};

Game.prototype.regenerateWorld = function() {
    x = 0;
    y = 0;
    this.world.chunksDrawn = 0;
    this.world.renderedChunks = 0;
};
