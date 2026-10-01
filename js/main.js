// Mobile menu toggle
(function () {
  var toggle = document.querySelector(".nav-toggle");
  var links = document.getElementById("nav-links");
  if (!toggle || !links) return;
  toggle.addEventListener("click", function () {
    var open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  // Esc closes the menu and returns focus to the Menu button
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape" || !links.classList.contains("open")) return;
    links.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.focus();
  });
})();

// Footer year
(function () {
  var el = document.getElementById("year");
  if (el) el.textContent = new Date().getFullYear();
})();

// Book Us form: sends answers to our Google Form, then shows a thank-you message
(function () {
  var form = document.getElementById("inquiry-form");
  if (!form) return;
  var errorBox = document.getElementById("form-error");
  var success = document.getElementById("form-success");
  var button = form.querySelector('button[type="submit"]');

  // Show the "Other" text box only when "Other" is picked
  form.querySelectorAll("input[data-other]").forEach(function (other) {
    var box = document.getElementById(other.getAttribute("data-other"));
    form.querySelectorAll('input[name="' + other.name + '"]').forEach(function (radio) {
      radio.addEventListener("change", function () {
        box.hidden = !other.checked;
        box.required = other.checked;
        if (other.checked) box.focus();
      });
    });
  });

  // Show or clear a field's error: outline + a written message, announced to screen readers
  function setFieldError(field, bad) {
    field.classList.toggle("invalid", bad);
    var old = field.querySelector(":scope > .field-error");
    if (old) old.remove();
    var inputs = field.querySelectorAll("input, textarea");
    Array.prototype.forEach.call(inputs, function (el) {
      if (bad) el.setAttribute("aria-invalid", "true"); else el.removeAttribute("aria-invalid");
      var ids = (el.getAttribute("aria-describedby") || "").split(" ").filter(function (x) { return x && x.indexOf("err-") !== 0; });
      if (bad) ids.push("err-" + fieldKey(field));
      if (ids.length) el.setAttribute("aria-describedby", ids.join(" ")); else el.removeAttribute("aria-describedby");
    });
    if (!bad) return;
    var msg = document.createElement("p");
    msg.className = "field-error";
    msg.id = "err-" + fieldKey(field);
    msg.textContent = errorText(field);
    field.appendChild(msg);
  }
  function fieldKey(field) {
    var el = field.querySelector("input, textarea");
    return (el && (el.id || el.name) || "field").replace(/[^a-z0-9-]/gi, "-");
  }
  function errorText(field) {
    var email = field.querySelector('input[type="email"]');
    if (email && email.value) return "Please enter a valid email address, like name@example.com.";
    var other = field.querySelector(".other-input:not([hidden])");
    var picked = field.querySelector("input[type=radio]:checked");
    if (other && picked && picked.value === "__other_option__" && !other.value) return "Please fill in your \"Other\" answer.";
    return field.getAttribute("data-error") || "Please fill in this field.";
  }

  // Clear the error as soon as a field is fixed
  function clearIfFixed(e) {
    var field = e.target.closest(".field");
    if (!field || !field.classList.contains("invalid")) return;
    var stillBad = Array.prototype.some.call(field.querySelectorAll("input, textarea"), function (el) {
      return !el.hidden && !el.checkValidity();
    });
    if (!stillBad) setFieldError(field, false);
  }
  form.addEventListener("input", clearIfFixed);
  form.addEventListener("change", clearIfFixed);

  function showError(message) {
    errorBox.innerHTML = message;
    errorBox.hidden = false;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    errorBox.hidden = true;

    // Check required fields
    var firstBad = null;
    form.querySelectorAll(".field").forEach(function (field) {
      var bad = Array.prototype.some.call(field.querySelectorAll("input, textarea"), function (el) {
        return !el.hidden && !el.checkValidity();
      });
      setFieldError(field, bad);
      if (bad && !firstBad) firstBad = field;
    });
    if (firstBad) {
      var count = form.querySelectorAll(".field.invalid").length;
      showError(count === 1 ? "Please fix the 1 question marked below." : "Please fix the " + count + " questions marked below.");
      firstBad.scrollIntoView({ behavior: "smooth", block: "center" });
      var focusable = firstBad.querySelector("input:not([hidden]), textarea");
      if (focusable) focusable.focus({ preventScroll: true });
      return;
    }

    // Bots fill in the hidden field; quietly pretend it worked
    if (form.elements.website.value) {
      form.hidden = true;
      success.hidden = false;
      return;
    }

    // Build the answers the way Google Forms expects them
    var data = new URLSearchParams();
    new FormData(form).forEach(function (value, key) {
      if (key === "website") return;
      if (/\.other_option_response$/.test(key)) {
        var base = key.replace(".other_option_response", "");
        var picked = form.querySelector('input[name="' + base + '"]:checked');
        if (!picked || picked.value !== "__other_option__") return;
      }
      if (key === "entry.969458904" && value) {
        var parts = value.split("-"); // yyyy-mm-dd
        data.append(key + "_year", parts[0]);
        data.append(key + "_month", String(Number(parts[1])));
        data.append(key + "_day", String(Number(parts[2])));
        return;
      }
      data.append(key, value);
    });
    // The form also collects the email address separately (Settings > Collect email addresses)
    data.append("emailAddress", form.elements["entry.1840836820"].value);

    button.disabled = true;
    button.textContent = "Sending…";

    fetch(form.action, { method: "POST", mode: "no-cors", body: data })
      .then(function () {
        form.hidden = true;
        success.hidden = false;
        if (window.stickerBurst) window.stickerBurst(success);
        success.focus();
        success.scrollIntoView({ behavior: "smooth", block: "center" });
      })
      .catch(function () {
        showError('Sorry, something went wrong sending your inquiry. Please try again, or fill out our ' +
          '<a href="' + form.action.replace("formResponse", "viewform") + '" target="_blank" rel="noopener">Google Form<span class="sr-only"> (opens in new tab)</span></a> instead.');
        button.disabled = false;
        button.textContent = "Send inquiry";
      });
  });
})();

// Phone "Book us" bar: hide it while another booking button (or the footer) is on screen
(function () {
  var bar = document.querySelector(".mobile-book");
  if (!bar || !("IntersectionObserver" in window)) return;
  var targets = Array.prototype.slice.call(document.querySelectorAll('main a.btn-primary[href$="/contact/"], .site-footer'));
  if (!targets.length) return;
  var visible = new Set();
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) visible.add(e.target); else visible.delete(e.target);
    });
    bar.classList.toggle("is-hidden", visible.size > 0);
  }, { threshold: 0.2 });
  targets.forEach(function (t) { io.observe(t); });
})();

// Photo viewer: tap a photo or design to see it bigger, swipe or use arrows to move between photos
// in the same section. Videos work too: give a figure data-video="/videos/clip.mp4" (and optionally
// data-poster="/images/...jpg") and it plays in the viewer.
(function () {
  var box = document.getElementById("lightbox");
  if (!box || typeof box.showModal !== "function") return;
  var media = box.querySelector(".lb-media");
  var caption = box.querySelector(".lb-caption");
  var prev = box.querySelector(".lb-prev");
  var next = box.querySelector(".lb-next");
  var items = [];
  var index = 0;

  var triggers = Array.prototype.slice.call(document.querySelectorAll(
    "main .polaroid:not([data-video]) img, main .tile img, main .sticker-row img, main [data-video]"));
  if (!triggers.length) return;

  function describe(el) {
    var fig = el.closest("figure");
    var cap = fig && fig.querySelector("figcaption");
    var video = el.getAttribute("data-video") || (fig && fig.getAttribute("data-video"));
    var img = el.tagName === "IMG" ? el : el.querySelector("img");
    return {
      video: video,
      poster: el.getAttribute("data-poster") || (img && img.src) || "",
      src: img ? (img.getAttribute("data-full") || img.currentSrc || img.src) : "",
      alt: img ? img.alt : (cap ? cap.textContent.trim() : "Video"),
      caption: cap ? cap.textContent.trim() : ""
    };
  }

  function show(i) {
    index = (i + items.length) % items.length;
    var it = describe(items[index]);
    media.innerHTML = "";
    if (it.video) {
      var v = document.createElement("video");
      // prefer the smaller WebM where supported, fall back to MP4
      var webm = it.video.replace(/\.mp4$/, ".webm");
      if (webm !== it.video) { var s1 = document.createElement("source"); s1.src = webm; s1.type = "video/webm"; v.appendChild(s1); }
      var s2 = document.createElement("source"); s2.src = it.video; s2.type = "video/mp4"; v.appendChild(s2); v.controls = true; v.autoplay = true; v.playsInline = true; v.muted = true; v.loop = true;
      if (it.poster) v.poster = it.poster;
      media.appendChild(v);
    } else {
      var im = document.createElement("img");
      im.src = it.src; im.alt = it.alt;
      media.appendChild(im);
    }
    caption.textContent = it.caption;
    caption.hidden = !it.caption;
    var many = items.length > 1;
    prev.hidden = !many; next.hidden = !many;
  }

  function open(el) {
    var section = el.closest("section") || document;
    items = triggers.filter(function (t) { return section.contains(t); });
    show(items.indexOf(el));
    box.showModal();
    document.documentElement.classList.add("lb-open");
  }

  triggers.forEach(function (el) {
    el.setAttribute("tabindex", "0");
    el.setAttribute("role", "button");
    var label = el.getAttribute("alt") || el.getAttribute("aria-label") || "photo";
    el.setAttribute("aria-label", "View larger: " + label);
    el.classList.add("lb-trigger");
    el.addEventListener("click", function () { open(el); });
    el.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(el); }
    });
  });

  box.querySelector(".lb-close").addEventListener("click", function () { box.close(); });
  prev.addEventListener("click", function () { show(index - 1); });
  next.addEventListener("click", function () { show(index + 1); });
  box.addEventListener("click", function (e) {
    if (e.target === box || e.target.classList.contains("lb-figure") || e.target === media) box.close();
  });
  box.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") show(index - 1);
    if (e.key === "ArrowRight") show(index + 1);
  });
  box.addEventListener("close", function () {
    media.innerHTML = ""; // stops any playing video
    document.documentElement.classList.remove("lb-open");
  });

  // Swipe left/right on phones
  var startX = null;
  box.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; }, { passive: true });
  box.addEventListener("touchend", function (e) {
    if (startX === null || items.length < 2) return;
    var dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
    startX = null;
  });
})();

var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// "Pull a memento": twist the knob on the home page machine to get a random design
(function () {
  var game = document.querySelector(".pull-game");
  if (!game) return;
  var designs = JSON.parse(game.getAttribute("data-designs") || "[]");
  var knobs = Array.prototype.slice.call(game.querySelectorAll(".mm-knob"));
  var prize = game.querySelector(".mm-prize");
  var last = -1;
  var busy = false;
  if (!designs.length || !knobs.length) return;

  knobs.forEach(function (knob) { knob.addEventListener("click", function () {
    var slot = game;
    if (busy) return;
    busy = true;
    var i;
    do { i = Math.floor(Math.random() * designs.length); } while (designs.length > 1 && i === last);
    last = i;
    var d = designs[i];
    var img = new Image();
    img.src = d.src; // start loading while the knob turns

    knob.classList.remove("spin");
    void knob.offsetWidth; // restart the animation
    knob.classList.add("spin");
    slot.classList.add("dispensing");

    setTimeout(function () {
      var fig = document.createElement("figure");
      fig.className = "mm-card";
      var pic = document.createElement("img");
      pic.src = d.src;
      pic.alt = d.alt;
      var cap = document.createElement("figcaption");
      cap.textContent = d.name;
      fig.appendChild(pic);
      fig.appendChild(cap);
      var again = document.createElement("p");
      again.className = "mm-again";
      again.textContent = "Twist again for another!";
      prize.innerHTML = "";
      prize.appendChild(fig);
      prize.appendChild(again);
      slot.classList.remove("dispensing");
      busy = false;
    }, reduceMotion ? 0 : 650);
  }); });
})();

// Soft fade-in as sections scroll into view
(function () {
  if (reduceMotion || !("IntersectionObserver" in window)) return;
  var els = document.querySelectorAll(
    "main .section-head, main .card, main .stamp, main .polaroid, main .tile, main .quote-bubble, " +
    "main .sticker-row figure, main .faq details, main .pull-game");
  if (!els.length) return;
  document.documentElement.classList.add("js-reveal");
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      io.unobserve(e.target);
    });
  }, { rootMargin: "0px 0px -6% 0px" });
  Array.prototype.forEach.call(els, function (el) {
    var siblings = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
    el.style.setProperty("--reveal-delay", Math.min(siblings, 5) * 70 + "ms");
    el.classList.add("reveal");
    io.observe(el);
  });
})();

// Sticker burst: a handful of doodles pop out around the thank-you message
window.stickerBurst = function (target) {
  if (reduceMotion || !target) return;
  var path = target.getAttribute("data-sticker-path") || "/images/designs/";
  var srcs = (target.getAttribute("data-stickers") || "").split(",").filter(Boolean)
    .map(function (name) { return path + name + ".webp"; });
  if (!srcs.length) return;
  srcs.sort(function () { return Math.random() - 0.5; });
  var count = Math.min(9, srcs.length);
  for (var n = 0; n < count; n++) {
    var angle = (n / count) * Math.PI * 2 + Math.random() * 0.5;
    var dist = 110 + Math.random() * 70;
    var s = document.createElement("img");
    s.className = "burst-sticker";
    s.src = srcs[n];
    s.alt = "";
    s.style.setProperty("--x", Math.round(Math.cos(angle) * dist * 1.4) + "px");
    s.style.setProperty("--y", Math.round(Math.sin(angle) * dist) + "px");
    s.style.setProperty("--r", Math.round(Math.random() * 50 - 25) + "deg");
    s.style.animationDelay = n * 40 + "ms";
    target.appendChild(s);
    s.addEventListener("animationend", function (e) { e.target.remove(); });
  }
};

// Footer heart: beats when the footer scrolls into view, and again every time the line is hovered or tapped
(function () {
  var heart = document.querySelector(".site-footer .heart");
  if (!heart || reduceMotion) return;
  var line = heart.closest(".footer-bottom") || heart;
  function beat() {
    heart.classList.remove("beat");
    void heart.offsetWidth; // restart the animation
    heart.classList.add("beat");
  }
  heart.addEventListener("animationend", function () { heart.classList.remove("beat"); });
  line.addEventListener("mouseenter", beat);
  line.addEventListener("touchstart", beat, { passive: true });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      beat();
      io.disconnect();
    }, { threshold: 0.5 });
    io.observe(line);
  }
})();

// Keep keyboard focus visible: if a focused item lands behind the sticky header
// (or the phone "Book us" bar), nudge the page so it's in view
(function () {
  var header = document.querySelector(".site-header");
  if (!header) return;
  document.addEventListener("focusin", function (e) {
    var el = e.target;
    if (!el || !el.getBoundingClientRect || header.contains(el) || el.closest(".lightbox, .mobile-book")) return;
    var r = el.getBoundingClientRect();
    var top = header.getBoundingClientRect().bottom + 12;
    var bar = document.querySelector(".mobile-book");
    var barVisible = bar && getComputedStyle(bar).display !== "none" && !bar.classList.contains("is-hidden");
    var bottom = window.innerHeight - (barVisible ? bar.getBoundingClientRect().height + 24 : 12);
    // run after the browser's own scroll-into-view, and jump instantly (no smooth glide)
    requestAnimationFrame(function () {
      r = el.getBoundingClientRect();
      if (r.top < top) window.scrollBy({ top: r.top - top, behavior: "instant" });
      else if (r.bottom > bottom) window.scrollBy({ top: r.bottom - bottom, behavior: "instant" });
    });
  });
})();

// Reviews float and sparkles twinkle when they scroll into view, and again on hover
// (each run is short, so motion never goes on for more than 5 seconds)
(function () {
  if (reduceMotion) return;
  var els = Array.prototype.slice.call(document.querySelectorAll(".quote-bubble, .twinkle"));
  if (!els.length) return;
  function play(el) {
    if (el.classList.contains("play")) return; // let a running float finish
    el.classList.add("play");
  }
  els.forEach(function (el) {
    el.addEventListener("animationend", function (e) {
      if (e.target === el || e.animationName === "bob") el.classList.remove("play");
    });
    var hoverTarget = el.classList.contains("twinkle") ? el.closest(".eyebrow") || el : el;
    hoverTarget.addEventListener("mouseenter", function () { play(el); });
  });
  if (!("IntersectionObserver" in window)) { els.forEach(play); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      play(e.target);
      io.unobserve(e.target);
    });
  }, { threshold: 0.6 });
  els.forEach(function (el) { io.observe(el); });
})();

// Gallery scrapbook strip: arrow buttons scroll sideways; hide an arrow at either end
(function () {
  var wrap = document.querySelector(".scrapbook-wrap");
  if (!wrap) return;
  var strip = wrap.querySelector(".scrapbook");
  var prev = wrap.querySelector(".scrap-prev");
  var next = wrap.querySelector(".scrap-next");
  function update() {
    var max = strip.scrollWidth - strip.clientWidth - 2;
    prev.disabled = strip.scrollLeft <= 2;
    next.disabled = strip.scrollLeft >= max;
  }
  function go(dir) {
    strip.scrollBy({ left: dir * strip.clientWidth * 0.8, behavior: reduceMotion ? "auto" : "smooth" });
  }
  prev.addEventListener("click", function () { go(-1); });
  next.addEventListener("click", function () { go(1); });
  strip.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  window.addEventListener("load", update);
  update();
})();

// Step clips: play one at a time, in order (1 → 4) when the section scrolls into view,
// then rest on stills with a "Watch again" button. Hover (desktop) or tap plays a single step.
// With "reduce motion", nothing plays on its own; tapping a step still plays it.
(function () {
  var cards = Array.prototype.slice.call(document.querySelectorAll(".step-clip"));
  if (!cards.length) return;
  var vids = cards.map(function (c) { return c.querySelector("video"); });
  var replay = document.querySelector(".clip-replay");
  var seq = -1; // index playing in the sequence, -1 when not sequencing

  function stopAll(except) {
    vids.forEach(function (v, i) {
      if (v === except) return;
      v.pause();
      cards[i].classList.remove("is-playing");
    });
  }
  function play(i) {
    var v = vids[i];
    stopAll(v);
    try { v.currentTime = 0; } catch (e) {}
    cards[i].classList.add("is-playing");
    var p = v.play(); if (p && p.catch) p.catch(function () {});
  }
  function runSequence() {
    if (replay) replay.hidden = true;
    seq = 0; play(0);
  }
  vids.forEach(function (v, i) {
    v.muted = true; v.loop = false;
    v.addEventListener("ended", function () {
      cards[i].classList.remove("is-playing");
      if (seq === i && i < vids.length - 1) { seq = i + 1; play(seq); }
      else { seq = -1; if (replay) replay.hidden = false; }
    });
    cards[i].addEventListener("click", function () { seq = -1; if (v.paused) play(i); else { v.pause(); cards[i].classList.remove("is-playing"); } if (replay) replay.hidden = false; });
    if (!reduceMotion) cards[i].addEventListener("mouseenter", function () { if (seq === -1) play(i); });
  });
  if (replay) replay.addEventListener("click", runSequence);
  if (reduceMotion || !("IntersectionObserver" in window)) { if (replay) replay.hidden = false; return; }
  var started = false;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting && !started) { started = true; runSequence(); }
      if (!e.isIntersecting) { seq = -1; stopAll(); if (started && replay) replay.hidden = false; }
    });
  }, { threshold: 0.5 });
  io.observe(document.querySelector(".step-clips"));
})();
