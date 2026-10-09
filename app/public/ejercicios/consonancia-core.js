/* ============================================================
   Consonancia — cadena a dos voces con disonancias inyectadas
   ------------------------------------------------------------
   Diseño: docs/familias/consonancia.md (3.º UD 1, Morfología).
   Lo común (faltas inyectadas, comprobador, parejas del coro):
   docs/motor-contrapunto.md.
     1. El motor de contrapunto genera una cadena CORRECTA a dos
        voces (una pareja del coro, en una tonalidad del trimestre).
     2. Se inyectan 0–3 disonancias: en una sonoridad interior, una
        de las voces cambia de nota por otra de la escala que forme
        disonancia con la otra voz, sin que la melodía deje de ser
        correcta.
     3. La respuesta —la clase de cada intervalo— la da el
        comprobador independiente (ConduccionCheck), que además ha
        de confirmar que no hay ninguna otra falta: si la hay, la
        instancia se descarta.
   Sin DOM. Depende de contrapunto-core.js, conduccion-check.js,
   ../tonalidades.js y mini-lilypond-parser.js.
   ============================================================ */
(function (global) {
  'use strict';

  const esNode = typeof module !== 'undefined' && module.exports;
  const C   = esNode ? require('./contrapunto-core.js') : global.Contrapunto;
  const K   = esNode ? require('./conduccion-check.js') : global.ConduccionCheck;
  const TON = esNode ? require('../tonalidades.js')     : global.TONALIDADES;

  const N_NOTAS = 8;
  const MAX_NIVEL = 2;
  // Parejas del coro, de aguda a grave, y su escritura: las dos en Sol, las
  // dos en Fa, o la aguda en Sol y la grave en Fa.
  const PAREJAS = [
    {voces:['soprano','contralto'], pent:'sol'}, {voces:['contralto','tenor'], pent:'doble'},
    {voces:['tenor','bajo'], pent:'fa'},         {voces:['soprano','tenor'], pent:'doble'},
    {voces:['soprano','bajo'], pent:'doble'},    {voces:['contralto','bajo'], pent:'doble'}
  ];
  const INICIAL = {soprano:'S', contralto:'A', tenor:'T', bajo:'B'};
  // Cuántas disonancias: ninguna en ~20 % de las instancias (que «ninguna»
  // sea una respuesta posible); si hay, 1–3.
  const CUANTAS = [[0,0.2],[1,0.38],[2,0.3],[3,0.12]];
  const rnd = a => a[Math.floor(Math.random()*a.length)];
  function sorteo(pares){ let r=Math.random(); for(const [v,p] of pares){ if((r-=p)<0) return v; } return pares[pares.length-1][0]; }
  function barajar(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

  function tonalidades(nivel){
    const ts = TON.hastaTrimestre(1);
    return nivel<=1 ? ts.filter(t=>t.mode==='major') : ts;
  }

  const REGLAS = ['N1','N2','N3','N4','N12','N13'];    // la cadena, salvo las disonancias, ha de estar limpia

  // Una nota de la escala (letra, alteración de la tonalidad con la sensible)
  // en la posición diatónica abs.
  const nota = (abs, alters) => { const p=C.pitchAt(abs, alters); return {letter:p.letter, alter:p.alter, oct:p.oct, abs}; };

  // Inyecta una disonancia en la sonoridad k: reúne las opciones válidas
  // —una de las voces cambia a una nota a una 2.ª o 3.ª de distancia, forma
  // disonancia y la cadena no tiene otras faltas— y elige una con pesos: la
  // 4.ª justa, que sale con cualquier paso, pesa menos, para que haya variedad;
  // los de la sensible en menor (4.ª D, 5.ª A, 2.ª A, 7.ª D), que son los que
  // subrayan los apuntes (sol♯–do: suena como una 3.ª y es disonancia), más.
  const PESO_DISONANCIA = { '3:justa':0.35,                // forma simple:calidad
    '3:disminuida':4, '4:aumentada':4, '1:aumentada':4, '6:disminuida':4 };
  function inyectar(voces, k, roles, alters){
    const validas=[];
    for(const v of [0,1]) for(const d of [-2,-1,1,2]){
      const nueva = nota(voces[v][k].abs + d, alters);
      const prueba = voces.map(x=>x.slice()); prueba[v][k] = nueva;
      const cl = K.clasificar(prueba[0][k], prueba[1][k], true);
      if(cl.clase!=='D' || cl.cal.indexOf('super')===0) continue;
      if(K.comprobar(prueba, {roles, saltoMax:4, reglas:REGLAS}).length) continue;
      validas.push({prueba, w: PESO_DISONANCIA[cl.simple+':'+cl.cal] || 1});
    }
    if(!validas.length) return null;
    let r = Math.random()*validas.reduce((s,x)=>s+x.w,0);
    for(const x of validas){ if((r-=x.w)<0) return x.prueba; }
    return validas[validas.length-1].prueba;
  }

  function generar(nivel){
    nivel = Math.max(1, Math.min(MAX_NIVEL, nivel|0));
    for(let intento=0; intento<60; intento++){
      const key = rnd(tonalidades(nivel));
      const par = rnd(PAREJAS);
      const res = C.generar({tonalidad:key, pareja:par.voces, nNotas:N_NOTAS});
      if(!res) continue;
      // de aguda a grave, como el comprobador
      let voces = [res.voces[1], res.voces[0]].map(v=>v.map(p=>({letter:p.letter, alter:p.alter, oct:p.oct, abs:p.abs})));
      // sonoridades interiores, sin tocar la cadena (las dos últimas)
      const posibles = barajar([...Array(N_NOTAS-3).keys()].map(i=>i+1));
      const cuantas = sorteo(CUANTAS);
      const puestas=[];
      for(const k of posibles){
        if(puestas.length===cuantas) break;
        if(puestas.some(p=>Math.abs(p-k)<2)) continue;          // no dos disonancias seguidas
        const v2 = inyectar(voces, k, par.voces, res.alters);
        if(v2){ voces=v2; puestas.push(k); }
      }
      if(puestas.length!==cuantas) continue;
      // la respuesta, del comprobador
      if(K.comprobar(voces, {roles:par.voces, saltoMax:4, reglas:REGLAS}).length) continue;
      const intervalos = voces[0].map((p,i)=>K.clasificar(p, voces[1][i], true));
      const disonancias = intervalos.map((iv,i)=>iv.clase==='D'?i:-1).filter(i=>i>=0);
      return { key, pareja:par, voces, intervalos, disonancias, nivel,
               json:{ familia:'consonancia', consigna:'cadena', nivel,
                      answer:{ clases: intervalos.map(iv=>iv.clase), intervalos: intervalos.map(iv=>iv.nombre) } } };
    }
    return null;
  }

  /* ---------- MEI ---------- */
  const accMap={1:'s',0:'n','-1':'f'};
  const sigStr = sig => sig===0 ? '0' : Math.abs(sig)+(sig>0?'s':'f');
  // toMEI(inst, {mascara}): la cadena (blancas, un compás sin métrica visible)
  // y, bajo el pentagrama inferior, el intervalo y su clase de cada
  // sonoridad, como respuesta (type="resp"; las disonancias, además, "dis").
  function toMEI(inst, opts){
    opts=opts||{};
    const sig = C.keysigAlters(inst.key.sig);
    const nt = (p,id) => `<note xml:id="${id}" dur="2" pname="${p.letter.toLowerCase()}" oct="${p.oct}"${p.alter!==sig[p.letter]?` accid="${accMap[p.alter]}"`:''}/>`;
    const capa = (v,n,pre) => `<layer n="${n}">${inst.voces[v].map((p,i)=>nt(p,pre+i)).join('')}</layer>`;
    const pent = inst.pareja.pent;
    let staves;
    if(pent==='doble') staves = `<staff n="1">${capa(0,1,'a')}</staff><staff n="2">${capa(1,1,'g')}</staff>`;
    else if(pent==='sol') staves = `<staff n="1">${capa(0,1,'a')}${capa(1,2,'g')}</staff><staff n="2"><layer n="1">${'<space dur="2"/>'.repeat(N_NOTAS)}</layer></staff>`;
    else staves = `<staff n="1"><layer n="1">${'<space dur="2"/>'.repeat(N_NOTAS)}</layer></staff><staff n="2">${capa(0,1,'a')}${capa(1,2,'g')}</staff>`;
    const R = opts.mascara ? ' resp' : '';
    const harms = inst.intervalos.map((iv,i)=>
      `<harm place="below" staff="2" startid="#g${i}" n="1" type="intervalo${R}${iv.clase==='D'?' dis':''}">${iv.corto}</harm>`
      + `<harm place="below" staff="2" startid="#g${i}" n="2" type="clase${R}${iv.clase==='D'?' dis':''}">${iv.clase}</harm>`).join('');
    return `<?xml version="1.0" encoding="UTF-8"?>
<mei xmlns="http://www.music-encoding.org/ns/mei" meiversion="4.0.0">
 <music><body><mdiv><score>
  <scoreDef keysig="${sigStr(inst.key.sig)}" meter.count="${N_NOTAS}" meter.unit="2" meter.form="invis">
   <staffGrp symbol="brace" bar.thru="true"><staffDef n="1" lines="5" clef.shape="G" clef.line="2"/><staffDef n="2" lines="5" clef.shape="F" clef.line="4"/></staffGrp>
  </scoreDef>
  <section><measure right="end">${staves}${harms}</measure></section>
 </score></mdiv></body></music>
</mei>`;
  }

  /* ---------- audio ---------- */
  const PASO = 1.0;
  function midis(inst){
    const out=[];
    inst.voces[0].forEach((p,i)=>{
      [p, inst.voces[1][i]].forEach(q=>out.push({midi:K.midi(q), at:i*PASO, dur:PASO*0.95}));
    });
    return out;
  }

  const api = { generar, toMEI, midis, MAX_NIVEL, N_NOTAS, PAREJAS, INICIAL };
  if (esNode) module.exports = api;
  else global.Consonancia = api;
})(typeof window !== 'undefined' ? window : globalThis);
/* fin del módulo */
