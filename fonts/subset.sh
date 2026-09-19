#!/bin/sh
set -eu

cd "$(dirname "$0")/.."

fonttools='fonttools[woff]==4.65.0'
strict='--unicodes-file=fonts/unicodes.txt'
latin1='--unicodes=U+00A0-00FF'

mkdir -p src/assets/fonts

subset() {
  master=$1
  output=$2
  shift 2
  pipx run --spec "$fonttools" pyftsubset "fonts/masters/$master" \
    --output-file="src/assets/fonts/$output" \
    --layout-features+=tnum,case \
    --name-IDs+=13,14 \
    --desubroutinize \
    --flavor=woff2 \
    "$@"
}

subset Redaction-Regular.otf redaction-regular.woff2 "$strict" --no-hinting
subset Redaction-Bold.otf redaction-bold.woff2 "$strict" --no-hinting
subset Redaction70-Regular.otf redaction-70.woff2 "$strict" --no-hinting

# Redaction has no arrows; this patch face joins the Redaction family through unicode-range.
subset UncutSans-Regular.otf redaction-arrows.woff2 --unicodes=U+2190-2199

subset UncutSans-Regular.otf uncut-sans-regular.woff2 "$strict" "$latin1"
subset UncutSans-Bold.otf uncut-sans-bold.woff2 "$strict" "$latin1"

# Xenon keeps its copyright notice in name ID 7 rather than 0.
subset MonaspaceXenon-Regular.otf sozzer-mono-regular.woff2 "$strict" --name-IDs+=7
subset MonaspaceXenon-Bold.otf sozzer-mono-bold.woff2 "$strict" --name-IDs+=7
subset MonaspaceXenon-Italic.otf sozzer-mono-italic.woff2 "$strict" --name-IDs+=7

pipx run fonts/rename.py src/assets/fonts/sozzer-mono-*.woff2
