function drawGrid(major, minor){
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
}