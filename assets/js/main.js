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
    var current = { state: "home", appearance: "light" };

    var srcFor = function (s) {
      return "assets/images/closer-look/" + s.state + "-" + s.appearance + ".svg";
    };
    var labelFor = function (state) {
      var pill = pills.filter(function (p) { return p.dataset.state === state; })[0];
      return pill ? pill.querySelector(".pill__label").textContent : "";
    };

    // Preload every image pair so switching is instant.
    pills.forEach(function (p) {
      ["light", "dark"].forEach(function (a) {
        new Image().src = srcFor({ state: p.dataset.state, appearance: a });
      });
    });

    var swapImage = function () {
      var oldImg = screen.querySelector("img:not(.is-leaving)");
      var newImg = new Image(390, 844);
      newImg.src = srcFor(current);
      newImg.alt = labelFor(current.state) + " screen, " + current.appearance + " appearance (placeholder)";
      if (reduceMotion.matches || !oldImg) {
        screen.innerHTML = "";
        screen.appendChild(newImg);
        return;
      }
      newImg.className = "is-entering";
      screen.appendChild(newImg);
      oldImg.classList.add("is-leaving");
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { newImg.classList.remove("is-entering"); });
      });
      setTimeout(function () { if (oldImg.parentNode) oldImg.parentNode.removeChild(oldImg); }, 650);
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
