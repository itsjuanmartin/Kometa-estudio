import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy
from mathutils import Vector
import escena, anatomia
escena.limpiar()
A = anatomia.build()
print("INFO", {k: tuple(round(x, 3) for x in v) if hasattr(v, "x") else round(v, 3) for k, v in A.info.items()})
escena.estudio("gris"); escena.luces()
escena.render_cfg(pct=40, engine="EEVEE", samples=12)
h = A.info["hombro"]
cam, tgt = escena.camara((0, -1.9, 1.3), (0, 0, 1.22), lens=50)
tomas = [("detras", 205, 0, 0), ("detras_codo", 205, 0, 90), ("lado_arriba", 250, 170, 120), ("detras_arriba", 205, 170, 120)]
for n, rot, hom, codo in tomas:
    A.root.rotation_euler = (0, 0, math.radians(rot))
    A.pose(hom, codo); A.resalta("long" if "arriba" in n else None)
    bpy.context.scene.render.filepath = os.path.abspath(f"fotos/anat_{n}.png"); bpy.ops.render.render(write_still=True); print("FOTO", n)
