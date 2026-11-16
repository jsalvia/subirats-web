/* Subirats, endavant! — comportament mínim, sense dependències */
(function () {
  "use strict";

  /* Any del peu */
  var any = document.getElementById("any");
  if (any) any.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------- FORMULARI --- */
  var form = document.getElementById("subscriu");
  var nota = document.getElementById("nota");
  var input = document.getElementById("email");

  function avisa(text) {
    if (!nota) return;
    nota.textContent = text;
    nota.style.background = "rgba(0,0,0,.18)";
    nota.style.padding = "10px 14px";
    nota.style.borderRadius = "3px";
    nota.style.maxWidth = "none";
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      var valor = (input && input.value || "").trim();

      if (!valor || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor)) {
        e.preventDefault();
        avisa("Revisa el correu: sembla que falta alguna cosa.");
        if (input) input.focus();
        return;
      }

      // Mentre el formulari no estigui connectat a Brevo, no s'envia res.
      if (form.getAttribute("action").indexOf("REEMPLA\u00c7A-HO") !== -1) {
        e.preventDefault();
        avisa("Gràcies! El formulari encara s'ha de connectar a Brevo — aviat estarà actiu.");
        return;
      }

      /* Si tot va bé, s'envia de manera nativa cap a Brevo. */
    });
  }

  /* --------------------------------------------------- APARICIÓ SUAU --- */
  var reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var bloc = document.querySelector(".manifest__cos");

  if (bloc && !reduit && "IntersectionObserver" in window) {
    bloc.style.opacity = "0";
    bloc.style.transform = "translateY(18px)";
    bloc.style.transition = "opacity .7s ease, transform .7s cubic-bezier(.22,.7,.3,1)";

    var io = new IntersectionObserver(function (entrades) {
      entrades.forEach(function (ent) {
        if (ent.isIntersecting) {
          bloc.style.opacity = "1";
          bloc.style.transform = "none";
          io.disconnect();
        }
      });
    }, { threshold: 0.12 });

    io.observe(bloc);
  }
})();
