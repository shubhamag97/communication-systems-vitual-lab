const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const source = audioCtx.createOscillator();
const modulator = audioCtx.createOscillator();
const analyser = audioCtx.createAnalyser();
const merger = audioCtx.createChannelMerger(2);

const sourceAmplitude = document.getElementById('sourceamplitude');
const currentAmplitude = document.getElementById('currentamplitude');

const scriptNode = audioCtx.createScriptProcessor(4096, 2, 1);
scriptNode.onaudioprocess = (audioProcessingEvent) => {
    const inputBuffer = audioProcessingEvent.inputBuffer;
    const outputBuffer = audioProcessingEvent.outputBuffer;

    const sourceData = inputBuffer.getChannelData(0);
    const modulatorData = inputBuffer.getChannelData(1);
    const outputData = outputBuffer.getChannelData(0);

    for (let sample = 0; sample < inputBuffer.length; sample++) {
      outputData[sample] = (sourceData[sample] + 0.5 * modulatorData[sample]) / 2;
      sourceAmplitude.innerText = sourceData[sample];
      currentAmplitude.innerText = outputData[sample];
    }
}

source.type = 'sine';
source.frequency.value = 100;
modulator.type = 'sine';
modulator.frequency.value = 150;

analyser.fftSize = 2048;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

const canvas = document.getElementById("visualizer");
const canvasCtx = canvas.getContext("2d");

function draw() {
  drawVisual = requestAnimationFrame(draw);
  analyser.getByteTimeDomainData(dataArray);

  canvasCtx.fillStyle = 'rgb(200, 200, 200)';
  canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

  canvasCtx.lineWidth = 2;
  canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

  canvasCtx.beginPath();

  const sliceWidth = canvas.width * 1.0 / bufferLength;
  let x = 0;

  for (let i = 0; i < bufferLength; i++) {
    const v = dataArray[i] / 128.0;
    const y = v * canvas.height / 2;

    if (i === 0) {
      canvasCtx.moveTo(x, y);
    } else {
      canvasCtx.lineTo(x, y);
    }
    x += sliceWidth;
  }

  canvasCtx.lineTo(canvas.width, canvas.height / 2);
  canvasCtx.stroke();
};

source.connect(merger, 0, 0);
modulator.connect(merger, 0, 1);
merger.connect(scriptNode);
scriptNode.connect(analyser);
analyser.connect(audioCtx.destination);

draw();

source.start();
modulator.start();