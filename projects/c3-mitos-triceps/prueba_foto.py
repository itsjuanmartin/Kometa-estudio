"""Fotos de prueba de Marmo: cuerpo de frente, primer plano de la cara y espalda con el tríceps marcado."""
import sys, os, time, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy
from mathutils import Vector
import escena, marmo, poses

escena.limpiar()
body, rig = marmo.build()
escena.estudio("gris"); escena.luces()
cam, tgt = escena.camara((0.5, -2.7, 1.45), (0, 0, 1.3), lens=50)
escena.render_cfg(pct=40, engine="EEVEE", samples=16)
poses.aplicar(rig, dict(poses.POSES["explica"]))
os.makedirs("fotos", exist_ok=True)
tomas = [("cuerpo", (0.5, -2.7, 1.45), (0, 0, 1.3), 50, 0),
         ("cara", (0.35, -1.25, 1.8), (0, 0, 1.68), 60, 0),
         ("espalda", (0.5, -2.4, 1.5), (0, 0, 1.35), 50, 180)]
for n, loc, t, lens, rot in tomas:
    cam.location = loc; tgt.location = t; cam.data.lens = lens
    rig.rotation_euler = (0, 0, math.radians(rot))
    body.data.materials[0].node_tree.nodes["Resalte"].outputs[0].default_value = 1.0 if rot else 0.0
    bpy.context.scene.render.filepath = os.path.abspath(f"fotos/marmo_{n}.png")
    bpy.ops.render.render(write_still=True); print("FOTO", n)
