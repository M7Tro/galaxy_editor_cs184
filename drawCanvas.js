export function initDrawCanvas() {
  const drawCanvas = document.getElementById('drawCanvas');
  const drawControls = document.getElementById('drawControls');
  const generateButton = document.getElementById('generateGalaxyButton');
  let ctx = null;
  let isDrawing = false;

  function resizeDrawCanvas() {
    if (drawCanvas) {
      drawCanvas.width = window.innerWidth;
      drawCanvas.height = window.innerHeight;
      ctx = drawCanvas.getContext('2d');
      if (ctx) {
        ctx.globalAlpha = 0.7; // Set semi-transparent background
        ctx.fillStyle = 'rgb(255, 255, 255)';
        ctx.fillRect(0, 0, drawCanvas.width, drawCanvas.height);
        ctx.globalAlpha = 1.0; // Reset for drawing
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
      }
    }
  }

  function processCanvas() {
    if (!ctx) return;
    const width = 100; // Match generateArray.js dimensions
    const height = 100;
    const imageData = ctx.getImageData(0, 0, drawCanvas.width, drawCanvas.height);
    const data = Array(height).fill().map(() => Array(width).fill(0));

    // Downsample canvas to 100x100 array
    const scaleX = drawCanvas.width / width;
    const scaleY = drawCanvas.height / height;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const px = Math.floor(x * scaleX);
        const py = Math.floor(y * scaleY);
        const index = (py * imageData.width + px) * 4;
        // Use red channel (grayscale) and invert (black = high intensity)
        data[y][x] = 1 - (imageData.data[index] / 255); // Invert: black (0) -> 1, white (255) -> 0
      }
    }

    const arrayData = { data, width, height };
    window.processCanvasInput(arrayData);
  }

  if (drawCanvas) {
    resizeDrawCanvas();

    drawCanvas.addEventListener('mousedown', (e) => {
      if (ctx) {
        isDrawing = true;
        ctx.beginPath();
        ctx.moveTo(e.clientX, e.clientY);
      }
    });

    drawCanvas.addEventListener('mousemove', (e) => {
      if (isDrawing && ctx) {
        ctx.lineTo(e.clientX, e.clientY);
        ctx.stroke();
      }
    });

    drawCanvas.addEventListener('mouseup', () => {
      isDrawing = false;
      if (ctx) ctx.closePath();
    });

    drawCanvas.addEventListener('mouseout', () => {
      isDrawing = false;
      if (ctx) ctx.closePath();
    });

    window.addEventListener('resize', resizeDrawCanvas);
  }

  if (generateButton) {
    generateButton.addEventListener('click', () => {
      processCanvas();
      if (drawCanvas && drawControls) {
        drawCanvas.classList.remove('active');
        drawControls.classList.remove('active');
        document.getElementById('controls').style.display = 'block';
      }
    });
  }
}