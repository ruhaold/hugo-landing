#!/usr/bin/env bash
# Запускает Hugo из ./bin (или из PATH) с нативным Dart Sass из node_modules.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# Пакет sass-embedded ставит бинарники для нескольких платформ (на Linux и glibc, и musl),
# поэтому выбираем каталог явно по системе, а не по маске: иначе можно взять не тот бинарник.
case "$(uname -s)-$(uname -m)" in
  Darwin-arm64)  PLATFORM=darwin-arm64 ;;
  Darwin-x86_64) PLATFORM=darwin-x64 ;;
  Linux-x86_64)  PLATFORM=linux-x64 ;;
  Linux-aarch64) PLATFORM=linux-arm64 ;;
  *)             PLATFORM="" ;;
esac
SASS_DIR="$ROOT/node_modules/sass-embedded-$PLATFORM/dart-sass"
[ -n "$PLATFORM" ] && [ -d "$SASS_DIR" ] && export PATH="$SASS_DIR:$PATH"

HUGO="$ROOT/bin/hugo"
[ -x "$HUGO" ] || HUGO="$(command -v hugo)"
cd "$ROOT"
exec "$HUGO" "$@"
