"""Estudio, luces, cámara y render para los Shorts de Esculpe (9:16)."""
import math, os
import bpy
from mathutils import Vector


def limpiar():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def mat_estudio(color_top=(0.86, 0.87, 0.89), color_bot=(0.70, 0.72, 0.76), grid=0.035, cell=0.5):
    """Fondo gris claro con cuadrícula blanca suave (en coordenadas del objeto)."""
    m = bpy.data.materials.new("Estudio"); m.use_nodes = True
    nt = m.node_tree; N = nt.nodes; L = nt.links
    b = N["Principled BSDF"]; b.inputs["Roughness"].default_value = 0.9
    tc = N.new("ShaderNodeTexCoord"); sep = N.new("ShaderNodeSeparateXYZ")
    L.new(tc.outputs["Object"], sep.inputs[0])
    # degradado vertical
    grad = N.new("ShaderNodeMapRange"); grad.inputs["From Min"].default_value = -1; grad.inputs["From Max"].default_value = 4
    L.new(sep.outputs["Z"], grad.inputs["Value"])
    mixg = N.new("ShaderNodeMix"); mixg.data_type = "RGBA"
    mixg.inputs[6].default_value = (*color_bot, 1); mixg.inputs[7].default_value = (*color_top, 1)
    L.new(grad.outputs[0], mixg.inputs["Factor"])
    # líneas de cuadrícula en X y Z (pared) y en X e Y (suelo)
    def lines(out):
        mod = N.new("ShaderNodeMath"); mod.operation = "PINGPONG"; mod.inputs[1].default_value = cell / 2
        L.new(out, mod.inputs[0])
        lt = N.new("ShaderNodeMath"); lt.operation = "LESS_THAN"; lt.inputs[1].default_value = grid / 2
        L.new(mod.outputs[0], lt.inputs[0]); return lt
    lx = lines(sep.outputs["X"]); ly = lines(sep.outputs["Y"]); lz = lines(sep.outputs["Z"])
    mx = N.new("ShaderNodeMath"); mx.operation = "MAXIMUM"; L.new(lx.outputs[0], mx.inputs[0]); L.new(ly.outputs[0], mx.inputs[1])
    mx2 = N.new("ShaderNodeMath"); mx2.operation = "MAXIMUM"; L.new(mx.outputs[0], mx2.inputs[0]); L.new(lz.outputs[0], mx2.inputs[1])
    k = N.new("ShaderNodeMath"); k.operation = "MULTIPLY"; k.inputs[1].default_value = 0.35
    L.new(mx2.outputs[0], k.inputs[0])
    mixl = N.new("ShaderNodeMix"); mixl.data_type = "RGBA"; mixl.inputs[7].default_value = (1, 1, 1, 1)
    L.new(k.outputs[0], mixl.inputs["Factor"]); L.new(mixg.outputs[2], mixl.inputs[6])
    L.new(mixl.outputs[2], b.inputs["Base Color"])
    return m


def estudio(tono="gris"):
    cols = {"gris": ((0.86, 0.87, 0.89), (0.66, 0.68, 0.72)),
            "azul": ((0.80, 0.88, 0.94), (0.60, 0.72, 0.82))}[tono]
    m = mat_estudio(*cols)
    # suelo + pared con curva (ciclorama)
    bpy.ops.mesh.primitive_plane_add(size=1)
    cyc = bpy.context.object; cyc.name = "Ciclorama"
    me = cyc.data
    import bmesh
    bm = bmesh.new()
    prof = []
    for i in range(0, 40):
        t = i / 39
        if t < 0.5:
            y = -6 + t / 0.5 * 7.0; z = 0
        else:
            a = (t - 0.5) / 0.5 * math.pi / 2
            y = 1 + math.sin(a) * 1.2; z = (1 - math.cos(a)) * 1.2
        prof.append((y, z))
    prof.append((2.2, 9))
    rows = []
    for (y, z) in prof:
        rows.append([bm.verts.new((x, y, z)) for x in (-8, 8)])
    for r0, r1 in zip(rows, rows[1:]):
        bm.faces.new((r0[0], r0[1], r1[1], r1[0]))
    bm.to_mesh(me); bm.free()
    for p in me.polygons: p.use_smooth = True
    me.materials.append(m)
    w = bpy.data.worlds.new("Mundo"); bpy.context.scene.world = w; w.use_nodes = True
    w.node_tree.nodes["Background"].inputs[0].default_value = (*cols[0], 1)
    w.node_tree.nodes["Background"].inputs[1].default_value = 0.35
    return cyc


def luces():
    def area(name, loc, rot, energy, size, color=(1, 1, 1)):
        bpy.ops.object.light_add(type="AREA", location=loc, rotation=[math.radians(r) for r in rot])
        l = bpy.context.object; l.name = name; l.data.energy = energy; l.data.size = size; l.data.color = color
        return l
    area("Clave", (-2.0, -2.4, 2.9), (55, 0, -40), 260, 1.6, (1.0, 0.97, 0.92))
    area("Relleno", (2.4, -2.2, 1.6), (75, 0, 48), 90, 2.5, (0.92, 0.95, 1.0))
    area("Contra", (0.9, 1.0, 2.6), (-55, 0, 160), 160, 1.0, (1.0, 1.0, 1.0))


def camara(loc, target, lens=50):
    bpy.ops.object.camera_add(location=loc)
    cam = bpy.context.object; bpy.context.scene.camera = cam; cam.data.lens = lens
    tgt = bpy.data.objects.new("Mira", None); bpy.context.collection.objects.link(tgt); tgt.location = target
    c = cam.constraints.new("TRACK_TO"); c.target = tgt; c.track_axis = "TRACK_NEGATIVE_Z"; c.up_axis = "UP_Y"
    return cam, tgt


def render_cfg(w=1080, h=1920, pct=100, engine="EEVEE", samples=32):
    s = bpy.context.scene
    s.render.resolution_x = w; s.render.resolution_y = h; s.render.resolution_percentage = pct
    s.render.fps = 30
    if engine == "EEVEE":
        s.render.engine = "BLENDER_EEVEE"
        s.eevee.taa_render_samples = samples
    else:
        s.render.engine = "CYCLES"; s.cycles.device = "CPU"; s.cycles.samples = samples
        s.cycles.use_denoising = True
    s.view_settings.view_transform = "AgX"; s.view_settings.look = "AgX - Medium High Contrast"
    s.render.image_settings.file_format = "PNG"
    s.render.film_transparent = False
