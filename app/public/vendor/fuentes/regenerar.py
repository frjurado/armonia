# Regenera leland-alteraciones.woff2 a partir de LelandText.otf:
#  - cmap formato 12 con ♭ ♮ ♯ 𝄪 𝄫 (Unicode) → glifos SMuFL (U+E260–E264)
#  - subconjunto a esos cinco glifos
#  - contornos reescalados ×1,4 y apoyados en la línea base (Leland Text los
#    dibuja pequeños y alzados, para cifrados), con 18 unidades de margen
import sys, os
from fontTools.ttLib import TTFont
from fontTools.ttLib.tables._c_m_a_p import CmapSubtable
from fontTools import subset
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.t2CharStringPen import T2CharStringPen
from fontTools.pens.transformPen import TransformPen
sys.stdout.reconfigure(encoding='utf-8')
UNI={0x266D:0xE260,0x266E:0xE261,0x266F:0xE262,0x1D12A:0xE263,0x1D12B:0xE264}
S=1.4; SB=18
YMIN={0x266F:-40,0x266E:-30,0x266D:-10,0x1D12B:-10}; YCENTRO={0x1D12A:405}

f=TTFont(sys.argv[1] if len(sys.argv)>1 else 'LelandText.otf'); cm=f.getBestCmap()
t12=CmapSubtable.newSubtable(12); t12.platformID=3; t12.platEncID=10; t12.language=0
t12.cmap={u:cm[p] for u,p in UNI.items()}
f['cmap'].tables=[t12]
opts=subset.Options(); opts.notdef_outline=True
s=subset.Subsetter(opts); s.populate(unicodes=list(UNI)); s.subset(f)

gs=f.getGlyphSet(); cm=f.getBestCmap()
cff=f['CFF '].cff.topDictIndex[0]; cs=cff.CharStrings; hmtx=f['hmtx']
for u in UNI:
    g=cm[u]; bp=BoundsPen(gs); gs[g].draw(bp); x0,y0,x1,y1=bp.bounds
    dy = (YMIN[u]-y0*S) if u in YMIN else (YCENTRO[u]-(y0+y1)/2*S)
    dx = SB - x0*S; adv = round((x1-x0)*S + 2*SB)
    # el ancho en CFF se guarda relativo a nominalWidthX
    pen=T2CharStringPen(adv - cff.Private.nominalWidthX, gs)
    gs[g].draw(TransformPen(pen,(S,0,0,S,dx,dy)))
    cs[g]=pen.getCharString(private=cff.Private, globalSubrs=f["CFF "].cff.GlobalSubrs)
    hmtx[g]=(adv, round(x0*S+dx))
out=sys.argv[2] if len(sys.argv)>2 else 'leland-alteraciones.woff2'
f.flavor='woff2'; f.save(out)

f=TTFont(out); gs=f.getGlyphSet(); cm=f.getBestCmap(); cs=f['CFF '].cff.topDictIndex[0].CharStrings
for u in UNI:
    g=cm[u]; c=cs[g]; c.decompile(); bp=BoundsPen(gs); gs[g].draw(bp)
    print(chr(u), 'avance', c.width, f['hmtx'][g][0], 'caja', tuple(round(v) for v in bp.bounds))
print(out, os.path.getsize(out), 'bytes')
