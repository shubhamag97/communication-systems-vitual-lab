const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const audio = document.querySelector('audio');
const source = audioCtx.createMediaElementSource(audio);
const analyser = audioCtx.createAnalyser();

const distortion = audioCtx.createWaveShaper();
function makeDistortionCurve(amount) {
  var k = typeof amount === 'number' ? amount : 50,
    n_samples = 44100,
    curve = new Float32Array(n_samples),
    deg = Math.PI / 180,
    i = 0,
    x;
  for ( ; i < n_samples; ++i ) {
    x = i * 2 / n_samples - 1;
    curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
  }
  return curve;
};

distortion.oversample = '4x';
distortion.curve = makeDistortionCurve(400);

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

source.connect(distortion);
distortion.connect(analyser);
analyser.connect(audioCtx.destination);

draw();