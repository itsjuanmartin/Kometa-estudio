"""Poses de Marmo por direcciones en el mundo (el personaje mira a −Y; su izquierda es +X).

Cada pose es un dict hueso -> dirección deseada (o ángulo para dedos/mandíbula/columna).
`aplicar(rig, pose)` coloca los huesos padre→hijo; `mezclar(a, b, t)` interpola.
"""
import math
import bpy
from mathutils import Vector, Quaternion, Matrix

BRAZO = {  # cadena por lado: (hueso, clave de dirección)
    "L": [("upperarm01.L", "ua"), ("upperarm02.L", "ua"), ("lowerarm01.L", "fa"), ("lowerarm02.L", "fa"), ("wrist.L", "ha")],
    "R": [("upperarm01.R", "ua"), ("upperarm02.R", "ua"), ("lowerarm01.R", "fa"), ("lowerarm02.R", "fa"), ("wrist.R", "ha")],
}
DEDOS = ["finger2", "finger3", "finger4", "finger5"]


def v(x, y, z):
    return Vector((x, y, z)).normalized()


def lado(d, s):
    """Refleja una dirección pensada para el brazo izquierdo (+X) al derecho."""
    return Vector((d.x * (1 if s == "L" else -1), d.y, d.z))


def reset(rig):
    for pb in rig.pose.bones:
        pb.rotation_mode = "QUATERNION"; pb.rotation_quaternion = (1, 0, 0, 0); pb.location = (0, 0, 0)


def _aim(rig, pb, d):
    """Apunta el hueso en la dirección d, dada en el espacio del PERSONAJE (no de la cámara):
    −Y es su frente, +X su izquierda, +Z arriba. Así las poses no cambian cuando Marmo gira."""
    bpy.context.view_layer.update()
    cur = pb.matrix.copy()
    y = (cur.to_3x3() @ Vector((0, 1, 0))).normalized()
    q = y.rotation_difference(d.normalized())
    new = (q.to_matrix() @ cur.to_3x3()).to_4x4(); new.translation = cur.translation
    pb.matrix = new
    pb.location = (0, 0, 0); pb.scale = (1, 1, 1)


_PALM_SIGN = {}


def palma(rig, s):
    """Normal de la palma (espacio del personaje)."""
    pb = rig.pose.bones; w = pb[f"wrist.{s}"].head
    n = (pb[f"finger2-1.{s}"].head - w).cross(pb[f"finger5-1.{s}"].head - w).normalized()
    return n * _PALM_SIGN.get(s, 1.0)


def _calibra_palma(rig):
    bpy.context.view_layer.update()
    for s in ("L", "R"):
        _PALM_SIGN[s] = 1.0
        n = palma(rig, s)
        # en reposo la palma mira hacia el cuerpo: −X en la mano izquierda, +X en la derecha
        if n.x * (1 if s == "L" else -1) > 0: _PALM_SIGN[s] = -1.0


def _gira_palma(rig, s, deseada):
    """Gira antebrazo (60 %) y muñeca (resto) sobre su eje para que la palma mire hacia `deseada`."""
    for bone, frac in ((f"lowerarm02.{s}", 0.6), (f"wrist.{s}", 1.0)):
        bpy.context.view_layer.update()
        pb = rig.pose.bones[bone]
        eje = (rig.pose.bones[f"wrist.{s}"].matrix.to_3x3() @ Vector((0, 1, 0))).normalized()
        n = palma(rig, s); a = (n - eje * n.dot(eje)); b = (deseada - eje * deseada.dot(eje))
        if a.length < 1e-4 or b.length < 1e-4: return
        a.normalize(); b.normalize()
        ang = math.atan2(eje.dot(a.cross(b)), a.dot(b)) * frac
        m = pb.matrix.copy(); t = m.translation.copy()
        r = Matrix.Rotation(ang, 3, eje) @ m.to_3x3()
        new = r.to_4x4(); new.translation = t
        pb.matrix = new; pb.location = (0, 0, 0); pb.scale = (1, 1, 1)


def _rot_local(pb, axis, ang):
    pb.rotation_quaternion = pb.rotation_quaternion @ Quaternion(axis, ang)


def aplicar(rig, p):
    """p: {'L': {'ua','fa','ha'}, 'R': {...}, 'spine': (x,y,z) grados, 'head': (x,y,z), 'jaw': rad,
           'curl': {'L': 0..1, 'R': 0..1}, 'thumb': {'L': 0..1}, 'index': {'L': 0..1}}"""
    reset(rig)
    if not _PALM_SIGN: _calibra_palma(rig)
    sp = p.get("spine", (0, 0, 0))
    for b, f in (("spine03", 0.35), ("spine02", 0.35), ("spine01", 0.3)):
        pb = rig.pose.bones[b]
        pb.rotation_quaternion = Matrix.Identity(3).to_quaternion()
        e = [math.radians(a * f) for a in sp]
        from mathutils import Euler
        pb.rotation_quaternion = Euler(e, "XYZ").to_quaternion()
    hd = p.get("head", (0, 0, 0))
    from mathutils import Euler
    for b, f in (("neck01", 0.4), ("head", 0.6)):
        rig.pose.bones[b].rotation_quaternion = Euler([math.radians(a * f) for a in hd], "XYZ").to_quaternion()
    for s in ("L", "R"):
        if s not in p:
            continue
        for bone, key in BRAZO[s]:
            if key in p[s]:
                _aim(rig, rig.pose.bones[bone], lado(p[s][key], s))
        if p[s].get("agarre") == "barra":
            # agarre prono en barra horizontal: la palma queda perpendicular al antebrazo, hacia abajo/atrás
            bpy.context.view_layer.update()
            fa_dir = (rig.pose.bones[f"lowerarm01.{s}"].matrix.to_3x3() @ Vector((0, 1, 0))).normalized()
            _gira_palma(rig, s, Vector((1, 0, 0)).cross(fa_dir).normalized())
    if "jaw" in p:
        _rot_local(rig.pose.bones["jaw"], Vector((1, 0, 0)), p["jaw"])
    for s, c in p.get("curl", {}).items():
        for f in DEDOS:
            if f == "finger2" and p.get("index", {}).get(s, 0) > 0.5:
                continue
            for j, k in ((1, 0.9), (2, 1.2), (3, 1.0)):
                n = f"{f}-{j}.{s}"
                if n in rig.pose.bones:
                    _rot_local(rig.pose.bones[n], Vector((1, 0, 0)), c * k * CURL_SIGN)
        if p.get("thumb", {}).get(s, 0) < 0.5:
            for j in (2, 3):
                n = f"finger1-{j}.{s}"
                if n in rig.pose.bones:
                    _rot_local(rig.pose.bones[n], Vector((1, 0, 0)), c * 0.8 * CURL_SIGN)
    bpy.context.view_layer.update()


CURL_SIGN = 1.0


def mezclar(a, b, t):
    """Interpola dos poses (direcciones con slerp simple, números lineal)."""
    t = max(0.0, min(1.0, t))
    out = {}
    for k in set(a) | set(b):
        va, vb = a.get(k, b.get(k)), b.get(k, a.get(k))
        if isinstance(va, dict):
            out[k] = mezclar(va, vb, t)
        elif isinstance(va, str):
            out[k] = va
        elif isinstance(va, Vector):
            out[k] = va.slerp(vb, t) if va.angle(vb, 0) < 3.1 else va.lerp(vb, t)
        elif isinstance(va, tuple):
            out[k] = tuple(x + (y - x) * t for x, y in zip(va, vb))
        else:
            out[k] = va + (vb - va) * t
    return out


def suave(t):
    t = max(0.0, min(1.0, t)); return t * t * (3 - 2 * t)


# ---------------- biblioteca de poses (lado izquierdo; el derecho se refleja) ----------------
def brazos(ua, fa, ha=None, ua_r=None, fa_r=None, ha_r=None):
    L = {"ua": ua, "fa": fa, "ha": ha or fa}
    R = {"ua": ua_r or ua, "fa": fa_r or fa, "ha": ha_r or ha_r or (fa_r or fa)}
    return {"L": L, "R": R}


POSES = {
    "reposo": {**brazos(v(0.22, 0.04, -1), v(0.12, -0.32, -1)), "curl": {"L": 0.35, "R": 0.35}},
    "explica": {**brazos(v(0.35, 0.05, -1), v(0.25, -1, -0.15), v(0.35, -1, 0.1),
                         ua_r=v(0.22, 0.04, -1), fa_r=v(0.12, -0.32, -1)), "curl": {"L": 0.15, "R": 0.35}},
    "biceps": {**brazos(v(1, 0.05, 0.12), v(0.05, -0.15, 1)), "curl": {"L": 1.0, "R": 1.0}},
    "polea_arriba": {**brazos(v(0.12, 0.12, -1), v(0.12, -1, 0.15), v(0.1, -1, 0.0)), "curl": {"L": 0.9, "R": 0.9}, "spine": (8, 0, 0)},
    "polea_abajo": {**brazos(v(0.12, 0.12, -1), v(0.04, -0.15, -1), v(0.04, -0.1, -1)), "curl": {"L": 0.9, "R": 0.9}, "spine": (8, 0, 0)},
    "nuca_abajo": {**brazos(v(0.25, -0.12, 1), v(-0.35, 0.45, -1), v(-0.5, 0.4, -1)), "curl": {"L": 0.8, "R": 0.8}},
    "nuca_arriba": {**brazos(v(0.12, -0.08, 1), v(-0.06, -0.05, 1), v(-0.08, 0, 1)), "curl": {"L": 0.8, "R": 0.8}},
    "pulgar": {**brazos(v(0.25, -0.35, -1), v(0.25, -1, 0.55), v(0.15, -0.7, 1),
                        ua_r=v(0.22, 0.04, -1), fa_r=v(0.12, -0.32, -1)),
               "curl": {"L": 1.0, "R": 0.35}, "thumb": {"L": 1.0}},
    "duda": {**brazos(v(0.4, 0.1, -1), v(0.6, -0.8, 0.1), v(0.7, -0.6, 0.4)), "curl": {"L": 0.1, "R": 0.1}, "head": (0, 0, 12)},
    "señala_arriba": {**brazos(v(0.3, -0.4, 1), v(0.15, -0.3, 1), v(0.1, -0.2, 1),
                               ua_r=v(0.22, 0.04, -1), fa_r=v(0.12, -0.32, -1)),
                      "curl": {"L": 1.0, "R": 0.35}, "index": {"L": 1.0}},
}
