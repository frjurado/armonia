/* ============================================================
   Intervalos armónicos (núcleo compartido)
   ------------------------------------------------------------
   Diseño: docs/familias/intervalos.md. Lógica común a las tres
   consignas (identificación, con inversión, con grados):
   generación del intervalo, calidad y exportador MEI. Absorbe la
   antigua «familia 2» (compuestos, dos claves), que se retiró.
     · Identificación y Con grados: PENTAGRAMA DOBLE, intervalos
       simples y compuestos hasta la 12.ª; las dos notas en Sol,
       las dos en Fa o una en cada pentagrama (por tercios), con
       2 líneas adicionales como mucho (por pasos diatónicos).
     · Con inversión: un pentagrama (clave de Sol), de la 2.ª a
       la 7.ª: invertir es una operación dentro de la 8.ª.
     · Identificación y Con inversión van sin tonalidad:
       alteraciones sueltas de un solo ♯/♭; Con grados, dentro de
       una tonalidad del trimestre 1 (tonalidades.js), con la
       sensible como único accidental.
     · Aumentados y disminuidos: solo los que aparecen en la
       escala mayor o en la menor armónica, y sus compuestos
       (ALTERADOS_PERMITIDOS).
   Sin niveles de dificultad.
   Depende de `mini-lilypond-parser.js` (global MiniLily) y de
   `../tonalidades.js` (global TONALIDADES).
   ============================================================ */
(function (global) {
  'use strict';

  const esNode = typeof module !== 'undefined' && module.exports;
  const MiniLily = esNode ? require('./mini-lilypond-parser') : global.MiniLily;
  const TON = esNode ? require('../tonalidades') : global.TONALIDADES;

  /* ---------- núcleo de alturas ---------- */
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
  // Alteración de cada letra en la tonalidad (menor armónica: sensible alterada).
  function altersByLetter(key){
    const sig=keysigAlters(key.sig), L=scaleLetters(key.tonic);
    const map={};
    L.forEach((x,i)=>{ map[x]=sig[x] + ((key.mode==='minor' && i===6)?1:0); });
    return map;
  }
  function midiOf(letter,alter,oct){ return (oct+1)*12 + LETTER_SEMITONE[letter] + alter; }
  // Índice diatónico absoluto (pasos de letra): la amplitud de un intervalo es
  // una resta, y las líneas adicionales dependen solo de él.
  function absLetterIndex(letter, oct){ return oct*7 + LETTERS.indexOf(letter); }
  function letterOctAt(absIdx){
    return { letter: LETTERS[((absIdx%7)+7)%7], oct: Math.floor(absIdx/7) };
  }

  /* ---------- tesituras ---------- */
  // Con inversión: clave de Sol con 1 línea adicional (Do4..La5).
  const LO = absLetterIndex('C',4), HI = absLetterIndex('A',5);
  // Pentagrama doble: 2 líneas adicionales por encima y por debajo de cada
  // pentagrama, contadas por pasos diatónicos (línea → espacio → línea = 2).
  const MAX_LEDGER_LINES = 2;
  const STAFF_BOUNDS = {                                   // línea inferior / superior
    treble: [absLetterIndex('E',4), absLetterIndex('F',5)],
    bass:   [absLetterIndex('G',2), absLetterIndex('A',3)]
  };
  function rangoClave(clave){
    const [lo,hi]=STAFF_BOUNDS[clave], pad=2*MAX_LEDGER_LINES;
    return [lo-pad, hi+pad];                               // Sol: La3..Do6 · Fa: Do2..Mi4
  }
  const MAX_STEPS = 11;                                     // hasta la 12.ª

  /* ---------- calidad del intervalo (también compuestos) ---------- */
  const REF_SEMIS = [0,2,4,5,7,9,11,12];                   // mayor / justa
  const PERFECT_STEPS = new Set([0,3,4,7]);                // 1.ª, 4.ª, 5.ª, 8.ª
  // Un compuesto se reduce a su simple (1.ª–8.ª): la 12.ª, a 5.ª; la 15.ª, a 8.ª.
  function reducir(steps){
    if(steps<=7) return {simple:steps, octavas:0};
    const octavas=Math.floor((steps-1)/7);
    return {simple:steps-7*octavas, octavas};
  }
  function intervalQuality(steps, semis){
    const {simple, octavas}=reducir(steps);
    const diff = semis - (REF_SEMIS[simple] + 12*octavas);
    if(PERFECT_STEPS.has(simple)){
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
  // Aumentados y disminuidos admitidos (forma simple · calidad): los que salen
  // en la escala mayor o en la menor armónica —el tritono (4.ª A, 5.ª D), 6̂–7̂
  // en menor (2.ª A, 7.ª D) y 3̂–7̂ en menor (5.ª A, 4.ª D)—, y sus compuestos.
  // Fuera: unísono A, 2.ª D, 3.as y 6.as A/D, 7.ª A y 8.as alteradas.
  const ALTERADOS_PERMITIDOS = new Set(['3:aumentada','4:disminuida','1:aumentada',
                                        '6:disminuida','4:aumentada','3:disminuida']);
  function admitido(steps, quality){
    if(quality!=='aumentada' && quality!=='disminuida') return quality.indexOf('super')!==0;
    return ALTERADOS_PERMITIDOS.has(reducir(steps).simple+':'+quality);
  }
  const amplitud = steps => steps===0 ? 'Unísono' : (steps+1)+'.ª';
  // «5.ª justa»; si es compuesto, la forma real va aparte (`real`: «12.ª justa»).
  function etiquetas(steps, quality){
    const {simple}=reducir(steps);
    const simpleTxt = simple===0 ? 'Unísono' : amplitud(simple)+' '+quality;
    return { label: steps>7 ? amplitud(simple)+' '+quality : simpleTxt,
             real: steps>7 ? amplitud(steps)+' '+quality : null };
  }

  /* ---------- generadores ---------- */
  const rnd = a => a[Math.floor(Math.random()*a.length)];
  // Alteraciones sueltas: natural la mitad de las veces, ♯/♭ a partes iguales.
  function rndAlter(){ const r=Math.random(); return r<0.5?0 : r<0.75?1 : -1; }

  // Dos notas a distancia `steps` (pasos de letra) colocadas según la
  // disposición: 'sol' (las dos en Sol), 'fa' (las dos en Fa) o 'repartido'
  // (la grave en Fa, la aguda en Sol). Devuelve las posiciones absolutas o
  // null si no caben.
  function colocar(steps, disp){
    if(disp==='repartido'){
      const [bLo,bHi]=rangoClave('bass'), [tLo,tHi]=rangoClave('treble');
      const lows=[]; for(let a=bLo;a<=bHi;a++) if(a+steps>=tLo && a+steps<=tHi) lows.push(a);
      if(!lows.length) return null;
      const lo=rnd(lows); return {loAbs:lo, hiAbs:lo+steps, staffLo:2, staffHi:1};
    }
    const clave = disp==='sol' ? 'treble' : 'bass';
    const [lo,hi]=rangoClave(clave);
    if(hi-lo<steps) return null;
    const a=lo+Math.floor(Math.random()*(hi-lo-steps+1));
    const st = disp==='sol' ? 1 : 2;
    return {loAbs:a, hiAbs:a+steps, staffLo:st, staffHi:st};
  }
  const DISPOSICIONES = ['sol','fa','repartido'];

  // Intervalo libre (sin tonalidad) en pentagrama doble: Identificación.
  function generarNormal(){
    for(let t=0;t<500;t++){
      const steps=Math.floor(Math.random()*(MAX_STEPS+1));
      const disp=rnd(DISPOSICIONES);
      const c=colocar(steps, disp); if(!c) continue;
      const lower=Object.assign(letterOctAt(c.loAbs), {alter:rndAlter()});
      const upper=Object.assign(letterOctAt(c.hiAbs), {alter:rndAlter()});
      const semis=midiOf(upper.letter,upper.alter,upper.oct)-midiOf(lower.letter,lower.alter,lower.oct);
      if(semis<0 || (steps>0 && semis===0)) continue;        // cruce enarmónico o «2.ª dism.»
      const quality=intervalQuality(steps, semis);
      if(!admitido(steps, quality)) continue;
      // sin amortiguar, los alterados saldrían demasiado: que dominen M/m/J
      if((quality==='aumentada'||quality==='disminuida') && Math.random()<0.55) continue;
      const ej={lower, upper, steps, semis, quality, disp, sig:0, ...etiquetas(steps, quality)};
      ej.mei = opts => build([{lower, upper, staffLo:c.staffLo, staffHi:c.staffHi, visible:true}], 0, [], opciones(opts), 2);
      return ej;
    }
    return null;   // no debería ocurrir
  }

  // Con inversión (2.ª a 7.ª), en clave de Sol: la nota inferior sube una
  // octava. La inversión es un segundo compás: con máscara, dibujado y marcado
  // «resp» (lo oculta comun.css); sin ella, <space> hasta revelar.
  function generarLibreSimple(minSteps, maxSteps, hiAbs){
    for(let t=0;t<300;t++){
      const steps = minSteps + Math.floor(Math.random()*(maxSteps-minSteps+1));
      const loAbs = LO + Math.floor(Math.random()*(hiAbs-steps-LO+1));
      const lower = Object.assign(letterOctAt(loAbs),       {alter:rndAlter()});
      const upper = Object.assign(letterOctAt(loAbs+steps), {alter:rndAlter()});
      const semis = midiOf(upper.letter,upper.alter,upper.oct)-midiOf(lower.letter,lower.alter,lower.oct);
      if(semis<0 || (steps>0 && semis===0)) continue;
      const quality = intervalQuality(steps, semis);
      if(!admitido(steps, quality)) continue;
      if((quality==='aumentada'||quality==='disminuida') && Math.random()<0.55) continue;
      return { lower, upper, steps, semis, quality, ...etiquetas(steps, quality) };
    }
    return null;
  }
  function generarInversion(){
    const ej = generarLibreSimple(1,6,HI-7);    // la nota grave invertida debe caber
    const inv = {
      lower: {letter:ej.upper.letter, alter:ej.upper.alter, oct:ej.upper.oct},
      upper: {letter:ej.lower.letter, alter:ej.lower.alter, oct:ej.lower.oct+1}
    };
    inv.steps  = 7-ej.steps;
    inv.semis  = 12-ej.semis;
    inv.quality= intervalQuality(inv.steps, inv.semis);
    Object.assign(inv, etiquetas(inv.steps, inv.quality));
    ej.inv = inv;
    ej.sig = 0;
    ej.mei = opts => { const o=opciones(opts); return build([
      {lower:ej.lower, upper:ej.upper, staffLo:1, staffHi:1, visible:true},
      {lower:inv.lower, upper:inv.upper, staffLo:1, staffHi:1, visible:o.mascara||o.revelado, resp:o.mascara}
    ], 0, [], o, 1); };
    return ej;
  }

  // Con grados: tonalidades del trimestre 1, notas diatónicas (único accidental
  // posible: la sensible del menor), en pentagrama doble como Identificación.
  const KEYS = TON.hastaTrimestre(1);
  function gradoDe(letter, key){
    return ((LETTERS.indexOf(letter)-LETTERS.indexOf(key.tonic))%7+7)%7 + 1;
  }
  function generarGrados(){
    for(let t=0;t<500;t++){
      const key = rnd(KEYS);
      const alters = altersByLetter(key);
      const steps=Math.floor(Math.random()*(MAX_STEPS+1));
      const disp=rnd(DISPOSICIONES);
      const c=colocar(steps, disp); if(!c) continue;
      const pos = abs => Object.assign(letterOctAt(abs), {alter:alters[letterOctAt(abs).letter]});
      const lower=pos(c.loAbs), upper=pos(c.hiAbs);
      const semis = midiOf(upper.letter,upper.alter,upper.oct)-midiOf(lower.letter,lower.alter,lower.oct);
      if(semis<0) continue;
      const quality = intervalQuality(steps, semis);
      if(!admitido(steps, quality)) continue;               // no debería pasar: son de la escala
      const gradoInf=gradoDe(lower.letter,key), gradoSup=gradoDe(upper.letter,key);
      const caret = g => g+'̂';   // número con circunflejo (4̂)
      return {
        key, lower, upper, steps, semis, quality, disp, ...etiquetas(steps, quality),
        gradoInf, gradoSup, gradoInfTxt:caret(gradoInf), gradoSupTxt:caret(gradoSup),
        // los grados (encima de la nota aguda, debajo de la grave): con máscara,
        // siempre y marcados «resp»; sin ella, solo al revelar
        mei: opts => { const o=opciones(opts); return build(
          [{lower, upper, staffLo:c.staffLo, staffHi:c.staffHi, visible:true}], key.sig,
          (o.mascara||o.revelado) ? [ {place:'above', id:'m0s', text:caret(gradoSup)},
                                      {place:'below', id:'m0b', text:caret(gradoInf)} ] : [], o, 2); }
      };
    }
    return null;
  }

  /* ---------- exportador MEI ---------- */
  // Pipeline habitual: nota → token mini-LilyPond → parser → evento → MEI.
  function pitchToken(n){
    let s=n.letter.toLowerCase();
    if(n.alter===1)s+='s'; else if(n.alter===-1)s+='f';
    const d=n.oct-3;
    s += d>0 ? "'".repeat(d) : (d<0 ? ",".repeat(-d) : "");
    return s;
  }
  const accMap={1:'s',0:'n','-1':'f',2:'x','-2':'ff'};

  // mei(opts) de cada instancia: opts = {mascara, dato} (página común) o, como
  // antes, un booleano «revelado».
  const opciones = o => (o && typeof o==='object') ? o : {revelado:!!o};

  // build(medidas, sig, dirs, {mascara, dato}, pentagramas):
  //   medidas: [{lower, upper, staffLo, staffHi, visible, resp}]: cada nota en
  //     su pentagrama (1 = Sol, 2 = Fa). Si las dos van en el mismo, a dos
  //     capas (plicas arriba / abajo); si no, una en cada uno.
  //   mascara: lo que es respuesta (un compás con `resp`, los grados) se
  //     dibuja con type="resp" (comun.css lo oculta hasta revelar);
  //   dato: texto que se DA (la tonalidad, en Con grados), como <reh
  //     type="dato"> sobre el primer tiempo del pentagrama superior;
  //   pentagramas: 1 (Sol) o 2 (Sol y Fa, con llave).
  function build(medidas, sig, dirs, opts, pentagramas){
    opts=opts||{};
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
      const capa = m.resp ? ' type="resp"' : '';
      const sup = m.visible ? noteXml(m.upper,`m${i}s`,force) : '<space dur="2"/>';
      const inf = m.visible ? noteXml(m.lower,`m${i}b`,force) : '<space dur="2"/>';
      const staff = n => {
        const capas = [];
        if(m.staffHi===n) capas.push(`<layer n="1"${capa}>${sup}</layer>`);
        if(m.staffLo===n) capas.push(`<layer n="${capas.length+1}"${capa}>${inf}</layer>`);
        if(!capas.length) capas.push('<layer n="1"><space dur="2"/></layer>');
        return `<staff n="${n}">${capas.join('')}</staff>`;
      };
      const dirXml = dirs.filter(d=>d.id.indexOf(`m${i}`)===0)
        .map(d=>`<dir place="${d.place}" startid="#${d.id}"${opts.mascara?' type="resp"':''}>${d.text}</dir>`).join('')
        + (i===0 && opts.dato ? `<reh place="above" staff="1" tstamp="1" type="dato">${opts.dato}</reh>` : '');
      // Con un 2.º compás aún oculto no se dibuja la barra intermedia;
      // al revelarlo se separa el original de la inversión con barra doble.
      // Con máscara la barra doble se dibuja siempre, y el compás lleva
      // type="barra-resp": comun.css oculta su barra hasta revelar.
      const right = (i===0 && medidas.length===2)
        ? (medidas[1].visible ? ' right="dbl"' : ' right="invis"') : '';
      const tipoMedida = (i===0 && medidas.length===2 && medidas[1].resp) ? ' type="barra-resp"' : '';
      return `<measure n="${i+1}"${right}${tipoMedida}>`
        + Array.from({length:pentagramas},(_,k)=>staff(k+1)).join('') + `${dirXml}</measure>`;
    }).join('');
    const sigAttr = sig===0?'0':(Math.abs(sig)+(sig>0?'s':'f'));
    const defs = pentagramas===2
      ? '<staffGrp symbol="brace" bar.thru="true"><staffDef n="1" lines="5" clef.shape="G" clef.line="2"/>'
        + '<staffDef n="2" lines="5" clef.shape="F" clef.line="4"/></staffGrp>'
      : '<staffGrp><staffDef n="1" lines="5" clef.shape="G" clef.line="2"/></staffGrp>';
    return `<?xml version="1.0" encoding="UTF-8"?>
<mei xmlns="http://www.music-encoding.org/ns/mei" meiversion="4.0.0">
 <music><body><mdiv><score>
  <scoreDef keysig="${sigAttr}" meter.count="1" meter.unit="2" meter.form="invis">
   ${defs}
  </scoreDef>
  <section>${cuerpo}</section>
 </score></mdiv></body></music>
</mei>`;
  }

  const api = { generarNormal, generarInversion, generarGrados, midiOf,
                // para pruebas
                intervalQuality, reducir, admitido, rangoClave, ALTERADOS_PERMITIDOS, MAX_STEPS };
  if (esNode) module.exports = api;
  else global.Intervalos = api;
})(typeof window !== 'undefined' ? window : globalThis);
/* fin */
