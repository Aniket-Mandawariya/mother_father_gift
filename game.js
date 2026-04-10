const stage = document.getElementById("gameStage");
const runnerButton = document.getElementById("runnerButton");
const tryNote = document.getElementById("tryNote");
const homeWin = document.getElementById("homeWin");

let attempts = 0;
let escaped = false;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function moveRunner() {
  if (!stage || !runnerButton || escaped) {
    return;
  }

  const stageRect = stage.getBoundingClientRect();
  const buttonRect = runnerButton.getBoundingClientRect();
  const padding = 20;
  const maxX = stageRect.width - buttonRect.width - padding;
  const maxY = stageRect.height - buttonRect.height - padding;
  const nextX = Math.random() * Math.max(maxX - padding, 40) + padding;
  const nextY = Math.random() * Math.max(maxY - 120, 120) + 90;

  runnerButton.style.left = `${clamp(nextX, padding, maxX)}px`;
  runnerButton.style.top = `${clamp(nextY, 90, maxY)}px`;
  runnerButton.style.transform = "translate(0, 0)";
}

function registerAttempt() {
  attempts += 1;
  tryNote.textContent = `Attempts: ${attempts}`;

  if (attempts < 4) {
  } else if (attempts < 8) {
  } else {
    escaped = true;
    runnerButton.style.opacity = "0";
    runnerButton.style.pointerEvents = "none";
    homeWin.classList.add("is-visible");
    homeWin.setAttribute("aria-hidden", "false");
  }
}

function maybeRunAway(event) {
  if (!stage || !runnerButton || escaped) {
    return;
  }

  const buttonRect = runnerButton.getBoundingClientRect();
  const dx = event.clientX - (buttonRect.left + buttonRect.width / 2);
  const dy = event.clientY - (buttonRect.top + buttonRect.height / 2);
  const distance = Math.hypot(dx, dy);

  if (distance < 140) {
    registerAttempt();
    moveRunner();
  }
}

runnerButton?.addEventListener("mouseenter", (event) => {
  if (escaped) {
    return;
  }
  registerAttempt();
  moveRunner();
});

runnerButton?.addEventListener("click", (event) => {
  event.preventDefault();
  if (escaped) {
    return;
  }
  registerAttempt();
  moveRunner();
});

stage?.addEventListener("pointermove", maybeRunAway);
window.addEventListener("resize", () => {
  if (!escaped) {
    moveRunner();
  }
});

moveRunner();
