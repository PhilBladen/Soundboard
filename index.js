const fs = require('fs');
const path = require('path');

// Create a canvas element:
let canvas = document.getElementById("canvas");
let selectedPage = 0;
// Create a context object, which contains all the methods for drawing objects:

const keysDown = {};
let renderPageOffsetX = 0;
const audioCtx = new AudioContext();

class AudioSample {
    constructor(name, buffer) {
        this.name = name;
        this.buffer = buffer;
    }
    play() {
        const source = audioCtx.createBufferSource();
        source.buffer = this.buffer;
        source.connect(audioCtx.destination);
        source.start(0);
    }
}

let audioSamples = [];

function toArrayBuffer(buffer) {
    const ab = new ArrayBuffer(buffer.length);
    const view = new Uint8Array(ab);
    for (let i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i];
    }
    return ab;
}
const audioDirectory = "P:\\House party\\Sound board\\HP Sound Board\\SoundBoard";
const files = fs.readdirSync(audioDirectory);
for (const file of files) {
    if (fs.lstatSync(path.join(audioDirectory, file)).isDirectory()) continue;
    let fileData = fs.readFileSync(path.join(audioDirectory, file), (err, data) => {
        // if (err) throw err;
        // sampleBuffer = data;
    });
    const sampleName = file.substring(0, file.lastIndexOf("."));
    audioCtx.decodeAudioData(toArrayBuffer(fileData), (buffer) => {
        audioSamples.push(new AudioSample(sampleName, buffer));
    });
}

const keyboard = [['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
['z', 'x', 'c', 'v', 'b', 'n', 'm']];

const keyboardToSampleMap = [{}, {}, {}];

function render() {
    let ctx = canvas.getContext("2d");
    ctx.resetTransform();
    ctx.fillStyle = "#fcd140";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    renderPageOffsetX += (selectedPage * window.innerWidth - renderPageOffsetX) * 0.08;

    const margin = 10;
    const buttonSize = ((window.innerWidth - margin) / keyboard[0].length) - margin;
    ctx.translate(-renderPageOffsetX, 0);
    let i = 0;
    for (let pageIndex = 0; pageIndex < 3; pageIndex++) {
        for (const lineIndex in keyboard) {
            const line = keyboard[lineIndex];
            const lineOffset = (window.innerWidth - (line.length * buttonSize + (line.length - 1) * margin)) / 2;
            for (const keyIndex in line) {
                let as = audioSamples[i++];
                if (!as) continue;
                keyboardToSampleMap[pageIndex][line[keyIndex]] = as;

                const fileName = as.name;
                const wrappedFileName = fileName.replace(/(.{13})/g, "$1\n");
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
                ctx.fillText(key.toLocaleUpperCase(), buttonStartX + buttonSize * 0.5 - textWidth * 0.5, buttonStartY + buttonSize - 10);
                ctx.font = "25px Arial";
                for (let j = 0; j < wrappedFileName.split("\n").length; j++) {
                    const line = wrappedFileName.split("\n")[j];
                    ctx.fillText(line, buttonStartX + margin, buttonStartY + 25 + j * 25);
                }
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
    else if (e.key == "ArrowRight") {
        selectedPage++;
        if (selectedPage > 2) selectedPage = 2;
    }
    else {
        keyboardToSampleMap[selectedPage][e.key.toLocaleLowerCase()]?.play();

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

document.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();

    for (const f of e.dataTransfer.files) {
        console.log('File(s) you dragged here: ', f.path)
    }
});
document.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
});