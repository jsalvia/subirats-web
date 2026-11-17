#!/usr/bin/env python3
"""Comprova que totes les pàgines tinguin el comptador de NeatStats."""
import pathlib
import sys

ARREL = pathlib.Path(__file__).resolve().parent.parent
TAG = "neatstats.net/view.js"
pagines = sorted(ARREL.glob("*.html"))
falta = [p.name for p in pagines if TAG not in p.read_text(encoding="utf-8")]

if falta:
    print("Falten el comptador de NeatStats: " + ", ".join(falta))
    sys.exit(1)

print("OK: " + str(len(pagines)) + " pàgines amb el comptador.")
