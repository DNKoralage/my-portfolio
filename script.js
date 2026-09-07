(() => {
  const TOTAL_FRAMES = 300;
  const canvas = document.getElementById('animationCanvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const loader = document.getElementById('loader');
  const loaderBar = document.getElementById('loaderBar');

  // Array to cache all Image instances
  const images = new Array(TOTAL_FRAMES + 1);
  let loadedCount = 0;
  let isInitialFrameRendered = false;

  // LERP interpolation states for ultra-smooth scrolling
  let targetFrame = 1;
  let currentFrame = 1;
  let lastDrawnFrame = -1;
  const LERP_FACTOR = 0.08; // High-precision buttery smoothing

  function getFrameUrl(index) {
    const padded = String(index).padStart(3, '0');
    return `frames/ezgif-frame-${padded}.jpg`;
  }

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = window.innerWidth;
    const displayHeight = window.innerHeight;

    if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
      canvas.width = Math.round(displayWidth * dpr);
      canvas.height = Math.round(displayHeight * dpr);
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Force redraw on resize
    drawFrame(Math.round(currentFrame), true);
  }

  function drawFrame(frameIndex, force = false) {
    const clampedIndex = Math.min(Math.max(frameIndex, 1), TOTAL_FRAMES);

    if (!force && clampedIndex === lastDrawnFrame) {
      return;
    }

    const img = images[clampedIndex];
    if (!img || !img.complete || img.naturalWidth === 0) {
      return;
    }

    const cWidth = canvas.width;
    const cHeight = canvas.height;
    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;

    // Center & cover canvas aspect ratio (full viewport fill, no bars)
    const scale = Math.max(cWidth / imgWidth, cHeight / imgHeight);
    const renderWidth = imgWidth * scale;
    const renderHeight = imgHeight * scale;
    const offsetX = (cWidth - renderWidth) / 2;
    const offsetY = (cHeight - renderHeight) / 2;

    ctx.drawImage(img, 0, 0, imgWidth, imgHeight, offsetX, offsetY, renderWidth, renderHeight);
    lastDrawnFrame = clampedIndex;
  }

  function onScroll() {
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? scrollY / maxScroll : 0;
    const clampedProgress = Math.min(Math.max(progress, 0), 1);

    targetFrame = 1 + clampedProgress * (TOTAL_FRAMES - 1);

    updateActiveNavLink();
  }

  function animationLoop() {
    // Smooth linear interpolation (LERP)
    const diff = targetFrame - currentFrame;
    if (Math.abs(diff) > 0.0001) {
      currentFrame += diff * LERP_FACTOR;
    } else {
      currentFrame = targetFrame;
    }

    drawFrame(Math.round(currentFrame));
    requestAnimationFrame(animationLoop);
  }

  function preloadFrames() {
    // 1. Prioritize frame 1 for immediate render
    const firstImg = new Image();
    firstImg.src = getFrameUrl(1);
    images[1] = firstImg;

    firstImg.onload = () => {
      loadedCount++;
      if (!isInitialFrameRendered) {
        resizeCanvas();
        drawFrame(1, true);
        isInitialFrameRendered = true;
      }
      loadRemainingFrames();
    };

    firstImg.onerror = () => {
      loadRemainingFrames();
    };
  }

  function loadRemainingFrames() {
    for (let i = 2; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFrameUrl(i);
      images[i] = img;

      img.onload = () => {
        loadedCount++;
        const percent = (loadedCount / TOTAL_FRAMES) * 100;
        if (loaderBar) {
          loaderBar.style.width = `${percent}%`;
        }
        if (loadedCount >= TOTAL_FRAMES && loader) {
          loader.classList.add('loaded');
        }
      };

      img.onerror = () => {
        loadedCount++;
        if (loadedCount >= TOTAL_FRAMES && loader) {
          loader.classList.add('loaded');
        }
      };
    }
  }

  // Active navigation link synchronization
  const navLinks = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('section[id]');

  function updateActiveNavLink() {
    const scrollY = window.scrollY || window.pageYOffset;

    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 150;
      const sectionId = section.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  // Event Listeners
  window.addEventListener('resize', resizeCanvas, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });

  // Initialize
  resizeCanvas();
  preloadFrames();
  requestAnimationFrame(animationLoop);
  onScroll();
})();
