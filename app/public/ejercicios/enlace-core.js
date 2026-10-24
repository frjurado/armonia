/* ============================================================
   Enlazar acordes — notas comunes o movimiento contrario
   (3.º UD 1, familia Paralelas y directas)
   ------------------------------------------------------------
   Diseño: docs/familias/paralelas-directas.md, «Enlazar acordes».
   Se da un bajo de 8 notas en estado fundamental (gramática de
   Morfología, bajo-cifrado-core.js con `fundamental`) y el primer
   acorde (cerrado o abierto, la fundamental duplicada); se pide
   enlazar los demás con la consigna básica: si hay notas comunes,
   se mantienen (y las otras voces van por grado a las que
   faltan); si no, las tres voces superiores van por movimiento
   contrario al bajo, a la nota más cercana del acorde siguiente.
   La solución es única: la calcula `enlazar`, y los dos
   comprobadores (ConduccionCheck y CuatroVocesCheck) vigilan que
   sea correcta. Partitura y audio: los de movimientos-core.js.
   Sin DOM. Depende de conduccion-check.js, cuatro-voces-core.js,
   cuatro-voces-check.js, bajo-cifrado-core.js, movimientos-core.js
   (y, a través de este, contrapunto-core.js y ../tonalidades.js).
   ============================================================ */
(function (global) {
  'use strict';

  const esNode = typeof module !== 'undefined' && module.exports;
  const K  = esNode ? require('./conduccion-check.js')   : global.ConduccionCheck;
  const CV = esNode ? require('./cuatro-voces-core.js')  : global.CuatroVoces;
  const CK = esNode ? require('./cuatro-voces-check.js') : global.CuatroVocesCheck;
  const BC = esNode ? require('./bajo-cifrado-core.js')  : global.BajoCifrado;
  const M  = esNode ? require('./movimientos-core.js')   : global.Movimientos;

  const N = 8, MAX_NIVEL = 2;
  const ROLES4 = ['soprano','contralto','tenor','bajo'];
  const REGLAS = ['N1','N2','N3','N4','N5','N12','N13','N15'];
  // Con la consigna, la sensible bajaría (y en menor, V–VI y VI–V darían 2.ª aumentada).
  const EVITA = [['V','VI'],['VI','V'],['III','IV']];
  const ROTULO = ['contr.', '1 n.c.', '2 n.c.'];   // abreviados: así caben en una fila entre blancas seguidas
  const rnd = a => a[Math.floor(Math.random()*a.length)];
  function baraja(a){ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

  // La nota de letra `letra` más cercana a `abs` (nunca hay empate: a la misma
  // distancia por arriba y por abajo hay letras distintas).
  function cercana(abs, letra){
    for(let d=0; d<4; d++) for(const a of [abs-d, abs+d]) if(CV.letterOf(a)===letra) return a;
    return null;
  }

  // La consigna, de un acorde al siguiente: `ant` son las tres voces
  // superiores (S, A, T) del anterior; el bajo va de `bAnt` a `bSig`; `ch`,
  // el acorde siguiente. Devuelve {voces:[S,A,T], comunes:[voces que se
  // mantienen]}, o null si no sale un acorde completo (no debería pasar).
  function enlazar(ant, bAnt, bSig, ch){
    const letras = ch.tones.map(t=>t.letter);
    const tono = abs => ch.tones.find(t=>t.letter===CV.letterOf(abs));
    const sig = [null, null, null], comunes = [];
    ant.forEach((p,v)=>{ if(letras.includes(p.letter)){ sig[v]=CV.altura(p.abs, tono(p.abs).alter); comunes.push(v); } });
    if(comunes.length){
      // las demás, cada una por grado a una de las que faltan
      const faltan = ch.tones.filter(t=>!sig.some(q=>q && q.letter===t.letter));
      const mueven = [0,1,2].filter(v=>!sig[v]);
      if(faltan.length!==mueven.length) return null;
      let mejor=null;
      for(const orden of (mueven.length===2 ? [[0,1],[1,0]] : [[0]])){
        const qs = mueven.map((v,i)=>{ const t=faltan[orden[i]]; return CV.altura(cercana(ant[v].abs, t.letter), t.alter); });
        if(qs.some((q,i)=>Math.abs(q.abs-ant[mueven[i]].abs)>1)) continue;
        const tot = qs.reduce((s,q,i)=>s+Math.abs(q.abs-ant[mueven[i]].abs), 0);
        if(!mejor || tot<mejor.tot) mejor={tot, qs};
      }
      if(!mejor) return null;
      mueven.forEach((v,i)=>sig[v]=mejor.qs[i]);
    } else {
      // sin notas comunes: contrario al bajo, a la más cercana en esa dirección
      const dir = -Math.sign(bSig.abs-bAnt.abs);
      if(!dir) return null;
      ant.forEach((p,v)=>{
        let a=p.abs+dir;
        while(!letras.includes(CV.letterOf(a))) a+=dir;
        sig[v]=CV.altura(a, tono(a).alter);
      });
    }
    if(new Set(sig.map(q=>q.letter)).size!==3) return null;     // completo, con la fundamental duplicada
    return {voces:sig, comunes};
  }

  // Disposición por la distancia tenor–soprano (apuntes c3u1 §2.1; la de Disposición).
  const disposicion = (s, t) => s.abs-t.abs<7 ? 'cerrada' : s.abs-t.abs>7 ? 'abierta' : 'mixta';

  // Los primeros acordes posibles: tónica sobre el bajo dado, las tres voces
  // superiores con una nota distinta cada una, en su tesitura, sin cruces ni
  // unísonos, a no más de una 8.ª entre vecinas y en la disposición pedida.
  function inicios(ch, bajo, disp){
    const out=[];
    const notas = v => { const [lo,hi]=CV.RANGOS[v], o=[]; for(let a=lo;a<=hi;a++) if(ch.tones.some(t=>t.letter===CV.letterOf(a))) o.push(a); return o; };
    for(const s of notas(0)) for(const a of notas(1)) for(const t of notas(2)){
      if(!(s>a && a>t && t>bajo.abs) || s-a>7 || a-t>7 || t-bajo.abs>14) continue;
      if(new Set([s,a,t].map(CV.letterOf)).size!==3) continue;
      if(disposicion({abs:s},{abs:t})!==disp) continue;
      out.push([s,a,t].map(x=>CV.altura(x, ch.tones.find(q=>q.letter===CV.letterOf(x)).alter)));
    }
    return out;
  }

  // La cadena entera desde un primer acorde; null si la consigna lleva a
  // alguna falta (tesitura, distancia, cruce…) o a un unísono entre vecinas.
  function cadena(key, acs, bajos, primero){
    const voces=[[primero[0]],[primero[1]],[primero[2]],[bajos[0]]], enlaces=[];
    for(let k=1;k<acs.length;k++){
      const r = enlazar([0,1,2].map(v=>voces[v][k-1]), bajos[k-1], bajos[k], acs[k]);
      if(!r) return null;
      r.voces.forEach((q,v)=>voces[v].push(q));
      voces[3].push(bajos[k]);
      enlaces.push({comunes:r.comunes, rotulo:ROTULO[r.comunes.length]});
    }
    for(let k=0;k<acs.length;k++) if(voces[0][k].abs===voces[1][k].abs || voces[1][k].abs===voces[2][k].abs) return null;
    if(K.comprobar(voces, {roles:ROLES4, reglas:REGLAS}).length || CK.comprobar(key, acs, voces).length) return null;
    return {voces, enlaces};
  }

  function generar(nivel){
    nivel = Math.max(1, Math.min(MAX_NIVEL, nivel|0));
    const disp = Math.random()<0.5 ? 'cerrada' : 'abierta';
    for(let intento=0; intento<60; intento++){
      const b = BC.generar(nivel, {n:N, fundamental:true, evita:EVITA});
      if(!b) continue;
      const acs = b.ids.map(id=>CV.acorde(b.key, BC.ACORDES[id]));
      const bajos = b.acordes.map(a=>a.bajo);
      for(const primero of baraja(inicios(acs[0], bajos[0], disp))){
        const c = cadena(b.key, acs, bajos, primero);
        if(!c) continue;
        return { tipo:'armonico', nivel, key:b.key, voces:c.voces, roles:ROLES4, sel:null, pent:'satb',
                 // respuesta: las voces superiores desde el 2.º acorde
                 resp: c.voces.map((x,v)=>x.map((_,k)=>v<3 && k>0)),
                 enlaces:c.enlaces, disp, acordes:acs, grados:b.acordes.map(a=>a.romano) };
      }
    }
    return null;
  }

  // Lo que la página dibuja tras el render, con su paso (el enlace k va del
  // acorde k-1 al k): el rótulo bajo el enlace y una raya por nota mantenida
  // o, en el movimiento contrario, una por voz (también el bajo), en otro color.
  function dibujo(inst){
    const rotulos=[], rayas=[];
    inst.enlaces.forEach((e,i)=>{
      const k=i+1;
      const contr = !e.comunes.length;
      rotulos.push({desde:M.idNota(3,k-1), hasta:M.idNota(3,k), texto:e.rotulo, clase:'resp '+(contr ? 'contraria' : 'dis'), paso:k});
      (contr ? [0,1,2,3] : e.comunes).forEach(v=>rayas.push({de:M.idNota(v,k-1), a:M.idNota(v,k), clase:'resp '+(contr ? 'contraria' : 'mantenida'), paso:k}));
    });
    return {rotulos, rayas};
  }

  // Sin revelar: el bajo entero y el primer acorde; revelado, todo.
  function midis(inst, revelado){
    if(revelado) return M.midis(inst);
    return M.midis(Object.assign({}, inst, {voces:inst.voces.map((x,v)=>v<3 ? x.slice(0,1) : x)}));
  }

  const api = { generar, enlazar, inicios, dibujo, toMEI:M.toMEI, midis, midisPaso:M.midisPaso,
                disposicion, EVITA, REGLAS, N, MAX_NIVEL };
  if (esNode) module.exports = api;
  else global.Enlace = api;
})(typeof window !== 'undefined' ? window : globalThis);
/* fin del módulo */
