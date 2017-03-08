const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const audio = document.querySelector('audio');
const source = audioCtx.createMediaElementSource(audio);
const analyser = audioCtx.createAnalyser();

const sourceAmplitude = document.getElementById('sourceamplitude');
const currentAmplitude = document.getElementById('currentamplitude');

const scriptNode = audioCtx.createScriptProcessor(4096, 1, 1);
scriptNode.onaudioprocess = (audioProcessingEvent) => {
    const inputBuffer = audioProcessingEvent.inputBuffer;
    const outputBuffer = audioProcessingEvent.outputBuffer;

    const inputData = inputBuffer.getChannelData(0);
    const outputData = outputBuffer.getChannelData(0);

    for (let sample = 0; sample < inputBuffer.length; sample++) {
      outputData[sample] = inputData[sample];
      outputData[sample] += ((Math.random() * 2) - 1) * 0.2;
      sourceAmplitude.innerText = inputData[sample];
      currentAmplitude.innerText = outputData[sample];
    }
}

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

draw();

source.connect(scriptNode);
scriptNode.connect(analyser);
analyser.connect(audioCtx.destination);