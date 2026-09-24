const viewer = document.getElementById("viewer");
const viewerWrap = document.querySelector(".viewer-wrap");
const angleText = document.getElementById("angleText");
const dragHint = document.getElementById("dragHint");
const autoButton = document.getElementById("autoRotate");
const leftButton = document.getElementById("rotateLeft");
const rightButton = document.getElementById("rotateRight");

const TOTAL_FRAMES = 24;
const STEP_DEGREES = 15;

let frame = 0;
let pointerDown = false;
let lastX = 0;
let accumulated = 0;
let autoRotate = false;
let autoTimer = null;

// Preload all 24 images for smooth rotation.
const images = [];
for (let i = 1; i <= TOTAL_FRAMES; i++) {
  const image = new Image();
  image.src = `assets/360/${String(i).padStart(2, "0")}.jpg`;
  images.push(image);
}

function normalizeFrame(value) {
  return (value + TOTAL_FRAMES) % TOTAL_FRAMES;
}

function showFrame(newFrame) {
  frame = normalizeFrame(newFrame);
  viewer.src = images[frame].src;
  angleText.textContent = `${frame * STEP_DEGREES}°`;
}

function rotate(direction) {
  showFrame(frame + direction);
}

function stopAuto() {
  autoRotate = false;
  clearInterval(autoTimer);
  autoTimer = null;
  autoButton.textContent = "AUTO";
}

function startAuto() {
  autoRotate = true;
  autoButton.textContent = "STOP";

  clearInterval(autoTimer);
  autoTimer = setInterval(() => {
    rotate(1);
  }, 130);
}

viewerWrap.addEventListener("pointerdown", (event) => {
  pointerDown = true;
  lastX = event.clientX;
  accumulated = 0;
  viewerWrap.classList.add("dragging");
  stopAuto();
  dragHint.style.opacity = "0";
  viewerWrap.setPointerCapture(event.pointerId);
});

viewerWrap.addEventListener("pointermove", (event) => {
  if (!pointerDown) return;

  const movement = event.clientX - lastX;
  accumulated += movement;
  lastX = event.clientX;

  // Approximately 20 px of horizontal movement = one 15° frame.
  while (Math.abs(accumulated) >= 20) {
    if (accumulated > 0) {
      rotate(-1);
      accumulated -= 20;
    } else {
      rotate(1);
      accumulated += 20;
    }
  }
});

function endDrag(event) {
  pointerDown = false;
  viewerWrap.classList.remove("dragging");

  try {
    viewerWrap.releasePointerCapture(event.pointerId);
  } catch (_) {}
}

viewerWrap.addEventListener("pointerup", endDrag);
viewerWrap.addEventListener("pointercancel", endDrag);
viewerWrap.addEventListener("pointerleave", (event) => {
  if (pointerDown && event.buttons === 0) endDrag(event);
});

leftButton.addEventListener("click", () => {
  stopAuto();
  rotate(-1);
});

rightButton.addEventListener("click", () => {
  stopAuto();
  rotate(1);
});

autoButton.addEventListener("click", () => {
  autoRotate ? stopAuto() : startAuto();
});

document.getElementById("year").textContent = new Date().getFullYear();

showFrame(0);
