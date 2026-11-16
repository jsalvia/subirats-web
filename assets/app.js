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
      e.preventDefault(); /* mai no deixem que el navegador enviï pel seu compte */
      var valor = (input && input.value || "").trim();

      if (!valor || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor)) {
        avisa("Revisa el correu: sembla que falta alguna cosa.");
        if (input) input.focus();
        return;
      }

      // Envia a Brevo sense sortir de la pàgina (mode no-cors: la resposta no es llegeix).
      var dades = "EMAIL=" + encodeURIComponent(valor) +
                  "&email_address_check=" +
                  "&locale=es";
      avisa("Enviant…");

      fetch(form.action, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: dades
      }).then(function () {
        form.reset();
        avisa("Gràcies! Ja ets a la llista. T'escriurem poc i només quan valgui la pena.");
      }).catch(function () {
        form.submit(); // si el navegador no ho permet, enviament clàssic
      });
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

  /* -------------------------------------------------------- CONTACTE ----- */
  /* MODE DE PROVA: valida i mostra el missatge d'èxit, però no envia res.
     Quan hi hagi endpoint, posar-lo a l'action del formulari, treure el
     preventDefault i deixar que el navegador faci el POST. */
  var contacte = document.getElementById("contacte");
  var notaContacte = document.getElementById("contacte-nota");

  if (contacte) {
    contacte.addEventListener("submit", function (e) {
      e.preventDefault();

      var nom = document.getElementById("nom");
      var correu = document.getElementById("correu");
      var missatge = document.getElementById("missatge");
      var nucli = document.getElementById("nucli");
      var rgpd = document.getElementById("rgpd");
      var trampa = document.getElementById("web");

      function diu(text, ok) {
        if (!notaContacte) return;
        notaContacte.textContent = text;
        notaContacte.className = "formulari__nota" + (ok ? " formulari__nota--ok" : "");
      }

      function marcaError(camp) {
        if (!camp) return;
        camp.classList.add("camp--error");
        camp.setAttribute("aria-invalid", "true");
      }

      function netejaErrors() {
        contacte.querySelectorAll(".camp--error").forEach(function (c) {
          c.classList.remove("camp--error");
          c.removeAttribute("aria-invalid");
        });
      }

      if (trampa && trampa.value) { return; } /* bot: no diem res */

      netejaErrors();

      if (!nom || !nom.value.trim()) { diu("Falta el nom.", false); marcaError(nom && nom.closest(".camp")); nom.focus(); return; }
      if (!correu || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correu.value.trim())) {
        diu("Revisa el correu.", false); marcaError(correu && correu.closest(".camp")); correu.focus(); return;
      }
      if (nucli && !nucli.value) { diu("Digues de quin poble o nucli ets.", false); marcaError(nucli.closest(".camp")); nucli.focus(); return; }
      if (!missatge || !missatge.value.trim()) { diu("Escriu-nos el missatge.", false); marcaError(missatge && missatge.closest(".camp")); missatge.focus(); return; }
      if (rgpd && !rgpd.checked) { diu("Cal acceptar el tractament de les dades.", false); rgpd.focus(); return; }

      diu("Gràcies, " + nom.value.trim().split(" ")[0] + ". T'hem llegit i et respondrem aviat.", true);
      contacte.reset();
    });
  }


  /* ------------------------------------------------------ MENÚ MÒBIL ---- */
  var cap = document.querySelector(".site-cap");
  var botoMenu = document.querySelector(".menu-boto");
  var navMenu = document.getElementById("menu-principal");

  if (cap && botoMenu && navMenu) {
    function tancaMenu() {
      cap.classList.remove("site-cap--obert");
      botoMenu.setAttribute("aria-expanded", "false");
      botoMenu.setAttribute("aria-label", "Obre el menú");
    }

    botoMenu.addEventListener("click", function () {
      var obert = cap.classList.toggle("site-cap--obert");
      botoMenu.setAttribute("aria-expanded", obert ? "true" : "false");
      botoMenu.setAttribute("aria-label", obert ? "Tanca el menú" : "Obre el menú");
    });

    navMenu.addEventListener("click", function (e) {
      if (e.target.closest("a")) tancaMenu();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") tancaMenu();
    });

    document.addEventListener("click", function (e) {
      if (!cap.contains(e.target)) tancaMenu();
    });
  }

})();
