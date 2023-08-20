const fs = require('fs');
const path = require('path');

let selectedPage = 0;
const keysDown = {};
let renderPageOffsetX = 0;
const audioCtx = new AudioContext();
const keyboard = [['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
['z', 'x', 'c', 'v', 'b', 'n', 'm']];

const mainColor = "#fcd140";
const secondaryColor = "#2b2618";

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

class AudioSlot {
    constructor(controlKey, parent, pageID) {
        this.pageID = pageID;
        this.controlKey = controlKey;

        const div = document.createElement("div");
        div.style = "display: flex; flex-direction: column; justify-content: center; align-items: center;"
        div.style.minWidth = div.style.maxWidth = `${buttonSize - 10}px`;
        div.style.minHeight = div.style.maxHeight = `${buttonSize - 10}px`;
        div.style.borderRadius = "10px";
        div.style.fontFamily = "HP";
        div.style.fontSize = "25px";
        div.style.textAlign = "center";
        div.style.verticalAlign = "middle";
        div.style.cursor = "pointer";
        div.style.overflow = "hidden";
        // div.style.backgroundColor = "#2b2618";

        // div.style.border = "none";
        // div.style.flexGrow = 1;
        div.style.margin = "5px";
        div.style.padding = "5px";
        div.style.outline = "5px dashed #2b2618";
        div.style.outlineOffset = "-5px";

        const cross = document.getElementById("cross").cloneNode(true);
        cross.id = "";
        // cross.style.display = "";
        div.appendChild(cross);

        this.nameDiv = document.createElement("div");
        this.nameDiv.style = "display: flex; flex-direction: column; justify-content: center; align-items: center; margin-bottom: 0px; flex: 1; overflow: hidden;"
        this.nameDiv.style.textOverflow = "ellipsis";
        // this.nameDiv.innerText = controlKey.toLocaleUpperCase();
        div.appendChild(this.nameDiv);

        this.div = div;

        // Detect control modifier key press:
        window.addEventListener("keydown", (e) => {
            if (e.ctrlKey) {
                cross.style.display = "";
            }
            // else {
            // cross.style.display = "none";
            // }
        });
        window.addEventListener("keyup", (e) => {
            if (!e.ctrlKey) {
                cross.style.display = "none";
            }
        });


        // div.innerText = as.name;
        const labelDiv = document.createElement("div");
        labelDiv.style = "display: flex; flex-direction: column; justify-content: center; align-items: center; margin-bottom: 0px;";
        labelDiv.innerText = controlKey.toLocaleUpperCase();
        div.appendChild(labelDiv);

        parent.appendChild(div);
    }

    loadFile(absoluteFilePath) {
        if (!absoluteFilePath) return;
        fs.readFile(absoluteFilePath, (err, data) => {
            if (err) throw err;
            const fileName = path.basename(absoluteFilePath);
            const sampleName = fileName.substring(0, fileName.lastIndexOf("."));
            audioCtx.decodeAudioData(toArrayBuffer(data), (buffer) => {
                const as = new AudioSample(sampleName, buffer);
                // this.div.style.backgroundColor = secondaryColor;
                this.div.style.outlineStyle = "solid";
                this.nameDiv.innerText = sampleName;
                keyboardToSampleMap[this.pageID][this.controlKey] = as;
            });
        });
    }
}

let audioSamples = [];
const keyboardToSampleMap = [{}, {}, {}];

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
const validAudioFiles = [];
for (const file of files) {
    if (fs.lstatSync(path.join(audioDirectory, file)).isDirectory()) continue;
    validAudioFiles.push(path.join(audioDirectory, file));
}



document.body.style.backgroundColor = mainColor;

const margin = 10;
const buttonSize = ((window.innerWidth - margin) / keyboard[0].length) - margin;
let i = 0;
const app = document.createElement("div");
app.id = "app";
app.style = "display: flex; flex-direction: row; justify-content: center; align-items: center; width:100%; height:100%;";
for (let pageIndex = 0; pageIndex < 3; pageIndex++) {
    const page = document.createElement("div");
    page.style = "display: flex; flex-direction: column; justify-content: center; align-items: center; width:100%; height:100%; position: absolute; transition: transform 0.15s ease-in-out;";
    for (const lineIndex in keyboard) {
        const row = document.createElement("div");
        row.style = "display: flex; flex-direction: row; justify-content: center; align-items: center;";
        const line = keyboard[lineIndex];
        for (const keyIndex in line) {
            const key = line[keyIndex];
            // if (validAudioFiles[i])/
            new AudioSlot(key, row, pageIndex).loadFile(validAudioFiles[i++]);

            // button.addEventListener("click", () => {
            // keyboardToSampleMap[selectedPage][key]?.play();
            // });
            // document.body.appendChild(button);
            // row.appendChild(button);
        }
        page.appendChild(row);
    }
    app.appendChild(page);
}
document.body.appendChild(app);

for (let pageIndicatorIndex = 0; pageIndicatorIndex < 3; pageIndicatorIndex++) {
    const pageIndicator = document.createElement("div");
    pageIndicator.style = `height: 30px; width: 30px; margin: 10px; border-radius: 999px; outline: 5px solid #2b2618; outline-offset: -5px; margin-bottom: 30px; ${pageIndicatorIndex == 0 ? `background-color: ${secondaryColor}` : mainColor}`;
    pageIndicator.style.transition = "background-color 0.15s ease-in-out ";
    document.getElementById("pageIndicators").appendChild(pageIndicator);
}

function updateIndicators() {
    for (let pageIndicatorIndex = 0; pageIndicatorIndex < 3; pageIndicatorIndex++) {
        const pageIndicator = document.getElementById("pageIndicators").children[pageIndicatorIndex];
        pageIndicator.style.backgroundColor = selectedPage == pageIndicatorIndex ? secondaryColor : mainColor;
    }
}

// function render() {
//     let ctx = canvas.getContext("2d");
//     ctx.resetTransform();
//     ctx.fillStyle = "#fcd140";
//     ctx.fillRect(0, 0, canvas.width, canvas.height);

//     renderPageOffsetX += (selectedPage * window.innerWidth - renderPageOffsetX) * 0.08;

//     const margin = 10;
//     const buttonSize = ((window.innerWidth - margin) / keyboard[0].length) - margin;
//     ctx.translate(-renderPageOffsetX, 0);
//     let i = 0;
//     for (let pageIndex = 0; pageIndex < 3; pageIndex++) {
//         for (const lineIndex in keyboard) {
//             const line = keyboard[lineIndex];
//             const lineOffset = (window.innerWidth - (line.length * buttonSize + (line.length - 1) * margin)) / 2;
//             for (const keyIndex in line) {
//                 let as = audioSamples[i++];
//                 if (!as) continue;
//                 keyboardToSampleMap[pageIndex][line[keyIndex]] = as;

//                 const fileName = as.name;
//                 const wrappedFileName = fileName.replace(/(.{13})/g, "$1\n");
//                 const key = line[keyIndex];
//                 const buttonStartX = lineOffset + keyIndex * (buttonSize + margin);
//                 const buttonStartY = lineIndex * (buttonSize + margin) + 230;
//                 ctx.fillStyle = keysDown[key] ? "#aa9e6b" : "#2b2618";
//                 ctx.beginPath();
//                 ctx.roundRect(buttonStartX, buttonStartY, buttonSize, buttonSize, 10);
//                 ctx.fill();

//                 ctx.fillStyle = "#fcd140";
//                 ctx.font = "30px HP";
//                 const textWidth = ctx.measureText(key).width;
//                 ctx.fillText(key.toLocaleUpperCase(), buttonStartX + buttonSize * 0.5 - textWidth * 0.5, buttonStartY + buttonSize - 10);
//                 ctx.font = "25px HP";
//                 for (let j = 0; j < wrappedFileName.split("\n").length; j++) {
//                     const line = wrappedFileName.split("\n")[j];
//                     ctx.fillText(line, buttonStartX + margin, buttonStartY + 25 + j * 25);
//                 }
//             }
//         }
//         ctx.translate(window.innerWidth, 0);
//     }
//     ctx.resetTransform();

//     // Draw three small dots below the rectangles:
//     ctx.translate(canvas.width * 0.5, canvas.height - 50);
//     for (let i = -1; i <= 1; i++) {
//         ctx.fillStyle = "#2b2618";
//         ctx.beginPath();
//         ctx.arc(i * 50, 0, 13, 0, 2 * Math.PI);
//         ctx.fill();
//         ctx.fillStyle = selectedPage == (i + 1) ? "#2b2618" : "#fcd140";
//         ctx.beginPath();
//         ctx.arc(i * 50, 0, 10, 0, 2 * Math.PI);
//         ctx.fill();
//     }
// }

// const animFrame = () => window.requestAnimationFrame(() => {
//     render();
//     animFrame();
// });
// animFrame();
// render();

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

    for (let i = 0; i < 3; i++) {
        document.getElementById("app").children[i].style.transform = `translateX(${(i - selectedPage) * window.innerWidth}px)`;
    }
    // document.getElementById("app").children style.translateX = selectedPage * window.innerWidth;
    updateIndicators();
});
window.addEventListener("keyup", (e) => {
    keysDown[e.key.toLocaleLowerCase()] = false;
});

// canvas.width = window.innerWidth;
// canvas.height = window.innerHeight;

// window.addEventListener("resize", () => {
//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;
//     render();
// });

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