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
