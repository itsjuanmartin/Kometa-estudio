"""Prueba de calidad: jalón de tríceps en polea con barra, agarre correcto y brazos simétricos.
/root/bpyenv/bin/python prueba_polea.py -- [--fotos] [--clip]"""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy
from mathutils import Vector
import escena, marmo, poses
from poses import v, mezclar

HERE = os.path.dirname(os.path.abspath(__file__))
escena.limpiar()
body, rig = marmo.build()
escena.estudio("gris"); escena.luces()
cam, tgt = escena.camara((0, -3.0, 1.3), (0, 0, 1.5), lens=45)
body.data.materials[0].node_tree.nodes["Resalte"].outputs[0].default_value = 1.0
negro = marmo.mat_simple("Hierro", (0.02, 0.02, 0.022), 0.35, 0.6)
acero = marmo.mat_simple("Acero", (0.6, 0.61, 0.63), 0.25, 1.0)

UA = v(0.08, 0.10, -1)                      # brazo pegado al cuerpo, codo un poco atrás
ARRIBA = {"ua": UA, "fa": v(-0.10, -0.80, 0.52), "ha": v(-0.10, -0.80, 0.52), "agarre": "barra"}
ABAJO = {"ua": UA, "fa": v(-0.05, -0.20, -1), "ha": v(-0.05, -0.20, -1), "agarre": "barra"}
def pose(k):  # k: 0 arriba, 1 abajo
    return {"L": mezclar(ARRIBA, ABAJO, k), "R": mezclar(ARRIBA, ABAJO, k), "curl": {"L": 0.85, "R": 0.85},
            "spine": (float(os.environ.get("LEAN", "8")), 0, 0), "head": (6, 0, 0)}

# máquina (espacio del personaje: delante = −Y)
PY = -0.62; piezas = []
def caja(loc, sc):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc); c = bpy.context.object; c.scale = sc; c.data.materials.append(negro); c.parent = rig; piezas.append(c)
for x in (-0.14, 0.14): caja((x, PY - 0.1, 1.15), (0.05, 0.05, 2.3))
caja((0, PY - 0.1, 2.32), (0.36, 0.14, 0.06)); caja((0, PY - 0.1, 0.4), (0.2, 0.09, 0.6)); caja((0, PY - 0.3, 0.03), (0.55, 0.7, 0.06))
bpy.ops.mesh.primitive_cylinder_add(radius=0.07, depth=0.04, location=(0, PY + 0.0, 2.2), rotation=(0, math.radians(90), 0))
bpy.context.object.data.materials.append(negro); bpy.context.object.parent = rig
POLEA = Vector((0, PY + 0.02, 2.14))
bpy.ops.mesh.primitive_cylinder_add(radius=0.014, depth=0.56, vertices=20, rotation=(0, math.radians(90), 0))
barra = bpy.context.object; barra.data.materials.append(acero); barra.parent = rig
cd = bpy.data.curves.new("Cable", "CURVE"); cd.dimensions = "3D"; cd.bevel_depth = 0.005
sp = cd.splines.new("POLY"); sp.points.add(1)
cable = bpy.data.objects.new("Cable", cd); bpy.context.collection.objects.link(cable); cd.materials.append(negro); cable.parent = rig

def coloca(k, f=None):
    poses.aplicar(rig, pose(k)); bpy.context.view_layer.update()
    pb = rig.pose.bones; c = Vector()
    for s in ("L", "R"):
        c += (pb[f"wrist.{s}"].head + pb[f"finger3-1.{s}"].head) / 2 + poses.palma(rig, s) * 0.022
    c /= 2; c.x = 0
    barra.location = c
    sp.points[0].co = (*POLEA, 1); sp.points[1].co = (*c, 1)
    if f is not None:
        for b in pb:
            b.keyframe_insert("rotation_quaternion", frame=f)
        barra.keyframe_insert("location", frame=f)
        sp.points[1].keyframe_insert("co", frame=f)

ARGS = sys.argv
os.makedirs(os.path.join(HERE, "fotos"), exist_ok=True)
sc = bpy.context.scene
if "--clip" in ARGS:
    escena.render_cfg(pct=50, engine="EEVEE", samples=8)
    N = 75; ang = float(os.environ.get("ANG", "125"))
    rig.rotation_euler = (0, 0, -math.radians(ang))
    for f in range(1, N + 1):
        ph = (f - 1) / N
        k = 0.5 - 0.5 * math.cos(2 * math.pi * ph)          # baja y sube suave
        coloca(k, f)
    sc.frame_start, sc.frame_end = 1, N
    sc.render.filepath = os.path.join(HERE, "clip_polea", "f_"); bpy.ops.render.render(animation=True); print("CLIP OK")
else:
    escena.render_cfg(pct=40, engine="EEVEE", samples=12)
    for ang in (60, 125):
        for nombre, k in (("arriba", 0.0), ("abajo", 1.0)):
            rig.rotation_euler = (0, 0, -math.radians(ang)); coloca(k)
            sc.render.filepath = os.path.join(HERE, "fotos", f"polea_{ang}_{nombre}.png")
            bpy.ops.render.render(write_still=True); print("FOTO", ang, nombre)
