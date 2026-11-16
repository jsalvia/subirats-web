// Cloudflare Pages Function: formulari de contacte de subiratsendavant.cat
// Rep un POST JSON del formulari i envia el missatge a info@ via API de Brevo.
// Variable d'entorn necessària: BREVO_API_KEY (clau amb permís d'enviament transaccional)

const DESTI = "info@subiratsendavant.cat";
const REMITENT = { name: "Subirats, endavant!", email: "info@subiratsendavant.cat" };

function json(dades, estat = 200) {
  return new Response(JSON.stringify(dades), {
    status: estat,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}

function escapa(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function onRequestPost({ request, env }) {
  let dades;
  try {
    dades = await request.json();
  } catch {
    return json({ error: "Format incorrecte." }, 400);
  }

  const nom = String(dades.nom || "").trim();
  const correu = String(dades.correu || "").trim();
  const nucli = String(dades.nucli || "").trim();
  const missatge = String(dades.missatge || "").trim();
  const rgpd = dades.rgpd === true || dades.rgpd === "on";
  const trampa = String(dades.web || "").trim();

  // Honeypot: si ve ple és un bot. Respon bé i no enviïs res.
  if (trampa) return json({ ok: true });

  if (!nom || nom.length > 120) return json({ error: "Falta el nom." }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correu)) return json({ error: "El correu no és vàlid." }, 400);
  if (!nucli || nucli.length > 120) return json({ error: "Falta el poble o nucli." }, 400);
  if (!missatge || missatge.length > 5000) return json({ error: "Falta el missatge." }, 400);
  if (!rgpd) return json({ error: "Cal acceptar el tractament de les dades." }, 400);

  if (!env.BREVO_API_KEY) {
    return json({ error: "El formulari no està configurat." }, 500);
  }

  const cos =
    "Nom: " + nom + "\n" +
    "Correu: " + correu + "\n" +
    "Poble o nucli: " + nucli + "\n\n" +
    missatge + "\n";

  const resposta = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": env.BREVO_API_KEY,
      "content-type": "application/json",
      "accept": "application/json"
    },
    body: JSON.stringify({
      sender: REMITENT,
      to: [{ email: DESTI, name: "Subirats, endavant!" }],
      replyTo: { email: correu, name: nom },
      subject: "Contacte web: " + nom + " (" + nucli + ")",
      textContent: cos,
      htmlContent:
        '<div style="font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:15px;line-height:24px;color:#222;">' +
        "<p><strong>Nom:</strong> " + escapa(nom) + "<br>" +
        "<strong>Correu:</strong> " + escapa(correu) + "<br>" +
        "<strong>Poble o nucli:</strong> " + escapa(nucli) + "</p>" +
        '<p style="white-space:pre-wrap;">' + escapa(missatge) + "</p>" +
        '<p style="color:#777;font-size:12px;">Enviat des del formulari de subiratsendavant.cat</p>' +
        "</div>",
      tags: ["contacte-web"]
    })
  });

  if (!resposta.ok) {
    const detall = await resposta.text().catch(() => "");
    console.error("Brevo error", resposta.status, detall);
    return json({ error: "No s'ha pogut enviar el missatge." }, 502);
  }

  return json({ ok: true });
}

export async function onRequestGet() {
  return json({ error: "Mètode no permès." }, 405);
}
