"""Draw the AS monogram in public/icon.svg, with the letters as outlines from Redaction Bold.

Outlines rather than <text> so the icon renders identically everywhere, with no font to load.
Run with: pipx run --spec 'fonttools[woff]' python scripts/build-monogram.py
"""

from pathlib import Path

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
FONT = ROOT / "fonts" / "masters" / "Redaction-Bold.otf"
OUT = ROOT / "public" / "icon.svg"

BOX = 32  # viewBox, in the same units as the rest of the icon set
INK = "#0A0A0A"
AMBER = "#E2A100"
TRACKING = -0.012  # em, matching the display tracking in the tokens


def main() -> None:
    font = TTFont(FONT)
    glyphs = font.getGlyphSet()
    upem = font["head"].unitsPerEm
    cmap = font.getBestCmap()

    paths, advance = [], 0.0
    for letter in "AS":
        name = cmap[ord(letter)]
        pen = SVGPathPen(glyphs)
        glyphs[name].draw(pen)
        paths.append((pen.getCommands(), advance))
        advance += glyphs[name].width + TRACKING * upem

    ascent, descent = font["hhea"].ascent, font["hhea"].descent
    cap = font["OS/2"].sCapHeight

    # Fit the pair to the box with a small margin, then centre it on both axes.
    margin = BOX * 0.14
    scale = min((BOX - 2 * margin) / advance, (BOX - 2 * margin) / cap)
    x = (BOX - advance * scale) / 2
    y = (BOX + cap * scale) / 2

    letters = "".join(
        f'<path d="{d}" transform="translate({x + offset * scale:.3f} {y:.3f}) '
        f'scale({scale:.5f} {-scale:.5f})"/>'
        for d, offset in paths
    )

    OUT.write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {BOX} {BOX}">'
        f'<rect width="{BOX}" height="{BOX}" fill="{INK}"/>'
        f'<g fill="{AMBER}">{letters}</g>'
        f"</svg>\n"
    )
    print(f"wrote {OUT.relative_to(ROOT)} (ascent {ascent}, descent {descent}, cap {cap})")


main()
