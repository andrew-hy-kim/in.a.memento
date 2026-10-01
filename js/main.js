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
