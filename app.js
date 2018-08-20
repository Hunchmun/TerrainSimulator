const canvas = document.getElementById("dashboard");

let previous = null;
let fps = 0;

const nodes = [
    "#00ff00",
    "#0000ff"
];

const screenSettings = {
    height: 900,
    width: 1600,
    unitSize: 100,
};

const mapPosition = {
    x: 0,
    y: 0
};

let mousePosition = {
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

let x = 0; let y = 0;
function update(elapsed) {
    fps = 1000 / elapsed;

    // Generate world 1 chunk per loop
    if (x < MAP_SIZE * 2) {
        world.generateChunk(x, y);
        x++;
    } else if (y < MAP_SIZE) {
        x = 0;
        y++;
        world.generateChunk(x, y);
    }
}

function draw(evt) {

    // Reset context
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    world.renderWorldView(mapPosition, 500, 500);//canvas.width, canvas.height);

    context.clearRect(10, 10, 175, 300);
    drawGrid(screenSettings.unitSize, screenSettings.unitSize / 2);

    drawText("FPS: " + Math.round(fps), {x: 20, y: 30}, "#FFFFFF");
    drawText("Mouse X: " + mousePosition.x, {x: 20, y: 40}, "#FFFFFF");
    drawText("Mouse Y: " + mousePosition.y, {x: 20, y: 50}, "#FFFFFF");

    // Elevation Inspector
    const chunkReference = world.getChunkReference(mousePosition.x - mapPosition.x, mousePosition.y - mapPosition.y);

    try {

        drawText("Chunk X: " + chunkReference.Cx, {x: 20, y: 70}, "#FFFFFF");
        drawText("Chunk Y: " + chunkReference.Cy, {x: 20, y: 80}, "#FFFFFF");
        drawText("Block X: " + chunkReference.x, {x: 20, y: 90}, "#FFFFFF");
        drawText("Block Y: " + chunkReference.y, {x: 20, y: 100}, "#FFFFFF");

        const elevation = world.getElevation(chunkReference);
        const moisture = world.getMoisture(chunkReference);
        const latitude = world.getLatitude(chunkReference);
        const temperature = world.getTemperature(chunkReference);
        const biome = world.getBiome(elevation, moisture, temperature);

        drawText("Elevation: " + elevation, {x: 20, y: 150}, "#FFFFFF");
        drawText("Moisture: " + moisture, {x: 20, y: 160}, "#FFFFFF");
        drawText("Biome: " + biome + " (" + tiles[biome].name + ")", {x: 20, y: 170}, "#FFFFFF");
        drawText("Latitude: " + latitude, {x: 20, y: 180}, "#FFFFFF");
        drawText("Temperature: " + temperature, {x: 20, y: 190}, "#FFFFFF");

        // Debug

    } catch (e) {
        console.error(e);
    }


    drawText("Map Offset X: " + mapPosition.x, {x: 20, y: 120}, "#FFFFFF");
    drawText("Map Offset Y: " + mapPosition.y, {x: 20, y: 130}, "#FFFFFF");

    drawText("Chunks Rendered: " + (world.renderedChunks === world.totalChunks ? "Complete!" : world.renderedChunks + "/" + world.totalChunks), {x: 20, y: 210}, "#FFFFFF")

    drawText("=DEBUG=", {x: 20, y: 240}, "#FF0000");

    const TLChunkReference = world.getChunkReference(mapPosition.x, mapPosition.y);
    const TRChunkReference = world.getChunkReference(mapPosition.x + canvas.width, mapPosition.y);
    const BLChunkReference = world.getChunkReference(mapPosition.x + canvas.width, mapPosition.y + canvas.height);
    const BRChunkReference = world.getChunkReference(mapPosition.x, mapPosition.y + canvas.height);
    drawText("Map Position Top Left: " + TLChunkReference.Cx + ", " + TLChunkReference.Cy, {x: 20, y: 260}, "#FF0000");
    drawText("Map Position Top Left: " + TRChunkReference.Cx + ", " + TRChunkReference.Cy, {x: 20, y: 270}, "#FF0000");
    drawText("Map Position Top Left: " + BLChunkReference.Cx + ", " + BLChunkReference.Cy, {x: 20, y: 280}, "#FF0000");
    drawText("Map Position Top Left: " + BRChunkReference.Cx + ", " + BRChunkReference.Cy, {x: 20, y: 290}, "#FF0000");


}

function keypress(e) {
    let code = e.keyCode;
    switch (code) {
        //case 27: throw new Error("Game terminated by user"); break//Escape
        case 37: mapPosition.x += 50; break; //Left key
        case 38: mapPosition.y += 50; break; //Up key
        case 39: mapPosition.x -= 50; break; //Right key
        case 40: mapPosition.y -= 50; break; //Down key
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

canvas.addEventListener('mousemove', function(evt) {
    mousePosition = getMousePos(canvas, evt);
}, false);

window.addEventListener('keydown', keypress, false);
window.requestAnimationFrame(loop);