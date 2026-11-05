# pyright: reportMissingImports=false
"""
Adds (or repositions) the `sign` empty in the Blender source of the campus model.

Keeps the .blend and the exported .glb in agreement so the marker does not
vanish the next time somebody re-exports from Blender.

Usage (position is in glTF coordinates: Y up, metres):
    blender -b blender/Eng.blend --python scripts/add-sign-to-blend.py -- 54.5,4,34
"""

import sys

# `bpy` only exists inside Blender's bundled Python, so static tools cannot see
# it: the pyright directive above silences that, and this guard explains the
# failure if the script is ever run with a system interpreter.
try:
    import bpy
except ImportError:  # pragma: no cover - developer ergonomics only
    sys.exit(
        "Run this script through Blender: "
        "blender -b blender/Eng.blend --python scripts/add-sign-to-blend.py -- x,y,z"
    )

argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
raw = argv[0] if argv else "54.5,4,34"
x, y, z = (float(value) for value in raw.split(","))

# glTF is Y-up, Blender is Z-up: (x, y, z) -> (x, -z, y)
location = (x, -z, y)

empty = bpy.data.objects.get("sign")
if empty is None:
    empty = bpy.data.objects.new("sign", None)
    bpy.context.scene.collection.objects.link(empty)
    empty.empty_display_type = "PLAIN_AXES"
    empty.empty_display_size = 4.0
    print(f"created empty 'sign' at {location}")
else:
    print(f"moved empty 'sign' to {location}")

empty.location = location
bpy.ops.wm.save_mainfile()
print("saved", bpy.data.filepath)
