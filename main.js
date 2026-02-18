/* ============================================
   FOURLINE — Custom Scripts
   Served via jsDelivr CDN from GitHub
   Requires: GSAP 3.12.5 + ScrollTrigger
   ============================================ */


/* ============================================
   SECTION: Hero Video Delay
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {
  const wrap = document.querySelector(".bg-video-wrap");
  if (!wrap) return;

  const vid = wrap.querySelector("video");
  if (!vid) return;

  const REVEAL_MS = 3500;

  const srcEl = vid.querySelector("source");
  const src = srcEl ? srcEl.getAttribute("src") : vid.getAttribute("src");

  setTimeout(() => {
    try {
      vid.pause();
      vid.currentTime = 0;

      if (srcEl && src) {
        srcEl.setAttribute("src", src);
      } else if (src) {
        vid.setAttribute("src", src);
      }
      vid.load();
      vid.play().catch(() => {});
    } catch (e) {
      console.log(e);
    }
  }, REVEAL_MS);
});


/* ============================================
   SECTION: Scroll Shift Marquee Rows
   ============================================ */

(() => {
  const rows = [...document.querySelectorAll('[data-marquee="row"]')];
  if (!rows.length) return;

  const marquees = rows.map((row) => {
    const track = row.querySelector('.loop-track');
    if (!track) return null;

    const kids = [...track.children];
    kids.forEach(k => track.appendChild(k.cloneNode(true)));

    const dirAttr = (row.getAttribute('data-direction') || 'left').toLowerCase();
    const baseDir = dirAttr === 'right' ? 1 : -1;
    const strength = parseFloat(row.getAttribute('data-strength') || '0.6');

    return { row, track, baseDir, strength, x: 0 };
  }).filter(Boolean);

  let lastY = window.scrollY;

  function wrap(m) {
    const hw = m.track.scrollWidth / 2;
    if (hw <= 0) return;
    while (m.x <= -hw) m.x += hw;
    while (m.x > 0) m.x -= hw;
  }

  function render() {
    marquees.forEach(m => {
      m.track.style.transform = `translate3d(${m.x}px,0,0)`;
    });
  }

  function onScroll() {
    const y = window.scrollY;
    const dy = y - lastY;
    lastY = y;

    if (dy === 0) return;

    const scrollSign = dy > 0 ? 1 : -1;

    marquees.forEach(m => {
      m.x += (m.baseDir * scrollSign) * Math.abs(dy) * m.strength;
      wrap(m);
    });

    render();
  }

  render();

  window.addEventListener('scroll', onScroll, { passive: true });

  window.addEventListener('resize', () => {
    marquees.forEach(wrap);
    render();
  });
})();


/* ============================================
   SECTION: Works Carousel (Drag + Infinite Loop)
   ============================================ */

(function() {
  "use strict";
  setTimeout(init, 50);

  function init() {
    var carousel = document.querySelector(".works-carousel");
    var track = document.querySelector(".works-track");
    if (!carousel || !track) return;

    // Config
    var GAP = 0;
    var SPEED = 0.6;
    var DIRECTION = -1;
    var DRAG_THRESHOLD = 8;

    // Setup styles
    carousel.style.overflow = "hidden";
    carousel.style.cursor = "grab";
    carousel.style.userSelect = "none";
    carousel.style.webkitUserSelect = "none";
    track.style.display = "flex";
    track.style.flexWrap = "nowrap";
    track.style.gap = GAP + "px";
    track.style.width = "fit-content";
    track.style.willChange = "transform";

    // Clone top-level children for infinite loop
    var topChildren = Array.from(track.children);
    var singleSetWidth = track.scrollWidth + GAP;

    for (var c = 0; c < 2; c++) {
      topChildren.forEach(function(child) {
        var clone = child.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        clone.querySelectorAll("a[href]").forEach(function(a) {
          a.dataset.href = a.getAttribute("href");
          a.removeAttribute("href");
        });
        track.appendChild(clone);
      });
    }

    singleSetWidth = track.scrollWidth / 3;

    // State
    var xPos = 0;
    var isDragging = false;
    var dragStartX = 0;
    var dragStartScroll = 0;
    var hasDragged = false;
    var lastX = 0;
    var velocity = 0;
    var mousedownTarget = null;
    var wheelTimer = null;
    var currentSpeed = SPEED;
    var targetSpeed = SPEED;
    var isWheelActive = false;

    // Shared mouse position for cursor script
    window._fourlineCarousel = {
      isInCarousel: false,
      carousel: carousel,
      mouseX: -100,
      mouseY: -100,
      hasPosition: false
    };

    var shared = window._fourlineCarousel;

    // Core functions
    function setPosition(x) {
      track.style.transform = "translate3d(" + x + "px,0,0)";
    }

    function wrapPosition() {
      if (singleSetWidth <= 0) return;
      if (xPos <= -singleSetWidth) xPos += singleSetWidth;
      if (xPos > 0) xPos -= singleSetWidth;
    }

    function isInCarousel(e) {
      var el = e.target || e;
      return el.closest && !!el.closest(".works-carousel");
    }

    function checkUnderCursor() {
      if (!shared.hasPosition || shared.mouseX < 0) return false;
      var el = document.elementFromPoint(shared.mouseX, shared.mouseY);
      var inside = el && el.closest && !!el.closest(".works-carousel");
      shared.isInCarousel = inside;
      return inside;
    }

    function updateSpeed() {
      currentSpeed += (targetSpeed - currentSpeed) * 0.08;
    }

    function applyMomentum() {
      if (Math.abs(velocity) < 1.5) return;
      var v = velocity;
      function step() {
        v *= 0.93;
        xPos += v;
        wrapPosition();
        setPosition(xPos);
        if (Math.abs(v) > 0.3) requestAnimationFrame(step);
      }
      step();
    }

    function navigateToLink(target) {
      if (!target) return;
      var link = target.closest("a[href], [data-href]");
      if (link) {
        var href = link.getAttribute("href") || link.dataset.href;
        if (href) window.location.href = href;
      }
    }

    function checkSpeedFromCursor() {
      if (isDragging || isWheelActive) return;
      var inside = checkUnderCursor();
      if (inside) {
        var el = document.elementFromPoint(shared.mouseX, shared.mouseY);
        var card = el && el.closest && el.closest(".works-column");
        targetSpeed = card ? SPEED * 0.25 : SPEED;
      } else {
        targetSpeed = SPEED;
      }
    }

    // Auto-scroll loop
    function animate() {
      if (!isDragging) {
        updateSpeed();
        xPos += currentSpeed * DIRECTION;
        wrapPosition();
        setPosition(xPos);
      }
      requestAnimationFrame(animate);
    }
    animate();

    // ── Hover: slow on card, full speed outside ──
    document.addEventListener("mousemove", function(e) {
      shared.mouseX = e.clientX;
      shared.mouseY = e.clientY;
      shared.hasPosition = true;
      checkSpeedFromCursor();
    }, true);

    window.addEventListener("scroll", function() {
      checkSpeedFromCursor();
    }, { passive: true });

    document.addEventListener("mouseleave", function() {
      targetSpeed = SPEED;
      shared.isInCarousel = false;
      shared.hasPosition = false;
      shared.mouseX = -100;
      shared.mouseY = -100;
    });

    // ── Drag: mousedown / mousemove / mouseup ──
    document.addEventListener("mousedown", function(e) {
      if (!isInCarousel(e)) return;
      if (e.button !== 0) return;

      isDragging = true;
      hasDragged = false;
      dragStartX = e.clientX;
      dragStartScroll = xPos;
      lastX = e.clientX;
      velocity = 0;
      mousedownTarget = e.target;
      carousel.style.cursor = "grabbing";
      targetSpeed = 0;
      currentSpeed = 0;
      e.preventDefault();
    }, true);

    document.addEventListener("mousemove", function(e) {
      if (!isDragging) return;
      var dx = e.clientX - dragStartX;
      velocity = e.clientX - lastX;
      lastX = e.clientX;
      if (Math.abs(dx) > DRAG_THRESHOLD) hasDragged = true;
      xPos = dragStartScroll + dx;
      wrapPosition();
      setPosition(xPos);
    }, true);

    document.addEventListener("mouseup", function(e) {
      if (!isDragging) return;
      isDragging = false;
      carousel.style.cursor = "grab";
      targetSpeed = SPEED;

      if (!hasDragged && mousedownTarget) {
        navigateToLink(mousedownTarget);
      } else if (hasDragged) {
        applyMomentum();
      }
      hasDragged = false;
      mousedownTarget = null;
    }, true);

    document.addEventListener("click", function(e) {
      if (isInCarousel(e)) e.preventDefault();
    }, true);

    document.addEventListener("dragstart", function(e) {
      if (isInCarousel(e)) e.preventDefault();
    }, true);

    // ── Touch Events ──
    var isHorizontalDrag = null;
    var touchStartY = 0;

    document.addEventListener("touchstart", function(e) {
      if (!isInCarousel(e)) return;
      isDragging = true;
      hasDragged = false;
      isHorizontalDrag = null;
      dragStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      dragStartScroll = xPos;
      lastX = e.touches[0].clientX;
      velocity = 0;
      mousedownTarget = e.target;
    }, { capture: true, passive: true });

    document.addEventListener("touchmove", function(e) {
      if (!isDragging) return;
      var cx = e.touches[0].clientX;
      var cy = e.touches[0].clientY;
      var dx = cx - dragStartX;
      var dy = cy - touchStartY;

      if (isHorizontalDrag === null && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
        isHorizontalDrag = Math.abs(dx) > Math.abs(dy);
      }
      if (isHorizontalDrag === false) { isDragging = false; return; }
      if (isHorizontalDrag) e.preventDefault();

      velocity = cx - lastX;
      lastX = cx;
      if (Math.abs(dx) > DRAG_THRESHOLD) hasDragged = true;
      xPos = dragStartScroll + dx;
      wrapPosition();
      setPosition(xPos);
    }, { capture: true, passive: false });

    document.addEventListener("touchend", function(e) {
      if (!isDragging) return;
      isDragging = false;
      targetSpeed = SPEED;
      if (!hasDragged && mousedownTarget) {
        navigateToLink(mousedownTarget);
      } else {
        applyMomentum();
      }
      hasDragged = false;
      mousedownTarget = null;
    }, { capture: true });

    // ── Trackpad: gesture locking ──
    var wheelGesture = null;
    var wheelGestureTimer = null;

    document.addEventListener("wheel", function(e) {
      shared.mouseX = e.clientX;
      shared.mouseY = e.clientY;
      shared.hasPosition = true;

      var inCarousel = isInCarousel(e);
      shared.isInCarousel = inCarousel;

      if (!inCarousel) {
        wheelGesture = null;
        return;
      }

      if (!isDragging) {
        targetSpeed = SPEED * 0.25;
      }

      var absX = Math.abs(e.deltaX);
      var absY = Math.abs(e.deltaY);

      if (wheelGesture === null) {
        if (absX < 2 && absY < 2) return;
        wheelGesture = absX > absY ? "horizontal" : "vertical";
      }

      clearTimeout(wheelGestureTimer);
      wheelGestureTimer = setTimeout(function() {
        wheelGesture = null;
        isWheelActive = false;
        checkSpeedFromCursor();
      }, 150);

      if (wheelGesture === "vertical") return;

      isWheelActive = true;
      xPos -= e.deltaX;
      wrapPosition();
      setPosition(xPos);
      e.preventDefault();
      e.stopPropagation();

      targetSpeed = 0;
      currentSpeed = 0;
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(function() {
        checkSpeedFromCursor();
      }, 1000);
    }, { capture: true, passive: false });

    // Resize
    window.addEventListener("resize", function() {
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(function() {
        singleSetWidth = track.scrollWidth / 3;
        wrapPosition();
      }, 300);
    });

    console.log("Fourline Carousel: Initialized");
  }
})();


/* ============================================
   SECTION: Custom Cursor
   ============================================ */

(function() {
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

  var cursor = document.createElement("div");
  cursor.className = "cursor-follower";
  cursor.innerHTML = '<div class="cursor-arrow cursor-arrow-left"></div>' +
                     '<div class="cursor-dot"></div>' +
                     '<div class="cursor-arrow cursor-arrow-right"></div>';
  document.body.appendChild(cursor);

  var cursorX = -100;
  var cursorY = -100;
  var hasInitialized = false;
  var isShowingArrows = false;

  function showArrows() {
    if (!isShowingArrows) {
      cursor.classList.add("is-carousel");
      isShowingArrows = true;
    }
  }

  function hideArrows() {
    if (isShowingArrows) {
      cursor.classList.remove("is-carousel");
      cursor.classList.remove("is-dragging");
      isShowingArrows = false;
    }
  }

  function checkUnderCursor() {
    var shared = window._fourlineCarousel;
    if (!shared || !shared.hasPosition || shared.mouseX < 0) {
      hideArrows();
      return;
    }
    var el = document.elementFromPoint(shared.mouseX, shared.mouseY);
    if (el && el.closest && el.closest(".works-carousel")) {
      showArrows();
    } else {
      hideArrows();
    }
  }

  document.addEventListener("mousemove", function(e) {
    var shared = window._fourlineCarousel;
    if (shared) {
      shared.mouseX = e.clientX;
      shared.mouseY = e.clientY;
      shared.hasPosition = true;
    }
    if (!hasInitialized) {
      cursorX = e.clientX;
      cursorY = e.clientY;
      hasInitialized = true;
    }
    checkUnderCursor();
  });

  document.addEventListener("wheel", function(e) {
    var shared = window._fourlineCarousel;
    if (shared) {
      shared.mouseX = e.clientX;
      shared.mouseY = e.clientY;
      shared.hasPosition = true;
    }
    if (!hasInitialized) {
      cursorX = e.clientX;
      cursorY = e.clientY;
      hasInitialized = true;
    }
    checkUnderCursor();
  }, { capture: true });

  window.addEventListener("scroll", function() {
    checkUnderCursor();
  }, { passive: true });

  document.addEventListener("mousedown", function(e) {
    if (isShowingArrows) cursor.classList.add("is-dragging");
  }, true);

  document.addEventListener("mouseup", function() {
    cursor.classList.remove("is-dragging");
  }, true);

  document.addEventListener("mouseleave", function() {
    hideArrows();
    hasInitialized = false;
    var shared = window._fourlineCarousel;
    if (shared) {
      shared.hasPosition = false;
      shared.mouseX = -100;
      shared.mouseY = -100;
    }
  });

  function animate() {
    var shared = window._fourlineCarousel;
    var mx = (shared && shared.hasPosition) ? shared.mouseX : -100;
    var my = (shared && shared.hasPosition) ? shared.mouseY : -100;
    cursorX += (mx - cursorX) * 0.45;
    cursorY += (my - cursorY) * 0.45;
    cursor.style.transform = "translate3d(" + cursorX + "px," + cursorY + "px,0) translate(-50%,-50%)";
    requestAnimationFrame(animate);
  }
  animate();
})();


/* ============================================
   SECTION: Magnetic Text
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
  const magneticParents = document.querySelectorAll('.magnetic-text');

  magneticParents.forEach(parent => {
    const inner = parent.querySelector('.magnetic-inner');
    if (!inner) return;

    const strengthX = 0.25;
    const strengthY = 0.45;
    let isFirstMove = true;

    parent.addEventListener('mouseenter', function() {
      isFirstMove = true;
    });

    parent.addEventListener('mousemove', function(e) {
      const rect = parent.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) * strengthX;
      const deltaY = (e.clientY - centerY) * strengthY;

      const duration = isFirstMove ? 0.8 : 0.3;
      const ease = isFirstMove ? "power4.out" : "power2.out";

      gsap.to(inner, {
        x: deltaX,
        y: deltaY,
        duration: duration,
        ease: ease,
        overwrite: 'auto'
      });

      isFirstMove = false;
    });

    parent.addEventListener('mouseleave', function() {
      gsap.to(inner, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: "power2.inOut",
        overwrite: true
      });
    });
  });
});


/* ============================================
   SECTION: CTA Image Grow
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
  gsap.registerPlugin(ScrollTrigger);

  const wrapper = document.querySelector('.cta-image-wrapper');

  if (wrapper) {
    gsap.to(wrapper, {
      padding: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: wrapper,
        start: 'top 50%',
        end: 'top 10%',
        scrub: 0.6,
      }
    });
  }
});
