#!/usr/bin/env python3
"""
Genera la secció d'agenda de la web a partir d'un calendari en format iCalendar.

Font, per ordre de prioritat:
  1. Variable d'entorn AGENDA_ICS_URL  (URL https del calendari públic de Google)
  2. Fitxer data/agenda.ics            (font local, versionada al repositori)

Escriu el bloc entre els marcadors <!-- AGENDA:INICI --> i <!-- AGENDA:FI -->
del fitxer agenda.html. Sense dependències externes.
"""

import os
import re
import sys
import unicodedata
import urllib.request
from datetime import date, datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

ARREL = Path(__file__).resolve().parent.parent
PAGINA = ARREL / "agenda.html"
LOCAL = ARREL / "data" / "agenda.ics"
TZ = ZoneInfo("Europe/Madrid")
MAX_ACTES = 20

MESOS = ["gener", "febrer", "març", "abril", "maig", "juny", "juliol",
         "agost", "setembre", "octubre", "novembre", "desembre"]
MESOS_CURT = ["gen.", "febr.", "març", "abr.", "maig", "juny", "jul.", "ag.", "set.", "oct.", "nov.", "des."]
DIES = ["dilluns", "dimarts", "dimecres", "dijous", "divendres", "dissabte", "diumenge"]


def desplega(text):
    """Desfà els salts de línia de iCalendar (línies que comencen amb espai)."""
    return re.sub(r"\r?\n[ \t]", "", text)


def escapa(text):
    return (text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                .replace('"', "&quot;"))


def llegeix_ics(contingut):
    """Retorna una llista de diccionaris amb els VEVENT."""
    esdeveniments = []
    actual = None
    for linia in desplega(contingut).splitlines():
        linia = linia.strip("\r")
        if linia == "BEGIN:VEVENT":
            actual = {}
        elif linia == "END:VEVENT":
            if actual is not None:
                esdeveniments.append(actual)
            actual = None
        elif actual is not None and ":" in linia:
            clau, valor = linia.split(":", 1)
            nom = clau.split(";")[0].upper()
            params = clau[len(nom):]
            if nom not in actual:
                actual[nom] = valor
                actual[nom + "_PARAMS"] = params
    return esdeveniments


def a_data(valor, params):
    """Converteix un valor DTSTART/DTEND a (datetime local, es_tot_el_dia)."""
    valor = valor.strip()
    if re.fullmatch(r"\d{8}", valor):                      # VALUE=DATE
        return datetime.strptime(valor, "%Y%m%d").replace(tzinfo=TZ), True
    if valor.endswith("Z"):
        return datetime.strptime(valor, "%Y%m%dT%H%M%SZ").replace(tzinfo=ZoneInfo("UTC")).astimezone(TZ), False
    return datetime.strptime(valor, "%Y%m%dT%H%M%S").replace(tzinfo=TZ), False


def neteja(text):
    if not text:
        return ""
    text = text.replace("\\n", " ").replace("\\,", ",").replace("\\;", ";").replace("\\\\", "\\")
    return re.sub(r"\s+", " ", text).strip()


def enllac_calendari(titol, inici, fi, lloc, descripcio):
    from urllib.parse import quote
    dates = f"{inici.strftime('%Y%m%dT%H%M%S')}/{fi.strftime('%Y%m%dT%H%M%S')}"
    params = [("action", "TEMPLATE"), ("text", titol), ("dates", dates)]
    if lloc:
        params.append(("location", lloc))
    if descripcio:
        params.append(("details", descripcio))
    consulta = "&".join(f"{k}={quote(v)}" for k, v in params)
    return "https://calendar.google.com/calendar/render?" + consulta


def targeta(ev, ara):
    inici, tot_dia = a_data(ev.get("DTSTART", ""), ev.get("DTSTART_PARAMS", ""))
    if "DTEND" in ev:
        fi, _ = a_data(ev["DTEND"], ev.get("DTEND_PARAMS", ""))
    else:
        fi = inici + (timedelta(days=1) if tot_dia else timedelta(hours=2))

    if fi < ara:
        return None
    if ev.get("STATUS", "").upper() == "CANCELLED":
        return None

    titol = neteja(ev.get("SUMMARY")) or "Acte de la candidatura"
    lloc = neteja(ev.get("LOCATION"))
    desc = neteja(ev.get("DESCRIPTION"))

    if tot_dia:
        meta_data = f"{DIES[inici.weekday()]} {inici.day} de {MESOS[inici.month - 1]}"
        meta_hora = "Tot el dia"
    else:
        meta_data = f"{DIES[inici.weekday()]} {inici.day} de {MESOS[inici.month - 1]} de {inici.year}"
        meta_hora = inici.strftime("%H.%M") + " h"

    meta = " · ".join([meta_data, meta_hora] + ([lloc] if lloc else []))
    boto = ""
    if not tot_dia:
        boto = (f'\n        <p class="acte__accions"><a class="acte__boto" '
                f'href="{escapa(enllac_calendari(titol, inici, fi, lloc, desc))}" '
                f'target="_blank" rel="noopener noreferrer">Afegeix al calendari</a></p>')

    return f'''      <article class="acte">
        <p class="acte__data" aria-hidden="true">
          <span class="acte__dia">{inici.day}</span>
          <span class="acte__mes">{MESOS_CURT[inici.month - 1]}</span>
        </p>
        <div class="acte__cos">
          <h2 class="acte__titol">{escapa(titol)}</h2>
          <p class="acte__meta">{escapa(meta)}</p>
          {f'<p class="acte__text">{escapa(desc)}</p>' if desc else ''}{boto}
        </div>
      </article>'''


def main():
    url = os.environ.get("AGENDA_ICS_URL", "").strip()

    if url:
        with urllib.request.urlopen(url, timeout=30) as resposta:
            contingut = resposta.read().decode("utf-8", "replace")
        origen = url
    elif LOCAL.exists():
        contingut = LOCAL.read_text(encoding="utf-8")
        origen = str(LOCAL.relative_to(ARREL))
    else:
        print("No hi ha font d'agenda (ni AGENDA_ICS_URL ni data/agenda.ics).", file=sys.stderr)
        return 1

    ara = datetime.now(TZ)
    blocs = [t for t in (targeta(ev, ara) for ev in llegeix_ics(contingut)) if t]

    if blocs:
        cos = '    <div class="agenda">\n' + "\n".join(blocs) + "\n    </div>"
    else:
        cos = ('    <p class="agenda__buit">Encara no hi ha actes publicats. '
               'Segueix-nos a les xarxes i els anirem anunciant.</p>')

    html = PAGINA.read_text(encoding="utf-8")
    patro = re.compile(r"(<!-- AGENDA:INICI -->).*?(<!-- AGENDA:FIN -->)", re.S)
    if not patro.search(html):
        print("No trobo els marcadors de l'agenda a agenda.html", file=sys.stderr)
        return 1
    nou = html[:patro.search(html).start()] + f"<!-- AGENDA:INICI -->\n{cos}\n    <!-- AGENDA:FIN -->" + html[patro.search(html).end():]
    PAGINA.write_text(nou, encoding="utf-8")
    print(f"Agenda actualitzada des de {origen}: {len(blocs)} acte(s).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
