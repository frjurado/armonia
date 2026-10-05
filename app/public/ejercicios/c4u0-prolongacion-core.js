/* ============================================================
   4.º · Unidad 0 — Prolongación (núcleo compartido)
   ------------------------------------------------------------
   Bajos sin cifrar con progresiones de prolongación (de I o de V,
   por bordadura o por paso, con la regla de la 8.ª) y, según el
   tipo, cadencias. Diseño: docs/familias/prolongacion.md.
   Reglas de escritura: curriculum/Minimos-conduccion.md.
     · TIPOS de extensión: 1 prolongación sola (2–3 cc.), 2 frase
       (prolongación + CA o SC, 4 cc.), 3 periodo (… SC ‖ … CA,
       8 cc.);
     · CÉLULAS (§2): gestos de bajo de 2–3 notas con sus
       lecturas, encadenados por el acorde de unión; ENLACES de la
       prolongación de V a la tónica y CADENCIAS con las casillas de
       la familia Cadencias (§3);
     · RITMO (§5): después de la cadena de acordes, enumerando
       los patrones de compás que cuadran (subordinado en débil);
     · REALIZACIÓN por el motor a cuatro voces, con líneas de
       soprano preferidas por célula y la cláusula de cada cadencia;
     · LECTURAS (§7): el bajo escrito se ANALIZA con la misma
       gramática; de ahí salen las alternativas por nota y la
       guarda de tonalidad única;
     · SALIDA: JSON de Modelo-ejercicios.md §5, MEI (romanos con los subordinados
       entre paréntesis, filas de alternativas, etiqueta por tramo)
       y notas MIDI.
   Depende de cuatro-voces-core.js (CuatroVoces), tonalidades.js
   (TONALIDADES), mini-lilypond-parser.js (MiniLily) y
   c4u0-cadencias-core.js (Cadencias). Sin DOM.
   ============================================================ */
(function (global) {
  'use strict';

  const esNode = typeof module !== 'undefined' && module.exports;
  const CV  = esNode ? require('./cuatro-voces-core') : global.CuatroVoces;
  const TON = esNode ? require('../tonalidades') : global.TONALIDADES;
  const ML  = esNode ? require('./mini-lilypond-parser') : global.MiniLily;
  const CAD = esNode ? require('./c4u0-cadencias-core') : global.Cadencias;

  const rnd = () => Math.random();
  const elige = a => a[Math.floor(rnd()*a.length)];
  function pesado(items){                 // [{x, w}] → x, con probabilidad ∝ w
    const tot=items.reduce((s,i)=>s+i.w,0); let r=rnd()*tot;
    for(const i of items){ r-=i.w; if(r<=0) return i.x; }
    return items[items.length-1].x;
  }

  const MAX_NIVEL = 3;
  const TIPOS = {
    1:{key:'prol',    nombre:'Prolongación', compases:[2,3]},
    2:{key:'frase',   nombre:'Frase',        compases:[4]},
    3:{key:'periodo', nombre:'Periodo',      compases:[4,4]}
  };
  const CADENCIAS = {
    CA:{sigla:'CA', nombre:'Cadencia Auténtica'},
    SC:{sigla:'SC', nombre:'Semicadencia'}
  };

  /* ---------- acordes ---------- */
  const ACORDES = {
    I:{grado:1}, I6:{grado:1,inv:1}, I64:{grado:1,inv:2,cadencial64:true},
    I64b:{grado:1,inv:2,sub64:'bordadura'},
    II:{grado:2}, II6:{grado:2,inv:1}, IV:{grado:4}, IV6:{grado:4,inv:1},
    IV64:{grado:4,inv:2,sub64:'bordadura'},
    V:{grado:5}, V6:{grado:5,inv:1}, V64:{grado:5,inv:2,sub64:'paso'},
    V7:{grado:5,septima:true}, V65:{grado:5,inv:1,septima:true},
    V43:{grado:5,inv:2,septima:true}, V42:{grado:5,inv:3,septima:true},
    VII6:{grado:7,inv:1}
  };
  // Spec del motor. En menor, IV6 solo sale en `paso-V` (⑤–♯⑥–♯⑦): es el IV
  // MAYOR de la melódica ascendente (la PD de la cadencia no usa IV6, §3).
  function spec(id, modo){
    const s=Object.assign({id}, ACORDES[id]);
    if(id==='IV6' && modo==='minor') s.eleva=[6];
    return s;
  }
  const cacheAc = new Map();
  function acordeDe(key, id){
    const k=key.tonic+key.sig+key.mode+'|'+id;
    if(!cacheAc.has(k)) cacheAc.set(k, CV.acorde(key, spec(id, key.mode)));
    return cacheAc.get(k);
  }
  const bajoDeAc = ch => ch.tones[ch.bass];
  const mismoBajo = (ch, nota) => { const b=bajoDeAc(ch); return b.letter===nota.letter && b.alter===nota.alter; };

  /* ---------- células (§2) ---------- */
  // pos: una lista de opciones por posición; la primera y la última son los
  // acordes principales (una sola opción), las de en medio, el subordinado.
  // Opción: [id, nivel desde]. La primera opción de cada posición pesa el doble.
  const CELULAS = [
    {id:'bord-inf',  prol:'I', tecnica:'bordadura inferior', pos:[[['I',1]],[['V6',1],['V65',2]],[['I',1]]], w:3},
    {id:'bord-sup',  prol:'I', tecnica:'bordadura superior', pos:[[['I',1]],[['VII6',1],['V43',2]],[['I',1]]], w:3},
    {id:'bord-3',    prol:'I', tecnica:'bordadura de 3̂ en el bajo', pos:[[['I6',1]],[['IV',1],['V42',2]],[['I6',1]]], w:2},
    {id:'paso-asc',  prol:'I', tecnica:'paso ascendente', pos:[[['I',1]],[['VII6',1],['V43',2],['V64',3]],[['I6',1]]], w:4},
    {id:'paso-desc', prol:'I', tecnica:'paso descendente', pos:[[['I6',1]],[['VII6',1],['V43',2],['V64',3]],[['I',1]]], w:3},
    {id:'salto-143', prol:'I', tecnica:'paso (bajo ①–④–③)', pos:[[['I',1]],[['IV',1],['V42',2]],[['I6',1]]], w:1.5},
    {id:'salto-371', prol:'I', tecnica:'paso (bajo ③–⑦–①)', pos:[[['I6',1]],[['V6',1],['V65',2]],[['I',1]]], w:1.5, soloMayor:true},
    {id:'pedal-IV',  prol:'I', tecnica:'bordadura (6/4)', pos:[[['I',1]],[['IV64',3]],[['I',1]]], w:1.5, desde:3},
    {id:'arp-asc',   prol:'I', tecnica:'arpegio', pos:[[['I',1]],[['I6',1]]], w:1, inversa:'arp-desc'},
    {id:'arp-desc',  prol:'I', tecnica:'arpegio', pos:[[['I6',1]],[['I',1]]], w:1, inversa:'arp-asc'},
    {id:'paso-V',    prol:'V', tecnica:'paso ascendente', pos:[[['V',1]],[['IV6',1]],[['V6',1]]], w:3},
    {id:'bord-V',    prol:'V', tecnica:'bordadura (6/4)', pos:[[['V',1]],[['I64b',3]],[['V',1]]], w:1.5, desde:3},
    {id:'arp-V-asc', prol:'V', tecnica:'arpegio', pos:[[['V',1]],[['V6',1]]], w:1, inversa:'arp-V-desc'},
    {id:'arp-V-desc',prol:'V', tecnica:'arpegio', pos:[[['V6',1]],[['V',1]]], w:1, inversa:'arp-V-asc'},
    // Enlaces de la prolongación de V con la tónica (§3); la llegada es la bisagra.
    {id:'enl-V6',    prol:'V→I', tecnica:'V6 → I', pos:[[['V6',1]],[['I',1]]], w:3},
    {id:'enl-V42',   prol:'V→I', tecnica:'V – V4/2 – I6', pos:[[['V',1]],[['V42',2]],[['I6',1]]], w:2, desde:2}
  ];
  const CEL = {}; CELULAS.forEach(c=>{ CEL[c.id]=c; });
  const esArpegio = c => c.tecnica==='arpegio';
  const disponible = (c, nivel, modo) => (c.desde||1)<=nivel && !(c.soloMayor && modo==='minor');
  const opcionesPos = (c, j, nivel) => c.pos[j].filter(o=>o[1]<=nivel).map(o=>o[0]);
  const inicioDe = c => c.pos[0][0][0];
  const finDe = c => c.pos[c.pos.length-1][0][0];
  // ¿Puede ir la célula c tras la célula previa? (veto de repetición inmediata
  // y de ida y vuelta por arpegio: I–I6–I no prolonga nada)
  const encadena = (prev, c) => !prev || (prev.id!==c.id && prev.inversa!==c.id && finDe(prev)===inicioDe(c));

  // Líneas de soprano preferidas por célula (§6), grados «a>b>c».
  const SOPRANO = {
    'bord-inf':{'1>2>1':3,'3>4>3':3,'5>5>5':2,'3>2>1':2,'1>2>3':2},
    'bord-sup':{'1>7>1':3,'3>4>3':3,'5>4>3':2,'3>2>3':1},
    'bord-3':{'5>6>5':3,'1>7>1':3,'1>1>1':2,'5>5>5':1},
    'paso-asc':{'3>2>1':4,'3>4>5':3,'5>4>3':2},
    'paso-desc':{'1>2>3':4,'5>4>3':3,'3>4>5':2},
    'salto-143':{'3>2>1':2,'5>6>5':2,'1>1>1':1},
    'salto-371':{'1>2>3':2,'5>5>5':2,'3>2>1':2},
    'pedal-IV':{'5>6>5':4,'3>4>3':4,'1>1>1':1},
    'paso-V':{'7>1>2':4,'2>1>2':2,'5>4>5':2},
    'bord-V':{'2>3>2':4,'7>1>7':4}
  };
  const PESO_MAX = 4, SIN_LINEA = 3;
  // Penalización de la soprano `sop` (grados desde el comienzo de la célula
  // hasta el acorde actual): la línea completa al final de la célula; antes,
  // el mejor prefijo que coincide, a la mitad (encamina la búsqueda, que
  // elige nota a nota).
  function penCelula(celId, sop, completa){
    const tabla=SOPRANO[celId]; if(!tabla) return 0;
    let mejor=0;
    for(const linea in tabla){
      const g=linea.split('>').map(Number);
      if(sop.every((d,i)=>g[i]===d) && tabla[linea]>mejor) mejor=tabla[linea];
    }
    const pen = mejor ? PESO_MAX-mejor : SIN_LINEA;
    return completa ? pen : pen/2;
  }

  /* ---------- construcción de la cadena (§2–4q.4) ---------- */
  // Cadena de nCel células de la armonía `prol`; `empieza` fuerza el acorde
  // inicial (o null). → [célula…] o null.
  function cadena(prol, nivel, modo, nCel, empieza){
    const cels=[];
    for(let i=0;i<nCel;i++){
      const prev=cels[cels.length-1];
      const cand=CELULAS.filter(c=>c.prol===prol && disponible(c,nivel,modo) && encadena(prev,c)
        && (i>0 || !empieza || inicioDe(c)===empieza));
      if(!cand.length) return null;
      cels.push(pesado(cand.map(c=>({x:c, w:c.w}))));
    }
    if(cels.every(esArpegio)) return null;
    return cels;
  }
  // Despliega células en eventos (los extremos compartidos, una sola vez).
  // Evento: {id, rol:'P'|'S'|'PD'|'D64'|'D'|'TF', cel:[índices en `celulas`]}
  function desplegar(cels, ev, celulas, nivel){
    cels.forEach(c=>{
      const ci=celulas.length; celulas.push({id:c.id, desde:null, hasta:null});
      c.pos.forEach((_,j)=>{
        if(j===0 && ev.length && celulas.length>1 && ev[ev.length-1].id===inicioDe(c) && ev[ev.length-1].rol==='P'
           && ev[ev.length-1].abierta){
          ev[ev.length-1].cel.push(ci); celulas[ci].desde=ev.length-1; return;
        }
        const ops=opcionesPos(c,j,nivel);
        const id=pesado(ops.map((x,i)=>({x, w:i===0?2:1})));
        const sub = j>0 && j<c.pos.length-1;
        if(j===0) celulas[ci].desde=ev.length;
        ev.push({id, rol: sub?'S':'P', cel:[ci], abierta:false});
      });
      celulas[ci].hasta=ev.length-1;
      ev[ev.length-1].abierta=true;          // la siguiente célula puede compartirlo
    });
  }
  // Cadencia tras la bisagra: PD obligatoria, 6/4 cadencial opcional (nivel ≥ 2),
  // D; y I en la CA. → [{id, rol}] o null si el par bisagra–PD está vetado.
  function cadenciaTras(bisagra, sigla, nivel, modo){
    const pds=CAD.casilla('PD',nivel,modo).filter(x=>x.x!=='IV6' && !CAD.vetada([bisagra,x.x]));
    if(!pds.length) return null;
    const out=[{id:pesado(pds), rol:'PD'}];
    if(nivel>=2 && rnd()<0.5) out.push({id:'I64', rol:'D64'});
    const d = sigla==='SC' ? 'V' : (nivel>=2 ? pesado(CAD.casilla('D',nivel,modo)) : 'V');
    out.push({id:d, rol:'D'});
    if(sigla==='CA') out.push({id:'I', rol:'TF'});
    return out;
  }

  // Una frase: prolongación (de I, o de V + enlace) y, si hay sigla, cadencia.
  // Añade a `est` eventos, células y tramos. `repite` = células a copiar.
  function frase(est, o){
    const {nivel, modo} = o;
    const ini=est.ev.length;
    let cels;
    if(o.repite){ cels=o.repite; }
    else{
      cels=cadena(o.prol, nivel, modo, pesado([{x:1,w:2},{x:2,w:3}]), null);
      if(!cels) return null;
    }
    if(o.prol==='V'){
      const fin=finDe(cels[cels.length-1]);
      if(o.sigla){                                           // enlace V → I
        const enl=CELULAS.filter(c=>c.prol==='V→I' && disponible(c,nivel,modo) && inicioDe(c)===fin);
        if(!enl.length) return null;
        cels=cels.concat([pesado(enl.map(c=>({x:c,w:c.w})))]);
      }
    }
    const c0=est.celulas.length;
    const antes=est.ev.length;
    desplegar(cels, est.ev, est.celulas, nivel);
    // que la frase no comparta acorde con la anterior
    if(antes>0 && est.celulas[c0].desde<antes) return null;
    const nuevas=est.celulas.slice(c0);
    let hastaProl=est.ev.length-1;
    if(o.prol==='V' && o.sigla){
      // el tramo de la prolongación de V llega hasta el enlace; su llegada es la bisagra
      hastaProl=est.ev.length-2;
    }
    est.tramos.push({tipo:'prol', armonia:o.prol, desde:ini, hasta:hastaProl,
      celulas:nuevas.map(c=>c.id)});
    if(!o.sigla) return cels;
    const h=est.ev.length-1;
    const bis=est.ev[h].id;
    if(bis!=='I' && bis!=='I6') return null;
    const cad=cadenciaTras(bis, o.sigla, nivel, modo);
    if(!cad) return null;
    est.ev[h].bisagra=true;
    cad.forEach(x=>est.ev.push({id:x.id, rol:x.rol, cel:[], abierta:false}));
    est.tramos.push({tipo:'cad', sigla:o.sigla, real:o.real, desde:h, hasta:est.ev.length-1});
    return cels;
  }

  // Forma de un tipo (§4), elegida ANTES de los reintentos: si no, las
  // formas con menos combinaciones válidas (la prolongación de V) saldrían
  // mucho menos de lo previsto.
  function elegirForma(tipo){
    if(tipo===1) return {prol: rnd()<0.7 ? 'I' : 'V'};
    if(tipo===2){
      const sigla = rnd()<0.6 ? 'CA' : 'SC';
      return {prol: rnd()<0.75 ? 'I' : 'V', sigla, real: sigla==='SC' ? 'SC' : (rnd()<0.65 ? 'CAP' : 'CAI')};
    }
    const prol2 = rnd()<0.6 ? 'I' : 'V';
    return {prol2, repite: prol2==='I' && rnd()<0.4};
  }
  // Estructura completa de un tipo → {ev, celulas, tramos, frases:[{desde,hasta,compases}]}
  function estructura(tipo, nivel, modo, forma){
    forma = forma || elegirForma(tipo);
    const est={ev:[], celulas:[], tramos:[], frases:[]};
    const o={nivel, modo};
    if(tipo===1){
      const prol = forma.prol;
      if(!frase(est, Object.assign({prol}, o))) return null;
      if(est.ev.length>5) return null;
      est.frases.push({desde:0, hasta:est.ev.length-1, compases:TIPOS[1].compases});
    } else if(tipo===2){
      const {prol, sigla, real} = forma;
      if(!frase(est, Object.assign({prol, sigla, real}, o))) return null;
      est.frases.push({desde:0, hasta:est.ev.length-1, compases:[4]});
    } else {
      const cels1=frase(est, Object.assign({prol:'I', sigla:'SC', real:'SC'}, o));
      if(!cels1) return null;
      const n1=est.ev.length;
      est.frases.push({desde:0, hasta:n1-1, compases:[4]});
      const prol = forma.prol2;
      const repite = forma.repite ? cels1 : null;
      if(!frase(est, Object.assign({prol, sigla:'CA', real:'CAP', repite}, o))) return null;
      if(repite){                                          // mismos acordes que el antecedente
        for(let k=0;k<est.tramos[0].hasta+1;k++) est.ev[n1+k].id=est.ev[k].id;
        est.tramos[2].repite=true;
      }
      est.frases.push({desde:n1, hasta:est.ev.length-1, compases:[4]});
    }
    return est;
  }

  /* ---------- ritmo (§5) ---------- */
  const PATRONES = {
    '4/4':[['1'],['2','2'],['2','4','4']],
    '3/4':[['2.'],['2','4'],['4','2'],['4','4','4']],
    '2/4':[['2'],['4','4']]
  };
  const COMPASES = Object.keys(PATRONES);
  function fuerzas(time, pat){
    let pos=0; return pat.map(d=>{
      const f = pos===0 ? 3 : (time==='4/4' && Math.abs(pos-0.5)<1e-9) ? 2 : 1;
      pos+=ML.durTokenValue(d); return f;
    });
  }
  // Todas las sucesiones de patrones para los eventos [a..b] en B compases.
  // → [{compases:[[dur…]…], w}]
  function ritmosFrase(ev, a, b, B, time){
    const out=[];
    const cad = r => r==='PD'||r==='D64'||r==='D';
    function rec(e, bar, acc, w, prevPat){
      if(bar===B){ if(e===b+1) out.push({compases:acc, w}); return; }
      const quedanBar=B-bar, quedanEv=b+1-e;
      if(quedanEv<quedanBar || quedanEv>quedanBar*3) return;
      PATRONES[time].forEach(pat=>{
        const k=pat.length; if(e+k-1>b) return;
        const fz=fuerzas(time,pat), grupo=ev.slice(e,e+k);
        const ultimoBar = bar===B-1;
        // la llegada: último evento de la frase, en el último compás
        if(ultimoBar !== (e+k-1===b)) return;
        if(ultimoBar){
          const fin=grupo[k-1];
          const ok = k===1 || (k===2 && grupo[0].rol==='D64' && fin.rol==='D');
          if(!ok) return;
        }
        // 1. subordinado nunca en parte fuerte
        if(grupo[0].rol==='S') return;
        // 2. un acorde por compás: la llegada o la D de la cadencia
        if(k===1 && !ultimoBar && grupo[0].rol!=='D') return;
        // 3. tres acordes: solo en el compás de la bisagra o de la cadencia
        if(k===3 && !grupo.some(g=>g.bisagra || cad(g.rol))) return;
        // 4. negra–blanca: el subordinado en la blanca
        let wp = k===2 ? 3 : 1;
        if(pat.join(' ')==='4 2'){
          if(grupo[1].rol!=='S') return;
          wp = prevPat==='2 4' ? 3 : 1;
        }
        // 5. N9: el 6/4 cadencial, en el mismo compás que su V y más fuerte;
        //    en ternario, también 6/4 en el 2.º tiempo y V en el 3.º
        for(let i=0;i<k;i++) if(grupo[i].rol==='D64'){
          if(i===k-1 || !(fz[i]>fz[i+1] || CAD.n9Ternario(time, pat, i))) return;
        }
        rec(e+k, bar+1, acc.concat([pat]), w*wp, pat.join(' '));
      });
    }
    rec(a, 0, [], 1, null);
    return out;
  }
  // Ritmo de toda la estructura: mismo compás en todas las frases.
  function ritmo(est){
    const opciones=[];
    COMPASES.forEach(time=>{
      let parciales=[{compases:[], w:1}];
      for(const f of est.frases){
        const nuevas=[];
        f.compases.forEach(B=>{
          const rs=ritmosFrase(est.ev, f.desde, f.hasta, B, time);
          parciales.forEach(p=>rs.forEach(r=>nuevas.push({compases:p.compases.concat(r.compases), w:p.w*r.w})));
        });
        parciales=nuevas;
        if(!parciales.length) break;
      }
      // muestreo previo por compás, para que cada compás pese lo mismo
      if(parciales.length){
        const r=pesado(parciales.map(p=>({x:p, w:p.w})));
        opciones.push({time, compases:r.compases});
      }
    });
    if(!opciones.length) return null;
    const o=elige(opciones);
    const txt=o.compases.map(c=>c.join(' ')).join(' | ');
    return Object.assign({time:o.time, plantilla:txt}, CAD.leerPlantilla(txt, o.time));
  }

  /* ---------- realización ---------- */
  function acordesDe(key, ev){
    return ev.map((e,k)=>{
      const s=spec(e.id, key.mode);
      if(e.id==='I' && k===ev.length-1 && k>0 && ev[k-1].id==='V7') s.dup={omitir:'5'};
      return CV.acorde(key, s);
    });
  }
  function ganchos(est){
    const n=est.ev.length;
    const celEn=[];    // por índice: células que lo contienen (sin contar su primer acorde)
    est.celulas.forEach(c=>{ for(let k=c.desde+1;k<=c.hasta;k++) (celEn[k]=celEn[k]||[]).push(c); });
    const cadDe=[];    // por índice: el tramo cadencial que lo contiene
    est.tramos.filter(t=>t.tipo==='cad').forEach(t=>{ for(let k=t.desde;k<=t.hasta;k++) cadDe[k]=t; });
    const finales={};
    est.tramos.filter(t=>t.tipo==='cad').forEach(t=>{ finales[t.hasta]=CAD.FINAL[t.real]; });
    return {
      filtro:(path,c,k)=> !finales[k] || finales[k].includes(c.v[0].deg),
      puntuar:(path,c,k)=>{
        const sop=path.map(x=>x.v[0].deg).concat([c.v[0].deg]);
        let pen=0;
        (celEn[k]||[]).forEach(cel=>{ pen+=penCelula(cel.id, sop.slice(cel.desde, k+1), k===cel.hasta); });
        const t=cadDe[k];
        if(t) pen+=CAD.penClausula(t.real, sop.slice(t.desde), k-t.desde, t.hasta-t.desde+1);
        return pen;
      },
      maxNodos: 4000 + 400*n
    };
  }

  /* ---------- lecturas: análisis del bajo (§7) ---------- */
  // Todas las cadenas de células de `prol` que empiezan en i sobre el bajo
  // dado. → [{fin, slots:[[ids]…], cels:[id…]}] (slots desde i hasta fin).
  function cadenasEn(key, nivel, bajo, prol, i, prev, primerId){
    const out=[];
    CELULAS.forEach(c=>{
      if(c.prol!==prol || !disponible(c,nivel,key.mode) || !encadena(prev,c)) return;
      if(!prev && primerId && inicioDe(c)!==primerId) return;
      const L=c.pos.length;
      if(i+L-1>=bajo.length) return;
      const slots=[];
      for(let j=0;j<L;j++){
        const ids=opcionesPos(c,j,nivel).filter(id=>mismoBajo(acordeDe(key,id), bajo[i+j]));
        if(!ids.length) return;
        slots.push(ids);
      }
      const fin=i+L-1;
      const esta={fin, slots, cels:[c.id], soloArp:esArpegio(c)};
      out.push(esta);
      cadenasEn(key, nivel, bajo, prol, fin, c, null).forEach(r=>{
        out.push({fin:r.fin, slots:slots.concat(r.slots.slice(1)), cels:[c.id].concat(r.cels),
                  soloArp:esta.soloArp && r.soloArp});
      });
    });
    return prev ? out : out.filter(r=>!r.soloArp);
  }
  // Cadencia desde la bisagra h: → [{fin, slots}] (slots desde h+1).
  function cadenciasEn(key, nivel, bajo, h, bisagra, sigla){
    const out=[], modo=key.mode;
    const pd=CAD.casilla('PD',nivel,modo).map(x=>x.x)
      .filter(id=>id!=='IV6' && !CAD.vetada([bisagra,id]) && bajo[h+1] && mismoBajo(acordeDe(key,id), bajo[h+1]));
    if(!pd.length) return out;
    const ds = sigla==='SC' ? ['V'] : (nivel>=2 ? CAD.casilla('D',nivel,modo).map(x=>x.x) : ['V']);
    [false,true].forEach(con64=>{
      if(con64 && nivel<2) return;
      let k=h+2; const slots=[pd];
      if(con64){ if(!bajo[k] || !mismoBajo(acordeDe(key,'I64'), bajo[k])) return; slots.push(['I64']); k++; }
      const d=ds.filter(id=>bajo[k] && mismoBajo(acordeDe(key,id), bajo[k]));
      if(!d.length) return; slots.push(d); k++;
      if(sigla==='CA'){ if(!bajo[k] || !mismoBajo(acordeDe(key,'I'), bajo[k])) return; slots.push(['I']); k++; }
      out.push({fin:k-1, slots});
    });
    return out;
  }
  // Frase analizada desde i: prolongación (+ enlace) (+ cadencia) que acaba
  // EXACTAMENTE en `fin`. → [{slots, tramos}]
  function frasesEn(key, nivel, bajo, i, fin, siglas, prols){
    const out=[];
    prols.forEach(prol=>{
      cadenasEn(key, nivel, bajo, prol, i, null, null).forEach(ch=>{
        const tramosProl=[{tipo:'prol', armonia:prol, desde:i, hasta:ch.fin, celulas:ch.cels}];
        if(!siglas){ if(ch.fin===fin) out.push({slots:ch.slots, tramos:tramosProl}); return; }
        let llegadas=[{h:ch.fin, slots:ch.slots, cels:ch.cels}];
        if(prol==='V'){
          const ultima=CEL[ch.cels[ch.cels.length-1]];
          llegadas=CELULAS.filter(c=>c.prol==='V→I' && disponible(c,nivel,key.mode) && inicioDe(c)===finDe(ultima))
            .map(c=>{
              const L=c.pos.length; const sl=[];
              for(let j=1;j<L;j++){
                const ids=opcionesPos(c,j,nivel).filter(id=>bajo[ch.fin+j] && mismoBajo(acordeDe(key,id), bajo[ch.fin+j]));
                if(!ids.length) return null;
                sl.push(ids);
              }
              return {h:ch.fin+L-1, slots:ch.slots.concat(sl), cels:ch.cels.concat([c.id])};
            }).filter(Boolean);
        }
        llegadas.forEach(ll=>{
          const bis=ll.slots[ll.slots.length-1];
          if(bis.length!==1 || (bis[0]!=='I' && bis[0]!=='I6')) return;
          siglas.forEach(sigla=>cadenciasEn(key, nivel, bajo, ll.h, bis[0], sigla).forEach(cd=>{
            if(cd.fin!==fin) return;
            const hp = prol==='V' ? ll.h-1 : ll.h;
            out.push({slots:ll.slots.concat(cd.slots), tramos:[
              {tipo:'prol', armonia:prol, desde:i, hasta:hp, celulas:ll.cels},
              {tipo:'cad', sigla, desde:ll.h, hasta:fin}]});
          }));
        });
      });
    });
    return out;
  }
  // Veto (§2): dentro de UNA prolongación, ningún par de notas del bajo se
  // repite inmediatamente (①–②–①–②–③, ③–⑦–①–⑦–①…). Entre procedimientos
  // distintos (el IV de la prolongación y el de la cadencia) sí se admite.
  const mismaNota = (a,b) => a.letter===b.letter && a.alter===b.alter;
  function parRepetido(bajo, tramos){
    return tramos.some(t=>{
      if(t.tipo!=='prol') return false;
      for(let k=t.desde;k+3<=t.hasta;k++)
        if(mismaNota(bajo[k],bajo[k+2]) && mismaNota(bajo[k+1],bajo[k+3])) return true;
      return false;
    });
  }
  // Todos los análisis del bajo (notas {letter, alter}) según el tipo.
  function analizar(key, nivel, tipo, bajo){
    return analisisSinVeto(key, nivel, tipo, bajo).filter(a=>!parRepetido(bajo, a.tramos));
  }
  function analisisSinVeto(key, nivel, tipo, bajo){
    const n=bajo.length;
    if(tipo===1) return frasesEn(key, nivel, bajo, 0, n-1, null, ['I','V']);
    if(tipo===2) return frasesEn(key, nivel, bajo, 0, n-1, ['CA','SC'], ['I','V']);
    const out=[];
    for(let m=3;m<n-3;m++){
      const a=frasesEn(key, nivel, bajo, 0, m, ['SC'], ['I']);
      if(!a.length) continue;
      const b=frasesEn(key, nivel, bajo, m+1, n-1, ['CA'], ['I','V']);
      a.forEach(x=>b.forEach(y=>out.push({slots:x.slots.concat(y.slots), tramos:x.tramos.concat(y.tramos)})));
    }
    return out;
  }
  const clave = tramos => tramos.map(t=>t.tipo+(t.armonia||t.sigla)+t.desde+'-'+t.hasta).join(' ');

  // Tonalidad relativa (misma armadura, otro modo)
  const relativas = key => TON.TODAS.filter(k=>k.sig===key.sig && k.mode!==key.mode);
  // Tonalidades por nivel (§8): 1, solo mayores de 3.º; 2, las 12 de 3.º; 3, 16.
  function tonalidades(nivel){
    const t=TON.hastaTrimestre(nivel>=3 ? 4 : 3);
    return nivel===1 ? t.filter(k=>k.mode==='major') : t;
  }

  /* ---------- generación ---------- */
  const CLAVES = ['treble','treble','bass','bass'];
  function musica(voz, r){
    return r.compases.map(m=>m.map(x=>CV.token(voz[x.k])+x.dur).join(' ')).join(' | ');
  }
  const ROM = (key,id) => acordeDe(key,id).romano;
  function etiquetaTramo(t){
    return t.tipo==='prol' ? 'Prol. '+t.armonia : CADENCIAS[t.sigla].sigla;
  }

  // generar(tipo, nivel) → instancia (o null)
  function generar(tipo, nivel, opts){
    opts=opts||{};
    tipo=Math.max(1,Math.min(3,tipo|0));
    nivel=Math.max(1,Math.min(MAX_NIVEL,nivel|0));
    const keys=opts.key ? [opts.key] : tonalidades(nivel);
    let forma=null;
    for(let intento=0;intento<300;intento++){
      if(intento%100===0) forma=elegirForma(tipo);        // se cambia solo si no sale
      const key=elige(keys);
      const est=estructura(tipo, nivel, key.mode, forma);
      if(!est) continue;
      const r=ritmo(est);
      if(!r) continue;
      const bajo=est.ev.map(e=>bajoDeAc(acordeDe(key,e.id)));
      if(parRepetido(bajo, est.tramos)) continue;
      // Lecturas y guarda de tonalidad (tipos 2 y 3)
      const analisis=analizar(key, nivel, tipo, bajo);
      if(tipo>1 && relativas(key).some(rel=>{
        const b=bajo;                                         // mismas notas escritas
        return analizar(rel, nivel, tipo, b).length>0;
      })) continue;
      const acordes=acordesDe(key, est.ev);
      const real=CV.realizar(key, acordes, ganchos(est));
      if(!real) continue;
      const ids=est.ev.map(e=>e.id);
      const alternativas=ids.map((id,k)=>{
        const s=new Set(); analisis.forEach(a=>a.slots[k].forEach(x=>{ if(x!==id) s.add(x); }));
        return [...s];
      });
      const segmentaciones=new Set(analisis.map(a=>clave(a.tramos))).size;
      const inst={ tipo, nivel, key, est, ids, acordes, voces:real.voces, ritmo:r, pen:real.pen,
                   alternativas, analisis, segmentaciones };
      inst.json=json(inst);
      return inst;
    }
    return null;
  }

  function resumen(inst){
    const partes=inst.est.frases.map(f=>inst.est.tramos.filter(t=>t.desde>=f.desde && t.hasta<=f.hasta)
      .map(etiquetaTramo).join(' + '));
    return partes.join(' ‖ ');
  }
  // Compás (1…) de un evento
  function compasDe(inst, k){ return inst.ritmo.compases.findIndex(m=>m.some(x=>x.k===k))+1; }
  function detalleTramo(inst, t){
    const c1=compasDe(inst,t.desde), c2=compasDe(inst,t.hasta);
    const cc = c1===c2 ? 'c. '+c1 : 'cc. '+c1+'–'+c2;
    if(t.tipo==='cad') return {compases:cc, texto:CADENCIAS[t.sigla].nombre
      + (t.sigla==='CA' ? ' (aquí, '+(t.real||'CAP')+')' : '')};
    const tecnicas=t.celulas.map(id=>CEL[id].tecnica);
    return {compases:cc, texto:'Prolongación de '+t.armonia+': '+tecnicas.join('; ')
      + (t.repite ? ' (como en el antecedente)' : '')};
  }
  function json(inst){
    const {key, ritmo:r}=inst;
    return {
      family:'prolongacion', tipo:TIPOS[inst.tipo].key, level:inst.nivel,
      context:{ key:{tonic:key.tonic, mode:key.mode, sig:key.sig}, time:r.time, partial:null },
      voices: inst.voces.map((v,i)=>({clef:CLAVES[i], music:musica(v,r)})),
      prompt: inst.tipo===1
        ? '¿Qué acordes lleva este bajo? ¿Qué armonía se prolonga, y cómo?'
        : '¿En qué tonalidad estás? ¿Qué acordes lleva el bajo? ¿Dónde se prolonga y dónde está la cadencia?',
      answer:{
        tonalidad:key.nombre, resumen:resumen(inst),
        tramos:inst.est.tramos.map(t=>Object.assign({etiqueta:etiquetaTramo(t)}, detalleTramo(inst,t))),
        acordes:inst.acordes.map((a,k)=>({id:a.id, romano:a.romano, cifras:a.cifras, americano:a.americano,
          subordinado: inst.est.ev[k].rol==='S',
          alternativas: inst.alternativas[k].map(id=>ROM(key,id))}))
      }
    };
  }

  /* ---------- MEI ---------- */
  const accMap={1:'s',0:'n','-1':'f',2:'x','-2':'ff'};
  const clefAttr = c => c==='bass' ? 'clef.shape="F" clef.line="4"' : 'clef.shape="G" clef.line="2"';
  const durAttrs = d => { const m=/^(\d+)(\.*)$/.exec(d); return `dur="${m[1]}"`+(m[2].length?` dots="${m[2].length}"`:''); };
  const sigStr = sig => sig===0 ? '0' : Math.abs(sig)+(sig>0?'s':'f');
  const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
  const VO_ALT = -1.5;

  // toMEI(inst, {cifrados, ocultas, dato, tramos, saltoFrase}):
  //   cifrados: americano encima, romanos debajo (subordinados entre
  //     paréntesis) y filas de alternativas (n="2", "3"…, type="alt");
  //   ocultas: índices de voz como <space> (Bajo: [0,1,2]);
  //   dato: texto sobre el primer tiempo (<reh type="dato">, ver Cadencias);
  //   tramos: etiqueta de cada tramo sobre su primer acorde, como <reh
  //     type="tramo" xml:id="tramo{i}"> (el id lo usa la página para dibujar
  //     el corchete hasta el final del tramo, ArmoniaEj.corchetesTramo).
  //     Orden de arriba abajo: tonalidad (todo el ejercicio), tramo (una
  //     parte), americano (un acorde). <reh> es lo único que Verovio sube por
  //     encima de los <harm>; entre dos <reh>, el que se escribe DESPUÉS queda
  //     más arriba: por eso el dato va al final del compás.
  //   saltoFrase: salto de sistema entre las frases del periodo (<sb/>).
  // El americano va en segundo plano (type="americano", más pequeño): aquí es
  // información añadida, no lo que se pregunta.
  function toMEI(inst, opts){
    opts=opts||{};
    const ocultas=opts.ocultas||[];
    const key=inst.key;
    const sig=CV.keysigAlters(key.sig);
    const [num,den]=inst.ritmo.time.split('/');
    const nota=(p,x,id)=>{
      if(ocultas.includes(id.v)) return `<space ${durAttrs(x.dur)}/>`;
      const acc = p.alter!==sig[p.letter] ? ` accid="${accMap[p.alter]}"` : '';
      return `<note xml:id="${id.pre}${x.k}" ${durAttrs(x.dur)} pname="${p.letter.toLowerCase()}" oct="${p.oct}"${acc}/>`;
    };
    const capa=(v,m,pre)=>`<layer n="${v%2+1}">${m.map(x=>nota(inst.voces[v][x.k],x,{v,pre})).join('')}</layer>`;
    const romanoXml=(a, paren)=>{
      const figs=a.cifras ? a.cifras.split('/') : [];
      return `<rend>${paren?'(':''}${a.romano.replace(a.cifras,'')}</rend>`+
        figs.map((f,i)=>`<rend rend="${i===0?'sup':'sub'}">${f}</rend>`).join('')+(paren?'<rend>)</rend>':'');
    };
    const inicioTramo={};
    (opts.tramos ? inst.est.tramos : []).forEach((t,i)=>{ (inicioTramo[t.desde]=inicioTramo[t.desde]||[]).push({i, txt:etiquetaTramo(t)}); });
    const n1 = inst.est.frases.length>1 ? inst.est.frases[0].hasta : null;
    const measures=inst.ritmo.compases.map((m,i)=>{
      const last = i===inst.ritmo.compases.length-1;
      let harms = '';
      m.forEach(x=>{
        (inicioTramo[x.k]||[]).forEach(e=>{
          const ancla = ocultas.includes(0) ? `staff="2" startid="#b${x.k}"` : `staff="1" startid="#s${x.k}"`;
          harms += `<reh xml:id="tramo${e.i}" place="above" ${ancla} type="tramo">${esc(e.txt)}</reh>`;
        });
        if(!opts.cifrados) return;
        const a=inst.acordes[x.k], sub=inst.est.ev[x.k].rol==='S';
        const am=`type="americano"><rend fontsize="80%">${esc(a.americano)}</rend>`;
        const arriba = ocultas.includes(0)
          ? `<harm place="above" staff="2" startid="#b${x.k}" ${am}</harm>`
          : `<harm place="above" staff="1" startid="#s${x.k}" ${am}</harm>`;
        harms += arriba + `<harm place="below" staff="2" startid="#b${x.k}" n="1">${romanoXml(a, sub)}</harm>`;
        (inst.alternativas[x.k]||[]).forEach((id,j)=>{
          harms += `<harm place="below" staff="2" startid="#b${x.k}" n="${j+2}" type="alt" vo="${VO_ALT}">`
                 + romanoXml(acordeDe(key,id), sub)+`</harm>`;
        });
      });
      if(i===0 && opts.dato) harms += `<reh place="above" staff="1" tstamp="1" type="dato">${esc(opts.dato)}</reh>`;
      // salto de sistema al empezar el consecuente del periodo
      const sb = (opts.saltoFrase && n1!==null && m[0].k===n1+1) ? '<sb/>' : '';
      return sb + `<measure n="${i+1}"${last ? ' right="end"' : ''}>`
        + `<staff n="1">${capa(0,m,'s')}${capa(1,m,'a')}</staff>`
        + `<staff n="2">${capa(2,m,'t')}${capa(3,m,'b')}</staff>${harms}</measure>`;
    }).join('\n   ');
    return `<?xml version="1.0" encoding="UTF-8"?>
<mei xmlns="http://www.music-encoding.org/ns/mei" meiversion="4.0.0">
 <music><body><mdiv><score>
  <scoreDef keysig="${sigStr(key.sig)}" meter.count="${num}" meter.unit="${den}">
   <staffGrp symbol="brace" bar.thru="true"><staffDef n="1" lines="5" ${clefAttr('treble')}/><staffDef n="2" lines="5" ${clefAttr('bass')}/></staffGrp>
  </scoreDef>
  <section>
   ${measures}
  </section>
 </score></mdiv></body></music>
</mei>`;
  }

  /* ---------- audio ---------- */
  const NEGRA_S = 0.6;
  function midis(inst, opts){
    const vs=(opts&&opts.voces)||[0,1,2,3];
    const out=[]; let t=0;
    inst.ritmo.durs.forEach((d,k)=>{
      const seg=ML.durTokenValue(d)*4*NEGRA_S;
      vs.forEach(v=>out.push({midi:inst.voces[v][k].midi, at:t, dur:seg*0.95}));
      t+=seg;
    });
    return out;
  }

  const NIVELES = [
    'Solo tríadas: V6, VII6 e IV como acordes de bordadura o de paso; cadencias con IV o II6 y V; tonalidades mayores.',
    'Añade las inversiones de V7 (V6/5, V4/3, V4/2), V7 y el 6/4 cadencial en la cadencia, y el modo menor (con ♯6̂ al subir de 5̂ a 7̂).',
    'Añade los 6/4 de paso (V6/4) y de bordadura (IV6/4 sobre I, I6/4 sobre V); 16 tonalidades.'
  ];

  const api = {
    generar, toMEI, midis, MAX_NIVEL, NIVELES, TIPOS, CADENCIAS,
    // gramática y análisis (para pruebas)
    CELULAS, CEL, SOPRANO, parRepetido, estructura, ritmo, ritmosFrase, analizar, acordeDe, acordesDe, ganchos,
    tonalidades, relativas, resumen, etiquetaTramo, spec
  };
  if (esNode) module.exports = api;
  else global.Prolongacion = api;
})(typeof window !== 'undefined' ? window : globalThis);
/* fin del módulo */
