/* ============================================================
   Unidad 0 — Acordes / tríadas (núcleo compartido)
   ------------------------------------------------------------
   Lógica común a las tres variantes (tipo, cifrado americano,
   inversiones). Reubica y generaliza la antigua familia 1
   (tríadas de la Unidad 1):
     · tríadas AISLADAS, sin tonalidad: fundamental libre con
       alteración simple (se rechazan los acordes que exigirían
       dobles alteraciones, y las fundamentales Mi♯/Si♯/Fa♭/Do♭);
     · cada ejercicio alterna dos sentidos: VER el acorde y
       nombrarlo, o CONSTRUIRLO a partir del dato (fundamental y
       tipo / cifrado / bajo cifrado);
     · niveles: 1 clave de Sol · 2 clave de Fa (posición cerrada)
       · 3 posición abierta en pentagrama doble (el bajo en Fa,
       las otras dos notas en Sol).
   Depende de `mini-lilypond-parser.js` (variable global MiniLily).
   ============================================================ */
(function (global) {
  'use strict';

  const MiniLily = (typeof module !== 'undefined' && module.exports)
    ? require('./mini-lilypond-parser') : global.MiniLily;

  /* ---------- núcleo de alturas ---------- */
  const LETTERS = ['C','D','E','F','G','A','B'];
  const LETTER_SEMITONE = {C:0,D:2,E:4,F:5,G:7,A:9,B:11};
  const ES = {C:'Do',D:'Re',E:'Mi',F:'Fa',G:'Sol',A:'La',B:'Si'};
  function midiOf(letter,alter,oct){ return (oct+1)*12 + LETTER_SEMITONE[letter] + alter; }
  const rnd = a => a[Math.floor(Math.random()*a.length)];

  /* ---------- construcción de la tríada ---------- */
  const TYPES = { mayor:[4,3], menor:[3,4], disminuida:[3,3], aumentada:[4,4] };
  // Mayor y menor salen el doble que aumentada/disminuida.
  const TYPE_POOL = ['mayor','mayor','menor','menor','disminuida','aumentada'];

  // Tríada en fundamental/3.ª/5.ª como {letter,alter}; null si alguna nota
  // exigiría doble alteración ("no más de ♯/♭").
  function buildTriad(root, type){
    const i=LETTERS.indexOf(root.letter);
    const semis=TYPES[type];
    const mk=(off,target)=>{
      const L=LETTERS[(i+off)%7];
      const nat=((LETTER_SEMITONE[L]-LETTER_SEMITONE[root.letter])%12+12)%12;
      const alter=root.alter+target-nat;
      return Math.abs(alter)<=1 ? {letter:L, alter} : null;
    };
    const third=mk(2,semis[0]), fifth=mk(4,semis[0]+semis[1]);
    return (third && fifth) ? [{letter:root.letter,alter:root.alter}, third, fifth] : null;
  }

  function rndRoot(){
    for(;;){
      const letter=rnd(LETTERS);
      const r=Math.random();
      const alter = r<0.5?0 : r<0.75?1 : -1;
      if(alter===1  && (letter==='E'||letter==='B')) continue;   // Mi♯, Si♯
      if(alter===-1 && (letter==='F'||letter==='C')) continue;   // Fa♭, Do♭
      return {letter, alter};
    }
  }

  /* ---------- nombres y cifrados ---------- */
  const sym = a => a===1?'♯':a===-1?'♭':'';
  function nombreNota(n){ return ES[n.letter]+sym(n.alter); }
  const CIFRADO_TIPO = { mayor:'', menor:'m', disminuida:'°', aumentada:'+' };
  function cifradoAm(root,type){ return root.letter+sym(root.alter)+CIFRADO_TIPO[type]; }
  const INV_LABEL = ['Estado fundamental','1.ª inversión','2.ª inversión'];
  const INV_CIFRA = ['5/3','6/3','6/4'];

  /* ---------- disposición (voicing) ---------- */
  // Posición cerrada (niveles 1-2), como la antigua familia 1:
  //   Sol (treble): Do4–La5  ·  Fa (bass): Mi2–Do4  (máx. 1 línea adicional)
  const RANGE = { treble:[60,81], bass:[40,60] };

  function voiceClose(triad, clef, inv){
    const base=(clef==='bass')?3:4;
    let prev=-Infinity;
    const notes=triad.map((n,i)=>{
      let o=base, m=midiOf(n.letter,n.alter,o);
      if(i>0){ while(m<=prev){o++;m=midiOf(n.letter,n.alter,o);} }
      prev=m; return {letter:n.letter,alter:n.alter,oct:o};
    });
    for(let i=0;i<inv;i++) notes[i].oct+=1;     // sube las inferiores → cambia el bajo
    notes.sort((a,b)=>midiOf(a.letter,a.alter,a.oct)-midiOf(b.letter,b.alter,b.oct));
    // encaja en la tesitura subiendo/bajando octavas
    const [lo,hi]=RANGE[clef];
    const ms=()=>notes.map(n=>midiOf(n.letter,n.alter,n.oct));
    let g=0,m=ms();
    while(Math.min.apply(null,m)<lo && g++<12){ notes.forEach(n=>n.oct++); m=ms(); }
    g=0;
    while(Math.max.apply(null,m)>hi && g++<12){ notes.forEach(n=>n.oct--); m=ms(); }
    m=ms();
    return (Math.min.apply(null,m)>=lo && Math.max.apply(null,m)<=hi) ? notes : null;
  }

  // Posición abierta (nivel 3): el bajo (según la inversión) en clave de Fa
  // y las otras dos notas en clave de Sol, en cualquier orden y ascendentes.
  function voiceOpen(triad, inv){
    const rot=[triad[inv%3], triad[(inv+1)%3], triad[(inv+2)%3]];
    const bass={letter:rot[0].letter, alter:rot[0].alter};
    const bOpts=[2,3].filter(o=>{
      const m=midiOf(bass.letter,bass.alter,o); return m>=40 && m<=57;
    });
    if(!bOpts.length) return null;
    bass.oct=rnd(bOpts);
    const bm=midiOf(bass.letter,bass.alter,bass.oct);
    const orders = Math.random()<0.5 ? [[1,2],[2,1]] : [[2,1],[1,2]];
    for(const ord of orders){
      const up=ord.map(k=>({letter:rot[k].letter, alter:rot[k].alter, oct:4}));
      let prev=Math.max(59,bm), ok=true;
      for(const n of up){
        while(midiOf(n.letter,n.alter,n.oct)<=prev || midiOf(n.letter,n.alter,n.oct)<60) n.oct++;
        const m=midiOf(n.letter,n.alter,n.oct);
        if(m>81){ ok=false; break; }
        prev=m;
      }
      if(!ok) continue;
      // abre algo más la disposición cuando cabe
      if(Math.random()<0.35 && midiOf(up[1].letter,up[1].alter,up[1].oct+1)<=81) up[1].oct++;
      return { bass, upper:up };
    }
    return null;
  }

  /* ---------- generador ---------- */
  // variante: 'tipo' | 'cifrado' | 'inversion'. En todas, la mitad de las
  // veces se VE el acorde (dir 'ver') y la otra mitad hay que CONSTRUIRLO
  // (dir 'construir'). Solo la variante 'inversion' usa inversiones; en el
  // sentido 'construir' el bajo cifrado se limita a 6/3 y 6/4 (con 5/3 el
  // dato sería el mismo que en la variante 'tipo').
  function generar(nivel, variante){
    for(let t=0;t<200;t++){
      const type=rnd(TYPE_POOL);
      const root=rndRoot();
      const triad=buildTriad(root,type);
      if(!triad) continue;
      const dir = Math.random()<0.5 ? 'ver' : 'construir';
      let inv=0;
      if(variante==='inversion')
        inv = dir==='ver' ? Math.floor(Math.random()*3) : 1+Math.floor(Math.random()*2);

      let ej;
      if(nivel<=2){
        const clef = nivel===1 ? 'treble' : 'bass';
        const notes=voiceClose(triad,clef,inv);
        if(!notes) continue;
        ej={ single:true, clef, notes };
      }else{
        const v=voiceOpen(triad,inv);
        if(!v) continue;
        ej={ single:false, bass:v.bass, upper:v.upper };
      }
      ej.nivel=nivel; ej.variante=variante; ej.dir=dir;
      ej.root=root; ej.type=type; ej.inv=inv;
      ej.cifrado=cifradoAm(root,type);
      ej.nombres=triad.map(nombreNota);          // fundamental – 3.ª – 5.ª
      ej.nombreRoot=nombreNota(root);
      ej.invLabel=INV_LABEL[inv]; ej.invCifra=INV_CIFRA[inv];
      return ej;
    }
    return null;   // no debería ocurrir
  }

  /* ---------- exportador MEI ---------- */
  // Pipeline habitual: notas → mini-LilyPond → parser → modelo → MEI.
  function pitchToken(n){
    let s=n.letter.toLowerCase();
    if(n.alter===1)s+='s'; else if(n.alter===-1)s+='f';
    const d=n.oct-3;
    s += d>0 ? "'".repeat(d) : (d<0 ? ",".repeat(-d) : "");
    return s;
  }
  const accMap={1:'s',0:'n','-1':'f',2:'x','-2':'ff'};
  const clefAttr = c => c==='bass' ? 'clef.shape="F" clef.line="4"'
                                   : 'clef.shape="G" clef.line="2"';
  // Sin tonalidad (keysig 0): toda alteración se escribe como accidental.
  function noteXml(ev, id){
    const acc = ev.alter!==0 ? ` accid="${accMap[ev.alter]}"` : '';
    const xid = id ? ` xml:id="${id}"` : '';
    return `<note${xid} dur="${ev.base||1}" pname="${ev.letter}" oct="${ev.octave}"${acc}/>`;
  }
  function parse1(music){ return MiniLily.parseVoice(music,{time:null}).events[0]; }

  // toMEI(ej, {solo, cifras}):
  //   solo   → dibuja solo el bajo (sentido 'construir', antes de revelar);
  //   cifras → añade el bajo cifrado (6/3 o 6/4) bajo la nota más grave.
  function toMEI(ej, opts){
    opts=opts||{};
    const harm = opts.cifras
      ? `<harm place="below" startid="#bajo"><fb>${
          ej.invCifra.split('/').map(f=>`<f>${f}</f>`).join('')}</fb></harm>`
      : '';
    let staffDefs, staves;
    if(ej.single){
      staffDefs=`<staffDef n="1" lines="5" ${clefAttr(ej.clef)}/>`;
      let cuerpo;
      if(opts.solo){
        cuerpo=noteXml(parse1(pitchToken(ej.notes[0])+'1'),'bajo');
      }else{
        const ev=MiniLily.parseVoice('<'+ej.notes.map(pitchToken).join(' ')+'>1',{time:null}).events[0];
        cuerpo=`<chord dur="${ev.base}">${
          ev.notes.map((n,i)=>noteXml(n, i===0?'bajo':null)).join('')}</chord>`;
      }
      staves=`<staff n="1"><layer n="1">${cuerpo}</layer></staff>`;
    }else{
      staffDefs=`<staffDef n="1" lines="5" ${clefAttr('treble')}/>`+
                `<staffDef n="2" lines="5" ${clefAttr('bass')}/>`;
      const sup = opts.solo
        ? '<space dur="1"/>'
        : (()=>{ const ev=MiniLily.parseVoice('<'+ej.upper.map(pitchToken).join(' ')+'>1',{time:null}).events[0];
                 return `<chord dur="${ev.base}">${ev.notes.map(n=>noteXml(n)).join('')}</chord>`; })();
      const baj = noteXml(parse1(pitchToken(ej.bass)+'1'),'bajo');
      staves=`<staff n="1"><layer n="1">${sup}</layer></staff>`+
             `<staff n="2"><layer n="1">${baj}</layer></staff>`;
    }
    const grpAttrs = ej.single ? '' : ' symbol="brace" bar.thru="true"';
    return `<?xml version="1.0" encoding="UTF-8"?>
<mei xmlns="http://www.music-encoding.org/ns/mei" meiversion="4.0.0">
 <music><body><mdiv><score>
  <scoreDef keysig="0">
   <staffGrp${grpAttrs}>${staffDefs}</staffGrp>
  </scoreDef>
  <section><measure>${staves}${harm}</measure></section>
 </score></mdiv></body></music>
</mei>`;
  }

  /* ---------- audio ---------- */
  function midis(ej){
    const notas = ej.single ? ej.notes : [ej.bass].concat(ej.upper);
    return notas.map(n=>({midi:midiOf(n.letter,n.alter,n.oct)}));
  }

  // Descripciones de nivel (compartidas por las tres páginas).
  const LVL_NOTES = {
    1: '(clave de Sol, posición cerrada)',
    2: '(clave de Fa, posición cerrada)',
    3: '(posición abierta en pentagrama doble: bajo en Fa, las otras dos notas en Sol)'
  };
  const MAX_NIVEL = 3;

  const api = { generar, toMEI, midis, LVL_NOTES, MAX_NIVEL, INV_LABEL, INV_CIFRA };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else global.U0Acordes = api;
})(typeof window !== 'undefined' ? window : globalThis);
/* fin */
