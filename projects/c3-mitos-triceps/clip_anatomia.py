"""Clip anatómico: extensión por encima de la cabeza con la cabeza larga del tríceps resaltada."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy
import escena, anatomia
HERE = os.path.dirname(os.path.abspath(__file__))
escena.limpiar()
A = anatomia.build()
escena.estudio("gris"); escena.luces()
escena.render_cfg(pct=50, engine="EEVEE", samples=6)
cam, tgt = escena.camara((0, -2.3, 1.45), (0, 0, 1.5), lens=50)
A.resalta("long")
N = 60
for f in range(1, N + 1):
    k = 0.5 - 0.5 * math.cos(2 * math.pi * (f - 1) / N)
    A.pose(172, 135 - 120 * k)
    A.root.rotation_euler = (0, 0, math.radians(232 + 10 * math.sin(2 * math.pi * (f - 1) / N)))
    A.hombro.keyframe_insert("rotation_euler", frame=f); A.codo.keyframe_insert("rotation_euler", frame=f)
    A.root.keyframe_insert("rotation_euler", frame=f)
sc = bpy.context.scene; sc.frame_start, sc.frame_end = 1, N
sc.render.filepath = os.path.join(HERE, "clip_anatomia", "f_"); bpy.ops.render.render(animation=True); print("CLIP OK")
