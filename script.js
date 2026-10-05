const CONFIG = {
  name: 'Iliana Sánchez',
  eventDate: '2026-11-15T15:00:00',
  displayDate: 'Domingo 15 de noviembre de 2026',
  displayTime: '3:00 p. m.',

  venueName: 'Salón “Cenzontle”',

  venueAddress: 'Ubicación en Google Maps',

venueMaps: 'https://maps.app.goo.gl/kjkdStXxbnDqjzra8?g_st=aw',

  whatsapp: '525547078385'
};

let slideIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
  initIntro();
  initMusic();

  // Video secundario automático
  initMemoryVideo();

  initCountdown();
  initMaps();
  initCarousel();
  initReveal();
  initRSVP();
  initSparkles();
  initPhotoLightbox();
});

function initIntro() {
  const intro = document.getElementById('intro');
  const video = document.getElementById('introVideo');
  const soundBtn = document.getElementById('soundBtn');
  const skipBtn = document.getElementById('skipIntroBtn');
  const musicBtn = document.getElementById('musicBtn');

  if (!intro || !video) return;

  let finished = false;
  let soundEnabled = false;

  const finishIntro = () => {
    if (finished) return;
    finished = true;

    video.pause();
    video.muted = true;

    try {
      video.currentTime = 0;
    } catch (_) {}

    soundBtn?.classList.add('is-hidden');
    intro.classList.add('is-hidden');
    musicBtn?.classList.add('show');

    setTimeout(() => {
      intro.style.display = 'none';
    }, 750);

    window.startMusic?.();
  };

  const enableSound = async () => {
    if (soundEnabled || finished) return;

    try {
      video.muted = false;
      video.volume = 1;
      await video.play();

      soundEnabled = true;
      soundBtn?.classList.add('is-hidden');
    } catch (_) {}
  };

  video.muted = true;
  video.volume = 1;
  video.play().catch(() => {});

  // ⭐ DESAPARECER TEXTO EXACTAMENTE EN EL SEGUNDO 25
  video.addEventListener('timeupdate', () => {
    const introCopy = document.getElementById('introCopy');

    if (video.currentTime >= 25 && introCopy) {
      introCopy.classList.add('hide');
    }
  });

  intro.addEventListener('pointerdown', enableSound);

  soundBtn?.addEventListener('click', async (event) => {
    event.preventDefault();
    event.stopPropagation();
    await enableSound();
  });

  skipBtn?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    finishIntro();
  });

  video.addEventListener('ended', finishIntro);

  video.addEventListener('error', () => {
    setTimeout(finishIntro, 700);
  });
}

function initMusic() {
  const btn = document.getElementById('musicBtn');
  const music = document.getElementById('bgMusic');
  if (!btn || !music) return;

  const sync = () => {
    const playing = !music.paused;
    btn.classList.toggle('playing', playing);
    btn.textContent = playing ? '♫' : '♪';
  };

  window.startMusic = async () => {
    try { await music.play(); } catch (_) {}
    sync();
  };

  btn.addEventListener('click', async () => {
    if (music.paused) {
      try { await music.play(); } catch (_) {}
    } else {
      music.pause();
    }
    sync();
  });

  music.addEventListener('play', sync);
  music.addEventListener('pause', sync);
}
function initMemoryVideo() {
  const video = document.getElementById('memoryVideo');
  const music = document.getElementById('bgMusic');

  if (!video || !music) return;

  let musicWasPlaying = false;
  let videoFinished = false;

  const playMemoryVideo = async () => {
    if (videoFinished) return;

    // Recordamos si la música estaba sonando.
    musicWasPlaying = !music.paused;

    // Pausamos la música sin reiniciarla.
    if (!music.paused) {
      music.pause();
    }

    // Activamos el audio del video.
    video.muted = false;
    video.volume = 1;

    try {
      await video.play();
    } catch (error) {
      console.log('El navegador bloqueó la reproducción automática:', error);
    }
  };

  const pauseMemoryVideo = async () => {
    if (!video.paused) {
      video.pause();
    }

    // Reanudar la música exactamente donde quedó.
    if (musicWasPlaying && music.paused) {
      try {
        await music.play();
      } catch (_) {}
    }
  };

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {

        // El video está suficientemente visible.
        if (entry.isIntersecting && entry.intersectionRatio >= 0.65) {
          playMemoryVideo();
        }

        // Ya salió de pantalla.
        else {
          pauseMemoryVideo();
        }

      });
    },
    {
      threshold: [0, 0.25, 0.5, 0.65, 0.8, 1]
    }
  );

  observer.observe(video);

  // Cuando termine el video,
  // regresar automáticamente a la música.
  video.addEventListener('ended', async () => {
    videoFinished = true;

    if (musicWasPlaying && music.paused) {
      try {
        await music.play();
      } catch (_) {}
    }
  });

  // Si la persona vuelve a reproducirlo manualmente,
  // volvemos a pausar la música.
  video.addEventListener('play', () => {
    if (!music.paused) {
      musicWasPlaying = true;
      music.pause();
    }
  });
}
function initCountdown() {
  const target = new Date(CONFIG.eventDate).getTime();
  const ids = ['days', 'hours', 'minutes', 'seconds'];
  if (ids.some(id => !document.getElementById(id))) return;

  const update = () => {
    const diff = Math.max(0, target - Date.now());
    const total = Math.floor(diff / 1000);
    const values = [
      Math.floor(total / 86400),
      Math.floor((total % 86400) / 3600),
      Math.floor((total % 3600) / 60),
      total % 60
    ];
    ids.forEach((id, i) => {
      document.getElementById(id).textContent = String(values[i]).padStart(2, '0');
    });
  };

  update();
  setInterval(update, 1000);
}

function initMaps() {
  const button = document.getElementById('venueMaps');
  if (!button) return;

  if (CONFIG.venueMaps) {
    button.href = CONFIG.venueMaps;
  } else {
    button.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONFIG.venueAddress)}`;
  }
}

function initCarousel() {
  const track = document.getElementById('track');
  const prev = document.getElementById('prevBtn');
  const next = document.getElementById('nextBtn');
  const dots = document.getElementById('dots');
  if (!track || !prev || !next || !dots) return;

  const slides = [...track.children];
  let timer;

  slides.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.className = 'dot' + (index === 0 ? ' active' : '');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Ir a foto ${index + 1}`);
    dot.addEventListener('click', () => {
      slideIndex = index;
      render();
      restart();
    });
    dots.appendChild(dot);
  });

  const render = () => {
    track.style.transform = `translateX(-${slideIndex * 100}%)`;
    dots.querySelectorAll('.dot').forEach((dot, index) => {
      dot.classList.toggle('active', index === slideIndex);
    });
  };

  const go = (delta) => {
    slideIndex = (slideIndex + delta + slides.length) % slides.length;
    render();
  };

  const restart = () => {
    clearInterval(timer);
    timer = setInterval(() => go(1), 4500);
  };

  prev.addEventListener('click', () => { go(-1); restart(); });
  next.addEventListener('click', () => { go(1); restart(); });

  let startX = 0;
  track.addEventListener('touchstart', event => {
    startX = event.touches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', event => {
    const endX = event.changedTouches[0].clientX;
    if (Math.abs(startX - endX) > 45) go(startX > endX ? 1 : -1);
    restart();
  }, { passive: true });

  render();
  restart();
}

function initReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: .12 });

  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
}

function initRSVP() {
  const button = document.getElementById('confirmWhatsappBtn');
  const msg = document.getElementById('formMsg');
  if (!button) return;

  button.addEventListener('click', () => {
    const phone = String(CONFIG.whatsapp || '').replace(/\D/g, '');
    if (!phone) {
      if (msg) msg.textContent = 'Agrega el número de WhatsApp en CONFIG.whatsapp dentro de script.js.';
      return;
    }

    const text = `🦄💜 Confirmación · Mi Bautizo y 5 Años de ${CONFIG.name}\n\nConfirmo mi asistencia para el ${CONFIG.displayDate} a las ${CONFIG.displayTime}.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  });
}

function initSparkles() {
  const holder = document.getElementById('sparkles');

  if (!holder) return;

  const createSparkle = () => {

    const sparkle = document.createElement('span');

    sparkle.className = 'spark';

    // POSICIÓN ALEATORIA EN TODA LA PANTALLA
    sparkle.style.left =
      `${Math.random() * 92}%`;

    sparkle.style.top =
      `${Math.random() * 92}%`;

    // TAMAÑOS DIFERENTES
    const size =
      18 + Math.random() * 30;

    sparkle.style.width =
      `${size}px`;

    sparkle.style.height =
      `${size}px`;

    // DURACIÓN UN POCO DIFERENTE
    sparkle.style.animationDuration =
      `${2 + Math.random() * 1.8}s`;

    holder.appendChild(sparkle);

    // ELIMINAR DESPUÉS DE LA ANIMACIÓN
    setTimeout(() => {
      sparkle.remove();
    }, 4000);
  };

  // CREA EL PRIMERO
  createSparkle();

  // VAN APARECIENDO POCO A POCO
  setInterval(() => {

    createSparkle();

    // A VECES APARECEN DOS
    if (Math.random() > .65) {
      setTimeout(createSparkle, 350);
    }

  }, 900);
}

function initPhotoLightbox() {
  const lightbox = document.getElementById('photoLightbox');
  const image = document.getElementById('photoLightboxImage');
  const close = document.getElementById('photoLightboxClose');
  if (!lightbox || !image) return;

  document.querySelectorAll('.carousel-track .slide img').forEach(photo => {
    photo.addEventListener('click', () => {
      image.src = photo.src;
      image.alt = photo.alt || 'Foto';
      lightbox.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    });
  });

  const closeLightbox = () => {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
  };

  close?.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', event => {
    if (event.target === lightbox) closeLightbox();
  });
}
