"""Consulta OSV para ferramentas e bibliotecas copiadas, além do npm audit."""

import json
from pathlib import Path
import re
import urllib.request

ROOT = Path(__file__).resolve().parent.parent


def inventory():
    lock = json.loads((ROOT / "package-lock.json").read_text(encoding="utf-8"))
    packages = [
        ("npm", item.get("name", path.split("node_modules/")[-1]), item["version"])
        for path, item in lock["packages"].items()
        if path and "version" in item
    ]
    requirements = (ROOT / "requirements-dev.txt").read_text(encoding="utf-8")
    packages += [
        ("PyPI", name, version)
        for name, version in re.findall(
            r"^([A-Za-z0-9_.-]+)==([^\s;]+)", requirements, re.MULTILINE
        )
    ]
    for name in ["intl-tel-input", "libphonenumber-js"]:
        readme = (ROOT / f"assets/vendor/{name}/README.md").read_text(encoding="utf-8")
        version = re.search(r"^# " + re.escape(name) + r" (\S+)", readme)[1]
        packages.append(("npm", name, version))
    speech = json.loads(
        (ROOT / "assets/vendor/espeak-ng/PROVENANCE.json").read_text(encoding="utf-8")
    )
    packages.append(("npm", speech["package"], speech["version"]))
    return packages


def main():
    packages = inventory()
    queries = [
        {"package": {"ecosystem": ecosystem, "name": name}, "version": version}
        for ecosystem, name, version in packages
    ]
    request = urllib.request.Request(
        "https://api.osv.dev/v1/querybatch",
        data=json.dumps({"queries": queries}).encode(),
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(request, timeout=45) as response:
        results = json.load(response)["results"]
    if len(results) != len(packages):
        raise RuntimeError("OSV retornou uma resposta incompleta.")
    failed = False
    for (_, name, version), result in zip(packages, results):
        ids = [item["id"] for item in result.get("vulns", [])]
        failed |= bool(ids)
        print(f"{name}@{version}: " + (", ".join(ids) if ids else "sem alertas no OSV"))
    raise SystemExit(1 if failed else 0)


if __name__ == "__main__":
    main()
