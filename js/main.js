// Mobile menu toggle
(function () {
  var toggle = document.querySelector(".nav-toggle");
  var links = document.getElementById("nav-links");
  if (!toggle || !links) return;
  toggle.addEventListener("click", function () {
    var open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
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

  // Clear the red outline as soon as a field is fixed
  form.addEventListener("input", function (e) {
    var field = e.target.closest(".field");
    if (field) field.classList.remove("invalid");
  });

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
      field.classList.toggle("invalid", bad);
      if (bad && !firstBad) firstBad = field;
    });
    if (firstBad) {
      showError("Please fill in the highlighted fields.");
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
        success.focus();
        success.scrollIntoView({ behavior: "smooth", block: "center" });
      })
      .catch(function () {
        showError('Sorry, something went wrong sending your inquiry. Please try again, or fill out our ' +
          '<a href="' + form.action.replace("formResponse", "viewform") + '" target="_blank" rel="noopener">Google Form</a> instead.');
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
    "main .polaroid img, main .tile img, main .sticker-row img, main [data-video]"));
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
      v.src = it.video; v.controls = true; v.autoplay = true; v.playsInline = true;
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
