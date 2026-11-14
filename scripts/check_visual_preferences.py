"""Check actual controls, distinct modes, persisted settings and color contrast."""

import itertools
import json
from pathlib import Path
from check_contact import run_browser_checks

ROOT = Path(__file__).resolve().parent.parent
WAIT = "new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))"
source = (ROOT / "scripts/check_contrast.cjs").read_text(encoding="utf-8")
AUDIT = source.split("const audit = `", 1)[1].split("`;\n", 1)[0].replace("\\\\", "\\")


def check(client, origin):
    checks = {}
    report = {
        "browser": client.evaluate("navigator.userAgent"),
        "pages": [],
        "layouts": [],
        "contrast": [],
        "skipped": set(),
        "hoverTextChecks": 0,
    }

    def emulate_media(features):
        # Medir cores finais, sem capturar a interpolação de uma transição CSS.
        client.call(
            "Emulation.setEmulatedMedia",
            {"features": [*features, {"name": "prefers-reduced-motion", "value": "reduce"}]},
        )

    client.call(
        "Emulation.setDeviceMetricsOverride",
        {"width": 1440, "height": 1000, "deviceScaleFactor": 1, "mobile": False},
    )
    emulate_media([{"name": "prefers-color-scheme", "value": "light"}])

    def click(selector):
        client.evaluate("document.querySelector(" + json.dumps(selector) + ").click()")

    def select(selector, value):
        client.evaluate(
            """(() => { const element = document.querySelector("""
            + json.dumps(selector)
            + """);
          element.value = """
            + json.dumps(value)
            + """; element.dispatchEvent(new Event('change',{bubbles:true})); })()"""
        )

    def snapshot():
        return client.evaluate("""(() => {
          const root = document.documentElement, style = getComputedStyle(root);
          return {theme:root.classList.contains('theme-dark'),scheme:style.colorScheme,
            invert:root.classList.contains('inverted-colors'),filter:style.filter,
            contrast:root.classList.contains('high-contrast'),vision:root.dataset.colorVision,
            paper:style.getPropertyValue('--paper').trim(),accent:style.getPropertyValue('--blue').trim(),
            border:getComputedStyle(document.querySelector('.accessibility-controls')).borderWidth};
        })()""")

    client.navigate(origin + "/acessibilidade.html")
    original = snapshot()
    checks["four_requested_options"] = client.evaluate(
        "JSON.stringify([...document.querySelector('select[data-color-vision]').options].slice(1).map(o=>o.textContent))===JSON.stringify(['Protanopia','Deuteranopia','Tritanopia','Acromatopsia'])"
    )
    for profile in ("protanopia", "deuteranopia", "tritanopia", "achromatopsia"):
        select("select[data-color-vision]", profile)
        checks["control_" + profile] = client.evaluate(
            "document.documentElement.dataset.colorVision==="
            + json.dumps(profile)
            + " && getComputedStyle(document.body).filter==="
            + json.dumps("grayscale(1)" if profile == "achromatopsia" else "none")
        )
    select("select[data-color-vision]", "off")
    select("[data-theme-preference]", "dark")
    dark = snapshot()
    checks["dark_changes_surfaces_without_filter"] = (
        dark["paper"] != original["paper"] and dark["filter"] == "none" and dark["scheme"] == "dark"
    )
    click("[data-invert-toggle]")
    inverted = snapshot()
    checks["inversion_is_independent"] = (
        inverted["theme"]
        and inverted["scheme"] == "dark"
        and inverted["paper"] == dark["paper"]
        and inverted["filter"] == "invert(1)"
    )
    click("[data-invert-toggle]")
    select("select[data-color-vision]", "deuteranopia")
    vision = snapshot()
    checks["color_vision_changes_accents_without_changing_theme"] = (
        vision["paper"] == dark["paper"]
        and vision["accent"] != dark["accent"]
        and vision["filter"] == "none"
    )
    click("[data-contrast-toggle]")
    contrast = snapshot()
    checks["high_contrast_changes_surfaces_and_borders"] = (
        contrast["paper"] == "#000" and contrast["border"] == "2px" and contrast["theme"]
    )
    checks["toggle_states_and_non_color_cues"] = client.evaluate("""(() => {
      const button=document.querySelector('[data-contrast-toggle]');
      return button.getAttribute('aria-pressed')==='true' && getComputedStyle(button,'::after').content.includes('✓')
        && document.querySelector('select[data-color-vision]').value==='deuteranopia';
    })()""")
    click("[data-invert-toggle]")
    client.navigate(origin + "/contato.html")
    checks["settings_persist_on_navigation"] = client.evaluate(
        "document.documentElement.classList.contains('theme-dark') && document.documentElement.classList.contains('inverted-colors') && document.documentElement.classList.contains('high-contrast') && document.documentElement.dataset.colorVision==='deuteranopia'"
    )
    client.navigate(origin + "/midia.html")
    client.evaluate("new Promise(resolve=>setTimeout(resolve,150))")
    checks["frame_inherits_without_double_inversion"] = client.evaluate(
        "(() => {const r=document.querySelector('iframe').contentDocument.documentElement;return r.classList.contains('theme-dark') && r.classList.contains('high-contrast') && !r.classList.contains('inverted-colors') && r.dataset.colorVision==='deuteranopia'})()"
    )
    client.navigate(origin + "/assets/apresentacao.html")
    checks["standalone_frame_inverts_once"] = client.evaluate(
        "document.documentElement.classList.contains('inverted-colors') && getComputedStyle(document.documentElement).filter==='invert(1)'"
    )
    client.navigate(origin + "/acessibilidade.html")
    click("[data-visual-reset]")
    checks["reset_all_visual_controls"] = client.evaluate(
        "(() => {const p=JSON.parse(localStorage.getItem('esperanca-visual-preferences'));return p.scale===1&&!p.contrast&&!p.invert&&p.theme==='system'&&p.colorVision==='off'&&!document.documentElement.classList.contains('theme-dark')})()"
    )
    emulate_media([{"name": "prefers-color-scheme", "value": "dark"}])
    client.evaluate(WAIT)
    checks["system_theme_updates"] = client.evaluate(
        "document.documentElement.classList.contains('theme-dark')"
    )
    select("[data-theme-preference]", "light")
    checks["explicit_theme_overrides_system"] = not snapshot()["theme"]
    emulate_media([{"name": "prefers-color-scheme", "value": "light"}])
    click("[data-visual-reset]")

    for legacy, current in (
        ("red-green", "deuteranopia"),
        ("blue-yellow", "tritanopia"),
        ("monochrome", "achromatopsia"),
    ):
        client.evaluate(
            "localStorage.setItem('esperanca-visual-preferences',JSON.stringify({theme:'light',colorVision:"
            + json.dumps(legacy)
            + "}))"
        )
        client.navigate(origin + "/acessibilidade.html")
        checks["migrate_" + legacy] = client.evaluate(
            "document.documentElement.dataset.colorVision==="
            + json.dumps(current)
            + " && document.querySelector('select[data-color-vision]').value==="
            + json.dumps(current)
        )
    click("[data-visual-reset]")

    for page in sorted(ROOT.glob("*.html")):
        client.navigate(origin + "/" + page.name)
        page_count = 0
        for vision, dark, invert, contrast in itertools.product(
            ("off", "protanopia", "deuteranopia", "tritanopia", "achromatopsia"),
            (False, True),
            (False, True),
            (False, True),
        ):
            mode = {"vision": vision, "dark": dark, "invert": invert, "contrast": contrast}
            client.evaluate(
                """(() => {const mode="""
                + json.dumps(mode)
                + """; const root=document.documentElement;
              root.dataset.colorVision=mode.vision;root.classList.toggle('theme-dark',mode.dark);
              root.classList.toggle('inverted-colors',mode.invert);root.classList.toggle('high-contrast',mode.contrast);
              document.querySelectorAll('.nav-group').forEach(e=>e.open=true);
            })()"""
            )
            audit = client.evaluate(AUDIT)
            page_count += audit["checked"]
            report["skipped"].update(audit["skipped"])
            for failure in audit["failures"]:
                report["contrast"].append({"page": page.name, **mode, **failure})
        report["pages"].append({"page": page.name, "modes": 40, "textChecks": page_count})

    client.call("DOM.enable")
    client.call("CSS.enable")
    forced = []
    for page in ("acessibilidade.html", "contato.html", "galeria.html", "noticias.html"):
        client.navigate(origin + "/" + page)
        document = client.call("DOM.getDocument")["root"]
        nodes = client.call(
            "DOM.querySelectorAll",
            {"nodeId": document["nodeId"], "selector": ".button,[data-filter]"},
        )["nodeIds"]
        for node in nodes:
            client.call("CSS.forcePseudoState", {"nodeId": node, "forcedPseudoClasses": ["hover"]})
        for vision, dark, invert, contrast in itertools.product(
            ("off", "protanopia", "deuteranopia", "tritanopia", "achromatopsia"),
            (False, True),
            (False, True),
            (False, True),
        ):
            mode = {"vision": vision, "dark": dark, "invert": invert, "contrast": contrast}
            client.evaluate(
                """(() => {const m="""
                + json.dumps(mode)
                + """,r=document.documentElement;
              r.dataset.colorVision=m.vision;r.classList.toggle('theme-dark',m.dark);
              r.classList.toggle('inverted-colors',m.invert);r.classList.toggle('high-contrast',m.contrast);
            })()"""
            )
            audit = client.evaluate(AUDIT)
            report["hoverTextChecks"] += audit["checked"]
            report["contrast"].extend(
                {"page": page, "hover": True, **mode, **failure} for failure in audit["failures"]
            )
        emulate_media([{"name": "forced-colors", "value": "active"}])
        audit = client.evaluate(AUDIT)
        forced.append({"page": page, "checked": audit["checked"], "failures": audit["failures"]})
        emulate_media([{"name": "prefers-color-scheme", "value": "light"}])
    report["forcedColors"] = forced
    checks["forced_system_colors"] = not any(item["failures"] for item in forced)

    for page in ("index.html", "acessibilidade.html", "contato.html"):
        client.navigate(origin + "/" + page)
        for width, height in ((390, 844), (768, 1024), (1440, 1000)):
            client.call(
                "Emulation.setDeviceMetricsOverride",
                {"width": width, "height": height, "deviceScaleFactor": 1, "mobile": width < 600},
            )
            for scale in (1, 2):
                client.evaluate(
                    "document.documentElement.style.setProperty('--font-scale'," + str(scale) + ")"
                )
                for dark, invert, contrast in (
                    (False, False, False),
                    (True, False, False),
                    (False, True, False),
                    (True, True, True),
                ):
                    client.evaluate(
                        f"document.documentElement.classList.toggle('theme-dark',{str(dark).lower()});document.documentElement.classList.toggle('inverted-colors',{str(invert).lower()});document.documentElement.classList.toggle('high-contrast',{str(contrast).lower()})"
                    )
                    overflow = client.evaluate("document.documentElement.scrollWidth>innerWidth+1")
                    report["layouts"].append(
                        {
                            "page": page,
                            "width": width,
                            "scale": scale,
                            "dark": dark,
                            "invert": invert,
                            "contrast": contrast,
                            "overflow": overflow,
                        }
                    )
    checks["all_color_combinations_contrast"] = not report["contrast"]
    checks["responsive_and_zoom_layouts"] = not any(item["overflow"] for item in report["layouts"])
    errors = [e["params"] for e in client.events if e.get("method") == "Runtime.exceptionThrown"]
    checks["no_javascript_errors"] = not errors
    report["skipped"] = sorted(report["skipped"])
    report["errors"] = errors
    report["checks"] = checks
    (ROOT / "docs/visual-checks.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    if report["contrast"]:
        unique = {
            f["element"] + "|" + f["color"] + "|" + str(f["background"]) + "|" + str(f["ratio"]): f
            for f in report["contrast"]
        }
        print(
            json.dumps(
                {"uniqueContrastFailures": list(unique.values())[:40]}, ensure_ascii=True, indent=2
            ),
            flush=True,
        )
    print(
        json.dumps(
            {"layoutFailures": [item for item in report["layouts"] if item["overflow"]]}, indent=2
        ),
        flush=True,
    )
    return checks


if __name__ == "__main__":
    run_browser_checks(check)
