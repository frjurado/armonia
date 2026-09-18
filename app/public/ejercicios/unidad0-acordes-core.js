/* ============================================================
   Unidad 0 — Acordes / tríadas (núcleo compartido)
   ------------------------------------------------------------
   Lógica común a las tres variantes (tipo, inversiones, grados).
   Reubica y generaliza la antigua familia 1 (tríadas de la
   Unidad 1):
     · variantes 'tipo' e 'inversion': tríadas AISLADAS, sin
       tonalidad: fundamental libre con alteración simple (se
       rechazan los acordes que exigirían dobles alteraciones, y
       las fundamentales Mi♯/Si♯/Fa♭/Do♭);
     · variante 'grados': tríada diatónica en estado fundamental
       sobre un grado de una tonalidad (las 4 del trimestre 1);
       en menor, la sensible solo en V y VII (III natural, mayor);
     · dos sentidos: VER el acorde y nombrarlo, o CONSTRUIRLO a
       partir del dato (cifrado americano / bajo cifrado). Qué
       sentidos admite cada variante y nivel lo fija SENTIDOS;
     · niveles: 1 clave de Sol · 2 clave de Fa (posición cerrada)
       · 3 posición abierta en pentagrama doble (el bajo en Fa,
       las otras dos notas en Sol, nunca a más de una 8.ª).
   Depende de `mini-lilypond-parser.js` (variable global MiniLily).
   ============================================================ */
(function (global) {
  'use strict';

  const MiniLily = (typeof module !== 'undefined' && module.exports)
    ? require('./mini-lilypond-parser') : global.MiniLily;

  /* ---------- núcleo de alturas (igual que las otras familias) ---------- */
  const LETTERS = ['C','D','E','F','G','A','B'];
  const LETTER_SEMITONE = {C:0,D:2,E:4,F:5,G:7,A:9,B:11};
  const SHARP_ORDER = ['F','C','G','D','A','E','B'];
  const FLAT_ORDER  = ['B','E','A','D','G','C','F'];
  const ES = {C:'Do',D:'Re',E:'Mi',F:'Fa',G:'Sol',A:'La',B:'Si'};
  function midiOf(letter,alter,oct){ return (oct+1)*12 + LETTER_SEMITONE[letter] + alter; }
  const rnd = a => a[Math.floor(Math.random()*a.length)];

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

  /* ---------- tríadas diatónicas (variante 'grados') ---------- */
  // Tonalidades del trimestre 1 (las mismas que Intervalos con grados).
  const KEYS = [
    {tonic:'C', sig:0,  mode:'major', nombre:'Do mayor'},
    {tonic:'G', sig:1,  mode:'major', nombre:'Sol mayor'},
    {tonic:'A', sig:0,  mode:'minor', nombre:'La menor'},
    {tonic:'D', sig:-1, mode:'minor', nombre:'Re menor'}
  ];
  const ROMANOS = ['I','II','III','IV','V','VI','VII'];

  // Tríada sobre el grado `grado` (1–7) de `key`, como {letter,alter}[].
  // En menor, la sensible (7.º grado alterado) solo aparece en V y VII:
  // el III se toma de la escala natural (mayor), no aumentado.
  function diatonicTriad(key, grado){
    const sig=keysigAlters(key.sig), L=scaleLetters(key.tonic);
    const sensible = key.mode==='minor' && (grado===5 || grado===7);
    return [0,2,4].map(off=>{
      const idx=(grado-1+off)%7, letter=L[idx];
      const alter = sig[letter] + ((sensible && idx===6) ? 1 : 0);
      return {letter, alter};
    });
  }
  // Tipo de una tríada en fundamental/3.ª/5.ª por sus semitonos.
  function typeOf(triad){
    const m=triad.map(n=>midiOf(n.letter,n.alter,4));
    const a=((m[1]-m[0])%12+12)%12, b=((m[2]-m[1])%12+12)%12;
    return Object.keys(TYPES).find(t=>TYPES[t][0]===a && TYPES[t][1]===b) || null;
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
  // y las otras dos notas en clave de Sol, en cualquier orden y apiladas
  // ascendentes desde Do4: así quedan siempre a menos de una 8.ª entre sí
  // (la distancia grande, si la hay, va entre el bajo y ellas).
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
      return { bass, upper:up };
    }
    return null;
  }

  /* ---------- generador ---------- */
  // Sentidos admitidos por variante y nivel. 'construir' solo tiene
  // sentido cuando la disposición revelada es la única posible (posición
  // cerrada, niveles 1-2): en el nivel 3 la disposición abierta es
  // arbitraria y solo se podrían contrastar nombres de notas. En
  // 'inversion' se mantiene en todos los niveles: leer un bajo cifrado
  // en clave de Fa es precisamente el ejercicio. 'grados' es solo ver.
  const SENTIDOS = {
    tipo:      {1:['ver','construir'], 2:['ver','construir'], 3:['ver']},
    inversion: {1:['ver','construir'], 2:['ver','construir'], 3:['ver','construir']},
    grados:    {1:['ver'],             2:['ver'],             3:['ver']}
  };

  // variante: 'tipo' | 'inversion' | 'grados'. Solo 'inversion' usa
  // inversiones; en su sentido 'construir' el bajo cifrado se limita a
  // 6/3 y 6/4 (con 5/3 el dato sería el mismo que en la variante 'tipo').
  function generar(nivel, variante){
    for(let t=0;t<200;t++){
      const dir = rnd(SENTIDOS[variante][nivel]);
      let root, type, triad, key=null, grado=0, inv=0;
      if(variante==='grados'){
        key=rnd(KEYS); grado=1+Math.floor(Math.random()*7);
        triad=diatonicTriad(key,grado);
        root=triad[0]; type=typeOf(triad);
      }else{
        type=rnd(TYPE_POOL);
        root=rndRoot();
        triad=buildTriad(root,type);
        if(!triad) continue;
        if(variante==='inversion')
          inv = dir==='ver' ? Math.floor(Math.random()*3) : 1+Math.floor(Math.random()*2);
      }

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
      // cifrado con barra: el bajo tras la barra cuando hay inversión (C/E)
      ej.cifradoBajo = inv ? ej.cifrado+'/'+triad[inv].letter+sym(triad[inv].alter) : ej.cifrado;
      ej.nombres=triad.map(nombreNota);          // fundamental – 3.ª – 5.ª
      ej.nombreRoot=nombreNota(root);
      ej.invLabel=INV_LABEL[inv]; ej.invCifra=INV_CIFRA[inv];
      if(key){
        ej.key=key; ej.grado=grado; ej.gradoRomano=ROMANOS[grado-1];
        ej.modoTxt = key.mode==='minor' ? 'menor' : 'mayor';
      }
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
  function parse1(music){ return MiniLily.parseVoice(music,{time:null}).events[0]; }

  // toMEI(ej, {solo, cifras}):
  //   solo   → dibuja solo el bajo (sentido 'construir', antes de revelar);
  //   cifras → añade el bajo cifrado (6/3 o 6/4) bajo la nota más grave.
  // Con tonalidad (variante 'grados') se escribe la armadura y solo llevan
  // accidental las notas ajenas a ella (la sensible); sin tonalidad
  // (keysig 0) toda alteración se escribe como accidental.
  function toMEI(ej, opts){
    opts=opts||{};
    const sig = ej.key ? ej.key.sig : 0;
    const sigMap = keysigAlters(sig);
    const noteXml=(ev, id)=>{
      const L=ev.letter.toUpperCase();
      const acc = ev.alter!==sigMap[L] ? ` accid="${accMap[ev.alter]}"` : '';
      const xid = id ? ` xml:id="${id}"` : '';
      return `<note${xid} dur="${ev.base||1}" pname="${ev.letter}" oct="${ev.octave}"${acc}/>`;
    };
    // idBajo: la nota más grave del acorde lleva xml:id="bajo" (ancla de
    // las cifras) solo cuando ese acorde contiene realmente al bajo.
    const chordXml = (notas, idBajo) => {
      const ev=MiniLily.parseVoice('<'+notas.map(pitchToken).join(' ')+'>1',{time:null}).events[0];
      return `<chord dur="${ev.base}">${
        ev.notes.map((n,i)=>noteXml(n, (idBajo && i===0)?'bajo':null)).join('')}</chord>`;
    };
    const harm = opts.cifras
      ? `<harm place="below" startid="#bajo"><fb>${
          ej.invCifra.split('/').map(f=>`<f>${f}</f>`).join('')}</fb></harm>`
      : '';
    let staffDefs, staves;
    if(ej.single){
      staffDefs=`<staffDef n="1" lines="5" ${clefAttr(ej.clef)}/>`;
      const cuerpo = opts.solo
        ? noteXml(parse1(pitchToken(ej.notes[0])+'1'),'bajo')
        : chordXml(ej.notes, true);
      staves=`<staff n="1"><layer n="1">${cuerpo}</layer></staff>`;
    }else{
      staffDefs=`<staffDef n="1" lines="5" ${clefAttr('treble')}/>`+
                `<staffDef n="2" lines="5" ${clefAttr('bass')}/>`;
      const sup = opts.solo ? '<space dur="1"/>' : chordXml(ej.upper, false);
      const baj = noteXml(parse1(pitchToken(ej.bass)+'1'),'bajo');
      staves=`<staff n="1"><layer n="1">${sup}</layer></staff>`+
             `<staff n="2"><layer n="1">${baj}</layer></staff>`;
    }
    const grpAttrs = ej.single ? '' : ' symbol="brace" bar.thru="true"';
    const sigAttr = sig===0?'0':(Math.abs(sig)+(sig>0?'s':'f'));
    return `<?xml version="1.0" encoding="UTF-8"?>
<mei xmlns="http://www.music-encoding.org/ns/mei" meiversion="4.0.0">
 <music><body><mdiv><score>
  <scoreDef keysig="${sigAttr}">
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

  const api = { generar, toMEI, midis, midiOf, LVL_NOTES, MAX_NIVEL, SENTIDOS, INV_LABEL, INV_CIFRA, KEYS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else global.U0Acordes = api;
})(typeof window !== 'undefined' ? window : globalThis);
/* fin */
