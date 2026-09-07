/* ============================================================
   Unidad 0 — Armaduras (núcleo compartido)
   ------------------------------------------------------------
   Lógica común a las tres variantes (por quintas, cromático y
   aleatorio): tablas armadura ↔ tonalidad, generación de las
   series encadenadas de 12 armaduras y exportador MEI de la
   armadura sola (clave de Sol, sin notas). No pasa por
   mini-LilyPond porque aquí no hay contenido musical que anotar.
   Sin niveles de dificultad: cada variante es una serie única.
   ============================================================ */
(function (global) {
  'use strict';

  const LETTER_SEMITONE = {C:0,D:2,E:4,F:5,G:7,A:9,B:11};
  const ES = {C:'Do',D:'Re',E:'Mi',F:'Fa',G:'Sol',A:'La',B:'Si'};

  // Tónica de cada armadura, de −6 (6 bemoles) a +6 (6 sostenidos).
  // Nunca se usan 7 alteraciones: fuera de este rango siempre se
  // prefiere la enarmónica de 5 (Re♭ mayor antes que Do♯ mayor).
  const TONICS = {
    major: { '-6':['G',-1],'-5':['D',-1],'-4':['A',-1],'-3':['E',-1],'-2':['B',-1],'-1':['F',0],
             '0':['C',0],'1':['G',0],'2':['D',0],'3':['A',0],'4':['E',0],'5':['B',0],'6':['F',1] },
    minor: { '-6':['E',-1],'-5':['B',-1],'-4':['F',0],'-3':['C',0],'-2':['G',0],'-1':['D',0],
             '0':['A',0],'1':['E',0],'2':['B',0],'3':['F',1],'4':['C',1],'5':['G',1],'6':['D',1] }
  };

  const rnd = a => a[Math.floor(Math.random()*a.length)];

  function nombre(sig, mode){
    const t = TONICS[mode][String(sig)];
    return ES[t[0]] + (t[1]===1?'♯':t[1]===-1?'♭':'') + (mode==='major'?' mayor':' menor');
  }
  function armaduraTxt(sig){
    return sig===0 ? 'Sin alteraciones' : Math.abs(sig)+' '+(sig>0?'♯':'♭');
  }
  function pcOf(letter,alter){ return ((LETTER_SEMITONE[letter]+alter)%12+12)%12; }

  // Armaduras cuya tónica es la clase de altura `pc` en el modo dado.
  // Devuelve 1 o 2 (solo ±6 comparte clase de altura: Fa♯/Sol♭, Re♯/Mi♭ m).
  function sigsForPc(pc, mode){
    const out=[];
    for(let s=-6;s<=6;s++){
      const t=TONICS[mode][String(s)];
      if(pcOf(t[0],t[1])===pc) out.push(s);
    }
    return out;
  }

  /* ---------- series encadenadas de 12 ---------- */
  // Por quintas: se parte de 2–5 alteraciones del lado contrario al sentido
  // de giro (2–5 bemoles si se va hacia los sostenidos, y al revés) y se
  // recorre el círculo completo. Con 6 alteraciones: sostenidos en sentido
  // horario (hacia sostenidos), bemoles en antihorario. Se muestra la
  // armadura y se pide la tonalidad.
  function serieQuintas(){
    const dir = Math.random()<0.5 ? 1 : -1;            // +1 horario (hacia ♯)
    const s0  = (2+Math.floor(Math.random()*4)) * -dir; // 2..5 del lado contrario
    const items=[];
    for(let i=0;i<12;i++){
      let v=s0+dir*i;
      if(v>6) v-=12;
      if(v<-6) v+=12;
      if(Math.abs(v)===6) v = dir>0 ? 6 : -6;
      items.push({ sig:v, ask:'tonalidad' });
    }
    return { tipo:'quintas', dir, items };
  }

  // Cromático: la tónica MAYOR parte de una nota blanca y sube o baja por
  // semitonos toda la octava; su relativa menor la acompaña en paralelo
  // («doble escala cromática»: Do M/La m, Re♭ M/Si♭ m…). Se muestran los
  // nombres (mayor y/o menor) y se pide la armadura, que se dibuja al
  // revelar. Subiendo se prefiere la tónica con sostenido (hasta un máximo
  // de 6 alteraciones); bajando, con bemol — la elección enarmónica real
  // solo existe en ±6, el resto queda fijado por el límite de 6.
  function serieCromatica(){
    const dir = Math.random()<0.5 ? 1 : -1;
    const start = pcOf(rnd(['C','D','E','F','G','A','B']),0);
    const items=[];
    for(let i=0;i<12;i++){
      const pc=((start+dir*i)%12+12)%12;
      const cands=sigsForPc(pc,'major');
      const sig = cands.length===1 ? cands[0]
                : (dir>0 ? Math.max.apply(null,cands) : Math.min.apply(null,cands));
      items.push({ sig, ask:'armadura' });
    }
    return { tipo:'cromatico', dir, items };
  }

  // Aleatorio: las 12 armaduras barajadas, sin repetición (nunca 7
  // alteraciones: −5..5 más una de las dos enarmónicas de 6, al azar);
  // se muestra la armadura y se pide la tonalidad, como en la serie
  // por quintas — solo cambia el orden.
  function serieAleatoria(){
    const sigs=[-5,-4,-3,-2,-1,0,1,2,3,4,5, Math.random()<0.5?6:-6];
    for(let i=sigs.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      const t=sigs[i]; sigs[i]=sigs[j]; sigs[j]=t;
    }
    return { tipo:'aleatorio', items: sigs.map(sig=>({ sig, ask:'tonalidad' })) };
  }

  /* ---------- exportador MEI: la armadura sola ---------- */
  function sigStr(sig){ return sig===0?'0':(Math.abs(sig)+(sig>0?'s':'f')); }
  function meiArmadura(sig){
    return `<?xml version="1.0" encoding="UTF-8"?>
<mei xmlns="http://www.music-encoding.org/ns/mei" meiversion="4.0.0">
 <music><body><mdiv><score>
  <scoreDef keysig="${sigStr(sig)}">
   <staffGrp><staffDef n="1" lines="5" clef.shape="G" clef.line="2"/></staffGrp>
  </scoreDef>
  <section><measure right="invis"><staff n="1"><layer n="1"><space dur="1"/></layer></staff></measure></section>
 </score></mdiv></body></music>
</mei>`;
  }

  /* ---------- exportador MEI: serie completa como tira ---------- */
  // Un solo sistema con un compás (vacío, barras invisibles) por armadura,
  // cambiando la armadura al inicio de cada compás. El cambio va como
  // scoreDef/staffGrp/staffDef@keysig: es la única forma que Verovio
  // renderiza de verdad (con scoreDef@keysig o scoreDef/keySig el cambio
  // se ignora — comprobado empíricamente con la build "latest" del CDN).
  // Pensado para renderizarse con breaks:none + adjustPageWidth (tira
  // indefinidamente ancha) y deslizarse con TiraPartitura.
  function meiSerieArmaduras(sigs){
    const compases = sigs.map((sig,ix) =>
      (ix===0 ? '' :
        `<scoreDef><staffGrp><staffDef n="1" keysig="${sigStr(sig)}"/></staffGrp></scoreDef>`) +
      `<measure n="${ix+1}" right="invis"><staff n="1"><layer n="1"><space dur="1"/></layer></staff></measure>`
    ).join('\n   ');
    return `<?xml version="1.0" encoding="UTF-8"?>
<mei xmlns="http://www.music-encoding.org/ns/mei" meiversion="4.0.0">
 <music><body><mdiv><score>
  <scoreDef keysig="${sigStr(sigs[0])}">
   <staffGrp><staffDef n="1" lines="5" clef.shape="G" clef.line="2"/></staffGrp>
  </scoreDef>
  <section>
   ${compases}
  </section>
 </score></mdiv></body></music>
</mei>`;
  }

  const api = { N:12, nombre, armaduraTxt, sigsForPc, serieQuintas, serieCromatica, serieAleatoria, meiArmadura, meiSerieArmaduras };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else global.U0Armaduras = api;
})(typeof window !== 'undefined' ? window : globalThis);
/* fin */
