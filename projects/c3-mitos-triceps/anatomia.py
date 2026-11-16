"""Modelo anatómico (BodyParts3D, CC BY-SA 2.1 JP): esqueleto + tríceps del brazo derecho, con hombro y codo articulados.
Uso: import anatomia; A = anatomia.build(); A.pose(hombro_grados, codo_grados)"""
import os, math, csv
import bpy
from mathutils import Vector
import marmo

BP = os.environ.get("BP3D", "/root/bp3d/assets/BodyParts3D_data/stl")
NOMBRES = os.path.join(os.path.dirname(os.path.abspath(__file__)), "anatomia_piezas.tsv")
MANO = ("metacarpal", "phalanx", "capitate", "hamate", "lunate", "scaphoid", "trapezium", "trapezoid", "triquetral", "pisiform")


def mat_hueso():
    m = marmo.mat_simple("Hueso", (0.72, 0.56, 0.36), 0.6)
    return m


def mat_musculo(name, c0, c1):
    m = bpy.data.materials.new(name); m.use_nodes = True
    N = m.node_tree.nodes; L = m.node_tree.links; b = N["Principled BSDF"]
    tc = N.new("ShaderNodeTexCoord"); w = N.new("ShaderNodeTexWave"); w.wave_type = "BANDS"; w.bands_direction = "X"
    w.inputs["Scale"].default_value = 260; w.inputs["Distortion"].default_value = 0.6
    L.new(tc.outputs["Object"], w.inputs["Vector"])
    r = N.new("ShaderNodeValToRGB"); r.color_ramp.elements[0].color = (*c0, 1); r.color_ramp.elements[1].color = (*c1, 1)
    L.new(w.outputs["Fac"], r.inputs["Fac"]); L.new(r.outputs["Color"], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = 0.45
    return m


class Anatomia:
    def pose(self, hombro=0.0, codo=0.0):
        """hombro: flexión (0 = brazo colgando, 180 = brazo arriba). codo: flexión (0 = recto)."""
        self.hombro.rotation_euler = (math.radians(hombro) * self.sx, 0, 0)
        self.codo.rotation_euler = (math.radians(codo) * self.sx, 0, 0)

    def resalta(self, cabeza=None):
        """cabeza: None (las tres en rojo) o 'long' / 'lateral' / 'medial' (esa en rojo, el resto apagado)."""
        for k, ob in self.triceps.items():
            ob.data.materials.clear(); ob.data.materials.append(self.m_on if (cabeza is None or k == cabeza) else self.m_off)


def build(lado="right"):
    A = Anatomia()
    hueso = mat_hueso()
    A.m_on = mat_musculo("MuscOn", (0.62, 0.05, 0.02), (1.0, 0.27, 0.07))
    A.m_off = mat_musculo("MuscOff", (0.55, 0.36, 0.33), (0.72, 0.5, 0.46))
    piezas = [l.rstrip("\n").split("\t") for l in open(NOMBRES, encoding="utf-8")]
    objs = {}
    for fid, name in piezas:
        bpy.ops.wm.stl_import(filepath=os.path.join(BP, fid + ".stl"), global_scale=0.001)
        ob = bpy.context.object; ob.name = name
        if len(ob.data.polygons) > 6000:      # aligera las piezas pesadas para que el render no tarde
            d = ob.modifiers.new("D", "DECIMATE"); d.ratio = max(0.08, 6000 / len(ob.data.polygons))
            bpy.ops.object.modifier_apply(modifier="D")
        for p in ob.data.polygons: p.use_smooth = True
        ob.data.materials.append(hueso); objs[name] = ob
    root = bpy.data.objects.new("Anatomia", None); bpy.context.collection.objects.link(root)
    bpy.context.view_layer.update()

    def bbox(ob):
        cs = [ob.matrix_world @ v.co for v in ob.data.vertices]
        return Vector((min(c.x for c in cs), min(c.y for c in cs), min(c.z for c in cs))), Vector((max(c.x for c in cs), max(c.y for c in cs), max(c.z for c in cs)))
    hum = objs[f"{lado} humerus"]; lo, hi = bbox(hum)
    cs = [hum.matrix_world @ v.co for v in hum.data.vertices]
    top = [c for c in cs if c.z > hi.z - 0.035]; bot = [c for c in cs if c.z < lo.z + 0.02]
    p_h = sum(top, Vector()) / len(top); p_c = sum(bot, Vector()) / len(bot)
    A.info = dict(hum_lo=lo, hum_hi=hi, hombro=p_h, codo=p_c,
                  sternum_y=bbox(objs["body of sternum"])[0].y, sacro_y=bbox(objs["sacrum"])[0].y)
    A.hombro = bpy.data.objects.new("Hombro", None); A.codo = bpy.data.objects.new("Codo", None)
    for e, p in ((A.hombro, p_h), (A.codo, p_c)):
        bpy.context.collection.objects.link(e); e.location = p
    bpy.context.view_layer.update()

    def emparenta(ob, padre):
        mw = ob.matrix_world.copy(); ob.parent = padre; bpy.context.view_layer.update(); ob.matrix_world = mw
    emparenta(A.codo, A.hombro)
    A.triceps = {}
    for name, ob in objs.items():
        if lado in name and "triceps" in name:
            k = "long" if "long" in name else "lateral" if "lateral" in name else "medial"
            A.triceps[k] = ob; emparenta(ob, A.hombro)
        elif name == f"{lado} humerus":
            emparenta(ob, A.hombro)
        elif lado in name and (name.endswith("radius") or name.endswith("ulna") or any(m in name for m in MANO)):
            emparenta(ob, A.codo)
        elif "triceps" in name:
            ob.data.materials.clear(); ob.data.materials.append(A.m_off); emparenta(ob, root)
        else:
            emparenta(ob, root)
    emparenta(A.hombro, root)
    A.root = root; A.objs = objs
    # el frente del modelo: si el esternón tiene Y menor que el sacro, mira a −Y (igual que Marmo)
    A.sx = -1.0   # flexión hacia delante (el modelo mira a −Y)
    A.resalta(None)
    return A
