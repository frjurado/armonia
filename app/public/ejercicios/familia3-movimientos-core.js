/* ============================================================
   Familia 3 — Movimientos armónicos a dos voces (núcleo compartido)
   ------------------------------------------------------------
   Capa de FAMILIA sobre el motor genérico de contrapunto
   (`contrapunto-core.js`, global Contrapunto): elige tonalidad,
   clave y tesituras según el nivel, pide al motor un contrapunto
   1:1 de 10 notas por voz (Generador-ejercicios.md §4.3) y le
   añade lo específico de esta familia:
     · movimiento uniforme para el modo audición (gancho
       filtroCandidato del motor)
     · clasificación de cada transición (oblicuo / contrario /
       directo / paralelo) y cifrado de los intervalos
     · exportación a MEI con reveal progresivo (las notas aún no
       mostradas van como <space>, para que el layout no baile)
       y cifras integradas (<harm> anclado a la voz inferior)
     · dibujo de las líneas de movimiento sobre el SVG de Verovio
   Las reglas del contrapunto (consonancias, paralelas/directas,
   cadencia 3.ª→unísono / 6.ª→8.ª, saltos…) viven en el motor.
   Depende de `contrapunto-core.js` y `mini-lilypond-parser.js`.
   ============================================================ */
(function (global) {
  'use strict';

  const C = global.Contrapunto || (typeof require!=='undefined' && require('./contrapunto-core.js'));

  /* ---------- parámetros de la familia ---------- */
  const N = 10;                                  // notas por voz
  const MAJOR_POOL=[{tonic:'C',sig:0},{tonic:'G',sig:1}];
  const MINOR_POOL=[{tonic:'A',sig:0},{tonic:'D',sig:-1}];
  const rnd = a => a[Math.floor(Math.random()*a.length)];

  // Tesituras por voz (índices diatónicos absolutos). En los niveles 1-2 ambas
  // voces comparten pentagrama (máx. 1 línea adicional, para que quede legible
  // con dos capas); en el nivel 3 cada voz tiene su pentagrama.
  const RANGES = {
    treble: { lower:[28,36], upper:[32,40] },   // Do4..Mi5 / Sol4..La5
    bass:   { lower:[16,24], upper:[20,28] },   // Mi2..Sol3 / Si2..Do4
    dual:   { lower:[16,26], upper:[30,40] }    // Fa: Mi2..La3 · Sol: Mi4..La5
  };

  function levelParams(level){
    if(level<=1)  return { allowMinor:false, clefs:['treble'],        dual:false };
    if(level===2) return { allowMinor:true,  clefs:['treble','bass'], dual:false };
    return { allowMinor:true, dual:true };
  }

  const motion = (seq,i) => C.motionOf(
    seq[i].u-seq[i-1].u, seq[i].l-seq[i-1].l,
    (seq[i].u-seq[i].l)===(seq[i-1].u-seq[i-1].l));

  /* ---------- un intento: tonalidad/clave al azar + motor ---------- */
  // opts.uniform: tipo de movimiento exigido en las transiciones CENTRALES
  // (índices 1..N-4; quedan libres la primera y las dos últimas, porque los
  // extremos en 8.ª/unísono y la fórmula de cadencia las determinan).
  function tryBuild(level, opts){
    const p = levelParams(level);
    const mode = (p.allowMinor && Math.random()<0.5) ? 'minor' : 'major';
    const key  = {...rnd(mode==='minor'?MINOR_POOL:MAJOR_POOL), mode};
    const clef = p.dual ? null : rnd(p.clefs);
    const R = p.dual ? RANGES.dual : RANGES[clef];
    const target = opts && opts.uniform || null;

    const res = C.generar({
      tonalidad: key,
      rangos: [R.lower, R.upper],
      nNotas: N,
      filtroCandidato: target
        ? ctx => ctx.motionIdx<1 || ctx.motionIdx>N-4 || ctx.tipo===target
        : null,
      pesoCandidato: (ctx,w)=>{
        if(!target){
          if(ctx.tipo==='paralelo' && ctx.tipoPrevio==='paralelo') w*=0.4; // evita cadenas monótonas
          if(ctx.tipoPrevio && ctx.tipo!==ctx.tipoPrevio) w*=1.5;          // favorece variedad
          if(ctx.tipo==='directo') w*=2;  // el directo estricto es raro con estas reglas: se compensa
        }
        return w;
      }
    });
    if(!res) return null;
    return { key, alters:res.alters, clef, dual:p.dual,
             lower:res.voces[0], upper:res.voces[1],
             seq: res.voces[0].map((nl,i)=>({ l:nl.abs, u:res.voces[1][i].abs })) };
  }

  /* ---------- exportadores ---------- */
  function sigStr(sig){ return sig===0?'0':(Math.abs(sig)+(sig>0?'s':'f')); }
  function pitchToken(n){
    let s=n.letter.toLowerCase();
    if(n.alter===1)s+='s'; else if(n.alter===-1)s+='f';
    else if(n.alter===2)s+='ss'; else if(n.alter===-2)s+='ff';
    const d=n.oct-3;
    s += d>0 ? "'".repeat(d) : (d<0 ? ",".repeat(-d) : "");
    return s;
  }

  // MEI con dos voces (una en cada capa del mismo pentagrama, o una por pentagrama
  // en el nivel 3). `opts.revealed` = nº de parejas visibles (el resto, <space>);
  // `opts.intervals` = nº de cifras de intervalo a incrustar (<harm> bajo la
  // partitura, ancladas a la nota de la voz inferior).
  function toMEI(ex, opts){
    opts = opts||{};
    const n = ex.n || ex.upper.length;
    const revealed = opts.revealed==null ? n : opts.revealed;
    const nInt = Math.min(opts.intervals==null ? 0 : opts.intervals, revealed);
    const sig = C.keysigAlters(ex.key.sig);
    const accMap={1:'s',0:'n','-1':'f',2:'x','-2':'ff'};
    const clefAttr = c => c==='bass' ? 'clef.shape="F" clef.line="4"' : 'clef.shape="G" clef.line="2"';

    const noteEl=(nt,id,i)=> i<revealed
      ? `<note xml:id="${id}${i}" dur="2" pname="${nt.letter.toLowerCase()}" oct="${nt.oct}"${nt.alter!==sig[nt.letter]?` accid="${accMap[nt.alter]}"`:''}/>`
      : `<space dur="2"/>`;
    const layerBody=(notes,id)=>notes.map((nt,i)=>noteEl(nt,id,i)).join('');

    let staffDefs, staves;
    if(ex.dual){
      staffDefs = `<staffDef n="1" lines="5" ${clefAttr('treble')}/><staffDef n="2" lines="5" ${clefAttr('bass')}/>`;
      staves = `<staff n="1"><layer n="1">${layerBody(ex.upper,'f3u')}</layer></staff>`
             + `<staff n="2"><layer n="1">${layerBody(ex.lower,'f3l')}</layer></staff>`;
    }else{
      staffDefs = `<staffDef n="1" lines="5" ${clefAttr(ex.clef)}/>`;
      staves = `<staff n="1"><layer n="1">${layerBody(ex.upper,'f3u')}</layer>`
             + `<layer n="2">${layerBody(ex.lower,'f3l')}</layer></staff>`;
    }
    let harms='';
    for(let i=0;i<nInt;i++)
      harms += `<harm place="below" startid="#f3l${i}">${ex.intervals[i].figure}</harm>`;
    const grpAttrs = ex.dual ? ' symbol="brace" bar.thru="true"' : '';
    return `<?xml version="1.0" encoding="UTF-8"?>
<mei xmlns="http://www.music-encoding.org/ns/mei" meiversion="4.0.0">
 <music><body><mdiv><score>
  <scoreDef keysig="${sigStr(ex.key.sig)}">
   <staffGrp${grpAttrs}>${staffDefs}</staffGrp>
  </scoreDef>
  <section><measure right="end">${staves}${harms}</measure></section>
 </score></mdiv></body></music>
</mei>`;
  }

  /* ---------- generate() ---------- */
  // level 1-3; opts.uniform ∈ {oblicuo, contrario, directo, paralelo} (audición).
  function generate(level, opts){
    opts = opts||{};
    let built=null;
    for(let t=0; t<60 && !built; t++){
      const b = tryBuild(level, opts);
      if(!b) continue;
      if(!opts.uniform){
        // en identificación/canto pedimos variedad: al menos 3 tipos distintos
        const types=new Set();
        for(let i=1;i<N;i++) types.add(motion(b.seq,i));
        if(types.size < (t<30?3:2)) continue;
      }
      built=b;
    }
    if(!built) throw new Error('No se pudo generar el contrapunto (nivel '+level+')');

    const { key, clef, dual, seq, upper, lower } = built;

    const intervals = seq.map((s,i)=>{
      const steps=s.u-s.l, semis=upper[i].midi-lower[i].midi;
      const { reduced } = C.reduceSteps(steps);
      const quality = C.intervalQuality(steps, semis);
      return {
        steps, semis, reduced, quality,
        figure: String(reduced+1),                                   // cifra bajo la partitura
        name: (reduced+1)+'.ª '+quality + (steps>7 ? ' ('+(steps+1)+'.ª)' : ''),
        category: C.perfectClass(semis) ? 'consonancia perfecta' : 'consonancia imperfecta'
      };
    });
    const motions = [];
    for(let i=1;i<N;i++){
      const type = motion(seq,i);
      motions.push({ type, label: type[0].toUpperCase()+type.slice(1) });
    }

    // Pipeline didáctico (igual que las otras familias): mini-LilyPond → modelo → MEI.
    const voiceDefs = dual
      ? [ { clef:'treble', music: upper.map((n,i)=>pitchToken(n)+(i===0?'2':'')).join(' ') },
          { clef:'bass',   music: lower.map((n,i)=>pitchToken(n)+(i===0?'2':'')).join(' ') } ]
      : [ { clef, music: upper.map((n,i)=>pitchToken(n)+(i===0?'2':'')).join(' ') },
          { clef, music: lower.map((n,i)=>pitchToken(n)+(i===0?'2':'')).join(' ') } ];
    const parsedVoices = voiceDefs.map(v=>({
      clef:v.clef, music:v.music, events: MiniLily.parseVoice(v.music,{time:null}).events
    }));
    const display = `\\language "english"\n`
      + `\\key ${key.tonic.toLowerCase()} \\${key.mode}\n`
      + voiceDefs.map((v,i)=>`voz ${i+1} [clave de ${v.clef==='bass'?'Fa':'Sol'}]: ${v.music}`).join('\n');

    const ex = { key, clef, dual, level, n:N, upper, lower, intervals, motions,
                 uniform: opts.uniform||null, voiceDefs, parsedVoices, display };
    ex.mei = toMEI(ex, {revealed:N, intervals:N});
    return ex;
  }

  /* ---------- líneas de movimiento sobre el SVG (UI compartida) ---------- */
  // wrap: contenedor position:relative que envuelve la partitura; overlay: <svg>
  // absoluto encima. Dibuja las transiciones [0, upTo) en ambas voces; si
  // opts.animateLast, la última "crece" hacia la nota de destino.
  const LINE_COLORS = { upper:'#3a5a78', lower:'#b06c3a' };
  function noteCenter(wrap, id){
    const g = wrap.querySelector('#'+id);
    if(!g) return null;
    const head = g.querySelector('.notehead') || g;
    const r = head.getBoundingClientRect(), c = wrap.getBoundingClientRect();
    return { x:r.left+r.width/2-c.left, y:r.top+r.height/2-c.top };
  }
  function drawMotionLines(wrap, overlay, upTo, opts){
    opts=opts||{};
    overlay.setAttribute('width', wrap.clientWidth);
    overlay.setAttribute('height', wrap.clientHeight);
    overlay.innerHTML='';
    const mk=(a,b,color,animate)=>{
      if(!a||!b) return;
      // recorta los extremos para no tapar las cabezas
      const dx=b.x-a.x, dy=b.y-a.y, len=Math.hypot(dx,dy);
      const t = len>26 ? 8/len : 0.18;
      const x1=a.x+dx*t, y1=a.y+dy*t, x2=b.x-dx*t, y2=b.y-dy*t;
      const ln=document.createElementNS('http://www.w3.org/2000/svg','line');
      ln.setAttribute('x1',x1); ln.setAttribute('y1',y1);
      ln.setAttribute('x2',x2); ln.setAttribute('y2',y2);
      ln.setAttribute('stroke',color); ln.setAttribute('stroke-width','2.5');
      ln.setAttribute('stroke-linecap','round'); ln.setAttribute('opacity','0.85');
      if(animate){
        const l=Math.hypot(x2-x1,y2-y1);
        ln.style.strokeDasharray=l; ln.style.strokeDashoffset=l;
        ln.style.transition='stroke-dashoffset .45s ease-out';
        requestAnimationFrame(()=>requestAnimationFrame(()=>{ ln.style.strokeDashoffset='0'; }));
      }
      overlay.appendChild(ln);
    };
    for(let i=0;i<upTo;i++){
      const animate = opts.animateLast && i===upTo-1;
      mk(noteCenter(wrap,'f3u'+i), noteCenter(wrap,'f3u'+(i+1)), LINE_COLORS.upper, animate);
      mk(noteCenter(wrap,'f3l'+i), noteCenter(wrap,'f3l'+(i+1)), LINE_COLORS.lower, animate);
    }
  }

  const api = { generate, toMEI, drawMotionLines, midiOf:C.midiOf, MOTION_TYPES:C.MOTION_TYPES, N, LINE_COLORS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else global.Familia3 = api;
})(typeof window !== 'undefined' ? window : globalThis);
/* fin del módulo */
