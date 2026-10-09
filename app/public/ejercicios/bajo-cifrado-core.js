/* ============================================================
   3.º · Unidad 1 — Morfología: núcleo de la familia
   ------------------------------------------------------------
   Variante «Bajo cifrado» (docs/familias/bajo-cifrado.md):
   un bajo breve (5–6 notas) con su cifrado, solo tríadas en estado
   fundamental, 1.ª y 2.ª inversión. Se piden el grado del bajo (en
   círculo, encima) y el acorde (romano, debajo, junto al cifrado).
   Al revelar, además, cada acorde en clave de Sol (posición
   cerrada, estado fundamental) y su cifrado americano.

   · El bajo se GENERA, no se escribe: una gramática de sucesiones
     armónicas (qué grado puede seguir a cuál) y las normas
     melódicas del bajo, en búsqueda en profundidad con orden
     aleatorio ponderado. Empieza en I o I6 y acaba en I (tras V)
     o en V. El 6/4, solo cadencial o de paso.
   · El modelo de acorde (romano, cifras, americano) es el de
     cuatro-voces-core.js (`CuatroVoces.acorde`): mismo dibujo que
     en 4.º. La menor, estrictamente armónica: sin III (sería III+).
   · Sin DOM: generación, MEI y MIDI. Global `BajoCifrado`.
   ============================================================ */
(function (global) {
  'use strict';
  const esNode = typeof module !== 'undefined' && module.exports;
  const CV  = esNode ? require('./cuatro-voces-core.js') : global.CuatroVoces;
  const TON = esNode ? require('../tonalidades.js')      : global.TONALIDADES;

  const rnd = n => Math.floor(Math.random()*n);
  function pesado(items){                 // [{x, w}] → x, con probabilidad ∝ w
    let t=items.reduce((s,i)=>s+i.w,0), r=Math.random()*t;
    for(const i of items){ r-=i.w; if(r<0) return i.x; }
    return items[items.length-1].x;
  }
  // Barajado ponderado: orden aleatorio en que los de más peso tienden a ir antes.
  function barajaPesada(items){
    return items.map(i=>({i, k:Math.pow(Math.random(), 1/i.w)}))
                .sort((a,b)=>b.k-a.k).map(o=>o.i);
  }

  /* ---------- catálogo de acordes ---------- */
  // id → {grado, inv, uso}. uso: 'cad' (6/4 cadencial), 'paso' (6/4 de paso).
  const ACORDES = {
    'I':{grado:1,inv:0}, 'I6':{grado:1,inv:1},
    'II':{grado:2,inv:0}, 'II6':{grado:2,inv:1},
    'III':{grado:3,inv:0},
    'IV':{grado:4,inv:0}, 'IV6':{grado:4,inv:1},
    'V':{grado:5,inv:0}, 'V6':{grado:5,inv:1},
    'VI':{grado:6,inv:0},
    'VII6':{grado:7,inv:1},
    'I64c':{grado:1,inv:2,uso:'cad'},
    'V64p':{grado:5,inv:2,uso:'paso'},
    'I64p':{grado:1,inv:2,uso:'paso'}
  };
  // Disponibles por modo. Fuera: VII en estado fundamental (disminuido), y
  // en menor el II en fundamental (disminuido) y el III (aumentado en la
  // armónica).
  const EN_MAYOR = Object.keys(ACORDES);
  const EN_MENOR = EN_MAYOR.filter(id => id!=='II' && id!=='III');

  // Gramática: a qué puede ir cada acorde, con su peso. Las sucesiones son
  // las habituales (Kostka-Payne, Pascual-Diego T. 7): por 5.ª descendente,
  // 2.ª ascendente, 3.ª descendente; nada de V → IV ni de V → II.
  // Los 6/4 de paso exigen además que el bajo pase por grado conjunto en la
  // misma dirección (lo comprueba `pasoValido`).
  const SIGUE = {
    'I':   {'I6':1, 'IV':2.5, 'IV6':1.2, 'II':1, 'II6':1.5, 'VI':1.5, 'V':2, 'V6':1.5, 'VII6':0.8, 'III':0.4, 'V64p':1.2},
    'I6':  {'I':0.8, 'IV':2.5, 'II':1, 'II6':1.2, 'V':2, 'V6':0.6, 'VII6':0.6, 'V64p':1.2},
    'II':  {'V':3, 'V6':1, 'I64c':2, 'VII6':0.6},
    'II6': {'V':3, 'I64c':2.5, 'VII6':0.6},
    'III': {'VI':3, 'IV':1.5},
    'IV':  {'V':2.5, 'V6':1, 'I64c':2, 'II':0.8, 'II6':1.2, 'I':0.8, 'IV6':0.6, 'VII6':0.4, 'I64p':1},
    'IV6': {'V':2.5, 'IV':0.6, 'I64c':1.2, 'II6':0.6, 'I64p':1},
    'V':   {'I':4, 'I6':1, 'VI':1.5, 'V6':0.6},
    'V6':  {'I':4, 'V':0.4},
    'VI':  {'II':1.5, 'II6':2, 'IV':2.5, 'IV6':1, 'V':0.8},
    'VII6':{'I':2, 'I6':2},
    'I64c':{'V':1},
    'V64p':{'I':1, 'I6':1},
    'I64p':{'IV':1, 'IV6':1}
  };
  const familiaDe = id => ACORDES[id].grado;
  // Cambio de acorde sobre el bajo repetido (5/3 → 6).
  const REPITE = {'IV':'II6', 'VI':'IV6'};
  // Penúltimo acorde cuando se acaba en V.
  const PRE_SC = ['II','II6','IV','IV6','I64c'];
  // 6/4 de paso: entre dos acordes de la misma función, con el bajo por
  // grado conjunto en la misma dirección (①–②–③, ③–②–①; ④–⑤–⑥, ⑥–⑤–④).
  const ENTRE = {'V64p':1, 'I64p':4};

  /* ---------- tonalidades y niveles ---------- */
  const MAX_NIVEL = 2;
  function tonalidades(nivel){
    const t=TON.delTrimestre(1);
    return nivel>=2 ? t : t.filter(k=>k.mode==='major');
  }

  /* ---------- bajo: alturas y normas melódicas ---------- */
  const RANGO = [CV.absIdx('E',2), CV.absIdx('C',4)];   // una línea adicional por cada lado
  // Altura del bajo de un acorde en la octava de índice diatónico `abs`.
  function bajoDe(key, ch, abs){
    const t=ch.tones[ch.inv];
    return CV.altura(abs, t.alter, {deg:t.deg});
  }
  // Las alturas posibles del bajo de `ch` dentro del rango.
  function alturasPosibles(key, ch){
    const t=ch.tones[ch.inv], out=[];
    for(let oct=1; oct<=4; oct++){
      const abs=CV.absIdx(t.letter, oct);
      if(abs>=RANGO[0] && abs<=RANGO[1]) out.push(bajoDe(key, ch, abs));
    }
    return out;
  }
  // Intervalo melódico admitido: 2.ª, 3.ª, 4.ª y 5.ª justas, 6.ª menor y 8.ª
  // justa; nunca aumentados, disminuidos, 7.ª ni 6.ª mayor. Devuelve los
  // pasos diatónicos con signo, o null.
  function intervaloValido(p, q){
    const d=q.abs-p.abs, s=q.midi-p.midi, ad=Math.abs(d), as=Math.abs(s);
    const ok = (ad===0 && as===0) || (ad===1 && (as===1||as===2)) || (ad===2 && (as===3||as===4))
      || (ad===3 && as===5) || (ad===4 && as===7) || (ad===5 && as===8) || (ad===7 && as===12);
    return ok ? d : null;
  }
  // Normas del bajo al añadir la nota `q` (acorde `idQ`) a la línea `ps`
  // (con sus ids). Devuelve true si se admite.
  function melodiaValida(ps, ids, q, idQ){
    const n=ps.length;
    if(!n) return true;
    const p=ps[n-1], d=intervaloValido(p, q);
    if(d===null) return false;
    // mismo grado seguido: siempre nota repetida, nunca a la 8.ª. Solo en
    // 6/4 cadencial → V (que la exige) y en el cambio de acorde sobre el
    // mismo bajo, 5/3 → 6 (IV → II6, VI → IV6)
    if(q.deg===p.deg && d!==0) return false;
    if((d===0) !== (ids[n-1]==='I64c' || REPITE[ids[n-1]]===idQ)) return false;
    // la sensible del bajo sube a la tónica
    if(p.deg===7 && !(d===1 && q.deg===1)) return false;
    if(n>=2){
      const d0=ps[n-1].abs-ps[n-2].abs;
      // tras un salto de 4.ª o mayor, cambio de dirección
      if(Math.abs(d0)>=3 && d!==0 && Math.sign(d)===Math.sign(d0)) return false;
      // dos saltos seguidos en la misma dirección: solo 3.ª + 3.ª (arpegio de 5.ª)
      if(Math.abs(d0)>=2 && Math.abs(d)>=2 && Math.sign(d)===Math.sign(d0)
         && !(Math.abs(d0)===2 && Math.abs(d)===2)) return false;
      // tres notas: el marco no puede ser aumentado ni disminuido (p. ej.
      // ④–⑤–⑦ no: 4.ª aum.; ⑦–②–④ no: 5.ª dism.)
      if(d!==0 && d0!==0 && intervaloValido(ps[n-2], q)===null && Math.abs(q.abs-ps[n-2].abs)<=7
         && Math.sign(d)===Math.sign(d0)) return false;
    }
    return true;
  }
  // 6/4 de paso: el anterior y el siguiente, de la función que prolonga, y
  // el bajo por grado conjunto en la misma dirección.
  function pasoValido(ids, ps, k){
    const id=ids[k];
    if(!ENTRE[id]) return true;
    if(k===0 || k===ids.length-1) return false;
    const g=ENTRE[id];
    if(familiaDe(ids[k-1])!==g || familiaDe(ids[k+1])!==g) return false;
    if(ids[k-1]===ids[k+1]) return false;                  // I–V64–I6, no I–V64–I
    const a=ps[k].abs-ps[k-1].abs, b=ps[k+1].abs-ps[k].abs;
    return Math.abs(a)===1 && a===b;
  }
  // Peso de un intervalo melódico (preferencia por el grado conjunto).
  const PESO_INTERVALO = d => ({0:1, 1:3, 2:2, 3:1.2, 4:1, 5:0.4, 7:0.25})[Math.abs(d)] || 0.1;

  /* ---------- generación ---------- */
  // generar(nivel, {key, n}) → instancia, o null si la búsqueda no da con nada
  function generar(nivel, opts){
    opts=opts||{};
    for(let intento=0; intento<60; intento++){
      const key = opts.key || tonalidades(nivel)[rnd(tonalidades(nivel).length)];
      const n = opts.n || (5 + rnd(2));
      const finV = opts.fin ? opts.fin==='V' : Math.random()<0.35;
      const r = buscar(key, n, finV);
      if(r) return construir(nivel, key, r.ids, r.ps);
      if(opts.key && opts.n && intento>20) return null;
    }
    return null;
  }

  function buscar(key, n, finV){
    const disp = key.mode==='minor' ? EN_MENOR : EN_MAYOR;
    const ch = {}; disp.forEach(id => ch[id]=CV.acorde(key, ACORDES[id]));
    const ids=[], ps=[];
    let pasos=0;
    function candidatos(k){
      let opc;
      if(k===0) opc=[{x:'I',w:3},{x:'I6',w:1}];
      else opc=Object.entries(SIGUE[ids[k-1]]).filter(([id])=>disp.includes(id)).map(([x,w])=>({x,w}));
      // final: …V–I, o semicadencia desde un predominante o el 6/4 cadencial
      if(k===n-1) opc=opc.filter(o => finV ? o.x==='V' : (o.x==='I' && ids[k-1]==='V'));
      if(k===n-2) opc=opc.filter(o => finV ? PRE_SC.includes(o.x) : o.x==='V');
      // tres seguidos del mismo grado, no (I–I6–I); el mismo acorde dos veces, tampoco
      if(k>=1) opc=opc.filter(o => o.x!==ids[k-1]);
      if(k>=2) opc=opc.filter(o => !(familiaDe(o.x)===familiaDe(ids[k-1]) && familiaDe(o.x)===familiaDe(ids[k-2])));
      // ni el mismo par dos veces seguidas (I6–V–I6–V)
      if(k>=3) opc=opc.filter(o => !(o.x===ids[k-2] && ids[k-1]===ids[k-3]));
      // el mismo 6/4 una sola vez
      opc=opc.filter(o => ACORDES[o.x].inv<2 || !ids.includes(o.x));
      const out=[];
      opc.forEach(o => alturasPosibles(key, ch[o.x]).forEach(q => {
        const d = k ? q.abs-ps[k-1].abs : 0;
        // primera nota: centrada en el pentagrama (Sol2–Re3 para ①/③)
        const w0 = k ? PESO_INTERVALO(d) : (q.abs>=CV.absIdx('G',2) && q.abs<=CV.absIdx('E',3) ? 1 : 0.15);
        out.push({x:{id:o.x, q}, w:o.w*w0});
      }));
      return barajaPesada(out).map(o=>o.x);
    }
    function dfs(k){
      if(++pasos>4000) return false;
      if(k===n) return true;
      for(const c of candidatos(k)){
        if(!melodiaValida(ps, ids, c.q, c.id)) continue;
        ids.push(c.id); ps.push(c.q);
        // los 6/4 de paso se validan al llegar el acorde siguiente
        const okPaso = k<1 || pasoValido(ids, ps, k-1);
        if(okPaso && dfs(k+1)) return true;
        ids.pop(); ps.pop();
      }
      return false;
    }
    if(!dfs(0)) return null;
    // al menos una inversión; si no, se repite
    if(!ids.some(id => ACORDES[id].inv>0)) return null;
    return {ids, ps};
  }

  /* ---------- cifrado del bajo ---------- */
  // Cifras de arriba abajo. En menor, la sensible lleva su alteración: sola
  // si es la 3.ª sobre el bajo (♯), delante de la cifra si es la 6.ª (♯6);
  // si la sensible está en el bajo, la lleva la nota y no el cifrado. El V
  // tras el 6/4 cadencial se cifra 5/3, como se lee la resolución.
  function cifrasDe(key, a, idPrev){
    let f = a.inv===0 ? [] : a.inv===1 ? ['6'] : ['6','4'];
    if(idPrev==='I64c' && a.grado===5 && a.inv===0) f=['5','3'];
    if(key.mode==='minor'){
      const sig=CV.keysigAlters(key.sig);
      a.tones.forEach((t,i)=>{
        if(t.deg!==7 || i===a.inv) return;
        const acc = t.alter===sig[t.letter] ? null : (t.alter===0 ? '♮' : CV.SYM(t.alter));
        if(!acc) return;
        const sobre = (i - a.inv + 3) % 3;               // 1 = 3.ª sobre el bajo, 2 = 5.ª (inv 0) o 6.ª
        const intervalo = a.inv===0 ? (sobre===1 ? '3' : '5') : a.inv===1 ? (sobre===1 ? '3' : '6') : (sobre===1 ? '4' : '6');
        if(intervalo==='3'){
          const j=f.indexOf('3');
          if(j>=0) f[j]=acc; else f.push(acc);
        } else {
          const j=f.indexOf(intervalo);
          if(j>=0) f[j]=acc+intervalo; else f.unshift(acc+intervalo);
        }
      });
    }
    return f;
  }

  // Grado del bajo como texto: alteración (si la nota no es la de la
  // armadura) + cifra. El círculo lo dibuja la página.
  function gradoBajoDe(key, p){
    const sig=CV.keysigAlters(key.sig);
    const acc = p.alter===sig[p.letter] ? '' : (p.alter===0 ? '♮' : CV.SYM(p.alter));
    return {acc, num:String(p.deg)};
  }
  const CIRCULO = ['①','②','③','④','⑤','⑥','⑦'];

  // Acorde en clave de Sol: estado fundamental, posición cerrada, con la
  // fundamental entre Mi4 y Re5.
  function acordeAgudo(a){
    const r=a.tones[0];
    let abs=CV.absIdx(r.letter, 4);
    if(abs<CV.absIdx('E',4)) abs+=7;
    return a.tones.map((t,i)=>CV.altura(abs+2*i, t.alter));
  }

  function construir(nivel, key, ids, ps){
    const acordes = ids.map((id,k)=>{
      const a=CV.acorde(key, ACORDES[id]);
      const g=gradoBajoDe(key, ps[k]);
      return {
        id, grado:a.grado, inv:a.inv, uso:ACORDES[id].uso||null,
        romano:a.romano.replace(a.cifras,''), cifrasRomano:a.cifras,
        cifras:cifrasDe(key, a, ids[k-1]), americano:a.americano,
        bajo:ps[k], gradoBajo:g, agudo:acordeAgudo(a)
      };
    });
    const usos = acordes.map((a,k)=>a.uso ? {k, uso:a.uso} : null).filter(Boolean);
    return {
      nivel, key, ids, acordes,
      json:{
        familia:'bajo-cifrado', variante:'lectura', nivel,
        context:{key:key.nombre, clefs:['treble','bass']},
        voices:[{clef:'bass', music:ps.map(p=>CV.token(p)+'1').join(' ')}],
        answer:{
          tonalidad:key.nombre,
          gradosBajo:acordes.map(a=>a.gradoBajo.acc+CIRCULO[+a.gradoBajo.num-1]),
          acordes:acordes.map(a=>a.romano+(a.cifrasRomano ? ' '+a.cifrasRomano : '')),
          seisCuatro:usos.map(u=>({compas:u.k+1, uso:u.uso==='cad' ? 'cadencial' : 'de paso'}))
        }
      }
    };
  }

  /* ---------- MEI ---------- */
  const accMap = {'-2':'ff','-1':'f','0':'n','1':'s','2':'x'};
  const sigStr = sig => sig===0 ? '0' : Math.abs(sig)+(sig>0?'s':'f');
  const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');

  // toMEI(inst, {revelado, mascara}):
  //   siempre: los dos pentagramas, el bajo con su cifrado debajo y la
  //     tonalidad como dato (`<reh type="dato">`, como en 4.º);
  //   revelado: el romano delante de las cifras, el grado del bajo encima
  //     del pentagrama de Fa (type="gradobajo": la página le dibuja el
  //     círculo) y, en clave de Sol, el acorde y su americano.
  //   Sin revelar, las cifras solas, centradas bajo la nota, como en un
  //   bajo cifrado; al revelar, el romano delante (y el conjunto se recentra).
  //   mascara (páginas sobre ArmoniaEj.ejercicio): se dibuja TODO de una vez,
  //     con @type para comun.css: «preg» lo que solo se ve sin revelar (las
  //     cifras solas) y «resp» lo que es respuesta (romano + cifras, grado,
  //     acorde y americano). Las dos filas de cifrado se superponen en el
  //     mismo sitio (sin `n`), así que revelar no mueve nada.
  //   La fila del cifrado baja con `vo`: Verovio mide la caja del texto sin
  //   la subida del superíndice, y la cifra de arriba chocaba con las notas
  //   en línea adicional.
  // Las cifras son aquí el DATO del ejercicio, no un índice del romano: más
  // grandes que en 4.º. Con `fontsize` en el propio <rend rend="sup|sub">,
  // Verovio escala la cifra y su desplazamiento vertical a la vez, y
  // ArmoniaEj.apilarCifras las sigue apilando (mismo cuerpo las dos).
  const CUERPO_CIFRAS = '140%';
  const VO_CIFRADO = -2;     // en vu (media línea): negativo = hacia abajo
  const VO_GRADO = 1;
  const CUERPO_GRADO = '75%';   // la cifra del círculo, más pequeña que el romano
  const ALT_CLASE = {'♯':'sostenido', '♭':'bemol', '♮':'becuadro'};
  function toMEI(inst, opts){
    opts=opts||{};
    const masc=!!opts.mascara, rev=masc || !!opts.revelado, sig=CV.keysigAlters(inst.key.sig);
    const tipo=t=>masc ? ` type="${t}"` : '';
    const nota=(p,id)=>{
      const acc = p.alter!==sig[p.letter] ? ` accid="${accMap[p.alter]}"` : '';
      return `<note${id?` xml:id="${id}"`:''} pname="${p.letter.toLowerCase()}" oct="${p.oct}"${acc}/>`;
    };
    // Sin romano: el cifrado del dato, con sus alteraciones (♯, ♯6) y el 5/3
    // tras el 6/4 cadencial. Con romano (al revelar): las cifras del acorde a
    // la convención de los apuntes, sin alteraciones —«V», «VII6»—, que ya se
    // leen en el dato (decidido el 2026-10-09; docs/familias/bajo-cifrado.md §1).
    const cifrado=(a, conRomano)=>{
      const rom = conRomano ? `<rend>${esc(a.romano)}</rend>` : '';
      const cifras = conRomano ? (a.cifrasRomano ? a.cifrasRomano.split('/') : []) : a.cifras;
      return rom + cifras.map((f,i)=>`<rend rend="${i===0?'sup':'sub'}" fontsize="${CUERPO_CIFRAS}">${esc(f)}</rend>`).join('');
    };
    const measures=inst.acordes.map((a,k)=>{
      const last=k===inst.acordes.length-1;
      let ctl = k===0 ? `<reh place="above" staff="1" tstamp="1" type="dato">${esc(inst.key.nombre)}</reh>` : '';
      const fila=(conRomano, t)=>`<harm place="below" staff="2" startid="#b${k}"${tipo(t)} vo="${VO_CIFRADO}">${cifrado(a, conRomano)}</harm>`;
      if(masc){ if(a.cifras.length) ctl += fila(false,'preg'); ctl += fila(true,'resp'); }
      else if(rev || a.cifras.length) ctl += fila(rev);
      if(rev){
        // Solo la cifra; la alteración va en el @type (llega al SVG como
        // clase) y la dibuja ArmoniaEj.circularGrados con el círculo: dentro
        // del texto, Verovio la cambia por un glifo de su fuente, que carga
        // después de medir, y el texto centrado se descoloca. `vo`: el
        // círculo es más grande que la caja que Verovio mide; sin subirlo,
        // roza las notas de la línea superior.
        const acc = a.gradoBajo.acc ? ' alt-'+ALT_CLASE[a.gradoBajo.acc] : '';
        ctl += `<harm place="above" staff="2" startid="#b${k}" type="gradobajo${acc}${masc?' resp':''}" vo="${VO_GRADO}">`
             + `<rend fontsize="${CUERPO_GRADO}">${a.gradoBajo.num}</rend></harm>`;
        ctl += `<harm place="above" staff="1" startid="#s${k}" type="americano${masc?' resp':''}"><rend fontsize="80%">${esc(a.americano)}</rend></harm>`;
      }
      const agudo = rev
        ? `<chord xml:id="s${k}" dur="1"${tipo('resp')}>${a.agudo.map(p=>nota(p)).join('')}</chord>`
        : `<space dur="1"/>`;
      return `<measure n="${k+1}"${last?' right="end"':''}>`
        + `<staff n="1"><layer n="1">${agudo}</layer></staff>`
        + `<staff n="2"><layer n="1"><note xml:id="b${k}" dur="1"`
        + nota(a.bajo).replace(/^<note/,'') + `</layer></staff>${ctl}</measure>`;
    }).join('\n   ');
    return `<?xml version="1.0" encoding="UTF-8"?>
<mei xmlns="http://www.music-encoding.org/ns/mei" meiversion="4.0.0">
 <music><body><mdiv><score>
  <scoreDef keysig="${sigStr(inst.key.sig)}" meter.count="4" meter.unit="4" meter.form="invis">
   <staffGrp symbol="brace" bar.thru="true"><staffDef n="1" lines="5" clef.shape="G" clef.line="2"/><staffDef n="2" lines="5" clef.shape="F" clef.line="4"/></staffGrp>
  </scoreDef>
  <section>
   ${measures}
  </section>
 </score></mdiv></body></music>
</mei>`;
  }

  /* ---------- audio ---------- */
  const ACORDE_S = 1.3;
  // midis(inst, {revelado}) → [{midi, at, dur}]: el bajo; al revelar, con el acorde.
  function midis(inst, opts){
    const out=[];
    inst.acordes.forEach((a,k)=>{
      const at=k*ACORDE_S, dur=ACORDE_S*0.95;
      out.push({midi:a.bajo.midi, at, dur});
      if(opts && opts.revelado) a.agudo.forEach(p=>out.push({midi:p.midi, at, dur}));
    });
    return out;
  }

  const api = {
    generar, toMEI, midis, MAX_NIVEL, CIRCULO,
    // para pruebas
    ACORDES, SIGUE, EN_MAYOR, EN_MENOR, RANGO, tonalidades, intervaloValido, melodiaValida,
    pasoValido, cifrasDe, acordeAgudo
  };
  if (esNode) module.exports = api;
  else global.BajoCifrado = api;
})(typeof window !== 'undefined' ? window : globalThis);
/* fin del módulo */
