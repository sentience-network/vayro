#!/usr/bin/env python3
"""Check literal internal links and client API targets against the Next app tree.

This is intentionally dependency-free so it can run locally and in Render/CI.
Dynamic segments are matched against [segment] and [...segment] route folders.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / "src" / "app"
SOURCE = ROOT / "src"

LINK_RE = re.compile(r"(?:href|url)\s*=\s*[\"'`]([^\"'`]+)")
FETCH_RE = re.compile(r"fetch\(\s*[\"'`]([^\"'`]+)")


def route_parts(path: str) -> list[str]:
    return [part for part in path.strip("/").split("/") if part]


def route_exists(path: str) -> bool:
    parts = route_parts(path.split("?", 1)[0].split("#", 1)[0])
    current = APP
    for part in parts:
        exact = current / part
        dynamic = next((child for child in current.iterdir() if child.is_dir() and child.name.startswith("[") and not child.name.startswith("[...")), None)
        catch_all = next((child for child in current.iterdir() if child.is_dir() and child.name.startswith("[...")), None)
        if exact.is_dir():
            current = exact
        elif dynamic and dynamic.is_dir():
            current = dynamic
        elif catch_all and catch_all.is_dir():
            current = catch_all
            return any((current / name).exists() for name in ("page.tsx", "route.ts", "route.tsx"))
        else:
            return False
    if any((current / name).exists() for name in ("page.tsx", "route.ts", "route.tsx")):
        return True
    # A template target may stop immediately before a dynamic segment, e.g.
    # /api/listings/${id}; accept a matching [id] child route.
    return any(
        child.is_dir()
        and child.name.startswith("[")
        and any((child / name).exists() for name in ("page.tsx", "route.ts", "route.tsx"))
        for child in current.iterdir()
    )


def normalize(value: str) -> str | None:
    value = value.strip()
    if not value.startswith("/") or value.startswith("//"):
        return None
    if value.startswith("/api/"):
        # A template target such as /api/listings/${id} is checked by its
        # static prefix, while literal query strings remain intact.
        value = value.split("${", 1)[0].rstrip("/")
    if value.startswith("/api/") and value.endswith("/"):
        value = value.rstrip("/")
    return value


def main() -> int:
    candidates: set[tuple[str, Path]] = set()
    for file in [*SOURCE.rglob("*.tsx"), *SOURCE.rglob("*.ts")]:
        text = file.read_text(encoding="utf-8", errors="ignore")
        for pattern in (LINK_RE, FETCH_RE):
            for match in pattern.finditer(text):
                target = normalize(match.group(1))
                if target:
                    candidates.add((target, file))

    missing: list[tuple[str, Path]] = []
    for target, file in sorted(candidates):
        if not route_exists(target):
            missing.append((target, file))

    print(f"Checked {len(candidates)} internal route targets.")
    if missing:
        print("Missing targets:")
        for target, file in missing:
            print(f"  {target} ({file.relative_to(ROOT)})")
        return 1
    print("All literal page and API targets resolve in src/app.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
