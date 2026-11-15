"""Marmo: la estatua de mármol del canal Esculpe, construida con datos de MPFB/MakeHuman (CC0).

Lee directamente la malla base, los targets de forma y el esqueleto «default» de MPFB
(sin registrar la extensión) y monta en Blender:
  cuerpo de mármol + short negro + ojos dorados + corona de laurel + esqueleto con pesos.
Uso: from marmo import build; body, rig = build()
"""
import gzip, json, math, os, random
import bpy, bmesh
from mathutils import Vector, Matrix, Quaternion

MPFB = os.environ.get("MPFB_DATA", "/root/mpfb2/src/mpfb/data")
SCALE = 0.1  # la malla base está en decímetros


def _obj():
    verts, faces = [], []
    with open(os.path.join(MPFB, "3dobjs/base.obj")) as f:
        for ln in f:
            if ln.startswith("v "):
                verts.append([float(x) for x in ln.split()[1:4]])
            elif ln.startswith("f "):
                faces.append([int(p.split("/")[0]) - 1 for p in ln.split()[1:]])
    return verts, faces


def _target(verts, rel, w=1.0):
    with gzip.open(os.path.join(MPFB, "targets", rel), "rt") as f:
        for ln in f:
            p = ln.split()
            if len(p) == 4 and not ln.startswith("#"):
                i = int(p[0]); verts[i][0] += w * float(p[1]); verts[i][1] += w * float(p[2]); verts[i][2] += w * float(p[3])


def _ranges(rs):
    out = []
    for a, b in rs:
        out.extend(range(a, b + 1))
    return out


def mat_marmol(name="Marmol"):
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; N = nt.nodes; L = nt.links
    bsdf = N["Principled BSDF"]
    tc = N.new("ShaderNodeTexCoord")
    noise = N.new("ShaderNodeTexNoise"); noise.inputs["Scale"].default_value = 3.0
    noise.inputs["Detail"].default_value = 8.0; noise.inputs["Distortion"].default_value = 2.5
    wave = N.new("ShaderNodeTexWave"); wave.inputs["Scale"].default_value = 2.2
    wave.inputs["Distortion"].default_value = 9.0; wave.inputs["Detail"].default_value = 6.0
    L.new(tc.outputs["Object"], noise.inputs["Vector"])
    L.new(noise.outputs["Color"], wave.inputs["Vector"])
    ramp = N.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position = 0.0; ramp.color_ramp.elements[0].color = (0.6, 0.61, 0.64, 1)
    ramp.color_ramp.elements[1].position = 0.06; ramp.color_ramp.elements[1].color = (0.94, 0.935, 0.92, 1)
    L.new(wave.outputs["Fac"], ramp.inputs["Fac"])
    # Zona de músculo (atributo «musculo» 0..1) mezclada con rojo-naranja fibroso, controlada por «Resalte»
    attr = N.new("ShaderNodeAttribute"); attr.attribute_name = "musculo"
    val = N.new("ShaderNodeValue"); val.name = "Resalte"; val.outputs[0].default_value = 0.0
    mul = N.new("ShaderNodeMath"); mul.operation = "MULTIPLY"
    L.new(attr.outputs["Fac"], mul.inputs[0]); L.new(val.outputs[0], mul.inputs[1])
    fib = N.new("ShaderNodeTexWave"); fib.wave_type = "BANDS"; fib.inputs["Scale"].default_value = 60
    fib.inputs["Distortion"].default_value = 1.5
    L.new(tc.outputs["Object"], fib.inputs["Vector"])
    fr = N.new("ShaderNodeValToRGB")
    fr.color_ramp.elements[0].color = (0.55, 0.06, 0.02, 1); fr.color_ramp.elements[1].color = (0.95, 0.25, 0.08, 1)
    L.new(fib.outputs["Fac"], fr.inputs["Fac"])
    mix = N.new("ShaderNodeMix"); mix.data_type = "RGBA"
    L.new(mul.outputs[0], mix.inputs["Factor"]); L.new(ramp.outputs["Color"], mix.inputs[6]); L.new(fr.outputs["Color"], mix.inputs[7])
    L.new(mix.outputs[2], bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = 0.32
    bsdf.inputs["Subsurface Weight"].default_value = 0.08
    bsdf.inputs["Subsurface Radius"].default_value = (0.4, 0.4, 0.4)
    bsdf.inputs["Coat Weight"].default_value = 0.25
    return m


def mat_simple(name, color, rough=0.5, metal=0.0, emit=None, strength=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*color, 1); b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if emit:
        b.inputs["Emission Color"].default_value = (*emit, 1); b.inputs["Emission Strength"].default_value = strength
    return m


def build(muscle_zone="triceps"):
    verts, faces = _obj()
    for t in ("macrodetails/universal-male-young-maxmuscle-averageweight.target.gz",
              "macrodetails/caucasian-male-young.target.gz",
              "macrodetails/proportions/male-young-maxmuscle-averageweight-idealproportions.target.gz"):
        _target(verts, t, 1.0)
    _target(verts, "macrodetails/height/male-young-maxmuscle-averageweight-maxheight.target.gz", 0.3)
    # más volumen, como la estatua del diseño: algo de peso y músculos marcados
    _target(verts, "macrodetails/universal-male-young-maxmuscle-maxweight.target.gz", 0.25)
    _target(verts, "macrodetails/universal-male-young-maxmuscle-averageweight.target.gz", -0.25)
    for t, w in (("torso/torso-muscle-pectoral-incr", 0.9), ("torso/torso-muscle-dorsi-incr", 0.8),
                 ("torso/torso-scale-horiz-incr", 0.25),
                 ("arms/l-upperarm-muscle-incr", 1.0), ("arms/r-upperarm-muscle-incr", 1.0),
                 ("arms/l-upperarm-shoulder-muscle-incr", 0.9), ("arms/r-upperarm-shoulder-muscle-incr", 0.9),
                 ("arms/l-lowerarm-muscle-incr", 0.6), ("arms/r-lowerarm-muscle-incr", 0.6),
                 ("legs/l-upperleg-muscle-incr", 0.6), ("legs/r-upperleg-muscle-incr", 0.6)):
        _target(verts, t + ".target.gz", w)
    groups = json.load(open(os.path.join(MPFB, "mesh_metadata/basemesh_vertex_groups.json")))
    gidx = {k: _ranges(v) for k, v in groups.items()}
    bl = [Vector((x * SCALE, -z * SCALE, y * SCALE)) for x, y, z in verts]

    # posiciones de articulaciones antes de borrar ayudantes
    def cube(name):
        ids = gidx[name]; return sum((bl[i] for i in ids), Vector()) / len(ids)

    rigdef = json.load(open(os.path.join(MPFB, "rigs/standard/rig.default.json")))

    def endpoint(e):
        s = e["strategy"]
        if s == "CUBE": return cube(e["cube_name"])
        if s == "VERTEX": return bl[e["vertex_index"]].copy()
        ids = e["vertex_indices"]; return sum((bl[i] for i in ids), Vector()) / len(ids)

    heads = {k: endpoint(b["head"]) for k, b in rigdef.items()}
    tails = {k: endpoint(b["tail"]) for k, b in rigdef.items()}
    eyeL, eyeR = cube("joint-l-eye"), cube("joint-r-eye")
    ground = min(v.z for v in (bl[i] for i in gidx["body"]))
    off = Vector((0, 0, -ground))

    # --- cuerpo ---
    body_set = set(gidx["body"]); tights = set(gidx["helper-tights"])
    me = bpy.data.meshes.new("MarmoBody")
    me.from_pydata([v + off for v in bl], [], faces)
    body = bpy.data.objects.new("Marmo", me); bpy.context.collection.objects.link(body)
    weights = json.load(open(os.path.join(MPFB, "rigs/standard/weights.default.json")))["weights"]
    for bone, lst in weights.items():
        vg = body.vertex_groups.new(name=bone)
        for i, w in lst:
            vg.add([i], w, "REPLACE")

    # short: copia de la malla de las mallas (tights) por encima de la rodilla
    knee = (heads["lowerleg01.L"].z + off.z) if "lowerleg01.L" in heads else 0.5
    knee_z = knee + 0.36
    waist_z = heads["pelvis.L"].z + off.z + 0.09
    shorts = body.copy(); shorts.data = me.copy(); shorts.name = "Short"; bpy.context.collection.objects.link(shorts)
    for ob, keep in ((body, body_set), (shorts, body_set)):
        bm = bmesh.new(); bm.from_mesh(ob.data); bm.verts.ensure_lookup_table()
        kill = [v for v in bm.verts if v.index not in keep or
                (ob is shorts and (v.co.z < knee_z or v.co.z > waist_z or abs(v.co.x) > 0.3))]
        bmesh.ops.delete(bm, geom=kill, context="VERTS"); bm.to_mesh(ob.data); bm.free()
    # suavizado
    for ob in (body, shorts):
        for p in ob.data.polygons: p.use_smooth = True
    # el short es una copia de la piel, inflada hacia fuera
    for v in shorts.data.vertices:
        v.co += v.normal * (0.009 + (0.005 if v.co.z > waist_z - 0.035 else 0.0))  # cintura elástica
    sol = shorts.modifiers.new("Grosor", "SOLIDIFY"); sol.thickness = 0.005; sol.offset = -1
    ssub = shorts.modifiers.new("Sub", "SUBSURF"); ssub.levels = 1; ssub.render_levels = 1

    # atributo de músculo (tríceps: parte trasera del brazo entre hombro y codo)
    attr = me.color_attributes.new("musculo", "FLOAT_COLOR", "POINT") if False else None
    fa = me.attributes.new("musculo", "FLOAT", "POINT")
    for side in ("L", "R"):
        sh = heads[f"upperarm01.{side}"] + off; el = heads[f"lowerarm01.{side}"] + off
        ax = (el - sh); ln = ax.length; ax.normalize()
        for v in me.vertices:
            p = v.co - sh; t = p.dot(ax)
            if t < 0.12 * ln or t > 1.0 * ln: continue
            radial = p - ax * t
            if radial.length > 0.085: continue
            back = radial.normalized().y  # +Y = espalda (MakeHuman mira a -Y)
            if back <= 0.05: continue
            s = min(1.0, (back - 0.05) / 0.45) * min(1.0, min(t / ln - 0.12, 1.0 - t / ln) / 0.18)
            fa.data[v.index].value = max(fa.data[v.index].value, s)

    body.data.materials.append(mat_marmol())
    shorts.data.materials.clear(); shorts.data.materials.append(mat_simple("ShortNegro", (0.015, 0.015, 0.017), 0.75))
    sub = body.modifiers.new("Sub", "SUBSURF"); sub.levels = 1; sub.render_levels = 1

    # --- esqueleto ---
    arm = bpy.data.armatures.new("MarmoRig"); rig = bpy.data.objects.new("MarmoRig", arm)
    bpy.context.collection.objects.link(rig); bpy.context.view_layer.objects.active = rig
    bpy.ops.object.mode_set(mode="EDIT")
    for k, b in rigdef.items():
        eb = arm.edit_bones.new(k); eb.head = heads[k] + off; eb.tail = tails[k] + off; eb.roll = b.get("roll", 0)
    for k, b in rigdef.items():
        if b.get("parent"):
            arm.edit_bones[k].parent = arm.edit_bones[b["parent"]]
            arm.edit_bones[k].use_connect = b.get("use_connect", False)
    bpy.ops.object.mode_set(mode="OBJECT")
    for ob in (body, shorts):
        ob.parent = rig
        md = ob.modifiers.new("Rig", "ARMATURE"); md.object = rig
        # el armature va primero
        while ob.modifiers.find("Rig") > 0:
            bpy.context.view_layer.objects.active = ob
            bpy.ops.object.modifier_move_up(modifier="Rig")

    # --- ojos dorados que brillan (almendra) ---
    gold_glow = mat_simple("OjoOro", (1.0, 0.6, 0.08), 0.25, 0.3, (1.0, 0.5, 0.04), 2.2)
    for name, c in (("OjoL", eyeL), ("OjoR", eyeR)):
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.0118, location=c + off + Vector((0, -0.004, 0)), segments=24, ring_count=12)
        e = bpy.context.object; e.name = name; e.scale = (1.25, 0.8, 0.62)
        e.rotation_euler = (0, math.radians(-12 if name == "OjoL" else 12), 0)
        e.data.materials.append(gold_glow)
        _parent_bone(e, rig, "head")

    # --- pelo rizado de estatua: rizos de mármol sobre el cuero cabelludo ---
    me.update()
    ey = (eyeL + eyeR) / 2 + off
    hc0 = heads["head"] + off
    scalp = []
    for vv in me.vertices:
        c = vv.co
        if (c - hc0).length > 0.2 or c.z < ey.z - 0.09: continue
        top = c.z > ey.z + 0.04 and c.y > ey.y - 0.02 + max(0, (ey.z + 0.075 - c.z)) * 0.0
        front_ok = c.y > ey.y + 0.012 or c.z > ey.z + 0.055   # deja libre la frente
        back = c.y > ey.y + 0.075 and (c.z > ey.z + 0.0 or abs(c.x - hc0.x) < 0.055)
        if (top and front_ok) or back:
            scalp.append((c.copy(), vv.normal.copy()))
    random.seed(7)
    curls = []
    marmol = body.data.materials[0]
    chosen = []
    for c, n in random.sample(scalp, len(scalp)):
        if all((c - q).length > 0.0115 for q in chosen):
            chosen.append(c)
            r = random.uniform(0.0105, 0.0145)
            bpy.ops.mesh.primitive_torus_add(major_radius=r * 0.75, minor_radius=r * 0.5, major_segments=12, minor_segments=6,
                                             location=c + n * (r * 0.35))
            cu = bpy.context.object; cu.scale = (1.0, random.uniform(0.8, 1.15), 0.75)
            cu.rotation_mode = "QUATERNION"
            cu.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(n) @ Quaternion((0, 0, 1), random.uniform(0, 6.28))
            curls.append(cu)
    bpy.ops.object.select_all(action="DESELECT")
    for cu in curls: cu.select_set(True)
    # casquete bajo los rizos para que no se vea el cráneo entre ellos
    cap_me = bpy.data.meshes.new("Casquete")
    cap_set = set(); bm0 = bmesh.new(); bm0.from_mesh(me); bm0.verts.ensure_lookup_table()
    sc_set = {tuple(round(x, 5) for x in c) for c, n in scalp}
    capf = [f for f in bm0.faces if all(tuple(round(x, 5) for x in v.co) in sc_set for v in f.verts)]
    bmc = bmesh.new(); vm = {}
    for f in capf:
        vs = []
        for v in f.verts:
            if v.index not in vm: vm[v.index] = bmc.verts.new(v.co + v.normal * 0.006)
            vs.append(vm[v.index])
        bmc.faces.new(vs)
    bmc.to_mesh(cap_me); bmc.free(); bm0.free()
    cap = bpy.data.objects.new("Casquete", cap_me); bpy.context.collection.objects.link(cap); curls.append(cap)
    cap.select_set(True)
    bpy.context.view_layer.objects.active = curls[0]; bpy.ops.object.join()
    hair = bpy.context.object; hair.name = "Pelo"
    hair.data.materials.clear(); hair.data.materials.append(marmol)
    for p in hair.data.polygons: p.use_smooth = True
    hs = hair.modifiers.new("Sub", "SUBSURF"); hs.levels = 1; hs.render_levels = 1
    _parent_bone(hair, rig, "head")

    # --- corona de laurel ---
    head_top = max(v.co.z for v in me.vertices)
    hc = (heads["head"] + off); center = Vector((hc.x, hc.y + 0.008, head_top - 0.055))
    gold = mat_simple("Oro", (1.0, 0.68, 0.22), 0.25, 1.0)
    # anillo de la cabeza a la altura de la frente: radio medido en la propia malla
    ring_z = head_top - 0.06
    near = [v.co for v in me.vertices if abs(v.co.z - ring_z) < 0.006 and v.co.y < hc.y + 0.15 and abs(v.co.x - hc.x) < 0.15]
    rx = max(abs(p.x - hc.x) for p in near) + 0.022
    ymin = min(p.y for p in near); ymax = max(p.y for p in near)
    cy = (ymin + ymax) / 2; ry = (ymax - ymin) / 2 + 0.022
    center = Vector((hc.x, cy, ring_z))
    leaves = []
    for side in (-1, 1):
        for i in range(11):
            th = math.radians(32 + i * 13)  # 0 = frente (−Y); abierto en la frente
            pos = center + Vector((side * rx * math.sin(th), -ry * math.cos(th), 0.004))
            tang = Vector((side * rx * math.cos(th), ry * math.sin(th), 0)).normalized()
            for k, out in ((0, 1), (1, -1)):
                bpy.ops.mesh.primitive_uv_sphere_add(radius=0.026, location=pos + Vector((0, 0, 0.01 * out)), segments=12, ring_count=6)
                lf = bpy.context.object; lf.scale = (0.36, 1.0, 0.09)
                # eje largo de la hoja siguiendo el anillo hacia la frente, abierta hacia fuera
                yaw = math.atan2(-tang.x, tang.y)
                lf.rotation_euler = (math.radians(out * 38 + 12), math.radians(side * 35), yaw)
                lf.data.materials.append(gold); leaves.append(lf)
    bpy.ops.object.select_all(action="DESELECT")
    for lf in leaves: lf.select_set(True)
    bpy.context.view_layer.objects.active = leaves[0]; bpy.ops.object.join()
    crown = bpy.context.object; crown.name = "Laurel"
    for p in crown.data.polygons: p.use_smooth = True
    _parent_bone(crown, rig, "head")

    return body, rig


def _parent_bone(ob, rig, bone):
    mw = ob.matrix_world.copy()
    ob.parent = rig; ob.parent_type = "BONE"; ob.parent_bone = bone
    bpy.context.view_layer.update()
    ob.matrix_world = mw
