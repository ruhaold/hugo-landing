#!/usr/bin/env bash
# Запускает Hugo из ./bin (или из PATH) с нативным Dart Sass из node_modules.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SASS_DIR="$(ls -d "$ROOT"/node_modules/sass-embedded-*/dart-sass 2>/dev/null | head -1 || true)"
[ -n "$SASS_DIR" ] && export PATH="$SASS_DIR:$PATH"
HUGO="$ROOT/bin/hugo"
[ -x "$HUGO" ] || HUGO="$(command -v hugo)"
cd "$ROOT"
exec "$HUGO" "$@"
