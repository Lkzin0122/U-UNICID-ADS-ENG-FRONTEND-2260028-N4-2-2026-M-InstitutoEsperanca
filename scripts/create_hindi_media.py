"""Gera o vídeo e o pôster em hindi com o Chromium local, sem serviços externos."""

import base64
from pathlib import Path

from check_contact import run_browser_checks

ROOT = Path(__file__).resolve().parent.parent


def create_media(client, origin):
    client.navigate(origin + "/assets/render-video.html?lang=hi")
    translated = client.evaluate(
        "slides.every(slide => [slide.label, ...slide.lines, slide.detail, slide.word].every(text => /[\\u0900-\\u097f]/.test(text)))"
    )
    if not translated:
        raise RuntimeError("Há textos do vídeo sem tradução em hindi.")
    result = client.evaluate("window.renderVideo()")
    (ROOT / "assets/manifesto-hi.webm").write_bytes(base64.b64decode(result["base64"]))
    poster = (ROOT / "assets/manifesto-poster.svg").read_text(encoding="utf-8")
    translations = {
        "NOSSA PROPOSTA": "हमारा प्रस्ताव",
        "Esperança</text>": "आशा</text>",
        "que acolhe.": "जो अपनापन देती है।",
        "Solidariedade que transforma.": "एकजुटता जो बदलाव लाती है।",
        'font-family="Arial,Helvetica,sans-serif"': 'font-family="Nirmala UI,Noto Sans Devanagari,Arial,sans-serif"',
    }
    for source, translated in translations.items():
        poster = poster.replace(source, translated)
    (ROOT / "assets/manifesto-poster-hi.svg").write_text(poster, encoding="utf-8")
    print(f"Video em hindi gerado: {result['bytes']} bytes.", flush=True)
    return {
        "video_hindi_gerado": result["bytes"] > 0,
        "poster_hindi_gerado": "जो अपनापन देती है।" in poster,
    }


if __name__ == "__main__":
    run_browser_checks(create_media)
