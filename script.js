/* =====================================================================
   CONFIG
   Everything personal lives here. Swap NAME, episode text, and image /
   video paths to make this someone else's story.

   To use real photos: drop files into an /assets folder next to this
   script and change `art` to something like "assets/photo1.jpg" — the
   code already supports real <img> sources as well as the gradient
   placeholders used below.
   ===================================================================== */
const CONFIG = {
  name: "Juno",

  // gradient "posters" stand in for real photos until you add your own
  placeholderGradients: [
    "linear-gradient(135deg,#3a1411,#0b0b0b)",
    "linear-gradient(135deg,#1f2a3a,#0b0b0b)",
    "linear-gradient(135deg,#3a2e11,#0b0b0b)",
    "linear-gradient(135deg,#102f2a,#0b0b0b)",
    "linear-gradient(135deg,#2a113a,#0b0b0b)",
    "linear-gradient(135deg,#3a1130,#0b0b0b)",
  ],

  rows: {
    continue: {
      track: "#row-continue .row__track",
      episodes: [
        {
          ep: "Episode 6",
          title: "Right Where We Left Off",
          desc: "A quiet evening, a long conversation, and the feeling that some stories don't need an ending — just a pause.",
          progress: 62,
          image: "",
          videoUrl: ""
        }
      ]
    },
    memories: {
      track: "#row-memories .row__track",
      episodes: [
        {
          ep: "Episode 1",
          title: "The First Conversation",
          desc: "Two strangers, one conversation that somehow never really stopped.",
          image: "",
          videoUrl: ""
        },
        {
          ep: "Episode 2",
          title: "The First Selfie",
          desc: "Bad lighting, worse angle, and a photo that still makes the group chat laugh.",
          image: "",
          videoUrl: ""
        },
        {
          ep: "Episode 3",
          title: "Late Night Talks",
          desc: "The hours after midnight, when the real conversations finally show up.",
          image: "",
          videoUrl: ""
        },
        {
          ep: "Episode 4",
          title: "The Best Day Together",
          desc: "No plan, no schedule, and somehow the best day of the year.",
          image: "",
          videoUrl: ""
        }
      ]
    },
    moments: {
      track: "#row-moments .row__track",
      episodes: [
        {
          ep: "Scene 1",
          title: "The Inside Joke",
          desc: "Still not funny to anyone else. Still funny to us.",
          image: "assets/img2.webp",
          videoUrl: "assets/video2.mp4"
        },
        {
          ep: "Scene 2",
          title: "That One Road Trip",
          desc: "Wrong turns, the right playlist, and a story we keep retelling.",
          image: "",
          videoUrl: ""
        },
        {
          ep: "Scene 3",
          title: "The Surprise",
          desc: "A plan kept secret for weeks, and a reaction worth every bit of it.",
          image: "",
          videoUrl: ""
        },
        {
          ep: "Scene 4",
          title: "Just an Ordinary Tuesday",
          desc: "Nothing happened. It was perfect anyway.",
          image: "",
          videoUrl: ""
        }
      ]
    }
  },

  // the final, locked episode
  birthdayMessage:
    "Every season needs a finale worth waiting for — and this one is yours. " +
    "Thank you for every late-night talk, every inside joke, and every ordinary " +
    "day you made feel like a good episode. Here's to the next season being " +
    "even better than this one. Happy birthday.",
  birthdayVideoUrl: "assets/video.mp4",

  songTitle: "Our Theme Song"
};

/* =====================================================================
   INIT
   ===================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  applyName();
  renderRows();
  initTopNavScroll();
  initHeroButtons();
  initCardObserver();
  initModal();
  initSpecialEpisode();
  initMusicPlayer();
});

/* ---- name injection ---- */
function applyName() {
  document.getElementById("heroName").textContent = CONFIG.name.toUpperCase();
  document.getElementById("creditsName").textContent = CONFIG.name;
  document.title = `The Story of ${CONFIG.name} — An Original`;
  document.getElementById("birthdayMessage").textContent = CONFIG.birthdayMessage;
  document.getElementById("playerSong").textContent = CONFIG.songTitle;
}

/* =====================================================================
   CARD RENDERING
   Builds each row's cards from CONFIG so content and markup stay in
   sync without hand-editing the HTML for every memory.
   ===================================================================== */
function renderRows() {
  let gradientIndex = 0;

  Object.values(CONFIG.rows).forEach((row) => {
    const track = document.querySelector(row.track);
    if (!track) return;

    row.episodes.forEach((episode) => {
      const gradient = CONFIG.placeholderGradients[gradientIndex % CONFIG.placeholderGradients.length];
      gradientIndex++;

      const card = document.createElement("article");
      card.className = "card";
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", `Play ${episode.title}`);

      // store episode data on the element so the modal can read it on click
      card.dataset.title = episode.title;
      card.dataset.desc = episode.desc;
      card.dataset.ep = episode.ep;
      card.dataset.video = episode.videoUrl || "";
      card.dataset.image = episode.image || "";
      card.dataset.gradient = gradient;

      const timecode = randomTimecode();

      // poster priority: real image > video first-frame > gradient placeholder
      let posterMarkup;
      if (episode.image) {
        posterMarkup = `<img class="placeholder-art" src="${episode.image}" alt="${episode.title}">`;
      } else if (episode.videoUrl) {
        posterMarkup = `<video class="placeholder-art" muted preload="metadata" playsinline src="${episode.videoUrl}#t=0.1"></video>`;
      } else {
        posterMarkup = `<div class="placeholder-art" style="background:${gradient}"></div>`;
      }

      card.innerHTML = `
        <div class="card__poster">
          ${posterMarkup}
          <div class="card__scrim"></div>
          <div class="card__glow"></div>
          <span class="card__timecode">${timecode}</span>
          ${episode.progress ? `<div class="card__progress"><span style="width:${episode.progress}%"></span></div>` : ""}
        </div>
        <div class="card__body">
          <p class="card__ep">${episode.ep}</p>
          <h3 class="card__title">${episode.title}</h3>
          <p class="card__desc">${episode.desc}</p>
        </div>
      `;

      card.addEventListener("click", () => openModal(card.dataset));
      card.addEventListener("keypress", (e) => {
        if (e.key === "Enter" || e.key === " ") openModal(card.dataset);
      });

      track.appendChild(card);
    });
  });
}

// generates a believable-looking runtime timecode like a scrubber position
function randomTimecode() {
  const minutes = Math.floor(Math.random() * 40) + 2;
  const seconds = Math.floor(Math.random() * 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/* =====================================================================
   SCROLL-TRIGGERED CARD REVEAL
   ===================================================================== */
function initCardObserver() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  document.querySelectorAll(".card").forEach((card) => observer.observe(card));
}

/* =====================================================================
   TOP NAV — adds a solid background once the hero has scrolled past
   ===================================================================== */
function initTopNavScroll() {
  const nav = document.getElementById("topnav");
  const onScroll = () => {
    nav.classList.toggle("scrolled", window.scrollY > 80);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* =====================================================================
   HERO BUTTONS
   ===================================================================== */
function initHeroButtons() {
  document.getElementById("scrollCue").addEventListener("click", () => {
    document.getElementById("row-continue").scrollIntoView({ behavior: "smooth" });
  });

  // "Play" opens the first / most recent episode
  document.getElementById("heroPlay").addEventListener("click", () => {
    const firstCard = document.querySelector(".card");
    if (firstCard) openModal(firstCard.dataset);
  });

  // "More Info" scrolls to the memories row
  document.getElementById("heroInfo").addEventListener("click", () => {
    document.getElementById("row-memories").scrollIntoView({ behavior: "smooth" });
  });
}

/* =====================================================================
   MODAL ("PLAYER") EXPERIENCE
   ===================================================================== */
function initModal() {
  const modal = document.getElementById("modal");
  modal.querySelectorAll("[data-close]").forEach((el) => {
    el.addEventListener("click", closeModal);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

function openModal(data) {
  const modal = document.getElementById("modal");
  document.getElementById("modalEyebrow").textContent = data.ep.toUpperCase();
  document.getElementById("modalTitle").textContent = data.title;
  document.getElementById("modalDesc").textContent = data.desc;

  const media = document.getElementById("modalMedia");
  if (data.video) {
    // a real video file/URL is attached — play it directly inside the page
    media.innerHTML = `<video controls playsinline src="${data.video}"></video>`;
  } else if (data.image) {
    media.innerHTML = `<img class="placeholder-art" src="${data.image}" alt="${data.title}">`;
  } else {
    // no media yet — show the gradient poster instead
    media.innerHTML = `<div class="placeholder-art" style="background:${data.gradient}"></div>`;
  }

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  const modal = document.getElementById("modal");
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";

  // stop any playing video so it doesn't keep running in the background
  const video = modal.querySelector("video");
  if (video) video.pause();
}

/* =====================================================================
   SPECIAL EPISODE — locked finale
   ===================================================================== */
function initSpecialEpisode() {
  const unlockBtn = document.getElementById("unlockBtn");
  const locked = document.getElementById("specialLocked");
  const unlocked = document.getElementById("specialUnlocked");

  unlockBtn.addEventListener("click", () => {
    locked.classList.add("hidden");
    unlocked.classList.remove("hidden");
    launchConfetti();
  });

  document.getElementById("watchVideoBtn").addEventListener("click", () => {
    const btn = document.getElementById("watchVideoBtn");
    const wrap = document.getElementById("specialVideoWrap");

    if (CONFIG.birthdayVideoUrl) {
      // build and play the video directly inside the page
      wrap.innerHTML = `<video controls autoplay playsinline src="${CONFIG.birthdayVideoUrl}"></video>`;
      wrap.classList.remove("hidden");
      btn.classList.add("hidden");
    } else {
      const original = btn.innerHTML;
      btn.textContent = "No video added yet";
      setTimeout(() => (btn.innerHTML = original), 1600);
    }
  });
}

/* =====================================================================
   MINIMAL CONFETTI
   A short, restrained burst — not a continuous shower — to match the
   "minimal" cinematic brief rather than a typical party effect.
   ===================================================================== */
function launchConfetti() {
  const canvas = document.getElementById("confettiCanvas");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ["#E6483C", "#C9A227", "#FFFFFF", "#B3B3B3"];
  const pieces = Array.from({ length: 70 }, () => ({
    x: canvas.width / 2 + (Math.random() - 0.5) * 200,
    y: canvas.height * 0.35,
    vx: (Math.random() - 0.5) * 6,
    vy: Math.random() * -6 - 2,
    size: Math.random() * 6 + 4,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 10,
    gravity: 0.18
  }));

  let frame = 0;
  const maxFrames = 140;

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frame++;

    pieces.forEach((p) => {
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, 1 - frame / maxFrames);
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.5);
      ctx.restore();
    });

    if (frame < maxFrames) {
      requestAnimationFrame(tick);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  requestAnimationFrame(tick);
}

/* =====================================================================
   FLOATING MUSIC PLAYER
   ===================================================================== */
function initMusicPlayer() {
  const audio = document.getElementById("bgAudio");
  const toggle = document.getElementById("playerToggle");
  const playIcon = toggle.querySelector(".icon--play");
  const pauseIcon = toggle.querySelector(".icon--pause");
  const volume = document.getElementById("playerVolume");

  audio.volume = Number(volume.value);

  toggle.addEventListener("click", () => {
    if (audio.paused) {
      // play() can reject if no real audio file has been added yet —
      // fail quietly rather than throwing a console error at the user
      audio.play().catch(() => {});
      playIcon.classList.add("hidden");
      pauseIcon.classList.remove("hidden");
    } else {
      audio.pause();
      pauseIcon.classList.add("hidden");
      playIcon.classList.remove("hidden");
    }
  });

  volume.addEventListener("input", () => {
    audio.volume = Number(volume.value);
  });
}