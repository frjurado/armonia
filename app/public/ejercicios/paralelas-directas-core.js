/* ============================================================
   Paralelas y directas — faltas inyectadas (3.º UD 1)
   ------------------------------------------------------------
   Diseño: docs/familias/paralelas-directas.md. Lo común (faltas
   inyectadas, comprobador, pareja resaltada):
   docs/motor-contrapunto.md.
     · Nivel 1: un contrapunto correcto a dos voces (motor de
       contrapunto) con 0–2 5.as u 8.as paralelas (N4) inyectadas.
       Sin directas: a dos voces, N5 no se pregunta.
     · Niveles 2 y 3: una sucesión de Bajo cifrado realizada a
       cuatro voces, con 0–2 faltas (N4 o N5) inyectadas cambiando
       una nota de soprano, contralto o tenor por otra del mismo
       acorde. Nivel 2: las faltas, solo en la pareja resaltada.
   La respuesta la da el comprobador independiente
   (ConduccionCheck); el de 4.º (CuatroVocesCheck) garantiza que,
   fuera de lo inyectado, la realización sigue siendo correcta.
   Partitura y audio: los de movimientos-core.js.
   Sin DOM. Depende de contrapunto-core.js, conduccion-check.js,
   cuatro-voces-core.js, cuatro-voces-check.js,
   bajo-cifrado-core.js, movimientos-core.js y ../tonalidades.js.
   ============================================================ */
(function (global) {
  'use strict';

  const esNode = typeof module !== 'undefined' && module.exports;
  const C   = esNode ? require('./contrapunto-core.js')   : global.Contrapunto;
  const K   = esNode ? require('./conduccion-check.js')   : global.ConduccionCheck;
  const CV  = esNode ? require('./cuatro-voces-core.js')  : global.CuatroVoces;
  const CK  = esNode ? require('./cuatro-voces-check.js') : global.CuatroVocesCheck;
  const BC  = esNode ? require('./bajo-cifrado-core.js')  : global.BajoCifrado;
  const M   = esNode ? require('./movimientos-core.js')   : global.Movimientos;
  const TON = esNode ? require('../tonalidades.js')       : global.TONALIDADES;

  const N = 8, MAX_NIVEL = 3;
  const KEYS = TON.hastaTrimestre(1);
  const ROLES4 = ['soprano','contralto','tenor','bajo'];
  const INICIAL = {soprano:'S', contralto:'A', tenor:'T', bajo:'B'};
  // lo que ha de estar limpio salvo lo inyectado
  const REGLAS = ['N1','N2','N3','N4','N5','N12','N13','N15'];
  const CUANTAS = [[0,0.25],[1,0.45],[2,0.30]];
  // la directa cabe con menos frecuencia: se intenta primero más a menudo
  const TIPOS4 = [['N4',0.4],['N5',0.6]];
  const rnd = a => a[Math.floor(Math.random()*a.length)];
  function sorteo(pares){ let r=Math.random(); for(const [v,p] of pares){ if((r-=p)<0) return v; } return pares[pares.length-1][0]; }
  function elegirPeso(xs){ let r=Math.random()*xs.reduce((s,x)=>s+x.w,0); for(const x of xs){ if((r-=x.w)<0) return x; } return xs[xs.length-1]; }
  const limpia = p => ({letter:p.letter, alter:p.alter, oct:p.oct, abs:p.abs});
  const nota = (abs, alters) => { const p=C.pitchAt(abs, alters); return {letter:p.letter, alter:p.alter, oct:p.oct, abs}; };
  const clave = f => f.regla+'@'+f.evento+'@'+f.voces.join('-');

  // Faltas según el comprobador general (a dos voces, saltos hasta la 5.ª).
  const faltasDe = (voces, roles) => K.comprobar(voces, {roles, reglas:REGLAS, saltoMax: voces.length===2 ? 4 : undefined});

  // Las opciones que dejan exactamente una falta nueva del tipo pedido, en un
  // paso donde no haya otra ni al lado (y, si hay `par`, entre esas dos voces), y sin
  // ninguna falta más de las que vigila `extra` (el comprobador de 4.º).
  function filtrar(pruebas, antes, roles, tipo, par, extra){
    const ya = new Set(antes.map(clave)), pasos = new Set(antes.map(f=>f.evento));
    const ok=[];
    for(const {prueba, w} of pruebas){
      const fs = faltasDe(prueba, roles);
      if(fs.length!==antes.length+1) continue;
      const nuevas = fs.filter(f=>!ya.has(clave(f)));
      if(nuevas.length!==1) continue;
      const f=nuevas[0];
      // ni en el mismo paso que otra ni en uno contiguo (compartirían sonoridad)
      if(f.regla!==tipo || [-1,0,1].some(d=>pasos.has(f.evento+d))) continue;
      if(par && f.voces.join()!==par.join()) continue;
      if(extra && !extra(prueba, fs)) continue;
      ok.push({prueba, w, quinta: f.texto.startsWith('5')});
    }
    if(!ok.length) return null;
    // 5.ª u 8.ª, a partes iguales si caben las dos (las 8.as caben mucho más
    // a menudo y, elegidas sin más, serían casi todas)
    const q = ok.filter(x=>x.quinta), o = ok.filter(x=>!x.quinta);
    const grupo = !q.length ? o : !o.length ? q : (Math.random()<0.5 ? q : o);
    return elegirPeso(grupo).prueba;
  }

  /* ---------- nivel 1: dos voces ---------- */
  function inyectar2(voces, roles, alters){
    const pruebas=[];
    for(let k=1;k<N-1;k++) for(const v of [0,1]) for(let d=-4; d<=4; d++){
      if(!d) continue;
      const prueba = voces.map(x=>x.slice());
      prueba[v][k] = nota(voces[v][k].abs+d, alters);
      if(K.clasificar(prueba[0][k], prueba[1][k], true).clase==='D') continue;   // sigue consonante
      pruebas.push({prueba, w:1/Math.abs(d)});
    }
    // o dos notas seguidas de una voz, a una 5.ª (u 8.ª) de la otra en las dos
    // sonoridades: casi siempre hace falta para las 5.as, porque el motor
    // prefiere 3.as y 6.as y rara vez hay ya una 5.ª al lado
    for(let k=1;k<N-2;k++) for(const v of [0,1]) for(const dist of [4,7]){
      const o=1-v, s = v===0 ? 1 : -1;               // la aguda, por encima de la grave
      const prueba = voces.map(x=>x.slice());
      prueba[v][k]   = nota(voces[o][k].abs+s*dist, alters);
      prueba[v][k+1] = nota(voces[o][k+1].abs+s*dist, alters);
      const cambio = Math.abs(prueba[v][k].abs-voces[v][k].abs)+Math.abs(prueba[v][k+1].abs-voces[v][k+1].abs);
      if(!cambio || cambio>6) continue;
      if([k,k+1].some(s=>K.clasificar(prueba[0][s], prueba[1][s], true).clase==='D')) continue;   // justa, no dism. ni aum.
      pruebas.push({prueba, w:0.5/cambio});
    }
    return filtrar(pruebas, faltasDe(voces, roles), roles, 'N4', null, null);
  }
  // Cuántas faltas se sortea una vez, fuera de los intentos: si no, los que
  // fallan (dos faltas que no caben) sesgarían el reparto hacia menos.
  function generar2(cuantas){
    for(let intento=0; intento<60; intento++){
      const key = rnd(KEYS), par = rnd(M.PAREJAS);
      const res = C.generar({tonalidad:key, pareja:par.voces, nNotas:N});
      if(!res) continue;
      let voces = [res.voces[1], res.voces[0]].map(v=>v.map(limpia));
      if(faltasDe(voces, par.voces).length) continue;
      let puestas=0;
      while(puestas<cuantas){
        const v2 = inyectar2(voces, par.voces, res.alters);
        if(!v2) break;
        voces=v2; puestas++;
      }
      if(puestas<cuantas) continue;
      return instancia(1, key, voces, par.voces, par.pent, [0,1]);
    }
    return null;
  }

  /* ---------- niveles 2 y 3: cuatro voces ---------- */
  function notasDelAcorde(ac, rol){
    const [lo,hi] = K.RANGO[rol], out=[];
    for(const t of ac.tones) for(let o=1;o<=6;o++){
      const abs = CV.absIdx(t.letter, o);
      if(abs>=lo && abs<=hi) out.push({abs, alter:t.alter});
    }
    return out;
  }
  function inyectar4(voces, key, acs, tipo, par){
    const pruebas=[];
    for(let k=1;k<N-1;k++) for(let v=0; v<3; v++) for(const t of notasDelAcorde(acs[k], ROLES4[v])){
      if(t.abs===voces[v][k].abs) continue;
      const prueba = voces.map(x=>x.slice());
      prueba[v][k] = limpia(CV.altura(t.abs, t.alter));
      pruebas.push({prueba, w:1/(1+Math.abs(t.abs-voces[v][k].abs))});
    }
    // fuera de las N4/N5 que da el comprobador general, el de 4.º no ha de
    // encontrar nada (duplicaciones, acorde completo, sensible…)
    const extra = (prueba, fs) => {
      const nuestras = new Set(fs.map(f=>f.regla+'@'+f.evento));
      return CK.comprobar(key, acs, prueba).every(f=>(f.regla==='N4' || f.regla==='N5') && nuestras.has(f.regla+'@'+f.evento));
    };
    return filtrar(pruebas, faltasDe(voces, ROLES4), ROLES4, tipo, par, extra);
  }
  function generar4(nivel, cuantas){
    for(let intento=0; intento<60; intento++){
      const b = BC.generar(3, {n:N});
      if(!b) continue;
      const acs = b.ids.map(id=>CV.acorde(b.key, BC.ACORDES[id]));
      const r = CV.realizar(b.key, acs, {fija:{voz:3, alturas:b.acordes.map(a=>a.bajo)}});
      if(!r) continue;
      let voces = r.voces.map(v=>v.map(limpia));
      if(faltasDe(voces, ROLES4).length || CK.comprobar(b.key, acs, voces).length) continue;
      let puestas=0, par=null;
      while(puestas<cuantas){
        let v2=null;
        for(const tipo of sorteo(TIPOS4)==='N4' ? ['N4','N5'] : ['N5','N4']){
          v2 = inyectar4(voces, b.key, acs, tipo, nivel===2 ? par : null);
          if(v2) break;
        }
        if(!v2) break;
        voces=v2; puestas++;
        // en el nivel 2, la pareja la fija la primera falta
        if(nivel===2 && !par){ const f=faltasDe(voces, ROLES4)[0]; par=f.voces; }
      }
      if(puestas<cuantas) continue;
      const sel = nivel===2 ? (par || rnd([[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]])) : null;
      const inst = instancia(nivel, b.key, voces, ROLES4, 'satb', sel);
      inst.acordes = acs;                                  // para comprobarla entera (tests)
      inst.grados = b.acordes.map(a=>a.romano+(a.cifrasRomano||''));
      return inst;
    }
    return null;
  }

  /* ---------- la instancia y su respuesta ---------- */
  // Rótulo corto: «5.as par.», «8.as par. contr.», «8.ª dir.» y, en una
  // segunda línea, las voces «(S–B)»; a dos voces, sin ellas (se sobreentienden).
  function rotulo(f, roles){
    const vs = roles.length>2 ? '\n('+f.voces.map(v=>INICIAL[roles[v]]).join('–')+')' : '';
    if(f.regla==='N5') return (f.texto.startsWith('5') ? '5.ª' : '8.ª')+' dir.'+vs;
    const cual = f.texto.startsWith('5') ? '5.as' : f.texto.startsWith('uní') ? 'unís.' : '8.as';
    return cual+' par.'+(f.texto.includes('contrario') ? ' contr.' : '')+vs;
  }
  function instancia(nivel, key, voces, roles, pent, sel){
    const faltas = faltasDe(voces, roles).map(f=>({regla:f.regla, paso:f.evento, voces:f.voces, texto:f.texto, rotulo:rotulo(f, roles)}))
      .sort((a,b)=>a.paso-b.paso);
    return { tipo:'armonico', nivel, key, voces, roles: sel ? sel.map(v=>roles[v]) : roles, todas:roles,
             pent, sel, faltas };
  }

  function generar(nivel){
    nivel = Math.max(1, Math.min(MAX_NIVEL, nivel|0));
    const cuantas = sorteo(CUANTAS);
    return (nivel===1 ? generar2(cuantas) : generar4(nivel, cuantas))
        || (nivel===1 ? generar2(0) : generar4(nivel, 0));          // por si acaso
  }

  // Lo que la página dibuja tras el render: bajo cada paso con falta, el
  // rótulo (centrado entre las dos sonoridades) y una raya en cada voz implicada.
  function dibujo(inst){
    const rotulos=[], rayas=[];
    inst.faltas.forEach(f=>{
      const [i,j]=f.voces, k=f.paso;
      rotulos.push({desde:M.idNota(i,k-1), hasta:M.idNota(i,k), texto:f.rotulo, clase:'resp dis'});
      [[i,'voz-sup'],[j,'voz-inf']].forEach(([v,cl])=>rayas.push({de:M.idNota(v,k-1), a:M.idNota(v,k), clase:'resp '+cl}));
    });
    return {rotulos, rayas};
  }

  const api = { generar, dibujo, toMEI:M.toMEI, midis:M.midis, rotulo, N, MAX_NIVEL, REGLAS };
  if (esNode) module.exports = api;
  else global.ParalelasDirectas = api;
})(typeof window !== 'undefined' ? window : globalThis);
/* fin del módulo */
