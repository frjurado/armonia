/* ============================================================
   Familia 2 — Intervalos a dos voces (núcleo musical compartido)
   ------------------------------------------------------------
   Lógica común a las versiones de identificación y audición:
   generación del intervalo, cálculo de amplitud/calidad/categoría,
   y exportadores (mini-LilyPond → modelo → MEI). Sigue el mismo
   patrón que `familia1-triadas.html`, pero factorizado en módulo
   aparte porque aquí hay dos variantes (id / audición) que
   comparten toda la lógica de generación y solo difieren en la UI.
   Depende de `mini-lilypond-parser.js` (variable global MiniLily).
   ============================================================ */
(function (global) {
  'use strict';

  /* ---------- núcleo de alturas / tonalidad (igual que familia 1) ---------- */
  const LETTERS = ['C','D','E','F','G','A','B'];
  const LETTER_SEMITONE = {C:0,D:2,E:4,F:5,G:7,A:9,B:11};
  const SHARP_ORDER = ['F','C','G','D','A','E','B'];
  const FLAT_ORDER  = ['B','E','A','D','G','C','F'];

  function keysigAlters(sig){
    const m={C:0,D:0,E:0,F:0,G:0,A:0,B:0};
    if(sig>0) for(let i=0;i<sig;i++) m[SHARP_ORDER[i]]=1;
    else if(sig<0) for(let i=0;i<-sig;i++) m[FLAT_ORDER[i]]=-1;
    return m;
  }
  function scaleLetters(tonic){
    const s=LETTERS.indexOf(tonic), out=[];
    for(let i=0;i<7;i++) out.push(LETTERS[(s+i)%7]);
    return out;
  }
  // Alteraciones por grado, en el orden de la escala (rotado a partir de la tónica).
  function scaleDegreeAlters(key){
    const sig=keysigAlters(key.sig), L=scaleLetters(key.tonic);
    const arr=L.map(x=>({letter:x,alter:sig[x]}));
    if(key.mode==='minor') arr[6].alter+=1;   // única alteración añadida: la sensible
    return arr;
  }
  // Lo mismo, pero indexado por LETRA (no por grado rotado): imprescindible en cuanto
  // generamos notas fuera de una única octava/escala recorrida linealmente (§ más abajo).
  function altersByLetter(key){
    const map={};
    scaleDegreeAlters(key).forEach(d=>{ map[d.letter]=d.alter; });
    return map;
  }
  function midiOf(letter,alter,oct){ return (oct+1)*12 + LETTER_SEMITONE[letter] + alter; }

  // Índice diatónico ABSOLUTO de una nota: cuenta "pasos de letra" (C,D,E,F,G,A,B,C,D…)
  // sin tener en cuenta alteraciones. Es la base de todo lo demás en este módulo:
  //  · da la AMPLITUD del intervalo entre dos notas cualesquiera (incluso compuestas,
  //    a varias octavas de distancia) como una simple resta de índices — sin casos
  //    especiales de "salto de octava" como en la versión anterior de este fichero;
  //  · da el Nº DE LÍNEAS ADICIONALES que ocupa una nota en un pentagrama, porque eso
  //    depende solo de la letra y la octava (no de si lleva alteración).
  function absLetterIndex(letter, oct){ return oct*7 + LETTERS.indexOf(letter); }
  function letterOctAt(absIdx){
    const oct = Math.floor(absIdx/7);
    const letter = LETTERS[((absIdx%7)+7)%7];
    return { letter, oct };
  }
  function pitchAt(absIdx, alters){
    const { letter, oct } = letterOctAt(absIdx);
    return { letter, oct, alter: alters[letter] };
  }

  /* ---------- tesitura: líneas adicionales permitidas ---------- */
  // Familia 1 (tríadas): máximo 1 línea adicional por encima/debajo del pentagrama.
  // Familia 2 (intervalos): máximo 2 líneas adicionales. Hacen falta más porque desde
  // el nivel 2 hay intervalos COMPUESTOS (hasta la 12.ª) que no caben en la tesitura de
  // una línea, y porque en el nivel 3 cada nota vive en su propio pentagrama (Sol / Fa)
  // con tesitura calculada de forma independiente.
  // Cada línea adicional añade 2 pasos diatónicos (letra+octava) por encima o por debajo
  // de la línea límite del pentagrama (línea→espacio→línea = 2 pasos de letra).
  const MAX_LEDGER_LINES = 2;
  const STAFF_BOUNDS = {                                  // línea inferior / superior del pentagrama
    treble: [absLetterIndex('E',4), absLetterIndex('F',5)],   // Mi4 .. Fa5
    bass:   [absLetterIndex('G',2), absLetterIndex('A',3)]    // Sol2 .. La3
  };
  function clefLetterRange(clef){
    const [lo,hi] = STAFF_BOUNDS[clef];
    const pad = 2*MAX_LEDGER_LINES;
    return [lo-pad, hi+pad];
    // treble → [26,42] = La3..Do6  ·  bass → [14,30] = Do2..Mi4
  }

  /* ---------- amplitud / calidad / categoría del intervalo ---------- */
  // `steps` = distancia diatónica absoluta (0 = unísono, 7 = 8.ª, 11 = 12.ª, …), sin
  // límite: puede superar la 8.ª (intervalo compuesto). La CALIDAD de un intervalo
  // compuesto es la misma que la de su intervalo simple equivalente (una 12.ª justa es
  // "justa" igual que una 5.ª justa: una 8.ª siempre suma exactamente 12 semitonos, así
  // que la desviación respecto al valor "natural" no cambia al añadir octavas).
  const REF_SEMIS  = [0,2,4,5,7,9,11,12];              // semitonos "naturales" (mayor/justa)
  const PERFECT_STEPS = new Set([0,3,4,7]);            // 1.ª, 4.ª, 5.ª, 8.ª

  // Reduce un intervalo compuesto a su forma simple (1.ª a 8.ª) + nº de octavas de más.
  function reduceSteps(steps){
    if(steps<=7) return { reduced: steps, octaves: 0 };
    const octaves = Math.floor((steps-1)/7);
    return { reduced: steps-7*octaves, octaves };
  }
  function amplitudeLabel(steps){ return (steps+1)+'.ª'; }   // 0→"1.ª", 7→"8.ª", 11→"12.ª"…

  function intervalQuality(steps, semis){
    const { reduced, octaves } = reduceSteps(steps);
    const ref = REF_SEMIS[reduced] + 12*octaves;
    const diff = semis - ref;
    if(PERFECT_STEPS.has(reduced)){
      if(diff===0) return 'justa';
      if(diff===1) return 'aumentada';
      if(diff===-1) return 'disminuida';
      return diff>0 ? 'superaumentada' : 'superdisminuida';
    }
    if(diff===0) return 'mayor';
    if(diff===-1) return 'menor';
    if(diff===1) return 'aumentada';
    if(diff===-2) return 'disminuida';
    return diff>0 ? 'superaumentada' : 'superdisminuida';
  }
  function intervalCategory(steps, quality){
    const { reduced } = reduceSteps(steps);
    if(quality==='aumentada' || quality==='disminuida' ||
       quality==='superaumentada' || quality==='superdisminuida') return 'disonancia';
    if(PERFECT_STEPS.has(reduced)) return 'consonancia perfecta';
    if(reduced===2 || reduced===5) return 'consonancia imperfecta';   // 3.ª, 6.ª
    return 'disonancia';                                              // 2.ª, 7.ª
  }

  /* ---------- exportadores desde la representación propia ---------- */
  function sigStr(sig){ return sig===0?'0':(Math.abs(sig)+(sig>0?'s':'f')); }

  function pitchToken(n){
    const oct = (n.oct!==undefined)?n.oct:n.octave;
    let s=n.letter.toLowerCase();
    if(n.alter===1)s+='s'; else if(n.alter===-1)s+='f';
    else if(n.alter===2)s+='ss'; else if(n.alter===-2)s+='ff';
    const d=oct-3;
    s += d>0 ? "'".repeat(d) : (d<0 ? ",".repeat(-d) : "");
    return s;
  }
  function chordMusic(notes,dur){ return '<'+notes.map(pitchToken).join(' ')+'>'+(dur||1); }
  function noteMusic(n,dur){ return pitchToken(n)+(dur||1); }

  // Exportador a MEI, generalizado a VARIAS voces/pentagramas (voices: [{clef, events}]).
  // Con 1 voz: intervalo en un solo pentagrama (acorde de 2 notas), niveles 1-2.
  // Con 2 voces: una nota en clave de Sol y otra en clave de Fa (pentagrama doble), nivel 3.
  function modelToMEI(voices, key){
    const sig=keysigAlters(key.sig);
    const accMap={1:'s',0:'n','-1':'f',2:'x','-2':'ff'};
    const clefAttr = c => c==='bass' ? 'clef.shape="F" clef.line="4"' : 'clef.shape="G" clef.line="2"';
    const noteEl = n=>{
      const L=n.letter.toUpperCase();
      const acc = (n.alter!==sig[L]) ? ` accid="${accMap[n.alter]}"` : '';
      return `<note pname="${n.letter}" oct="${n.octave}"${acc}/>`;
    };
    const eventsBody = events => events.map(ev=>{
      const dots = ev.dots ? ` dots="${ev.dots}"` : '';
      if(ev.type==='chord') return `<chord dur="${ev.base}"${dots}>${ev.notes.map(noteEl).join('')}</chord>`;
      if(ev.type==='note')  return `<note dur="${ev.base}"${dots} pname="${ev.letter}" oct="${ev.octave}"${(ev.alter!==sig[ev.letter.toUpperCase()])?` accid="${accMap[ev.alter]}"`:''}/>`;
      if(ev.type==='rest')  return ev.visible ? `<rest dur="${ev.base}"${dots}/>` : `<space dur="${ev.base}"${dots}/>`;
      return '';
    }).join('');
    const staffDefs = voices.map((v,idx)=>`<staffDef n="${idx+1}" lines="5" ${clefAttr(v.clef)}/>`).join('');
    const staves    = voices.map((v,idx)=>`<staff n="${idx+1}"><layer n="1">${eventsBody(v.events)}</layer></staff>`).join('');
    const grpAttrs   = voices.length>1 ? ' symbol="brace" bar.thru="true"' : '';
    return `<?xml version="1.0" encoding="UTF-8"?>
<mei xmlns="http://www.music-encoding.org/ns/mei" meiversion="4.0.0">
 <music><body><mdiv><score>
  <scoreDef keysig="${sigStr(key.sig)}">
   <staffGrp${grpAttrs}>${staffDefs}</staffGrp>
  </scoreDef>
  <section><measure>${staves}</measure></section>
 </score></mdiv></body></music>
</mei>`;
  }

  /* ---------- generador (al vuelo, en cliente) ---------- */
  // Tonalidades limitadas al TRIMESTRE 1 (Do, Sol mayores; La, Re menores) — igual que familia 1.
  const MAJOR_POOL=[{tonic:'C',sig:0},{tonic:'G',sig:1}];
  const MINOR_POOL=[{tonic:'A',sig:0},{tonic:'D',sig:-1}];
  const rnd = a => a[Math.floor(Math.random()*a.length)];
  function range(a,b){ const r=[]; for(let i=a;i<b;i++) r.push(i); return r; }

  // Parámetros por nivel:
  //  · Nivel 1 — modo mayor, clave de Sol, amplitudes 1.ª a 8.ª (unísono a octava incluidos).
  //    Únicos intervalos aumentados/disminuidos posibles: 4.ª aumentada / 5.ª disminuida
  //    (el único tritono de la escala mayor natural, sin alterar nada más).
  //  · Nivel 2 — añade el modo menor (con la sensible alterada: pueden salir otros
  //    intervalos aumentados/disminuidos, p. ej. 2.ª aumentada VI–VII#) y la clave de Fa.
  //    Amplitudes hasta la 12.ª (intervalos compuestos): se muestra la forma reducida en
  //    grande (p. ej. "5.ª justa") y, si es compuesto, la amplitud real en pequeño (p.
  //    ej. "12.ª justa").
  //  · Nivel 3 — dos claves A LA VEZ (una nota en clave de Fa, otra en clave de Sol, cada
  //    una con su propia tesitura de ±2 líneas adicionales), lo que hace que casi todos
  //    los intervalos sean compuestos. Incluye el unísono entre claves distintas (misma
  //    altura real, notada de dos formas), pero se EVITAN los cruces: la voz en Fa nunca
  //    puede sonar más aguda que la voz en Sol.
  function levelParams(level){
    if(level<=1) return { allowMinor:false, clefs:['treble'],           stepsPool:range(0,8),  dualClef:false };
    if(level===2) return { allowMinor:true,  clefs:['treble','bass'],   stepsPool:range(0,12), dualClef:false };
    return { allowMinor:true, dualClef:true };
  }

  // Niveles 1-2: intervalo en UN pentagrama (acorde de 2 notas).
  function buildSingleClef(params){
    const mode = (params.allowMinor && Math.random()<0.5) ? 'minor' : 'major';
    const key  = {...rnd(mode==='minor'?MINOR_POOL:MAJOR_POOL), mode};
    const alters = altersByLetter(key);
    const clef = rnd(params.clefs);
    const [lo,hi] = clefLetterRange(clef);
    const steps = rnd(params.stepsPool);
    const span = Math.max(hi-lo-steps, 0);              // margen para variar la posición
    const loAbs = lo + Math.floor(Math.random()*(span+1));
    const hiAbs = loAbs + steps;
    const lower = pitchAt(loAbs, alters);
    const upper = pitchAt(hiAbs, alters);
    const semis = midiOf(upper.letter,upper.alter,upper.oct) - midiOf(lower.letter,lower.alter,lower.oct);
    const quality  = intervalQuality(steps, semis);
    const category = intervalCategory(steps, quality);
    return { key, single:true, clef, notes:[lower,upper], steps, semis, quality, category };
  }

  // Nivel 3: una nota en clave de Fa y otra en clave de Sol, sin cruces.
  function buildDualClef(){
    const mode = Math.random()<0.5 ? 'minor' : 'major';
    const key  = {...rnd(mode==='minor'?MINOR_POOL:MAJOR_POOL), mode};
    const alters = altersByLetter(key);
    const [bLo,bHi] = clefLetterRange('bass');
    const [tLo,tHi] = clefLetterRange('treble');
    let lower, upper, lowerAbs, upperAbs, semis, steps;
    for(let t=0; t<80; t++){
      lowerAbs = bLo + Math.floor(Math.random()*(bHi-bLo+1));
      upperAbs = tLo + Math.floor(Math.random()*(tHi-tLo+1));
      lower = pitchAt(lowerAbs, alters);
      upper = pitchAt(upperAbs, alters);
      semis = midiOf(upper.letter,upper.alter,upper.oct) - midiOf(lower.letter,lower.alter,lower.oct);
      steps = upperAbs - lowerAbs;
      if(steps>=0 && semis>=0) break;   // rechaza cruces: Fa no puede sonar más agudo que Sol
    }
    const quality  = intervalQuality(steps, semis);
    const category = intervalCategory(steps, quality);
    return { key, single:false, clefLower:'bass', clefUpper:'treble', notes:[lower,upper], steps, semis, quality, category };
  }

  function generate(level){
    const params = levelParams(level);
    const raw = params.dualClef ? buildDualClef() : buildSingleClef(params);

    // Voces mini-LilyPond: 1 voz (acorde) en niveles 1-2, 2 voces (Sol arriba, Fa abajo) en nivel 3.
    const voiceDefs = raw.single
      ? [ { clef: raw.clef, music: chordMusic(raw.notes,1) } ]
      : [ { clef: 'treble', music: noteMusic(raw.notes[1],1) },
          { clef: 'bass',   music: noteMusic(raw.notes[0],1) } ];

    const parsedVoices = voiceDefs.map(v => ({
      clef: v.clef, music: v.music, events: MiniLily.parseVoice(v.music, {time:null}).events
    }));
    const mei = modelToMEI(parsedVoices, raw.key);

    const { reduced, octaves } = reduceSteps(raw.steps);
    const amplitude = amplitudeLabel(reduced);                                  // forma simple/reducida
    const isCompound = raw.steps > 7;
    const compoundAmplitude = isCompound ? amplitudeLabel(raw.steps) : null;    // forma real, si compuesto

    // Etiquetas para la UI. El unísono se nombra "Unísono", no "1.ª justa"
    // (con la generación diatónica actual el unísono solo puede ser justo).
    const label = raw.steps===0 ? 'Unísono' : amplitude+' '+raw.quality;
    const compoundLabel = isCompound ? amplitudeLabel(raw.steps)+' '+raw.quality : null;

    return { ...raw, voiceDefs, parsedVoices, mei,
             amplitude, isCompound, compoundAmplitude, octaves, label, compoundLabel };
  }

  // Descripciones de nivel (compartidas por las páginas de id y audición).
  const LVL_NOTES = {
    1: '(modo mayor, clave de Sol; del unísono a la 8.ª — los únicos intervalos aumentado/disminuido posibles son 4.ª aumentada / 5.ª disminuida)',
    2: '(añade modo menor —con la sensible pueden salir otros aumentados/disminuidos— y clave de Fa; amplitudes hasta la 12.ª)',
    3: '(dos claves a la vez: una nota en Fa y otra en Sol, cada una con su propia tesitura; incluye el unísono entre claves distintas; sin cruces)'
  };
  const MAX_NIVEL = 3;

  const api = { generate, midiOf, LVL_NOTES, MAX_NIVEL };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else global.Familia2 = api;
})(typeof window !== 'undefined' ? window : globalThis);
/* fin */
