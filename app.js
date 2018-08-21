const canvas = document.getElementById("dashboard");

let previous = null;
let fps = 0;

const mapPosition = {
    x: 0,
    y: 0
};

let mousePressed = false;

let mousePosition = {
    x: 0,
    y: 0
};

let lastMouseClickPosition = {
    x: 0,
    y: 0
};

// Create world
const world = new World(canvas.getContext("2d"));

function loop(timestamp) {
    if (!previous) previous = timestamp;
    const elapsed = timestamp - previous;

    // Update
    update(elapsed);

    // Draw
    draw();

    previous = timestamp;
    window.requestAnimationFrame(loop);
}

let x = 0, y = 0;

function update(elapsed) {
    fps = 1000 / elapsed;

    // Generate world 1 chunk per loop
    if (x < MAP_SIZE * 2) {
        world.status = "Generating: (" + x + ", " + y + ")";
        world.generateChunk(x, y);
        x++;
    } else if (y < MAP_SIZE - 1) {
        world.status = "Generating: (" + x + ", " + y + ")";
        x = 0;
        y++;
        world.generateChunk(x, y);
    } else {
        world.status = "Idle";
    }
}

function draw(evt) {

    // Reset context
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    world.renderWorldView(mapPosition, canvas.width, canvas.height);

    context.clearRect(10, 10, 175, 300);
    drawGrid(CHUNK_SIZE, CHUNK_SIZE / 2);

    drawText("FPS: " + Math.round(fps), {x: 20, y: 30}, "#FFFFFF");
    drawText("Mouse X: " + mousePosition.x, {x: 20, y: 40}, "#FFFFFF");
    drawText("Mouse Y: " + mousePosition.y, {x: 20, y: 50}, "#FFFFFF");

    // Elevation Inspector
    const chunkReference = world.getChunkReference(mousePosition.x + mapPosition.x, mousePosition.y + mapPosition.y);

    try {
        drawText("Chunk X: " + chunkReference.Cx, {x: 20, y: 70}, "#FFFFFF");
        drawText("Chunk Y: " + chunkReference.Cy, {x: 20, y: 80}, "#FFFFFF");
        drawText("Tile X: " + chunkReference.x, {x: 20, y: 90}, "#FFFFFF");
        drawText("Tile Y: " + chunkReference.y, {x: 20, y: 100}, "#FFFFFF");

        const elevation = world.getElevation(chunkReference);
        drawText("Elevation: " + elevation, {x: 20, y: 150}, "#FFFFFF");

        const moisture = world.getMoisture(chunkReference);
        drawText("Moisture: " + moisture, {x: 20, y: 160}, "#FFFFFF");

        const latitude = world.getLatitude(chunkReference);
        drawText("Latitude: " + latitude, {x: 20, y: 170}, "#FFFFFF");

        const temperature = world.getTemperature(chunkReference);
        drawText("Temperature: " + temperature, {x: 20, y: 180}, "#FFFFFF");

        const biome = world.getBiomeValue(chunkReference);
        drawText("Biome: " + biome + " (" + tiles[biome].name + ")", {x: 20, y: 190}, "#FFFFFF");

    } catch (e) {
        console.error(e);
    }

    drawText("Map Offset X: " + mapPosition.x, {x: 20, y: 120}, "#FFFFFF");
    drawText("Map Offset Y: " + mapPosition.y, {x: 20, y: 130}, "#FFFFFF");

    drawText("Chunks Rendered: " + (world.renderedChunks + "/" + world.totalChunks), {x: 20, y: 230}, "#FFFFFF");
    drawText("Chunks Drawn: " + world.chunksDrawn, {x: 20, y: 240}, "#FFFFFF");

    drawText("Status: " + world.status, {x: 20, y: 270}, "#FFFFFF");
}

function keypress(e) {
    let code = e.keyCode;
    switch (code) {
        //case 27: throw new Error("Game terminated by user"); break//Escape
        case 37: mapPosition.x -= 50; break; //Left key
        case 38: mapPosition.y -= 50; break; //Up key
        case 39: mapPosition.x += 50; break; //Right key
        case 40: mapPosition.y += 50; break; //Down key
        case 82: mapPosition.y = 0; mapPosition.x = 0; break; //Reset Map Position
        //default: alert(code); //Everything else
    }
}

function drawText(str, position, colour) {
    const context = canvas.getContext("2d");
    context.fillStyle = colour || "#00FF00";
    context.fillText(str, position.x, position.y);
    context.closePath();
}

function getMousePos(canvas, evt) {
    let rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function mouseDrag (){
    if(mousePressed) {
        mapPosition.x -= (mousePosition.x - lastMouseClickPosition.x);
        mapPosition.y -= (mousePosition.y - lastMouseClickPosition.y);
    }
    lastMouseClickPosition = mousePosition;
}

canvas.addEventListener('mousemove', function(evt) {
    mousePosition = getMousePos(canvas, evt);
    mouseDrag();
}, false);

canvas.addEventListener('mousedown', function(evt){
    mousePressed = true;
},false);

canvas.addEventListener('mouseup', function(evt){
    mousePressed = false;
}, false);

window.addEventListener('keydown', keypress, false);
window.requestAnimationFrame(loop);
