/* ============================================================
   Disposición — sonoridades y acordes sueltos, con faltas
   ------------------------------------------------------------
   Diseño: docs/familias/disposicion.md (3.º UD 1; apuntes c3u1
   §2.1). Lo común (faltas inyectadas, comprobador, parejas):
   docs/motor-contrapunto.md.
     · Entre dos voces: 5 sonoridades de una pareja (soprano–
       contralto o contralto–tenor); cada una, bien o con UNA de
       estas faltas: distancia de más de una 8.ª (N2), cruce (N3),
       unísono (P2).
     · A cuatro voces: 3 tríadas diatónicas en estado fundamental;
       cada una, bien —en disposición cerrada, abierta o mixta— o
       con UNA falta: fuera de tesitura (N1), distancia (N2) o
       cruce (N3). Cerrada y abierta, con la fundamental
       duplicada; mixta (soprano y tenor a una 8.ª), con la 3.ª o
       la 5.ª, y en pocos casos.
   Cómo: se enumeran las colocaciones posibles (también un poco
   fuera de tesitura, o cruzadas) y se elige una cuyas faltas,
   según el comprobador independiente, sean exactamente las
   buscadas. La respuesta es lo que dice el comprobador.
   Sin DOM. Depende de contrapunto-core.js (aritmética de alturas),
   conduccion-check.js y ../tonalidades.js.
   ============================================================ */
(function (global) {
  'use strict';

  const esNode = typeof module !== 'undefined' && module.exports;
  const C   = esNode ? require('./contrapunto-core.js') : global.Contrapunto;
  const K   = esNode ? require('./conduccion-check.js') : global.ConduccionCheck;
  const TON = esNode ? require('../tonalidades.js')     : global.TONALIDADES;

  const rnd = a => a[Math.floor(Math.random()*a.length)];
  function sorteo(pares){ let r=Math.random()*pares.reduce((s,p)=>s+p[1],0); for(const [v,p] of pares){ if((r-=p)<0) return v; } return pares[pares.length-1][0]; }
  const KEYS = TON.hastaTrimestre(1);
  const T = C.TESITURA;                                     // N1, índices absolutos
  const nota = (abs, alters) => { const p=C.pitchAt(abs, alters); return {letter:p.letter, alter:p.alter, oct:p.oct, abs}; };
  const ROL_CORTO = {soprano:'S', contralto:'A', tenor:'T', bajo:'B'};

  // Elige entre colocaciones válidas prefiriendo el registro central de cada
  // voz (P10: los extremos se visitan, no se habitan), como el motor de
  // contrapunto. `voces` de cada candidata, de aguda a grave, con sus roles.
  function elegir(cands, roles){
    return sorteo(cands.map(v=>{
      let w=1;
      v.forEach((p,i)=>{ const [lo,hi]=T[roles[i]], c=(lo+hi)/2, ancho=(hi-lo)/3, d=(p.abs-c)/ancho; w*=Math.exp(-1.2*d*d/2); });
      return [v, w];
    }));
  }

  // Resumen breve de una falta del comprobador, para la partitura. Con dos
  // voces no hace falta decir cuáles: la pareja está escrita como dato.
  function corta(f, roles){
    if(roles.length===2) return {N1:'tesitura', N2:'> 8.ª', N3:'cruce', P2:'(unís.)'}[f.regla] || f.regla;
    const v = f.voces.map(i=>ROL_CORTO[roles[i]]);
    if(f.regla==='N1') return 'tesitura ('+v[0]+')';
    if(f.regla==='N2') return (v.includes('B') ? '> 15.ª (' : '> 8.ª (')+v.join('–')+')';   // T–B: 15.ª
    if(f.regla==='N3') return 'cruce ('+v.join('/')+')';
    if(f.regla==='P2') return 'unísono';
    return f.regla;
  }

  /* ---------- Entre dos voces ---------- */
  // consonancia o 4.ª justa (la que se forma, cruzada o no), y su nombre: el
  // cruzado cuenta aparte del mismo intervalo sin cruzar
  function consonante(a, g){
    const iv = K.intervalo(a, g);
    return (iv.cal==='justa' || iv.cal==='mayor' || iv.cal==='menor') && iv.simple!==1 && iv.simple!==6;
  }
  const clave = (a, g) => (a.abs<g.abs ? 'x' : '') + K.intervalo(a, g).nombre;
  const N_DOS = 5;
  const PAREJAS_DOS = [['soprano','contralto'], ['contralto','tenor']];
  const REGLAS_DOS = ['N1','N2','N3','P2'];
  // qué se busca en cada sonoridad: bien en ~40 %, cada falta en ~20 %
  const BUSCA_DOS = [[null,0.4],['N2',0.2],['N3',0.2],['P2',0.2]];

  function generarDosVoces(){
    for(let intento=0; intento<50; intento++){
      const key = rnd(KEYS), alters = C.altersByLetter(key), roles = rnd(PAREJAS_DOS);
      const [ra, rg] = [T[roles[0]], T[roles[1]]];
      const sonoridades=[], usados=new Set();
      for(let k=0;k<N_DOS;k++){
        const busca = sorteo(BUSCA_DOS);
        // candidatas: la grave en su tesitura; la aguda, según lo que se busca
        const cands=[];
        for(let g=rg[0]; g<=rg[1]; g++) for(let a=ra[0]; a<=ra[1]; a++){
          const d=a-g;
          const ok = busca===null ? [2,3,4,5,7].includes(d)            // 3.ª, 4.ª, 5.ª, 6.ª, 8.ª
                   : busca==='N2' ? d>=9 && d<=12                        // 10.ª a 13.ª
                   : busca==='N3' ? d<=-2 && d>=-5                       // la aguda, una 3.ª a una 6.ª por debajo
                   : d===0;
          if(ok) cands.push([nota(a,alters), nota(g,alters)]);
        }
        const buenas = cands.filter(([a,g])=>{
          // lo que se pregunta es la distancia, el cruce o el unísono: nunca un
          // intervalo disonante que distraiga (sí la 4.ª justa); y ninguno se
          // repite en el mismo ejercicio (el unísono, por tanto, una vez)
          if(!consonante(a,g) || usados.has(clave(a,g))) return false;
          const fs = K.comprobar([[a],[g]], {roles, reglas:REGLAS_DOS, superposicion:false});
          return busca===null ? fs.length===0 : fs.length===1 && fs[0].regla===busca;
        });
        if(!buenas.length) break;
        const [a,g] = elegir(buenas, roles);
        usados.add(clave(a,g));
        sonoridades.push({voces:[a,g], falta:busca});
      }
      if(sonoridades.length<N_DOS) continue;
      const voces = [sonoridades.map(s=>s.voces[0]), sonoridades.map(s=>s.voces[1])];
      const faltas = K.comprobar(voces, {roles, reglas:REGLAS_DOS, superposicion:false});
      const porSon = sonoridades.map((_,k)=>faltas.filter(f=>f.evento===k));
      // el unísono (P2) es preferencia, no norma: se señala como aviso
      return { tipo:'dos', key, roles, voces, faltas, porSon,
               errores: porSon.map(fs=>fs.filter(f=>f.grado==='falta')),
               avisos: porSon.map(fs=>fs.filter(f=>f.grado!=='falta')),
               rotulos: porSon.map(fs=>fs.length
                 ? fs.map(f=>({texto:corta(f,roles), clase:'resp '+(f.grado==='falta'?'dis':'aviso')}))
                 : [{texto:'✓', clase:'resp bien'}]) };
    }
    return null;
  }

  /* ---------- A cuatro voces ---------- */
  const N_CUATRO = 3;
  const ROLES4 = ['soprano','contralto','tenor','bajo'];
  const REGLAS4 = ['N1','N2','N3','P2'];
  const BUSCA4 = [[null,0.6],['N1',0.13],['N2',0.14],['N3',0.13]];
  const DISP = [['cerrada',0.45],['abierta',0.42],['mixta',0.13]];
  const MARGEN = 3;                                         // pasos fuera de tesitura que se exploran

  // Tríada diatónica en estado fundamental sobre `grado` (1–7): letras de
  // fundamental, 3.ª y 5.ª (las alteraciones las pone la tonalidad).
  function grados(key){
    // fuera VII (disminuida, solo en 1.ª inversión: N10) y, en menor, II
    // (disminuida) y III (aumentada en la armónica)
    return key.mode==='minor' ? [1,4,5,6] : [1,2,3,4,5,6];
  }
  // Disposición por la distancia tenor–soprano (apuntes c3u1 §2.1).
  function disposicion(s, t){
    const d = s.abs - t.abs;
    return d<7 ? 'cerrada' : d>7 ? 'abierta' : 'mixta';
  }
  // Notas del acorde (clase diatónica 0–6 desde la tónica) en un rango.
  function enRango(clases, lo, hi){
    const out=[]; for(let x=lo; x<=hi; x++) if(clases.includes(x)) out.push(x); return out;
  }

  // Todas las colocaciones del acorde sobre `fundamental` (letra-índice 0–6
  // relativo a C), con el bajo en la fundamental, completas y con la
  // duplicación pedida; las tres voces superiores pueden cruzarse o salirse
  // un poco de su tesitura (para poder buscar faltas).
  function colocaciones(raizIdx, dup){
    const tono = off => ((raizIdx+off)%7+7)%7;                  // F, 3.ª, 5.ª como índice de letra
    const F=tono(0), III=tono(2), V=tono(4);
    const de = abs => ((abs%7)+7)%7;
    const R = r => [T[r][0]-MARGEN, T[r][1]+MARGEN];
    const out=[];
    const bajos = []; for(let b=R('bajo')[0]; b<=R('bajo')[1]; b++) if(de(b)===F) bajos.push(b);
    const sup = r => { const [lo,hi]=R(r), o=[]; for(let x=lo;x<=hi;x++) if([F,III,V].includes(de(x))) o.push(x); return o; };
    const S=sup('soprano'), A=sup('contralto'), Te=sup('tenor');
    for(const b of bajos) for(const s of S) for(const a of A) for(const t of Te){
      const cl=[de(s),de(a),de(t),de(b)];
      const n = x => cl.filter(c=>c===x).length;
      if(!(n(F)>=1 && n(III)>=1 && n(V)>=1)) continue;          // completo
      const doblada = n(F)===2 ? 'F' : n(III)===2 ? '3' : n(V)===2 ? '5' : null;
      if(dup==='F' && doblada!=='F') continue;
      if(dup==='35' && doblada!=='3' && doblada!=='5') continue;
      out.push([s,a,t,b]);
    }
    return out;
  }

  function generarCuatroVoces(){
    for(let intento=0; intento<50; intento++){
      const key = rnd(KEYS), alters = C.altersByLetter(key);
      const tonica = ['C','D','E','F','G','A','B'].indexOf(key.tonic);
      const acordes=[];
      for(let k=0;k<N_CUATRO;k++){
        const busca = sorteo(BUSCA4);
        const disp = busca===null ? sorteo(DISP) : null;
        // tres grados distintos: el mismo acorde repetido empobrece el ejercicio
        const grado = rnd(grados(key).filter(g=>!acordes.some(x=>x.grado===g)));
        const raiz = tonica + grado - 1;
        const dup = disp==='mixta' ? '35' : 'F';
        const cands = colocaciones(raiz, dup).map(c=>c.map(x=>nota(x, alters)));
        const buenas = cands.filter(v=>{
          // sin unísonos entre ninguna pareja: no se preguntan aquí, y en la
          // partitura las dos cabezas se superponen y una voz desaparece
          if(new Set(v.map(K.midi)).size<4) return false;
          const fs = K.comprobar(v.map(p=>[p]), {roles:ROLES4, reglas:REGLAS4, superposicion:false});
          if(busca===null) return fs.length===0 && disposicion(v[0],v[2])===disp;
          return fs.length===1 && fs[0].regla===busca;
        });
        if(!buenas.length) break;
        acordes.push({grado, voces:elegir(buenas, ROLES4)});
      }
      if(acordes.length<N_CUATRO) continue;
      const voces = [0,1,2,3].map(v=>acordes.map(a=>a.voces[v]));
      const faltas = K.comprobar(voces, {roles:ROLES4, reglas:REGLAS4, superposicion:false});
      const porAcorde = acordes.map((_,k)=>faltas.filter(f=>f.evento===k));
      const disposiciones = acordes.map((a,k)=> porAcorde[k].some(f=>f.regla==='N3') ? null : disposicion(a.voces[0], a.voces[2]));
      // bajo cada acorde, una sola cosa: la falta o, si no la hay, la disposición
      return { tipo:'cuatro', key, roles:ROLES4, voces, faltas, porAcorde,
               disposiciones: disposiciones.map((d,k)=>porAcorde[k].length ? null : d),
               grados: acordes.map(a=>a.grado),
               rotulos: porAcorde.map((fs,k)=>fs.length
                 ? fs.map(f=>({texto:corta(f,ROLES4), clase:'resp dis'}))
                 : [{texto:disposiciones[k][0].toUpperCase()+disposiciones[k].slice(1), clase:'resp'}]) };
    }
    return null;
  }

  /* ---------- MEI ---------- */
  const accMap={1:'s',0:'n','-1':'f'};
  const sigStr = sig => sig===0 ? '0' : Math.abs(sig)+(sig>0?'s':'f');
  const ESPACIO = '<space dur="2"/>';
  // toMEI(inst): una sonoridad o acorde por compás (blancas), en pentagrama
  // doble, separados por barras DOBLES (elementos sueltos, sin conducción
  // entre ellos: lo distingue a la vista de los ejercicios encadenados). En
  // Entre dos voces, el nombre de la pareja como dato. La respuesta NO va en el
  // MEI: son `rotulos`, que la página dibuja con ArmoniaEj.rotulosBajo (como
  // <harm>, su anchura ensancharía el compás y delataría la falta).
  function toMEI(inst, opts){
    opts=opts||{};
    const sig = C.keysigAlters(inst.key.sig);
    // blancas, no redondas: la plica dice qué voz es cuál (la aguda de cada
    // pentagrama, arriba; la grave, abajo), y sin ella un cruce no se ve
    const nt = (p,id) => `<note xml:id="${id}" dur="2" pname="${p.letter.toLowerCase()}" oct="${p.oct}"${p.alter!==sig[p.letter]?` accid="${accMap[p.alter]}"`:''}/>`;
    const n = inst.voces[0].length;
    const compases = [];
    for(let k=0;k<n;k++){
      let staves, harms='';
      if(inst.tipo==='dos'){
        const [a,g] = [inst.voces[0][k], inst.voces[1][k]];
        staves = inst.roles[1]==='contralto'
          ? `<staff n="1"><layer n="1">${nt(a,'a'+k)}</layer><layer n="2">${nt(g,'g'+k)}</layer></staff><staff n="2"><layer n="1">${ESPACIO}</layer></staff>`
          : `<staff n="1"><layer n="1">${nt(a,'a'+k)}</layer></staff><staff n="2"><layer n="1">${nt(g,'g'+k)}</layer></staff>`;
        if(k===0) harms += `<reh place="above" staff="1" tstamp="1" type="dato">${inst.roles[0][0].toUpperCase()+inst.roles[0].slice(1)} y ${inst.roles[1]}</reh>`;
      }else{
        const v = i => inst.voces[i][k];
        staves = `<staff n="1"><layer n="1">${nt(v(0),'s'+k)}</layer><layer n="2">${nt(v(1),'a'+k)}</layer></staff>`
               + `<staff n="2"><layer n="1">${nt(v(2),'t'+k)}</layer><layer n="2">${nt(v(3),'b'+k)}</layer></staff>`;
      }
      compases.push(`<measure n="${k+1}" right="dbl">${staves}${harms}</measure>`);
    }
    return `<?xml version="1.0" encoding="UTF-8"?>
<mei xmlns="http://www.music-encoding.org/ns/mei" meiversion="4.0.0">
 <music><body><mdiv><score>
  <scoreDef keysig="${sigStr(inst.key.sig)}" meter.count="1" meter.unit="2" meter.form="invis">
   <staffGrp symbol="brace" bar.thru="true"><staffDef n="1" lines="5" clef.shape="G" clef.line="2"/><staffDef n="2" lines="5" clef.shape="F" clef.line="4"/></staffGrp>
  </scoreDef>
  <section>${compases.join('')}</section>
 </score></mdiv></body></music>
</mei>`;
  }

  /* ---------- audio ---------- */
  const PASO = 1.4;
  function midis(inst){
    const out=[];
    inst.voces[0].forEach((_,k)=>inst.voces.forEach(v=>out.push({midi:K.midi(v[k]), at:k*PASO, dur:PASO*0.95})));
    return out;
  }

  const api = { generarDosVoces, generarCuatroVoces, toMEI, midis, disposicion, colocaciones, consonante, N_DOS, N_CUATRO };
  if (esNode) module.exports = api;
  else global.Disposicion = api;
})(typeof window !== 'undefined' ? window : globalThis);
/* fin del módulo */
