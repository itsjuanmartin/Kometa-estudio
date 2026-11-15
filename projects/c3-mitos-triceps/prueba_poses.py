"""Hoja de poses de Marmo (fotos rápidas para revisar)."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy
import escena, marmo, poses

escena.limpiar()
body, rig = marmo.build()
escena.estudio("gris"); escena.luces()
cam, tgt = escena.camara((0.9, -2.7, 1.55), (0, 0, 1.3), lens=45)
escena.render_cfg(pct=30, engine="EEVEE", samples=12)
os.makedirs("fotos/poses", exist_ok=True)
nombres = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else list(poses.POSES)
for n in nombres:
    p = dict(poses.POSES[n]); p["jaw"] = 0.0
    poses.aplicar(rig, p)
    bpy.context.scene.render.filepath = os.path.abspath(f"fotos/poses/{n}.png")
    bpy.ops.render.render(write_still=True)
    print("POSE", n)
