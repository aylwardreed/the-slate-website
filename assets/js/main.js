/* The Slate: one-page site interactions */
(function () {
  "use strict";

  document.documentElement.classList.remove("no-js");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------- Footer year ---------- */
  var year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Nav border on scroll ---------- */
  var nav = document.querySelector("[data-nav]");
  var heroTitle = document.getElementById("hero-title");
  if (nav && heroTitle) {
    if ("IntersectionObserver" in window) {
      // Solid bar and wordmark once the hero title has scrolled up under the bar.
      var navHeight = nav.offsetHeight;
      new IntersectionObserver(function (entries) {
        var e = entries[0];
        var passed = !e.isIntersecting && e.boundingClientRect.top < navHeight;
        nav.classList.toggle("is-solid", passed);
      }, { rootMargin: "-" + navHeight + "px 0px 0px 0px" }).observe(heroTitle);
    } else {
      nav.classList.add("is-solid");
    }
  }

  /* ---------- Hero: intro animation + scroll parallax ---------- */
  var stage = document.querySelector("[data-hero-stage]");
  if (stage) {
    var imgs = Array.prototype.slice.call(stage.querySelectorAll("img"));
    var started = false;
    var start = function () {
      if (started) return;
      started = true;
      stage.classList.add("is-ready");
    };
    // Start once the screen images are ready (or after a short timeout).
    Promise.all(imgs.map(function (img) {
      return img.decode ? img.decode().catch(function () {}) : Promise.resolve();
    })).then(start);
    setTimeout(start, 800);
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY;
      if (stage && !reduceMotion.matches) {
        var p = Math.min(Math.max(y / (window.innerHeight * 0.8), 0), 1);
        stage.style.setProperty("--p", p.toFixed(3));
      }
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -10% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Take a closer look ---------- */
  var closer = document.querySelector("[data-closer]");
  if (closer) {
    var pills = Array.prototype.slice.call(closer.querySelectorAll(".pill"));
    var swatches = Array.prototype.slice.call(closer.querySelectorAll("[data-appearance]"));
    var screen = closer.querySelector("[data-closer-screen]");
    var device = closer.querySelector("[data-appearance-current]");
    var caption = closer.querySelector("[data-closer-caption]");
    var appearanceLabel = closer.querySelector("[data-appearance-label]");
    var current = { state: pills[0] ? pills[0].dataset.state : "", appearance: "light" };

    var pillFor = function (state) {
      return pills.filter(function (p) { return p.dataset.state === state; })[0];
    };
    var srcFor = function (s) {
      var pill = pillFor(s.state);
      var ext = (pill && pill.dataset.ext) || "svg";
      return "assets/images/closer-look/" + s.state + "-" + s.appearance + "." + ext;
    };
    var labelFor = function (state) {
      var pill = pillFor(state);
      return pill ? pill.querySelector(".pill__label").textContent : "";
    };

    // Preload every image pair so switching is instant (videos load on demand).
    pills.forEach(function (p) {
      ["light", "dark"].forEach(function (a) {
        var src = srcFor({ state: p.dataset.state, appearance: a });
        if (!/\.(mp4|m4v|mov|webm)$/i.test(src)) new Image().src = src;
      });
    });

    // A screenshot taller than the screen scrolls slowly from top to bottom and back.
    var fitScroll = function (img) {
      var check = function () {
        if (!img.naturalWidth || !screen.clientWidth) return;
        var screenRatio = screen.clientHeight / screen.clientWidth;
        var imgRatio = img.naturalHeight / img.naturalWidth;
        var tall = imgRatio > screenRatio * 1.05;
        img.classList.toggle("is-tall", tall);
        if (tall) {
          var overflow = 1 - screenRatio / imgRatio; // share of the image hidden below the screen
          img.style.setProperty("--scroll-y", (-overflow * 100).toFixed(2) + "%");
          img.style.setProperty("--scroll-time", Math.max(8, overflow * 30).toFixed(1) + "s");
        }
      };
      if (img.complete) check(); else img.addEventListener("load", check);
    };
    Array.prototype.forEach.call(screen.querySelectorAll("img"), fitScroll);

    var isVideo = function (src) { return /\.(mp4|m4v|mov|webm)$/i.test(src); };

    var createMedia = function () {
      var src = srcFor(current);
      var label = labelFor(current.state) + " screen, " + current.appearance + " appearance";
      var el;
      if (isVideo(src)) {
        el = document.createElement("video");
        el.muted = true;
        el.loop = true;
        el.playsInline = true;
        el.setAttribute("muted", "");
        el.setAttribute("playsinline", "");
        el.setAttribute("aria-label", label);
        el.autoplay = !reduceMotion.matches;
        el.preload = "auto";
        el.src = src;
      } else {
        el = new Image(780, 1696);
        el.src = src;
        el.alt = label;
        fitScroll(el);
      }
      return el;
    };

    var swapImage = function () {
      var oldEl = screen.querySelector(":scope > :not(.is-leaving)");
      var newEl = createMedia();
      if (reduceMotion.matches || !oldEl) {
        screen.innerHTML = "";
        screen.appendChild(newEl);
        return;
      }
      newEl.classList.add("is-entering");
      screen.appendChild(newEl);
      oldEl.classList.add("is-leaving");
      var shown = false;
      var show = function () {
        if (shown) return;
        shown = true;
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { newEl.classList.remove("is-entering"); });
        });
        setTimeout(function () { if (oldEl.parentNode) oldEl.parentNode.removeChild(oldEl); }, 650);
      };
      // A video fades in once its first frame is ready, so the screen never flashes black.
      if (newEl.tagName === "VIDEO") {
        newEl.addEventListener("loadeddata", show);
        setTimeout(show, 1500);
      } else {
        show();
      }
    };

    var updateCaption = function (pill) {
      if (caption) caption.textContent = pill.querySelector(".pill__body").textContent;
    };

    pills.forEach(function (pill) {
      pill.addEventListener("click", function () {
        if (pill.getAttribute("aria-expanded") === "true") return;
        pills.forEach(function (p) { p.setAttribute("aria-expanded", String(p === pill)); });
        current.state = pill.dataset.state;
        updateCaption(pill);
        swapImage();
        // On narrow screens, keep the active pill in view in the horizontal list.
        if (window.matchMedia("(max-width: 820px)").matches) {
          pill.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "nearest", inline: "center" });
        }
      });
    });

    swatches.forEach(function (swatch) {
      swatch.addEventListener("click", function () {
        if (swatch.getAttribute("aria-checked") === "true") return;
        swatches.forEach(function (s) {
          var on = s === swatch;
          s.setAttribute("aria-checked", String(on));
          s.tabIndex = on ? 0 : -1;
        });
        current.appearance = swatch.dataset.appearance;
        if (device) device.setAttribute("data-appearance-current", current.appearance);
        if (appearanceLabel) appearanceLabel.textContent = swatch.getAttribute("aria-label");
        swapImage();
      });
      // Arrow-key navigation within the radio group.
      swatch.addEventListener("keydown", function (e) {
        if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].indexOf(e.key) === -1) return;
        e.preventDefault();
        var i = swatches.indexOf(swatch);
        var next = swatches[(i + (e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 1) + swatches.length) % swatches.length];
        next.focus();
        next.click();
      });
    });
    swatches.forEach(function (s) { s.tabIndex = s.getAttribute("aria-checked") === "true" ? 0 : -1; });

    var initial = pills.filter(function (p) { return p.getAttribute("aria-expanded") === "true"; })[0];
    if (initial) updateCaption(initial);
  }

  /* ---------- Privacy & Terms disclosures (animated open/close) ---------- */
  document.querySelectorAll("[data-disclosure]").forEach(function (details) {
    var summary = details.querySelector("summary");
    var content = details.querySelector(".disclosure__content");
    var anim = null;
    var closing = false;

    summary.addEventListener("click", function (e) {
      if (reduceMotion.matches || !content.animate) return; // native toggle
      e.preventDefault();
      var wasClosing = closing;
      var midHeight = content.offsetHeight;
      if (anim) anim.cancel();
      closing = false;

      if (!details.open || wasClosing) {
        details.open = true;
        var from = wasClosing ? midHeight : 0;
        var h = content.scrollHeight;
        anim = content.animate(
          [{ height: from + "px", opacity: from ? 1 : 0 }, { height: h + "px", opacity: 1 }],
          { duration: 450, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
        );
        anim.onfinish = function () { anim = null; };
      } else {
        closing = true;
        var start = midHeight;
        anim = content.animate(
          [{ height: start + "px", opacity: 1 }, { height: "0px", opacity: 0 }],
          { duration: 350, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
        );
        anim.onfinish = function () { details.open = false; closing = false; anim = null; };
      }
    });
  });
})();
