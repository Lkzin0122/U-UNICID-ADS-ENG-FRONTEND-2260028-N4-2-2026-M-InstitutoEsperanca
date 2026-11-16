"""Atualiza o sintetizador local com versão fixada e integridade do registro npm."""

import json

from update_phone_vendor import ROOT, package, write_member

NAME = "@echogarden/espeak-ng-emscripten"
VERSION = "0.3.5"


def main():
    target = ROOT / "assets/vendor/espeak-ng"
    with package(NAME, VERSION) as archive:
        for name in ["espeak-ng.js", "espeak-ng.data", "README.md"]:
            write_member(archive, "package/" + name, target / name)
        write_member(archive, "package/COPYING", target / "LICENSE")
    # Este arquivo pertencia à distribuição antiga, anterior às correções de 2023.
    (target / "espeak-ng.wasm").unlink(missing_ok=True)
    provenance = {
        "package": NAME,
        "version": VERSION,
        "source": "https://github.com/echogarden-project/espeak-ng-emscripten",
        "engine_source": "https://github.com/echogarden-project/espeak-ng/tree/fork",
        "security_fix": "https://github.com/espeak-ng/espeak-ng/commit/58f1e0b6a4e6aa55621c6f01118994d01fd6f68c",
        "refresh": "python -B scripts/update_speech_vendor.py",
    }
    (target / "PROVENANCE.json").write_text(
        json.dumps(provenance, indent=2) + "\n", encoding="utf-8"
    )
    print(f"Updated {NAME}@{VERSION}; registry integrity verified.")


if __name__ == "__main__":
    main()
