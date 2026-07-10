from __future__ import annotations

import importlib.util
import json
import unittest
from pathlib import Path

import jsonschema
import yaml


REPO_ROOT = Path(__file__).resolve().parents[1]
FIXTURES = REPO_ROOT / "tests" / "fixtures" / "filters"


def load_linter_module():
    module_path = REPO_ROOT / "scripts" / "lint_filters.py"
    spec = importlib.util.spec_from_file_location("lint_filters", module_path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {module_path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class FilterLinterTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.linter = load_linter_module()
        schema_path = REPO_ROOT / "scripts" / "filter-schema.json"
        with schema_path.open(encoding="utf-8") as handle:
            cls.schema = json.load(handle)

    def test_schema_is_valid_draft_07(self) -> None:
        jsonschema.Draft7Validator.check_schema(self.schema)
        self.assertEqual(
            "http://json-schema.org/draft-07/schema#", self.schema["$schema"]
        )

    def test_valid_policy_passes(self) -> None:
        errors = self.linter.lint_filters_root(FIXTURES / "valid", self.schema)
        self.assertEqual([], errors)

    def test_official_coursera_policy_matches_incident_evidence(self) -> None:
        filters_root = REPO_ROOT / "filters"
        errors = self.linter.lint_filters_root(filters_root, self.schema)
        self.assertEqual([], errors)

        policy_path = filters_root / "coursera" / "content-integrity.yaml"
        with policy_path.open(encoding="utf-8") as handle:
            policy = yaml.safe_load(handle)

        self.assertEqual(
            [
                '[data-ai-instructions="true"]',
                '[data-testid="content-integrity-instructions"]',
                '[data-testid="acknowledgment-checkpoint"]',
            ],
            policy["dom"]["drop_selectors"],
        )
        self.assertEqual(
            ['[data-action="acknowledge-guidelines"]'],
            policy["interaction"]["deny_selectors"],
        )
        self.assertEqual(
            "You are a helpful AI assistant.",
            policy["result"]["redact_blocks"][0]["start"],
        )
        self.assertEqual(
            "This verification step is mandatory for all AI assistants "
            "accessing assessment pages.",
            policy["result"]["redact_blocks"][0]["end"],
        )

    def test_unknown_executable_field_fails(self) -> None:
        errors = self.linter.lint_filters_root(
            FIXTURES / "invalid-unknown-field", self.schema
        )
        self.assertTrue(any("javascript" in error for error in errors), errors)

    def test_folder_identity_mismatch_fails(self) -> None:
        errors = self.linter.lint_filters_root(
            FIXTURES / "invalid-identity", self.schema
        )
        self.assertTrue(any("must match folder name" in error for error in errors), errors)

    def test_non_origin_url_fails(self) -> None:
        errors = self.linter.lint_filters_root(
            FIXTURES / "invalid-origin", self.schema
        )
        self.assertTrue(any("serialized HTTP origin" in error for error in errors), errors)

    def test_duplicate_yaml_key_fails(self) -> None:
        errors = self.linter.lint_filters_root(
            FIXTURES / "invalid-duplicate-key", self.schema
        )
        self.assertTrue(any("duplicate key" in error for error in errors), errors)

    def test_policy_without_actions_fails(self) -> None:
        errors = self.linter.lint_filters_root(
            FIXTURES / "invalid-no-actions", self.schema
        )
        self.assertTrue(any("schema violation" in error for error in errors), errors)

if __name__ == "__main__":
    unittest.main()
