/* ============================================================
   Conducción — COMPROBADOR independiente, de 1 a 4 voces
   ------------------------------------------------------------
   Diseño: docs/motor-contrapunto.md §2. Revisa cualquier textura
   de una a cuatro voces, SIN acordes, contra las reglas de
   `curriculum/Minimos-conduccion.md` que no dependen del acorde,
   y además clasifica intervalos y movimientos: es la respuesta
   de los ejercicios de la UD 1 de 3.º (las faltas inyectadas las
   encuentra este comprobador, no el generador que las puso).

   Escrito APARTE de `contrapunto-core.js` y sin compartir con él
   las reglas (solo la aritmética de alturas, aquí repetida), para
   que la validación no sea tautológica. El comprobador de 4.º
   (`cuatro-voces-check.js`) sigue aparte: aquel necesita acordes.

   comprobar(voces, opciones) → [{regla, evento, voces, texto, grado}]
     voces    [[{abs, alter}…], …] de la más AGUDA a la más grave
              (abs: índice diatónico absoluto, C4 = 28)
     opciones roles: ['soprano','bajo'…] (uno por voz; por defecto,
                los de las 4 voces desde arriba); reglas: lista de
                las que se comprueban (por defecto todas: N1 N2 N3
                P2 N4 N5 N12 N13 P9); saltoMax: tope de N13 en pasos
                diatónicos para todas las voces (UD 1 a dos voces: 4,
                la 5.ª); superposicion: false para no mirar la parte
                de N3 entre una sonoridad y la siguiente.
     `grado`: 'falta' (norma) o 'mejorable' (preferencia: P2, P9).
     `evento`: la sonoridad (o, en las transiciones, la de llegada).
   ============================================================ */
(function (global) {
  'use strict';

  const LETTERS = ['C','D','E','F','G','A','B'];
  const SEMI = {C:0,D:2,E:4,F:5,G:7,A:9,B:11};
  const ROLES = ['soprano','contralto','tenor','bajo'];
  const mod = (a,n)=>((a%n)+n)%n;
  const letra = abs => LETTERS[mod(abs,7)];
  const midi = p => (Math.floor(p.abs/7)+1)*12 + SEMI[letra(p.abs)] + p.alter;

  // Tesituras (N1), en índices diatónicos absolutos.
  const IDX = (L,o)=>o*7+LETTERS.indexOf(L);
  const RANGO = { soprano:[IDX('C',4),IDX('A',5)], contralto:[IDX('F',3),IDX('D',5)],
                  tenor:[IDX('C',3),IDX('A',4)], bajo:[IDX('E',2),IDX('C',4)] };

  /* ---------- intervalos ---------- */
  // Intervalo entre dos notas (p, q en cualquier orden), con su nombre.
  function intervalo(p, q){
    const [a,b] = p.abs>=q.abs ? [p,q] : [q,p];
    const pasos=a.abs-b.abs, semis=midi(a)-midi(b);
    const simple = pasos<=7 ? pasos : pasos-7*Math.floor((pasos-1)/7);
    const oct = (pasos-simple)/7;
    const ref = [0,2,4,5,7,9,11,12][simple] + 12*oct, d = semis-ref;
    const justo = [0,3,4,7].includes(simple);
    const cal = justo ? ({0:'justa',1:'aumentada','-1':'disminuida'}[d] || (d>0?'superaumentada':'superdisminuida'))
                      : ({0:'mayor','-1':'menor',1:'aumentada','-2':'disminuida'}[d] || (d>0?'superaumentada':'superdisminuida'));
    const amp = n => n===0 ? 'Unísono' : (n+1)+'.ª';
    return { pasos, semis, simple, cal,
             nombre: pasos===0 ? (cal==='justa'?'Unísono':'Unísono '+cal) : amp(pasos)+' '+cal,
             nombreSimple: simple===0 ? (cal==='justa'?'Unísono':'Unísono '+cal) : amp(simple)+' '+cal,
             corto: (simple===0?'1':String(simple+1))+({justa:'J',mayor:'M',menor:'m',aumentada:'A',disminuida:'D'}[cal]||'?') };
  }

  // Clase del intervalo armónico: 'P' (consonancia perfecta), 'I' (imperfecta)
  // o 'D' (disonancia). La 4.ª justa es disonancia si la nota inferior es el
  // bajo (a dos voces, siempre: la de abajo hace de bajo); entre voces
  // superiores, consonancia (perfecta). Apuntes c3u1 §1.3.
  function clasificar(p, q, conBajo){
    const iv = intervalo(p, q);
    let clase;
    if(iv.cal!=='justa' && iv.cal!=='mayor' && iv.cal!=='menor') clase='D';
    else if(iv.simple===1 || iv.simple===6) clase='D';
    else if(iv.simple===2 || iv.simple===5) clase='I';
    else if(iv.simple===3) clase = conBajo ? 'D' : 'P';
    else clase='P';                                      // unísono, 5.ª, 8.ª justas
    return Object.assign(iv, {clase});
  }

  // Movimiento entre dos voces (a: aguda, b: grave) de una sonoridad a la
  // siguiente: oblicuo, contrario, directo o paralelo (directo con la misma
  // amplitud diatónica: 3.ª mayor → 3.ª menor es paralelo); null si ninguna
  // se mueve.
  function movimiento(a1, b1, a2, b2){
    const da=a2.abs-a1.abs, db=b2.abs-b1.abs;
    if(da===0 && db===0) return null;
    if(da===0 || db===0) return 'oblicuo';
    if(Math.sign(da)!==Math.sign(db)) return 'contrario';
    return (a1.abs-b1.abs)===(a2.abs-b2.abs) ? 'paralelo' : 'directo';
  }

  const esOctava = iv => (iv.simple===0 || iv.simple===7) && iv.cal==='justa';   // unísono, 8.ª, 15.ª
  const esQuinta = iv => iv.simple===4 && iv.cal==='justa';

  /* ---------- comprobación ---------- */
  function comprobar(voces, opciones){
    const o = opciones||{};
    const nv = voces.length, n = nv ? voces[0].length : 0;
    // roles por defecto: las extremas son soprano y bajo
    const roles = o.roles || (nv===4 ? ROLES : nv===3 ? ['soprano','tenor','bajo'] : nv===2 ? ['soprano','bajo'] : ['soprano']);
    const activa = r => !o.reglas || o.reglas.includes(r);
    const faltas = [];
    const f = (regla, evento, vs, texto, grado) => faltas.push({regla, evento, voces:vs, texto, grado:grado||'falta'});
    const nom = v => roles[v] || ('voz '+(v+1));
    const contiguas = (i,j) => ROLES.indexOf(roles[j]) - ROLES.indexOf(roles[i]) === 1;

    for(let k=0;k<n;k++){
      const d = voces.map(v=>v[k]);
      // N1 tesituras
      if(activa('N1')) d.forEach((p,v)=>{
        const r=RANGO[roles[v]];
        if(r && (p.abs<r[0] || p.abs>r[1])) f('N1',k,[v], nom(v)+' fuera de su tesitura');
      });
      for(let v=0; v+1<nv; v++){
        const a=d[v], b=d[v+1];
        // N3 cruce (de altura real)
        if(activa('N3') && midi(a)<midi(b)) f('N3',k,[v,v+1],'cruce '+nom(v)+'/'+nom(v+1));
        // N2 distancias entre voces contiguas del coro
        if(activa('N2') && contiguas(v,v+1)){
          const max = roles[v+1]==='bajo' ? 14 : 7;
          if(a.abs-b.abs > max) f('N2',k,[v,v+1], nom(v)+'–'+nom(v+1)+' a más de '+(max===7?'una 8.ª':'una 15.ª'));
        }
        // P2 unísono entre contiguas (salvo tenor–bajo)
        if(activa('P2') && contiguas(v,v+1) && roles[v+1]!=='bajo' && midi(a)===midi(b))
          f('P2',k,[v,v+1],'unísono '+nom(v)+'/'+nom(v+1),'mejorable');
      }
      if(k===0) continue;
      const a = voces.map(v=>v[k-1]);
      // N3 superposición
      if(activa('N3') && o.superposicion!==false) for(let v=0; v<nv; v++){
        if(v>0 && midi(d[v])>midi(a[v-1])) f('N3',k,[v], nom(v)+' sobrepasa la nota anterior de '+nom(v-1));
        if(v<nv-1 && midi(d[v])<midi(a[v+1])) f('N3',k,[v], nom(v)+' baja de la nota anterior de '+nom(v+1));
      }
      // N4 paralelas (cualquier par; también por movimiento contrario)
      const conN4 = new Set();
      if(activa('N4')) for(let i=0;i<nv;i++) for(let j=i+1;j<nv;j++){
        const mueven = a[i].abs!==d[i].abs && a[j].abs!==d[j].abs;
        if(!mueven) continue;
        const ia=intervalo(a[i],a[j]), ib=intervalo(d[i],d[j]);
        let cual=null;
        if(esOctava(ia) && esOctava(ib)) cual = ia.pasos===0 && ib.pasos===0 ? 'unísonos paralelos' : '8.as paralelas';
        else if(esQuinta(ia) && esQuinta(ib)) cual='5.as paralelas';
        if(cual){
          if(ia.pasos!==ib.pasos) cual += ' (por movimiento contrario)';
          conN4.add(i+','+j); f('N4',k,[i,j], cual+' '+nom(i)+'/'+nom(j));
        }
      }
      // N5 directas entre las extremas (salvo la aguda por grado conjunto)
      if(activa('N5') && nv>=2 && !conN4.has('0,'+(nv-1))){
        const s=0, b=nv-1, mS=d[s].abs-a[s].abs, mB=d[b].abs-a[b].abs, iv=intervalo(d[s],d[b]);
        if(mS!==0 && mB!==0 && Math.sign(mS)===Math.sign(mB) && Math.abs(mS)>1 && (esOctava(iv)||esQuinta(iv)))
          f('N5',k,[s,b],(esQuinta(iv)?'5.ª':'8.ª')+' directa '+nom(s)+'/'+nom(b)+': movimiento directo, '+nom(s)+' por salto');
      }
    }
    // melódicas, voz a voz
    for(let v=0; v<nv; v++){
      const tope = o.saltoMax!=null ? o.saltoMax : (roles[v]==='bajo' ? 7 : 5);
      for(let k=1;k<n;k++){
        const p=voces[v][k-1], q=voces[v][k];
        if(p.abs===q.abs) continue;
        const m=intervalo(p,q), dir=Math.sign(q.abs-p.abs);
        // N13 saltos
        if(activa('N13') && (m.pasos===6 || m.pasos>7 || m.pasos>tope))
          f('N13',k,[v], nom(v)+': salto de '+m.nombre);
        // N12 aumentados y disminuidos (la 5.ª disminuida, si resuelve por grado hacia dentro)
        else if(activa('N12') && (m.cal==='aumentada' || m.cal==='disminuida' || m.cal.indexOf('super')===0)){
          const sig = voces[v][k+1];
          const resuelve = m.pasos===4 && m.cal==='disminuida' && sig && Math.abs(sig.abs-q.abs)===1 && Math.sign(sig.abs-q.abs)===-dir;
          if(!resuelve) f('N12',k,[v], nom(v)+': '+m.nombre+' melódica');
        }
        // P9 tras salto de 4.ª o mayor, cambio de dirección por grado
        if(activa('P9') && m.pasos>=3 && k+1<n && !(roles[v]==='bajo' && m.pasos===7)){
          const r=voces[v][k+1], dr=r.abs-q.abs;
          if(!(Math.abs(dr)===1 && Math.sign(dr)===-dir))
            f('P9',k+1,[v], nom(v)+': salto de '+m.nombre+' no compensado', 'mejorable');
        }
      }
    }
    return faltas;
  }

  const api = { comprobar, intervalo, clasificar, movimiento, midi, RANGO, ROLES };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else global.ConduccionCheck = api;
})(typeof window !== 'undefined' ? window : globalThis);
/* fin del módulo */
