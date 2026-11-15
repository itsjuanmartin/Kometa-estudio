"""Foto de prueba de Marmo: de frente y de espaldas con el tríceps marcado."""
import sys, os, time, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy
from mathutils import Vector
import escena, marmo

engine = sys.argv[sys.argv.index("--engine") + 1] if "--engine" in sys.argv else "EEVEE"
escena.limpiar()
body, rig = marmo.build()
escena.estudio("gris"); escena.luces()
cam, tgt = escena.camara((0, -2.6, 1.45), (0, 0, 1.35), lens=50)
escena.render_cfg(pct=50, engine=engine, samples=24 if engine == "EEVEE" else 32)
os.makedirs("fotos", exist_ok=True)
t = time.time()
bpy.context.scene.render.filepath = os.path.abspath(f"fotos/frente_{engine}.png")
bpy.ops.render.render(write_still=True)
print("FRENTE", round(time.time() - t, 1), "s")
# espalda con tríceps resaltado
rig.rotation_euler = (0, 0, math.radians(180))
body.data.materials[0].node_tree.nodes["Resalte"].outputs[0].default_value = 1.0
t = time.time()
bpy.context.scene.render.filepath = os.path.abspath(f"fotos/espalda_{engine}.png")
bpy.ops.render.render(write_still=True)
print("ESPALDA", round(time.time() - t, 1), "s")
