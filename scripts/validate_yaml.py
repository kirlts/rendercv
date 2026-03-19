#!/usr/bin/env python3
"""Validate a RenderCV YAML file against the schema.

Usage:  uv run python scripts/validate_yaml.py <path-to-yaml>
Exit:   0 = valid, 1 = validation error
"""
import pathlib
import sys

def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: validate_yaml.py <path-to-yaml>", file=sys.stderr)
        return 2

    yaml_path = pathlib.Path(sys.argv[1])
    if not yaml_path.exists():
        print(f"ERROR: File not found: {yaml_path}", file=sys.stderr)
        return 2

    yaml_content = yaml_path.read_text(encoding="utf-8")

    from rendercv.schema.rendercv_model_builder import (
        build_rendercv_dictionary_and_model,
    )
    from rendercv.exception import RenderCVUserValidationError

    try:
        _, model = build_rendercv_dictionary_and_model(
            yaml_content, input_file_path=yaml_path
        )
        print(f"✅ VALIDATION PASSED: {yaml_path}")
        return 0
    except RenderCVUserValidationError as e:
        print(f"❌ VALIDATION FAILED: {yaml_path}", file=sys.stderr)
        for err in e.validation_errors:
            print(f"   {err}", file=sys.stderr)
        return 1
    except Exception as e:
        print(f"❌ UNEXPECTED ERROR: {type(e).__name__}: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
