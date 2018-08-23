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
const MAP_SIZE = 9;

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

//TODO: Deprecate
function keypress(e) {
    game.input("keypress", e);
}

//TODO: Deprecate
window.addEventListener('keydown', keypress, false);
window.requestAnimationFrame(loop);
