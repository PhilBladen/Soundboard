// Create a canvas element:
let canvas = document.getElementById("canvas");
let selectedPage = 0;
// Create a context object, which contains all the methods for drawing objects:

let sampleBuffer = null;

const keysDown = {};
let renderPageOffsetX = 0;

function render() {
    let ctx = canvas.getContext("2d");
    ctx.resetTransform();
    ctx.fillStyle = "#fcd140";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const keyboard = [['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '{', '}'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', '@'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm', '<', '>', '?']];

    renderPageOffsetX += (selectedPage * window.innerWidth - renderPageOffsetX) * 0.08;

    const margin = 10;
    const buttonSize = ((window.innerWidth - margin) / keyboard[0].length) - margin;
    ctx.translate(-renderPageOffsetX, 0);
    for (let pageIndex = 0; pageIndex < 3; pageIndex++) {
        for (const lineIndex in keyboard) {
            const line = keyboard[lineIndex];
            const lineOffset = (window.innerWidth - (line.length * buttonSize + (line.length - 1) * margin)) / 2;
            for (const keyIndex in line) {
                const key = line[keyIndex];
                const buttonStartX = lineOffset + keyIndex * (buttonSize + margin);
                const buttonStartY = lineIndex * (buttonSize + margin) + 230;
                ctx.fillStyle = keysDown[key] ? "#aa9e6b" : "#2b2618";
                ctx.beginPath();
                ctx.roundRect(buttonStartX, buttonStartY, buttonSize, buttonSize, 10);
                ctx.fill();
                ctx.fillStyle = "#fcd140";
                ctx.font = "30px Arial";
                const textWidth = ctx.measureText(key).width;
                ctx.fillText(key, buttonStartX + buttonSize * 0.5 - textWidth * 0.5, buttonStartY + buttonSize - 10);
            }
        }
        ctx.translate(window.innerWidth, 0);
    }
    ctx.resetTransform();

    // Draw three small dots below the rectangles:
    ctx.translate(canvas.width * 0.5, canvas.height - 50);
    for (let i = -1; i <= 1; i++) {
        ctx.fillStyle = "#2b2618";
        ctx.beginPath();
        ctx.arc(i * 50, 0, 13, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = selectedPage == (i + 1) ? "#2b2618" : "#fcd140";
        ctx.beginPath();
        ctx.arc(i * 50, 0, 10, 0, 2 * Math.PI);
        ctx.fill();
    }
}

const animFrame = () => window.requestAnimationFrame(() => {
    render();
    animFrame();
});
animFrame();

window.addEventListener("keydown", (e) => {
    keysDown[e.key.toLocaleLowerCase()] = true;
    if (e.key == "ArrowLeft") {
        selectedPage--;
        if (selectedPage < 0) selectedPage = 0;
    }
    if (e.key == "ArrowRight") {
        selectedPage++;
        if (selectedPage > 2) selectedPage = 2;
    }
});
window.addEventListener("keyup", (e) => {
    keysDown[e.key.toLocaleLowerCase()] = false;
});

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    render();
});