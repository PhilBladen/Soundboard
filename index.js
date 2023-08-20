const fs = require('fs');
const path = require('path');

let selectedPage = 0;
const keysDown = {};
const audioCtx = new AudioContext();
const keyboard = [['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
['z', 'x', 'c', 'v', 'b', 'n', 'm']];
const audioSlots = [];
const keyboardToSampleMap = [];

//////////// CONFIG ////////////
const mainColor = "#fcd140";
const secondaryColor = "#2b2618";
const margin = 10;
const numPages = 3;

class AudioSample {
    constructor(name, buffer) {
        this.name = name;
        this.buffer = buffer;
    }

    play(endedCallback) {
        const source = audioCtx.createBufferSource();
        source.buffer = this.buffer;
        source.connect(audioCtx.destination);
        source.start(0);
        if (endedCallback)
            source.addEventListener("ended", endedCallback);
    }
}

class AudioSlot {
    constructor(controlKey, parent, pageID) {
        this.pageID = pageID;
        this.controlKey = controlKey;
        this.numPlaying = 0;

        const div = document.createElement("div");
        this.div = div;
        div.style = "display: flex; flex-direction: column; justify-content: center; align-items: center;"
        this.resize(buttonSize);
        div.style.borderRadius = "10px";
        div.style.fontFamily = "HP";
        div.style.fontSize = "1.2vw";
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


        // window.addEventListener("keydown", (e) => {
        //     if (e.ctrlKey) {
        //         cross.style.display = "";
        //     }
        //     // else {
        //     // cross.style.display = "none";
        //     // }
        // });
        // window.addEventListener("keyup", (e) => {
        //     if (!e.ctrlKey) {
        //         cross.style.display = "none";
        //     }
        // });


        // div.innerText = as.name;
        const labelDiv = document.createElement("div");
        labelDiv.style = `display: flex; flex-direction: column; justify-content: center; align-items: center; margin-bottom: 0px; background-color: ${secondaryColor}; color: ${mainColor}; width: 100%`;
        labelDiv.innerText = controlKey.toLocaleUpperCase();
        div.appendChild(labelDiv);

        parent.appendChild(div);

        audioSlots.push(this);
    }

    resize(buttonSize) {
        this.div.style.minWidth = this.div.style.maxWidth = `${buttonSize - 10}px`;
        this.div.style.minHeight = this.div.style.maxHeight = `${buttonSize - 10}px`;
    }

    onSamplePlayEnd() {
        this.numPlaying--;
        if (this.numPlaying == 0) {
            this.div.style.backgroundColor = mainColor;
            this.div.style.color = secondaryColor;
        }
    }

    play() {
        this.sample.play(() => this.onSamplePlayEnd());
        this.div.style.backgroundColor = secondaryColor;
        this.div.style.color = mainColor;
        this.numPlaying++;
    }

    loadFile(absoluteFilePath) {
        if (!absoluteFilePath) return;
        fs.readFile(absoluteFilePath, (err, data) => {
            if (err) throw err;
            const fileName = path.basename(absoluteFilePath);
            const sampleName = fileName.substring(0, fileName.lastIndexOf("."));
            audioCtx.decodeAudioData(toArrayBuffer(data), (buffer) => {
                this.sample = new AudioSample(sampleName, buffer);
                // this.div.style.backgroundColor = secondaryColor;
                this.div.style.outlineStyle = "solid";
                this.nameDiv.innerText = sampleName;
                keyboardToSampleMap[this.pageID][this.controlKey] = this;
            });
        });
    }
}



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


const buttonSize = ((window.innerWidth - margin) / keyboard[0].length) - margin;
let i = 0;
const app = document.createElement("div");
app.id = "app";
app.style = "display: flex; flex-direction: row; justify-content: center; align-items: center; width:100%; height:100%;";
for (let pageIndex = 0; pageIndex < numPages; pageIndex++) {
    const page = document.createElement("div");
    page.style = `display: flex; flex-direction: column; justify-content: center; align-items: center; width:100%; height:100%; position: absolute; transform: translateX(${(pageIndex - selectedPage) * window.innerWidth}px); transition: transform 0.15s ease-in-out;`;
    keyboardToSampleMap.push({});
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

for (let pageIndicatorIndex = 0; pageIndicatorIndex < numPages; pageIndicatorIndex++) {
    const pageIndicator = document.createElement("div");
    pageIndicator.style = `height: 30px; width: 30px; margin: 10px; border-radius: 999px; outline: 5px solid #2b2618; outline-offset: -5px; margin-bottom: 30px; ${pageIndicatorIndex == 0 ? `background-color: ${secondaryColor}` : mainColor}`;
    pageIndicator.style.transition = "background-color 0.15s ease-in-out ";
    document.getElementById("pageIndicators").appendChild(pageIndicator);
}

function updateIndicators() {
    for (let pageIndicatorIndex = 0; pageIndicatorIndex < numPages; pageIndicatorIndex++) {
        const pageIndicator = document.getElementById("pageIndicators").children[pageIndicatorIndex];
        pageIndicator.style.backgroundColor = selectedPage == pageIndicatorIndex ? secondaryColor : mainColor;
    }
}

window.addEventListener("keydown", (e) => {
    keysDown[e.key.toLocaleLowerCase()] = true;
    if (e.key == "ArrowLeft") {
        selectedPage--;
        if (selectedPage < 0) selectedPage = 0;
    }
    else if (e.key == "ArrowRight") {
        selectedPage++;
        if (selectedPage > (numPages - 1)) selectedPage = numPages - 1;
    }
    else {
        keyboardToSampleMap[selectedPage][e.key.toLocaleLowerCase()]?.play();

    }

    for (let i = 0; i < numPages; i++) {
        document.getElementById("app").children[i].style.transform = `translateX(${(i - selectedPage) * window.innerWidth}px)`;
    }
    updateIndicators();
});
window.addEventListener("keyup", (e) => {
    keysDown[e.key.toLocaleLowerCase()] = false;
});

window.addEventListener("resize", () => {
    const buttonSize = ((window.innerWidth - margin) / keyboard[0].length) - margin;
    for (const as of audioSlots) {
        as.resize(buttonSize);
    }
    for (let i = 0; i < numPages; i++) {
        document.getElementById("app").children[i].style.transform = `translateX(${(i - selectedPage) * window.innerWidth}px)`;
    }
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