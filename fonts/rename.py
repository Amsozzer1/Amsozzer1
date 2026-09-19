# /// script
# requires-python = ">=3.10"
# dependencies = ["fonttools[woff]==4.65.0"]
# ///
import sys

from fontTools.ttLib import TTFont

# "Monaspace" and "Xenon" are Reserved Font Names under the OFL, and a subset is a
# Modified Version, so the files the site ships must carry a different name.
FAMILY = 'Sozzer Mono'


def rename(path: str) -> None:
    font = TTFont(path, recalcTimestamp=False)
    name = font['name']
    style = name.getDebugName(2)
    version = name.getDebugName(5).split()[1]
    postscript = f"{FAMILY.replace(' ', '')}-{style}"
    full = f'{FAMILY} {style}'
    names = {
        1: FAMILY,
        2: style,
        3: f'{version};{postscript}',
        4: full,
        5: f'Version {version}',
        6: postscript,
        16: FAMILY,
        17: style,
    }
    for record in name.names:
        if record.nameID in names:
            record.string = names[record.nameID]

    cff = font['CFF '].cff
    cff.fontNames = [postscript]
    top = cff.topDictIndex[0]
    top.FamilyName = FAMILY
    top.FullName = full
    font.save(path)


for path in sys.argv[1:]:
    rename(path)
