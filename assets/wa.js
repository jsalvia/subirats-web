(function () {
  "use strict";
  var barra = document.getElementById("wa-barra");
  if (!barra) return;
  var fins = parseInt(localStorage.getItem("wa-barra-fins") || "0", 10);
  if (Date.now() < fins) { barra.remove(); return; }
  var tanca = document.getElementById("wa-barra-tanca");
  if (tanca) {
    tanca.addEventListener("click", function () {
      var d = new Date(); d.setDate(d.getDate() + 7);
      localStorage.setItem("wa-barra-fins", String(d.getTime()));
      barra.remove();
    });
  }
})();

/* CTA d'escriptori: un cop per persona i setmana */
(function () {
  var cta = document.getElementById("wa-cta");
  if (!cta) return;
  if (document.documentElement.classList.contains("wa-amagat")) return;
  try { localStorage.setItem("wa-cta-vist", String(Date.now())); } catch (e) {}
})();
