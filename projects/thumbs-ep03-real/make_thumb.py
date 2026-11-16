from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance, ImageOps
import sys
R='/home/user/Kometa-estudio/'
OUT=R+'projects/thumbs-ep03-real/'
W,H=1920,1080
src=Image.open(R+'projects/ep03-engano/assets/photos/dummy_tank.jpg').convert('L')
# crop to 16:9 keeping the tank; place it right
sw,sh=src.size
crop=src.crop((0,0,sw,int(sw*9/16))) if sw*9/16<=sh else src
bg=crop.resize((W,int(W*crop.size[1]/crop.size[0])),Image.LANCZOS)
bg=bg.crop((0,(bg.size[1]-H)//2,W,(bg.size[1]-H)//2+H)) if bg.size[1]>=H else bg.resize((W,H),Image.LANCZOS)
bg=bg.filter(ImageFilter.UnsharpMask(2,90,2))
bg=ImageEnhance.Contrast(bg).enhance(1.25)
# warm sepia grade like an archive photo
col=ImageOps.colorize(bg,black=(18,14,10),mid=(128,108,82),white=(240,228,205)).convert('RGB')
# film grain
import random
noise=Image.effect_noise((W,H),22).convert('L')
col=Image.blend(col,Image.merge('RGB',(noise,noise,noise)),0.06)
# left darkening gradient for text + vignette
grad=Image.new('L',(W,H));gd=ImageDraw.Draw(grad)
for x in range(W):
  a=int(max(0,200*(1-x/(W*0.62))))
  gd.line([(x,0),(x,H)],fill=a)
col=Image.composite(Image.new('RGB',(W,H),(0,0,0)),col,grad)
vig=Image.new('L',(W,H),0);vd=ImageDraw.Draw(vig);vd.ellipse((-300,-250,W+300,H+250),fill=255);vig=vig.filter(ImageFilter.GaussianBlur(160))
col=Image.composite(col,Image.new('RGB',(W,H),(0,0,0)),vig)
F=lambda n,s:ImageFont.truetype(R+'assets/fonts/'+n,s)
def text(d,xy,t,f,fill,stroke=10,sc=(0,0,0)):
  d.text(xy,t,font=f,fill=fill,stroke_width=stroke,stroke_fill=sc)
def make(name,l1,l2,small,arrow=True):
  im=col.copy();d=ImageDraw.Draw(im)
  # red "1944" tape
  d.rectangle((70,90,330,165),fill=(214,32,32));text(d,(92,92),'DÍA D · 1944',F('BebasNeue-Regular.ttf',66),(255,255,255),0)
  text(d,(62,190),l1,F('Anton-Regular.ttf',190),(255,255,255),12)
  text(d,(62,420),l2,F('Anton-Regular.ttf',230),(255,214,0),12)
  if small: text(d,(70,720),small,F('Anton-Regular.ttf',70),(255,255,255),8)
  if arrow:
    # red arrow pointing to the wrinkled side of the tank
    ax,ay,bx,by=1060,860,1330,700
    d.line((ax,ay,bx,by),fill=(0,0,0),width=44);d.line((ax,ay,bx,by),fill=(230,30,30),width=28)
    import math;ang=math.atan2(by-ay,bx-ax)
    def tri(s,c):
      p=[(bx+s*math.cos(ang),by+s*math.sin(ang)),(bx+s*.8*math.cos(ang+2.4),by+s*.8*math.sin(ang+2.4)),(bx+s*.8*math.cos(ang-2.4),by+s*.8*math.sin(ang-2.4))]
      d.polygon(p,fill=c)
    tri(95,(0,0,0));tri(72,(230,30,30))
    # circle around wrinkled fabric
    d.ellipse((1330,520,1780,830),outline=(0,0,0),width=22);d.ellipse((1330,520,1780,830),outline=(230,30,30),width=12)
  im.save(OUT+name,quality=92)
  im.resize((1280,720),Image.LANCZOS).save(OUT+name.replace('.jpg','_1280.jpg'),quality=90)
make('A_eran_de_goma.jpg','ERAN','DE GOMA','Y ENGAÑARON A HITLER')
make('B_tanques_de_goma.jpg','TANQUES','DE GOMA','EL ARMA SECRETA DEL DÍA D')
