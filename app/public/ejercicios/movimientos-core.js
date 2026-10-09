/* ============================================================
   Movimientos — melódicos y armónicos (3.º UD 1)
   ------------------------------------------------------------
   Diseño: docs/familias/movimientos.md. Lo común (faltas
   inyectadas, comprobador, parejas del coro, pareja resaltada):
   docs/motor-contrapunto.md.
   · Melódicos: una voz del coro, correcta, con 0–2 defectos
     inyectados (N12, N13, N15; P9 como mejorable). La respuesta
     la da el comprobador independiente (ConduccionCheck).
   · Armónicos: el tipo de movimiento de cada paso. Nivel 1, una
     pareja del motor de contrapunto; nivel 2, una pareja
     resaltada entre las cuatro voces de una sucesión de Bajo
     cifrado realizada por el motor a cuatro voces.
   Sin DOM. Depende de contrapunto-core.js, conduccion-check.js y
   ../tonalidades.js; el nivel 2 de Armónicos, además, de
   cuatro-voces-core.js y bajo-cifrado-core.js.
   ============================================================ */
(function (global) {
  'use strict';

  const esNode = typeof module !== 'undefined' && module.exports;
  const C   = esNode ? require('./contrapunto-core.js') : global.Contrapunto;
  const K   = esNode ? require('./conduccion-check.js') : global.ConduccionCheck;
  const TON = esNode ? require('../tonalidades.js')     : global.TONALIDADES;
  // solo para el nivel 2 de Armónicos (la página de Melódicos no los carga)
  const CV = () => esNode ? require('./cuatro-voces-core.js') : global.CuatroVoces;
  const BC = () => esNode ? require('./bajo-cifrado-core.js') : global.BajoCifrado;

  const N = 8;                                   // notas por voz (melódicos y armónicos)
  const MAX_NIVEL_ARM = 2;
  const KEYS = TON.hastaTrimestre(1);
  const LETRAS = ['C','D','E','F','G','A','B'];
  const VOCES = ['soprano','contralto','tenor','bajo'];
  const CLAVE = {soprano:'sol', contralto:'sol', tenor:'fa', bajo:'fa'};
  const mod = (a,n)=>((a%n)+n)%n;
  const rnd = a => a[Math.floor(Math.random()*a.length)];
  function sorteo(pares){ let r=Math.random(); for(const [v,p] of pares){ if((r-=p)<0) return v; } return pares[pares.length-1][0]; }
  function elegirPeso(xs){ let r=Math.random()*xs.reduce((s,x)=>s+x.w,0); for(const x of xs){ if((r-=x.w)<0) return x; } return xs[xs.length-1]; }
  const may = s => s[0].toUpperCase()+s.slice(1);

  // Nota de la escala (con la sensible en menor) en la posición diatónica abs.
  const nota = (abs, alters) => { const p=C.pitchAt(abs, alters); return {letter:p.letter, alter:p.alter, oct:p.oct, abs}; };

  /* ================= Melódicos ================= */
  const REGLAS_MEL = ['N12','N13','N15','P9'];
  // Cuántos defectos: ninguno en ~25 %; si hay, uno o dos. De qué tipo.
  const CUANTOS = [[0,0.25],[1,0.45],[2,0.30]];
  // Si el sorteado no cabe, se prueban los demás en orden sorteado: el no
  // compensado (P9) es el que más fácil cabe, y por eso pesa poco.
  const TIPOS = [['N12',0.32],['N13',0.2],['N15',0.36],['P9',0.12]];
  function ordenTipos(){
    const quedan=TIPOS.slice(), out=[];
    while(quedan.length){ const x=elegirPeso(quedan.map(([v,w])=>({v,w}))); out.push(x.v); quedan.splice(quedan.findIndex(q=>q[0]===x.v),1); }
    return out;
  }
  // Pesos de cada paso melódico (en pasos diatónicos) en la línea correcta;
  // el bajo salta más (y admite la 8.ª).
  const PESO_PASO = rol => rol==='bajo'
    ? {0:0.1, 1:1, 2:0.5, 3:0.45, 4:0.4, 5:0.06, 7:0.1}
    : {0:0.1, 1:1, 2:0.45, 3:0.28, 4:0.18, 5:0.06};

  const comprobarMel = (mel, rol) => K.comprobar([mel], {roles:[rol], reglas:REGLAS_MEL});

  // Una línea correcta de N notas: en la tesitura (sin tocar sus extremos),
  // empieza en 1̂, 3̂ o 5̂ (el bajo, en 1̂), termina en la tónica por grado (el
  // bajo, también por 4.ª o 5.ª), con dos a cuatro saltos, sin repetir nota
  // dos veces seguidas ni pasar más de dos veces por la misma, y sin ningún
  // defecto según el comprobador.
  function lineaCorrecta(key, rol){
    const alters = C.altersByLetter(key);
    const [lo0,hi0] = K.RANGO[rol], lo=lo0+1, hi=hi0-1, centro=(lo+hi)/2, ancho=(hi-lo)/3;
    const t = LETRAS.indexOf(key.tonic), grado = abs => mod(abs-t,7)+1;
    const W = PESO_PASO(rol);
    const reg = abs => Math.exp(-0.5*Math.pow((abs-centro)/ancho,2));
    const inicios = [];
    for(let a=lo; a<=hi; a++) if((rol==='bajo' ? [1] : [1,3,5]).includes(grado(a))) inicios.push({a, w:reg(a)});
    let visitas=0;
    function dfs(mel){
      if(++visitas>4000) return null;
      const k=mel.length;
      if(k===N){
        const saltos = mel.slice(1).filter((p,i)=>Math.abs(p.abs-mel[i].abs)>=2).length;
        return saltos>=2 && saltos<=4 ? mel : null;
      }
      const prev=mel[k-1], cands=[];
      for(const d of Object.keys(W).map(Number)) for(const s of d ? [1,-1] : [1]){
        const a=prev.abs+s*d;
        if(a<lo || a>hi) continue;
        if(d===0 && (k<2 || mel[k-2].abs===prev.abs || k===N-1)) continue;
        if(mel.filter(p=>p.abs===a).length>=2) continue;        // ninguna nota más de dos veces: sin vaivenes
        if(k===N-1 && !(grado(a)===1 && (d===1 || (rol==='bajo' && (d===3 || d===4))))) continue;
        cands.push({a, w:W[d]*reg(a)});
      }
      while(cands.length){
        const c=elegirPeso(cands); cands.splice(cands.indexOf(c),1);
        const m2=mel.concat([nota(c.a, alters)]);
        if(comprobarMel(m2, rol).length) continue;
        const r=dfs(m2); if(r) return r;
      }
      return null;
    }
    for(let i=0;i<20;i++){
      const r=dfs([nota(elegirPeso(inicios).a, alters)]);
      if(r) return r;
      visitas=0;
    }
    return null;
  }

  // Las notas que abarca cada defecto (índices, desde/hasta): el intervalo
  // (N12, N13), los dos saltos (N15) o el salto y lo que le sigue (P9).
  const tramo = f => (f.regla==='N12' || f.regla==='N13') ? [f.evento-1, f.evento] : [f.evento-2, f.evento];
  const solapa = (a,b) => a[0]<b[1] && b[0]<a[1];
  const clave = f => f.regla+'@'+f.evento;

  // Inyecta un defecto del tipo pedido cambiando una nota interior (no la
  // última) y, si hace falta, la siguiente, para que el salto nuevo se
  // compense por grado (si no, un salto de 7.ª o un tritono saldrían casi
  // siempre también como «sin compensar»): el comprobador ha de encontrar
  // exactamente los de antes más uno nuevo de ese tipo, sin solapar a los que
  // ya hay. Sin saltos de más de 10.ª.
  function inyectar(mel, rol, alters, tipo){
    const [lo,hi] = K.RANGO[rol];
    const antes = comprobarMel(mel, rol), ya = new Set(antes.map(clave));
    const opciones=[], pruebas=[];
    for(let k=1;k<N-1;k++) for(let a=lo;a<=hi;a++){
      if(a===mel[k].abs) continue;
      const p1 = mel.slice(); p1[k]=nota(a, alters);
      pruebas.push(p1);
      const vuelta = a - Math.sign(a-mel[k-1].abs);
      if(k+1<N-1 && vuelta!==mel[k+1].abs && vuelta>=lo && vuelta<=hi){
        const p2 = p1.slice(); p2[k+1]=nota(vuelta, alters);
        pruebas.push(p2);
      }
    }
    for(const prueba of pruebas){
      const cambios = prueba.filter((x,i)=>x.abs!==mel[i].abs).length;
      if(prueba.slice(1).some((p,i)=>Math.abs(p.abs-prueba[i].abs)>9)) continue;
      const fs = comprobarMel(prueba, rol);
      if(fs.length!==antes.length+1) continue;
      const nuevas = fs.filter(f=>!ya.has(clave(f)));
      if(nuevas.length!==1 || nuevas[0].regla!==tipo) continue;
      if(antes.some(f=>solapa(tramo(f), tramo(nuevas[0])))) continue;
      const dist = prueba.reduce((s,x,i)=>s+Math.abs(x.abs-mel[i].abs),0);
      opciones.push({prueba, w:1/(1+0.3*dist)/cambios});
    }
    return opciones.length ? elegirPeso(opciones).prueba : null;
  }

  // Rótulo corto de cada defecto (bajo su corchete).
  const ABR = {aumentada:'aum.', disminuida:'dism.', superaumentada:'aum.', superdisminuida:'dism.'};
  function rotulo(f, mel){
    const [i,j] = tramo(f);
    if(f.regla==='N12'){ const iv=K.intervalo(mel[i], mel[j]); return (iv.pasos+1)+'.ª '+(ABR[iv.cal]||iv.cal); }
    if(f.regla==='N13') return 'salto de '+(K.intervalo(mel[i], mel[j]).pasos+1)+'.ª';
    if(f.regla==='N15') return 'suman '+(K.intervalo(mel[i], mel[j]).pasos+1)+'.ª';
    return '(sin compensar)';
  }

  function generarMelodico(){
    for(let intento=0; intento<40; intento++){
      const key = rnd(KEYS), rol = rnd(VOCES), alters = C.altersByLetter(key);
      let mel = lineaCorrecta(key, rol);
      if(!mel) continue;
      const cuantos = sorteo(CUANTOS);
      let puestos=0;
      while(puestos<cuantos){
        let m2=null;
        for(const tipo of ordenTipos()){ m2 = inyectar(mel, rol, alters, tipo); if(m2) break; }
        if(!m2) break;
        mel=m2; puestos++;
      }
      if(puestos<cuantos) continue;
      // la respuesta, del comprobador
      const defectos = comprobarMel(mel, rol)
        .map(f=>({regla:f.regla, grado:f.grado, texto:f.texto, tramo:tramo(f), rotulo:rotulo(f, mel)}))
        .sort((a,b)=>a.tramo[0]-b.tramo[0]);
      return { tipo:'melodico', key, rol, voz:mel, defectos,
               faltas: defectos.filter(d=>d.grado==='falta'),
               mejorables: defectos.filter(d=>d.grado!=='falta') };
    }
    return null;
  }

  /* ================= Armónicos ================= */
  // Parejas del coro, de aguda a grave, y su escritura (como en Consonancia).
  const PAREJAS = [
    {voces:['soprano','contralto'], pent:'sol'}, {voces:['contralto','tenor'], pent:'doble'},
    {voces:['tenor','bajo'], pent:'fa'},         {voces:['soprano','tenor'], pent:'doble'},
    {voces:['soprano','bajo'], pent:'doble'},    {voces:['contralto','bajo'], pent:'doble'}
  ];
  const ABREV = {contrario:'contr.', oblicuo:'obl.', directo:'dir.', paralelo:'par.'};
  const movimientos = (a, b) => a.slice(1).map((_,i)=>K.movimiento(a[i], b[i], a[i+1], b[i+1]));
  const variado = movs => new Set(movs.filter(Boolean)).size>=3 && movs.filter(m=>!m).length<=1;
  const limpia = p => ({letter:p.letter, alter:p.alter, oct:p.oct, abs:p.abs});

  function generarArmonico(nivel){
    nivel = Math.max(1, Math.min(MAX_NIVEL_ARM, nivel|0));
    for(let intento=0; intento<60; intento++){
      let key, voces, par;
      if(nivel===1){
        key = rnd(KEYS); par = rnd(PAREJAS);
        // el directo (no paralelo) sale poco con las reglas del motor: se le da peso
        const res = C.generar({tonalidad:key, pareja:par.voces, nNotas:N,
                               pesoCandidato:(ctx,w)=>ctx.tipo==='directo' ? w*2.5 : w});
        if(!res) continue;
        voces = [res.voces[1], res.voces[0]].map(v=>v.map(limpia));
        if(!variado(movimientos(voces[0], voces[1]))) continue;
        return armonico(1, key, voces, [0,1], par);
      }
      // nivel 2: una sucesión de Bajo cifrado, realizada a cuatro voces
      const b = BC().generar(3, {n:N});
      if(!b) continue;
      const acs = b.ids.map(id=>CV().acorde(b.key, BC().ACORDES[id]));
      const r = CV().realizar(b.key, acs, {fija:{voz:3, alturas:b.acordes.map(a=>a.bajo)}});
      if(!r) continue;
      key = b.key; voces = r.voces.map(v=>v.map(limpia));
      const parejas=[];
      for(let i=0;i<4;i++) for(let j=i+1;j<4;j++) if(variado(movimientos(voces[i], voces[j]))) parejas.push([i,j]);
      if(!parejas.length) continue;
      const res = armonico(2, key, voces, rnd(parejas), null);
      res.grados = b.acordes.map(a=>a.romano+(a.cifrasRomano||''));
      res.acordes = acs;                     // para comprobar la realización entera (tests)
      return res;
    }
    return null;
  }

  function armonico(nivel, key, voces, sel, par){
    const [i,j] = sel;
    const movs = movimientos(voces[i], voces[j]);
    const roles = par ? par.voces : sel.map(v=>VOCES[v]);
    return { tipo:'armonico', nivel, key, voces, sel, roles, pent: par ? par.pent : 'satb', movs,
             rotulos: movs.map(m=>m ? ABREV[m] : '—') };
  }

  // «Contrario 3 · Oblicuo 2 · Paralelo 2», de más a menos.
  function recuento(movs){
    const c={}; movs.forEach(m=>{ const k=m||'sin movimiento'; c[k]=(c[k]||0)+1; });
    return Object.entries(c).sort((a,b)=>b[1]-a[1]).map(([k,n])=>may(k)+' '+n).join(' · ');
  }

  /* ================= MEI ================= */
  const accMap={1:'s',0:'n','-1':'f',2:'x','-2':'ff'};
  const sigStr = sig => sig===0 ? '0' : Math.abs(sig)+(sig>0?'s':'f');
  const CLAVES = {sol:'clef.shape="G" clef.line="2"', fa:'clef.shape="F" clef.line="4"'};
  // ids de nota: n<voz>_<k> (voz contada desde arriba); los usan los rótulos y
  // las rayas que la página dibuja tras el render.
  const idNota = (v,k) => `n${v}_${k}`;
  function cabecera(inst, staffGrp){
    return `<?xml version="1.0" encoding="UTF-8"?>
<mei xmlns="http://www.music-encoding.org/ns/mei" meiversion="4.0.0">
 <music><body><mdiv><score>
  <scoreDef keysig="${sigStr(inst.key.sig)}" meter.count="${N}" meter.unit="2" meter.form="invis">
   ${staffGrp}
  </scoreDef>`;
  }
  const pie = `
 </score></mdiv></body></music>
</mei>`;

  // toMEI(inst): blancas, un compás sin métrica visible. La respuesta NO va en
  // el MEI (la página la dibuja con ArmoniaEj.rotulosEntre y lineasMovimiento):
  // como <harm>, su anchura movería las notas.
  function toMEI(inst){
    const sig = C.keysigAlters(inst.key.sig);
    const nt = (p,id,tipo) => `<note xml:id="${id}" dur="2" pname="${p.letter.toLowerCase()}" oct="${p.oct}"${p.alter!==sig[p.letter]?` accid="${accMap[p.alter]}"`:''}${tipo?` type="${tipo}"`:''}/>`;
    if(inst.tipo==='melodico'){
      const cl = CLAVE[inst.rol];
      const notas = inst.voz.map((p,k)=>nt(p, idNota(0,k))).join('');
      return cabecera(inst, `<staffGrp><staffDef n="1" lines="5" ${CLAVES[cl]}/></staffGrp>`)
        + `<section><measure right="end"><staff n="1"><layer n="1">${notas}</layer></staff>`
        + `<reh place="above" staff="1" tstamp="1" type="dato">${may(inst.rol)}</reh></measure></section>` + pie;
    }
    // armónicos: la pareja en tinta; en el nivel 2, las otras dos voces en gris
    const capa = (v,n) => `<layer n="${n}">${inst.voces[v].map((p,k)=>nt(p, idNota(v,k), inst.sel.includes(v)?'':'gris')).join('')}</layer>`;
    const vacia = `<layer n="1">${'<space dur="2"/>'.repeat(N)}</layer>`;
    let staves;
    if(inst.pent==='satb') staves = `<staff n="1">${capa(0,1)}${capa(1,2)}</staff><staff n="2">${capa(2,1)}${capa(3,2)}</staff>`;
    else if(inst.pent==='doble') staves = `<staff n="1">${capa(0,1)}</staff><staff n="2">${capa(1,1)}</staff>`;
    else if(inst.pent==='sol') staves = `<staff n="1">${capa(0,1)}${capa(1,2)}</staff><staff n="2">${vacia}</staff>`;
    else staves = `<staff n="1">${vacia}</staff><staff n="2">${capa(0,1)}${capa(1,2)}</staff>`;
    const dato = inst.nivel===1 ? `<reh place="above" staff="1" tstamp="1" type="dato">${may(inst.roles[0])} y ${inst.roles[1]}</reh>` : '';
    return cabecera(inst, `<staffGrp symbol="brace" bar.thru="true"><staffDef n="1" lines="5" ${CLAVES.sol}/><staffDef n="2" lines="5" ${CLAVES.fa}/></staffGrp>`)
      + `<section><measure right="end">${staves}${dato}</measure></section>` + pie;
  }

  // Lo que la página dibuja tras el render. Melódicos: un corchete con su
  // rótulo bajo cada defecto. Armónicos: entre cada dos sonoridades, el tipo de
  // movimiento (paso k, 1..N-1) y una raya por voz de la pareja.
  function dibujo(inst){
    if(inst.tipo==='melodico') return {
      rotulos: inst.defectos.map(d=>({desde:idNota(0,d.tramo[0]), hasta:idNota(0,d.tramo[1]), texto:d.rotulo,
                                     clase:'resp '+(d.grado==='falta'?'dis':'aviso'), corchete:true})),
      rayas: [] };
    const [i,j] = inst.sel, rayas=[], rotulos=[];
    for(let k=1;k<N;k++){
      rotulos.push({desde:idNota(i,k-1), hasta:idNota(i,k), texto:inst.rotulos[k-1], clase:'resp dis', paso:k});
      [[i,'voz-sup'],[j,'voz-inf']].forEach(([v,cl])=>rayas.push({de:idNota(v,k-1), a:idNota(v,k), clase:'resp '+cl, paso:k}));
    }
    return {rotulos, rayas};
  }

  /* ================= audio ================= */
  const PASO = 1.0;
  function midis(inst){
    const vs = inst.tipo==='melodico' ? [inst.voz] : inst.voces, out=[];
    vs.forEach(v=>v.forEach((p,k)=>out.push({midi:K.midi(p), at:k*PASO, dur:PASO*0.95})));
    return out;
  }
  // el paso k (armónicos): sus dos sonoridades
  function midisPaso(inst, k){
    const out=[];
    inst.voces.forEach(v=>[k-1,k].forEach((s,i)=>out.push({midi:K.midi(v[s]), at:i*PASO, dur:PASO*0.95})));
    return out;
  }

  const api = { inyectar, generarMelodico, generarArmonico, toMEI, dibujo, midis, midisPaso, recuento, lineaCorrecta,
                tramo, N, MAX_NIVEL_ARM, PAREJAS, VOCES, REGLAS_MEL };
  if (esNode) module.exports = api;
  else global.Movimientos = api;
})(typeof window !== 'undefined' ? window : globalThis);
/* fin del módulo */
