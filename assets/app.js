/* Subirats, endavant! — comportament mínim, sense dependències */
(function () {
  "use strict";

  /* Any del peu */
  var any = document.getElementById("any");
  if (any) any.textContent = new Date().getFullYear();

  /* ------------------------------------------- SUBSCRIPCIÓ (Brevo) --- */
  var BREVO = "https://30385a9b.sibforms.com/serve/MUIFAEVDAUOgVV3ba9c8hQhjW4dNiH_wTjUoQngdjCd1Rv_iG4fIFh4IzszPSlhBRrnkN5UdYpkxE7D-KBlqVx3j0zPjpCGFZo-9q_Yn-yHs5H__sCNccIirNdUJ4qyoSeyHwc_NB49mHJSTuxufT_9UtTaxKeY-o-W690jLCPbzVVB4xZBX8RDUgbcOU4voSR9ay8U17UnvRPW4sg==";

  function subscriuBrevo(correu) {
    var dades = "EMAIL=" + encodeURIComponent(correu) +
                "&email_address_check=" +
                "&locale=es";
    return fetch(BREVO, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: dades
    });
  }

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

      avisa("Enviant…");

      subscriuBrevo(valor).then(function () {
        form.reset();
        avisa("Gràcies! Revisa el teu correu i confirma la subscripció. Si no el veus, mira a la brossa.");
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

      var butlleti = document.getElementById("newsletter");
      var volButlleti = !!(butlleti && butlleti.checked);
      var nomCurt = nom.value.trim().split(" ")[0];

      if (volButlleti) {
        diu("Enviant…", false);
        subscriuBrevo(correu.value.trim()).then(function () {
          diu("Gràcies, " + nomCurt + ". T'hem llegit, et respondrem aviat i t'hem apuntat al butlletí.", true);
          contacte.reset();
        }).catch(function () {
          diu("Gràcies, " + nomCurt + ". T'hem llegit i et respondrem aviat. Pel butlletí, torna-ho a provar.", true);
          contacte.reset();
        });
        return;
      }

      diu("Gràcies, " + nomCurt + ". T'hem llegit i et respondrem aviat.", true);
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
