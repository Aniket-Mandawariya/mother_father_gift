const revealElements = document.querySelectorAll(
  ".hero-content, .hero-visual, .hero-cards, .blessing-strip, .intro-panel, .intro-stats, .section-heading, .gallery-banner, .memory-card, .story-panel, .timeline-item, .message-card, .closing-card"
);

revealElements.forEach((element) => {
  element.setAttribute("data-reveal", "");
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.16,
    rootMargin: "0px 0px -40px 0px",
  }
);

revealElements.forEach((element) => observer.observe(element));

const musicToggles = document.querySelectorAll("[data-music-toggle]");
let audioContext;
let masterGain;
let sequenceTimer;
let activeOscillators = [];
let isPlaying = false;

const melody = [
  { notes: [523.25, 659.25, 783.99], duration: 1.4 },
  { notes: [587.33, 698.46, 880.0], duration: 1.4 },
  { notes: [659.25, 783.99, 987.77], duration: 1.4 },
  { notes: [698.46, 880.0, 1046.5], duration: 1.6 },
  { notes: [659.25, 783.99, 987.77], duration: 1.4 },
  { notes: [587.33, 698.46, 880.0], duration: 1.4 },
  { notes: [523.25, 659.25, 783.99], duration: 1.8 },
];

function ensureAudioContext() {
  if (!audioContext) {
    audioContext = new window.AudioContext();
    masterGain = audioContext.createGain();
    masterGain.gain.value = 0.34;
    masterGain.connect(audioContext.destination);
  }
}

function stopCurrentOscillators() {
  activeOscillators.forEach(({ oscillator, gainNode }) => {
    try {
      gainNode.gain.cancelScheduledValues(audioContext.currentTime);
      gainNode.gain.setTargetAtTime(0.0001, audioContext.currentTime, 0.12);
      oscillator.stop(audioContext.currentTime + 0.25);
    } catch (_) {
      // Ignore already-stopped oscillators.
    }
  });
  activeOscillators = [];
}

function playChord(notes, duration) {
  stopCurrentOscillators();

  notes.forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = index === 0 ? "sine" : "triangle";
    oscillator.frequency.value = frequency;

    gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.14, audioContext.currentTime + 0.32);
    gainNode.gain.setTargetAtTime(0.0001, audioContext.currentTime + Math.max(duration - 0.35, 0.6), 0.22);

    oscillator.connect(gainNode);
    gainNode.connect(masterGain);
    oscillator.start();

    activeOscillators.push({ oscillator, gainNode });
  });
}

function startMelody() {
  ensureAudioContext();

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  let index = 0;

  const scheduleNext = () => {
    if (!isPlaying) {
      return;
    }

    const step = melody[index];
    playChord(step.notes, step.duration);
    index = (index + 1) % melody.length;
    sequenceTimer = window.setTimeout(scheduleNext, step.duration * 1000);
  };

  scheduleNext();
}

function stopMelody() {
  window.clearTimeout(sequenceTimer);
  if (audioContext) {
    stopCurrentOscillators();
  }
}

function updateMusicButton() {
  musicToggles.forEach((button) => {
    const isDockButton = button.classList.contains("dock-music");
    button.textContent = isPlaying
      ? isDockButton ? "Pause" : "Pause Lovely Tune"
      : isDockButton ? "Tune" : "Play Lovely Tune";
    button.classList.toggle("is-playing", isPlaying);
    button.setAttribute("aria-pressed", String(isPlaying));
  });
}

musicToggles.forEach((button) => {
  button.addEventListener("click", () => {
    isPlaying = !isPlaying;

    if (isPlaying) {
      startMelody();
    } else {
      stopMelody();
    }

    updateMusicButton();
  });
});

updateMusicButton();

const parallaxCard = document.querySelector("[data-parallax]");

parallaxCard?.addEventListener("pointermove", (event) => {
  const rect = parallaxCard.getBoundingClientRect();
  const offsetX = (event.clientX - rect.left) / rect.width - 0.5;
  const offsetY = (event.clientY - rect.top) / rect.height - 0.5;

  parallaxCard.style.transform =
    `perspective(1000px) rotateX(${offsetY * -6}deg) rotateY(${offsetX * 8}deg) translateZ(0)`;
});

parallaxCard?.addEventListener("pointerleave", () => {
  parallaxCard.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
});
