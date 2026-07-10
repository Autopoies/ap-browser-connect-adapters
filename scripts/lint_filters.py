#!/usr/bin/env python3
"""Lint site-filter YAML files against the strict v1 filter schema.

Usage:
    python3 scripts/lint_filters.py filters/ --schema scripts/filter-schema.json
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any
from urllib.parse import urlsplit

import jsonschema
import yaml


class UniqueKeyLoader(yaml.SafeLoader):
    """Safe YAML loader that rejects duplicate mapping keys."""


def _construct_unique_mapping(
    loader: UniqueKeyLoader, node: yaml.MappingNode, deep: bool = False
) -> dict[Any, Any]:
    loader.flatten_mapping(node)
    mapping: dict[Any, Any] = {}
    for key_node, value_node in node.value:
        key = loader.construct_object(key_node, deep=deep)
        try:
            duplicate = key in mapping
        except TypeError as exc:
            raise yaml.constructor.ConstructorError(
                "while constructing a mapping",
                node.start_mark,
                "found an unhashable mapping key",
                key_node.start_mark,
            ) from exc
        if duplicate:
            raise yaml.constructor.ConstructorError(
                "while constructing a mapping",
                node.start_mark,
                f"found duplicate key {key!r}",
                key_node.start_mark,
            )
        mapping[key] = loader.construct_object(value_node, deep=deep)
    return mapping


UniqueKeyLoader.add_constructor(
    yaml.resolver.BaseResolver.DEFAULT_MAPPING_TAG, _construct_unique_mapping
)


def load_schema(schema_path: Path) -> dict[str, Any]:
    with schema_path.open(encoding="utf-8") as handle:
        schema = json.load(handle)
    jsonschema.Draft7Validator.check_schema(schema)
    return schema


def _format_path(parts: Any) -> str:
    rendered = ".".join(str(part) for part in parts)
    return rendered or "<root>"


def _serialized_origin_error(origin: str) -> str | None:
    try:
        parsed = urlsplit(origin)
        port = parsed.port
    except ValueError as exc:
        return str(exc)

    if parsed.scheme not in {"http", "https"}:
        return "scheme must be http or https"
    if parsed.hostname is None:
        return "hostname is required"
    if parsed.username is not None or parsed.password is not None:
        return "userinfo is not allowed"
    if parsed.path or parsed.query or parsed.fragment:
        return "path, query, and fragment must be absent"
    if (port == 80 and parsed.scheme == "http") or (
        port == 443 and parsed.scheme == "https"
    ):
        return "default ports must be omitted"

    host = parsed.hostname
    if ":" in host:
        host = f"[{host}]"
    canonical = f"{parsed.scheme}://{host}"
    if port is not None:
        canonical = f"{canonical}:{port}"
    if origin != canonical:
        return f"origin is not canonical; use {canonical!r}"
    return None


def lint_filter_file(
    policy_path: Path,
    site_dir: Path,
    validator: jsonschema.Draft7Validator,
) -> list[str]:
    errors: list[str] = []
    try:
        with policy_path.open(encoding="utf-8") as handle:
            policy = yaml.load(handle, Loader=UniqueKeyLoader)
    except yaml.YAMLError as exc:
        return [f"{policy_path}: invalid YAML: {exc}"]

    if not isinstance(policy, dict):
        return [f"{policy_path}: top-level must be a mapping"]

    if policy.get("site") != site_dir.name:
        errors.append(
            f"{policy_path}: `site` field ({policy.get('site')!r}) "
            f"must match folder name ({site_dir.name!r})"
        )
    if policy.get("name") != policy_path.stem:
        errors.append(
            f"{policy_path}: `name` field ({policy.get('name')!r}) "
            f"must match filename stem ({policy_path.stem!r})"
        )

    schema_errors = sorted(
        validator.iter_errors(policy),
        key=lambda error: tuple(str(part) for part in error.absolute_path),
    )
    for error in schema_errors:
        errors.append(
            f"{policy_path}: schema violation at "
            f"{_format_path(error.absolute_path)}: {error.message}"
        )

    match = policy.get("match")
    if isinstance(match, dict):
        origins = match.get("origins")
        if isinstance(origins, list):
            for index, origin in enumerate(origins):
                if not isinstance(origin, str):
                    continue
                reason = _serialized_origin_error(origin)
                if reason is not None:
                    errors.append(
                        f"{policy_path}: match.origins.{index} must be an exact "
                        f"serialized HTTP origin: {reason}"
                    )

    return errors


def lint_filters_root(filters_root: Path, schema: dict[str, Any]) -> list[str]:
    if not filters_root.is_dir():
        return [f"{filters_root}: filter root is not a directory"]

    site_dirs = sorted(path for path in filters_root.iterdir() if path.is_dir())
    if not site_dirs:
        return [f"{filters_root}: no site filter folders found"]

    validator = jsonschema.Draft7Validator(
        schema, format_checker=jsonschema.FormatChecker()
    )
    errors: list[str] = []
    for site_dir in site_dirs:
        policies = sorted(site_dir.glob("*.yaml"))
        if not policies:
            errors.append(f"{site_dir}: no filter YAML files found")
            continue
        for policy_path in policies:
            errors.extend(lint_filter_file(policy_path, site_dir, validator))
    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description="Lint site-filter YAML files.")
    parser.add_argument("filters_root", help="Directory containing per-site filters")
    parser.add_argument("--schema", default="scripts/filter-schema.json")
    args = parser.parse_args()

    filters_root = Path(args.filters_root)
    schema_path = Path(args.schema)
    if not filters_root.is_dir():
        print(f"error: {filters_root} is not a directory", file=sys.stderr)
        return 2

    try:
        schema = load_schema(schema_path)
    except (OSError, json.JSONDecodeError, jsonschema.SchemaError) as exc:
        print(f"error: cannot load schema {schema_path}: {exc}", file=sys.stderr)
        return 2

    errors = lint_filters_root(filters_root, schema)
    if errors:
        print(f"\n{len(errors)} error(s):", file=sys.stderr)
        for error in errors:
            print(f"  - {error}", file=sys.stderr)
        return 1

    print(f"OK: all filters under {filters_root} pass lint")
    return 0


if __name__ == "__main__":
    sys.exit(main())
