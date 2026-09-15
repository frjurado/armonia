/* ============================================================
   Unidad 0 — Intervalos armónicos (núcleo compartido)
   ------------------------------------------------------------
   Lógica común a las tres variantes (identificación, con
   inversión, con grados): generación del intervalo, calidad y
   exportador MEI. A diferencia de la familia 2 (Unidad 1), aquí:
     · todo va en clave de Sol y hasta la 8.ª (sin compuestos);
     · el intervalo se escribe A DOS VOCES en un pentagrama
       (dos capas: plicas arriba / plicas abajo, en blancas);
     · las variantes libre e inversión no tienen tonalidad:
       alteraciones sueltas de un solo ♯/♭ (sin dobles, y sin
       intervalos doble aumentados/disminuidos);
     · la variante con grados sí usa tonalidad (las 4 del
       trimestre 1) y solo admite la sensible como accidental.
   Sin niveles de dificultad.
   Depende de `mini-lilypond-parser.js` (variable global MiniLily).
   ============================================================ */
(function (global) {
  'use strict';

  const MiniLily = (typeof module !== 'undefined' && module.exports)
    ? require('./mini-lilypond-parser') : global.MiniLily;

  /* ---------- núcleo de alturas (igual que las familias 1-3) ---------- */
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
  function altersByLetter(key){
    const sig=keysigAlters(key.sig), L=scaleLetters(key.tonic);
    const map={};
    L.forEach((x,i)=>{ map[x]=sig[x] + ((key.mode==='minor' && i===6)?1:0); });  // sensible
    return map;
  }
  function midiOf(letter,alter,oct){ return (oct+1)*12 + LETTER_SEMITONE[letter] + alter; }
  function absLetterIndex(letter, oct){ return oct*7 + LETTERS.indexOf(letter); }
  function letterOctAt(absIdx){
    return { letter: LETTERS[((absIdx%7)+7)%7], oct: Math.floor(absIdx/7) };
  }

  // Tesitura: clave de Sol con 1 línea adicional por arriba/abajo (Do4..La5).
  const LO = absLetterIndex('C',4), HI = absLetterIndex('A',5);

  /* ---------- calidad del intervalo (steps 0..7) ---------- */
  const REF_SEMIS = [0,2,4,5,7,9,11,12];        // semitonos "naturales" (mayor/justa)
  const PERFECT_STEPS = new Set([0,3,4,7]);     // 1.ª, 4.ª, 5.ª, 8.ª

  function intervalQuality(steps, semis){
    const diff = semis - REF_SEMIS[steps];
    if(PERFECT_STEPS.has(steps)){
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
  function etiqueta(steps, quality){
    if(steps===0) return quality==='justa' ? 'Unísono' : 'Unísono aumentado';
    return (steps+1)+'.ª '+quality;
  }

  /* ---------- generadores ---------- */
  const rnd = a => a[Math.floor(Math.random()*a.length)];
  // Alteraciones sueltas: natural la mitad de las veces, ♯/♭ a partes iguales.
  function rndAlter(){ const r=Math.random(); return r<0.5?0 : r<0.75?1 : -1; }

  // Intervalo "libre" (sin tonalidad): dos notas con alteración simple.
  // Se rechazan los doble aumentados/disminuidos, los cruces enarmónicos
  // (semis<0) y los intervalos que suenan a unísono sin serlo (2.ª dism.).
  function generarLibre(minSteps, maxSteps, hiAbs){
    for(let t=0;t<300;t++){
      const steps = minSteps + Math.floor(Math.random()*(maxSteps-minSteps+1));
      const loAbs = LO + Math.floor(Math.random()*(hiAbs-steps-LO+1));
      const lower = Object.assign(letterOctAt(loAbs),        {alter:rndAlter()});
      const upper = Object.assign(letterOctAt(loAbs+steps),  {alter:rndAlter()});
      const semis = midiOf(upper.letter,upper.alter,upper.oct)
                  - midiOf(lower.letter,lower.alter,lower.oct);
      if(semis<0) continue;
      if(steps>0 && semis===0) continue;
      const quality = intervalQuality(steps, semis);
      if(quality.indexOf('super')===0) continue;
      // sin amortiguar, los aumentados/disminuidos saldrían en ~40% de los
      // casos; se descartan a veces para que dominen mayor/menor/justa
      if((quality==='aumentada'||quality==='disminuida') && Math.random()<0.55) continue;
      return { lower, upper, steps, semis, quality, label: etiqueta(steps,quality) };
    }
    return null;   // no debería ocurrir con estos rangos
  }

  // Variante 1 — identificación simple (unísono a 8.ª).
  function generarNormal(){
    const ej = generarLibre(0,7,HI);
    ej.sig = 0;
    ej.mei = build([{lower:ej.lower, upper:ej.upper, visible:true}], 0, []);
    return ej;
  }

  // Variante 2 — con inversión (2.ª a 7.ª, para que la inversión sea otra
  // cosa distinta): la nota inferior sube una octava. La inversión aparece
  // como segundo compás, oculto (spaces) hasta revelar la respuesta.
  function generarInversion(){
    const ej = generarLibre(1,6,HI-7);    // la nota grave invertida debe caber
    const inv = {
      lower: {letter:ej.upper.letter, alter:ej.upper.alter, oct:ej.upper.oct},
      upper: {letter:ej.lower.letter, alter:ej.lower.alter, oct:ej.lower.oct+1}
    };
    inv.steps  = 7-ej.steps;
    inv.semis  = 12-ej.semis;
    inv.quality= intervalQuality(inv.steps, inv.semis);
    inv.label  = etiqueta(inv.steps, inv.quality);
    ej.inv = inv;
    ej.sig = 0;
    ej.mei = revelado => build([
      {lower:ej.lower, upper:ej.upper, visible:true},
      {lower:inv.lower, upper:inv.upper, visible:!!revelado}
    ], 0, []);
    return ej;
  }

  // Variante 3 — con grados: tonalidades del trimestre 1, notas diatónicas
  // (único accidental posible: la sensible del modo menor, siempre alterada).
  const KEYS = [
    {tonic:'C', sig:0,  mode:'major', nombre:'Do mayor'},
    {tonic:'G', sig:1,  mode:'major', nombre:'Sol mayor'},
    {tonic:'A', sig:0,  mode:'minor', nombre:'La menor'},
    {tonic:'D', sig:-1, mode:'minor', nombre:'Re menor'}
  ];
  function gradoDe(letter, key){
    return ((LETTERS.indexOf(letter)-LETTERS.indexOf(key.tonic))%7+7)%7 + 1;
  }
  function generarGrados(){
    const key = rnd(KEYS);
    const alters = altersByLetter(key);
    const steps = Math.floor(Math.random()*8);
    const loAbs = LO + Math.floor(Math.random()*(HI-steps-LO+1));
    const pos = abs => {
      const p=letterOctAt(abs);
      return {letter:p.letter, oct:p.oct, alter:alters[p.letter]};
    };
    const lower=pos(loAbs), upper=pos(loAbs+steps);
    const semis = midiOf(upper.letter,upper.alter,upper.oct)
                - midiOf(lower.letter,lower.alter,lower.oct);
    const quality = intervalQuality(steps, semis);
    const gradoInf=gradoDe(lower.letter,key), gradoSup=gradoDe(upper.letter,key);
    const caret = g => g+'̂';   // número con circunflejo (4̂)
    return {
      key, lower, upper, steps, semis, quality, label:etiqueta(steps,quality),
      gradoInf, gradoSup, gradoInfTxt:caret(gradoInf), gradoSupTxt:caret(gradoSup),
      // los grados (encima/debajo del pentagrama) solo se dibujan al revelar
      mei: revelado => build([{lower, upper, visible:true}], key.sig,
        revelado ? [ {place:'above', id:'m0s', text:caret(gradoSup)},
                     {place:'below', id:'m0b', text:caret(gradoInf)} ] : [])
    };
  }

  /* ---------- exportador MEI (dos capas en un pentagrama) ---------- */
  // Pipeline habitual: nota → token mini-LilyPond → parser → evento → MEI.
  function pitchToken(n){
    let s=n.letter.toLowerCase();
    if(n.alter===1)s+='s'; else if(n.alter===-1)s+='f';
    const d=n.oct-3;
    s += d>0 ? "'".repeat(d) : (d<0 ? ",".repeat(-d) : "");
    return s;
  }
  const accMap={1:'s',0:'n','-1':'f',2:'x','-2':'ff'};

  function build(medidas, sig, dirs){
    const sigMap=keysigAlters(sig);
    const noteXml=(n,id,force)=>{
      const ev=MiniLily.parseVoice(pitchToken(n)+'2',{time:null}).events[0];
      const L=ev.letter.toUpperCase();
      const acc=(force || ev.alter!==sigMap[L]) ? ` accid="${accMap[ev.alter]}"` : '';
      return `<note xml:id="${id}" dur="${ev.base}" pname="${ev.letter}" oct="${ev.octave}"${acc}/>`;
    };
    const cuerpo = medidas.map((m,i)=>{
      // Unísono con alteraciones distintas: se fuerza el accidental en ambas
      // notas (también el becuadro), o la partitura sería ambigua.
      const force = m.visible && m.lower.letter===m.upper.letter &&
                    m.lower.oct===m.upper.oct && m.lower.alter!==m.upper.alter;
      const l1 = m.visible ? noteXml(m.upper,`m${i}s`,force) : '<space dur="2"/>';
      const l2 = m.visible ? noteXml(m.lower,`m${i}b`,force) : '<space dur="2"/>';
      const dirXml = dirs.filter(d=>d.id.indexOf(`m${i}`)===0)
        .map(d=>`<dir place="${d.place}" startid="#${d.id}">${d.text}</dir>`).join('');
      // Con un 2.º compás aún oculto no se dibuja la barra intermedia;
      // al revelarlo se separa el original de la inversión con barra doble.
      const right = (i===0 && medidas.length===2)
        ? (medidas[1].visible ? ' right="dbl"' : ' right="invis"') : '';
      return `<measure n="${i+1}"${right}><staff n="1">`+
             `<layer n="1">${l1}</layer><layer n="2">${l2}</layer>`+
             `</staff>${dirXml}</measure>`;
    }).join('');
    const sigAttr = sig===0?'0':(Math.abs(sig)+(sig>0?'s':'f'));
    return `<?xml version="1.0" encoding="UTF-8"?>
<mei xmlns="http://www.music-encoding.org/ns/mei" meiversion="4.0.0">
 <music><body><mdiv><score>
  <scoreDef keysig="${sigAttr}">
   <staffGrp><staffDef n="1" lines="5" clef.shape="G" clef.line="2"/></staffGrp>
  </scoreDef>
  <section>${cuerpo}</section>
 </score></mdiv></body></music>
</mei>`;
  }

  const api = { generarNormal, generarInversion, generarGrados, midiOf };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else global.U0Intervalos = api;
})(typeof window !== 'undefined' ? window : globalThis);
/* fin */
