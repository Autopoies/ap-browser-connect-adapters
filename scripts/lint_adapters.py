#!/usr/bin/env python3
"""Lint site-adapter YAML files against adapter-schema.json.

Mirrors the in-process lint done by ap-browser CLI's `ap-browser sites lint`.
This script is the CI source of truth so the adapters repo can validate PRs
without depending on the Rust binary.

Usage:
    python scripts/lint_adapters.py knowledge/sites/ --schema scripts/adapter-schema.json
"""
import argparse
import json
import sys
from pathlib import Path

import jsonschema
import yaml


def load_schema(schema_path: Path) -> dict:
    with schema_path.open() as f:
        return json.load(f)


def lint_site_dir(site_dir: Path, schema: dict) -> list[str]:
    """Lint every *.yml / *.yaml adapter inside a single site folder."""
    errors: list[str] = []
    yamls = sorted(site_dir.glob("*.yml")) + sorted(site_dir.glob("*.yaml"))
    if not yamls:
        errors.append(f"{site_dir}: no adapter YAML files found")
        return errors

    site_meta_ok = (site_dir / "site.yml").exists() or (site_dir / "site.yaml").exists()
    if not site_meta_ok:
        errors.append(f"{site_dir}: missing required 'site.yml' (site metadata)")

    for yml in yamls:
        if yml.name.startswith("site."):
            continue
        try:
            with yml.open() as f:
                adapter = yaml.safe_load(f)
        except yaml.YAMLError as e:
            errors.append(f"{yml}: invalid YAML: {e}")
            continue

        if not isinstance(adapter, dict):
            errors.append(f"{yml}: top-level must be a mapping")
            continue

        if adapter.get("site") != site_dir.name:
            errors.append(
                f"{yml}: `site` field ('{adapter.get('site')}') must match folder name ('{site_dir.name}')"
            )

        cmd_name = yml.stem
        if adapter.get("name") != cmd_name:
            errors.append(
                f"{yml}: `name` field ('{adapter.get('name')}') must match filename stem ('{cmd_name}')"
            )

        try:
            jsonschema.validate(adapter, schema)
        except jsonschema.ValidationError as e:
            path = ".".join(str(p) for p in e.absolute_path) or "<root>"
            errors.append(f"{yml}: schema violation at {path}: {e.message}")

    return errors


def main() -> int:
    ap = argparse.ArgumentParser(description="Lint site-adapter YAML files.")
    ap.add_argument("sites_root", help="Directory containing per-site folders")
    ap.add_argument("--schema", default="scripts/adapter-schema.json")
    args = ap.parse_args()

    sites_root = Path(args.sites_root)
    schema_path = Path(args.schema)

    if not sites_root.is_dir():
        print(f"error: {sites_root} is not a directory", file=sys.stderr)
        return 2

    schema = load_schema(schema_path)

    all_errors: list[str] = []
    site_dirs = sorted(p for p in sites_root.iterdir() if p.is_dir())
    if not site_dirs:
        print(f"error: no site folders under {sites_root}", file=sys.stderr)
        return 2

    for site_dir in site_dirs:
        all_errors.extend(lint_site_dir(site_dir, schema))

    if all_errors:
        print(f"\n{len(all_errors)} error(s):", file=sys.stderr)
        for e in all_errors:
            print(f"  - {e}", file=sys.stderr)
        return 1

    print(f"OK: all adapters under {sites_root} pass lint")
    return 0


if __name__ == "__main__":
    sys.exit(main())
