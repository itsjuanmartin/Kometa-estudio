"""Short «3 mitos del tríceps» con Marmo (canal Esculpe). Render 9:16 a fotogramas PNG.

/root/bpyenv/bin/python produccion.py -- [--pct 67] [--samples 8] [--frames 1-1302] [--fotos 30,200,...]
"""
import sys, os, math, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy
from mathutils import Vector
import escena, marmo, poses
from poses import POSES as P, mezclar, suave, v

ARGS = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
def arg(name, default):
    return ARGS[ARGS.index(name) + 1] if name in ARGS else default

FPS = 30
HERE = os.path.dirname(os.path.abspath(__file__))
TL = json.load(open(os.path.join(HERE, "timeline/lineas.json")))
MOUTH = json.load(open(os.path.join(HERE, "timeline/mouth.json")))
TOTAL = 43.4
NF = int(TOTAL * FPS)
S = [l["start"] for l in TL["lines"]]  # inicio de cada frase


def mouth(t):
    i = int(t * MOUTH["fps"]); vv = MOUTH["v"]
    return vv[i] if 0 <= i < len(vv) else 0.0


# ---------------- guion visual: segmentos (inicio, fin, pose(t), cámara(t), extras) ----------------
def rep(a, b, t, periodo, fase=0.0):
    return mezclar(P[a], P[b], 0.5 - 0.5 * math.cos(2 * math.pi * (t / periodo + fase)))


def seg_biceps(t):
    lt = t - 0.0
    if lt < 0.5: return P["reposo"]
    if lt < 3.75:
        k = suave((lt - 0.5) / 0.8)
        p = mezclar(P["reposo"], P["biceps"], k)
        p["spine"] = (0, 0, 4 * math.sin(lt * 2.0))
        return p
    p = mezclar(P["biceps"], P["duda"], suave((lt - 3.75) / 0.45))
    p["head"] = (0, 0, 14 * math.sin((lt - 3.9) * 9) * max(0, 1 - (lt - 3.9) / 1.2))  # niega con la cabeza
    return p


def seg_triceps(t):
    p = dict(P["biceps"])
    p["spine"] = (0, 0, -6)
    return p


def seg_polea(t):
    return rep("polea_arriba", "polea_abajo", t - S[2], 1.7)


def seg_nuca(t):
    return rep("nuca_abajo", "nuca_arriba", t - 13.6, 2.1)


def seg_mito2(t):
    if t < 27.6: return P["duda"]
    if t < 29.4: return P["explica"]
    return rep("nuca_abajo", "nuca_arriba", t - 29.4, 1.25)


def seg_mito3(t):
    p = dict(P["explica"])
    p["spine"] = (0, 0, 3 * math.sin(t * 1.3))
    return p


def seg_cta(t):
    return P["pulgar"] if t < 40.2 else P["señala_arriba"]


def cam_orbita(ang_deg, dist=3.4, h=1.2, th=1.35, lens=45):
    """Vista desde ang_deg alrededor de Marmo: se gira a Marmo (no la cámara) para no salir del estudio."""
    return (ang_deg, dist, h, th, lens)


SEGS = [
    # (t0, t1, pose, cam(t) -> (loc, target, lens), extras)
    (0.0, 5.2, seg_biceps, lambda t: cam_orbita(8 - t * 1.5, 3.6 - t * 0.08), {}),
    (5.2, 10.0, seg_triceps, lambda t: cam_orbita(8 + 170 * suave((t - 5.3) / 1.0) - (t - 5.2) * 3, 3.3, th=1.4), {"resalte": 1}),
    (10.0, 13.6, seg_polea, lambda t: cam_orbita(58 + (t - 10) * 2, 3.5), {"resalte": 1, "polea": 1}),
    (13.6, 24.1, seg_nuca, lambda t: cam_orbita(150 - (t - 13.6) * 6.5, 3.6, th=1.45), {"resalte": 1, "mancuernas": 1}),
    (24.1, 32.45, seg_mito2, lambda t: cam_orbita(-12 + (t - 24.1) * 1.2, 3.4 - (t - 24.1) * 0.03), {"mancuernas_desde": 29.25}),
    (32.45, 37.8, seg_mito3, lambda t: cam_orbita(14 - (t - 32.45) * 2, 3.2 - (t - 32.45) * 0.05), {}),
    (37.8, TOTAL + 1, seg_cta, lambda t: cam_orbita(-6 + (t - 37.8) * 1.0, 3.8, h=1.5, th=2.15), {}),
]
BLEND = 0.35


def estado(t):
    for i, (t0, t1, pf, cf, ex) in enumerate(SEGS):
        if t0 <= t < t1:
            p = pf(t)
            if i > 0 and t - t0 < BLEND:
                prev = SEGS[i - 1][2](t0 - 1e-3)
                p = mezclar(prev, p, suave((t - t0) / BLEND))
            return i, p, cf(t), ex
    t0, t1, pf, cf, ex = SEGS[-1]
    return len(SEGS) - 1, pf(t), cf(t), ex


# ---------------- escena ----------------
escena.limpiar()
body, rig = marmo.build()
escena.estudio("gris"); escena.luces()
cam, tgt = escena.camara((0, -3, 1.4), (0, 0, 1.2), lens=40)
cam.constraints.clear()
mat_body = body.data.materials[0]
resalte = mat_body.node_tree.nodes["Resalte"].outputs[0]

negro = marmo.mat_simple("Hierro", (0.02, 0.02, 0.022), 0.35, 0.6)
acero = marmo.mat_simple("Acero", (0.55, 0.56, 0.58), 0.25, 1.0)


def mancuerna(name):
    objs = []
    bpy.ops.mesh.primitive_cylinder_add(radius=0.016, depth=0.2, vertices=16); h = bpy.context.object; h.data.materials.append(acero); objs.append(h)
    for s in (-1, 1):
        bpy.ops.mesh.primitive_cylinder_add(radius=0.062, depth=0.07, vertices=6, location=(0, 0, s * 0.125))
        p = bpy.context.object; p.data.materials.append(negro); objs.append(p)
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs: o.select_set(True)
    bpy.context.view_layer.objects.active = h; bpy.ops.object.join()
    d = bpy.context.object; d.name = name
    for pl in d.data.polygons: pl.use_smooth = False
    return d


# mancuernas en la mano (posición de reposo: palma ≈ cabeza de finger3-1; eje = finger2→finger5)
poses.reset(rig); bpy.context.view_layer.update()
DB = {}
for s in ("L", "R"):
    pb = rig.pose.bones
    mw = rig.matrix_world
    palma = mw @ ((pb[f"finger3-1.{s}"].head + pb[f"wrist.{s}"].head) / 2 + (pb[f"finger3-1.{s}"].head - pb[f"wrist.{s}"].head) * 0.6)
    eje = (mw.to_3x3() @ (pb[f"finger5-1.{s}"].head - pb[f"finger2-1.{s}"].head)).normalized()
    d = mancuerna(f"Mancuerna{s}")
    d.location = palma
    d.rotation_mode = "QUATERNION"; d.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(eje)
    bpy.context.view_layer.update()
    marmo._parent_bone(d, rig, f"wrist.{s}")
    DB[s] = d

# máquina de polea delante de Marmo
POLEA_Y = -0.62
torre = []
for x in (-0.12, 0.12):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(x, POLEA_Y - 0.08, 1.15)); c = bpy.context.object; c.scale = (0.05, 0.05, 2.3); torre.append(c)
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, POLEA_Y - 0.08, 2.32)); c = bpy.context.object; c.scale = (0.32, 0.12, 0.06); torre.append(c)
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, POLEA_Y - 0.12, 0.35)); c = bpy.context.object; c.scale = (0.2, 0.1, 0.5); torre.append(c)  # pila de placas
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, POLEA_Y - 0.25, 0.03)); c = bpy.context.object; c.scale = (0.5, 0.6, 0.06); torre.append(c)
bpy.ops.mesh.primitive_cylinder_add(radius=0.06, depth=0.04, location=(0, POLEA_Y + 0.02, 2.22), rotation=(0, math.radians(90), 0)); torre.append(bpy.context.object)
for o in torre:
    o.data.materials.append(negro); o.parent = rig
POLEA_PT = Vector((0, POLEA_Y + 0.02, 2.17))
cd = bpy.data.curves.new("Cable", "CURVE"); cd.dimensions = "3D"; cd.bevel_depth = 0.006; cd.bevel_resolution = 2
for _ in range(3):
    sp = cd.splines.new("POLY"); sp.points.add(1)
cable = bpy.data.objects.new("Cable", cd); bpy.context.collection.objects.link(cable); cd.materials.append(negro)
POLEA_OBJS = torre + [cable]


def mano(s):
    pb = rig.pose.bones[f"finger3-1.{s}"]; return rig.matrix_world @ pb.head


def vis(objs, on, f):
    for o in objs:
        o.hide_render = not on; o.hide_viewport = not on
        o.keyframe_insert("hide_render", frame=f); o.keyframe_insert("hide_viewport", frame=f)


# ---------------- animación (claves en cada fotograma) ----------------
ANIM_BONES = [b.name for b in rig.pose.bones if any(k in b.name for k in
              ("arm", "wrist", "finger", "spine", "neck", "head", "jaw"))]
JAW_SIGN = float(arg("--jaw-sign", "1"))
t_list = list(range(1, NF + 1))
frames_sel = None
if "--fotos" in ARGS:
    frames_sel = [int(x) for x in arg("--fotos", "").split(",")]
    t_list = frames_sel
for f in t_list:
    t = (f - 1) / FPS
    i, p, (ang, dist, ch, th, lens), ex = estado(t)
    rig.rotation_euler = (0, 0, -math.radians(ang)); rig.keyframe_insert("rotation_euler", frame=f)
    drift = math.radians(4 * math.sin(t * 0.35))
    cl = Vector((math.sin(drift) * dist, -math.cos(drift) * dist, ch)); ct = Vector((0, 0, th))
    p = dict(p)
    m = mouth(t)
    p["jaw"] = JAW_SIGN * 0.16 * m
    sp = p.get("spine", (0, 0, 0))
    p["spine"] = (sp[0] + 1.2 * math.sin(t * 1.7), sp[1], sp[2])
    hd = p.get("head", (0, 0, 0))
    p["head"] = (hd[0] - 3 * m, hd[1], hd[2] + 2 * math.sin(t * 0.9))
    poses.aplicar(rig, p)
    for b in ANIM_BONES:
        rig.pose.bones[b].keyframe_insert("rotation_quaternion", frame=f)
        rig.pose.bones[b].keyframe_insert("location", frame=f)
    cam.location = cl; cam.keyframe_insert("location", frame=f)
    d = (ct - cl); cam.rotation_mode = "QUATERNION"
    cam.rotation_quaternion = d.to_track_quat("-Z", "Y"); cam.keyframe_insert("rotation_quaternion", frame=f)
    cam.data.lens = lens; cam.data.keyframe_insert("lens", frame=f)
    if i == 1:
        r = suave((t - 5.7) / 0.8)
    elif ex.get("resalte"):
        r = 1.0
    elif i == 4:
        r = suave((t - 29.3) / 0.4)
    else:
        r = 0.0
    resalte.default_value = r
    resalte.keyframe_insert("default_value", frame=f)
    pol = bool(ex.get("polea"))
    mancs = bool(ex.get("mancuernas")) or ("mancuernas_desde" in ex and t >= ex["mancuernas_desde"])
    vis(POLEA_OBJS, pol, f); vis(list(DB.values()), mancs, f)
    if pol:
        bpy.context.view_layer.update()
        hl, hr = mano("L"), mano("R"); nudo = (hl + hr) / 2 + Vector((0, 0, 0.12))
        segs = [(rig.matrix_world @ POLEA_PT, nudo), (nudo, hl), (nudo, hr)]
        for sp_, (a, b) in zip(cd.splines, segs):
            sp_.points[0].co = (*a, 1); sp_.points[1].co = (*b, 1)
            sp_.points[0].keyframe_insert("co", frame=f); sp_.points[1].keyframe_insert("co", frame=f)

# interpolación constante (ya hay clave en cada fotograma)
for ob in (rig, cam, cam.data, mat_body.node_tree):
    ad = ob.animation_data
    if ad and ad.action:
        for fc in getattr(ad.action, "fcurves", []):
            for kp in fc.keyframe_points: kp.interpolation = "LINEAR"

pct = int(arg("--pct", "67")); samples = int(arg("--samples", "8"))
escena.render_cfg(pct=pct, engine=arg("--engine", "EEVEE"), samples=samples)
sc = bpy.context.scene
sc.render.use_motion_blur = False
out = os.path.join(HERE, arg("--out", "frames"), "f_")
os.makedirs(os.path.dirname(out), exist_ok=True)
if frames_sel:
    for f in frames_sel:
        sc.frame_set(f); sc.render.filepath = os.path.join(HERE, "fotos", f"prod_{f:04d}.png")
        bpy.ops.render.render(write_still=True); print("FOTO", f)
else:
    rng = arg("--frames", f"1-{NF}").split("-")
    sc.frame_start, sc.frame_end = int(rng[0]), int(rng[1])
    sc.render.filepath = out
    sc.render.use_overwrite = False; sc.render.use_placeholder = True
    bpy.ops.render.render(animation=True)
    print("RENDER OK")
