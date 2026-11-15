"""Prueba: crea un humano MPFB musculoso con esqueleto y lista huesos y grupos."""
import time
import bpy, addon_utils
repos = bpy.context.preferences.extensions.repos
if "local" not in [r.module for r in repos]:
    r = repos.new(name="local", module="local", custom_directory="/root/blender_ext", source='USER')
addon_utils.enable("bl_ext.local.mpfb", default_set=True)
from bl_ext.local.mpfb.services.humanservice import HumanService
from bl_ext.local.mpfb.entities.objectproperties import HumanObjectProperties
from bl_ext.local.mpfb.services.targetservice import TargetService

t = time.time()
h = HumanService.create_human()
for k, v in dict(gender=1.0, muscle=1.0, weight=0.55, proportions=1.0, height=0.6,
                 age=0.5, african=0.0, asian=0.0, caucasian=1.0).items():
    HumanObjectProperties.set_value(k, v, entity_reference=h)
TargetService.reapply_macro_details(h)
rig = HumanService.add_builtin_rig(h, "default")
print("built", round(time.time() - t, 1), h.name, rig.name, len(h.data.vertices))
print("BONES", [b.name for b in rig.data.bones])
print("GROUPS", sorted(h.vertex_groups.keys()))
print("OBJS", [o.name for o in bpy.data.objects])
