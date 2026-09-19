/* ============================================================
   Cuatro voces — COMPROBADOR independiente
   ------------------------------------------------------------
   `comprobar(key, acordes, voces)` revisa una realización SATB
   cualquiera y devuelve la lista de infracciones de las NORMAS
   de `curriculum/Minimos-conduccion.md` (N1–N13, más la
   pertenencia de cada nota al acorde y las duplicaciones
   prohibidas). Cada infracción: {regla, evento, voces, texto}.

   Escrito APARTE del realizador (`cuatro-voces-core.js`) y sin
   compartir con él las funciones de transición: solo comparte
   el modelo de acorde (datos) y la aritmética de alturas. Así la
   validación masiva no es tautológica. Segundo uso previsto:
   ejercicios de detección de faltas (el id de regla es la
   respuesta).

   Entrada:
     key     {tonic, sig, mode}
     acordes [modelo de acorde de CuatroVoces.acorde()]  (uno por evento)
     voces   [[{abs, alter}…]×4]  índice 0 = soprano … 3 = bajo
   ============================================================ */
(function (global) {
  'use strict';

  const LETTERS = ['C','D','E','F','G','A','B'];
  const SEMI = {C:0,D:2,E:4,F:5,G:7,A:9,B:11};
  const NOMBRE_VOZ = ['soprano','contralto','tenor','bajo'];
  const mod = (a,n)=>((a%n)+n)%n;
  const letra = abs => LETTERS[mod(abs,7)];
  const midi = p => (Math.floor(p.abs/7)+1)*12 + SEMI[letra(p.abs)] + p.alter;

  // Tesituras (N1), como índices diatónicos absolutos (C4 = 28).
  const IDX = (L,o)=>o*7+LETTERS.indexOf(L);
  const RANGO = [[IDX('C',4),IDX('A',5)],[IDX('F',3),IDX('D',5)],[IDX('C',3),IDX('A',4)],[IDX('E',2),IDX('C',4)]];

  // Intervalo armónico entre dos notas (p arriba, q abajo): pasos de letra
  // y semitonos, ambos reducidos (simple).
  function intervalo(p,q){
    return { pasos: mod(p.abs-q.abs,7), semis: mod(midi(p)-midi(q),12) };
  }
  const esOctava = iv => iv.pasos===0 && iv.semis===0;
  const esQuinta = iv => iv.pasos===4 && iv.semis===7;
  const esQuintaDim = iv => iv.pasos===4 && iv.semis===6;

  // Nombre del intervalo melódico (para mensajes) y su clasificación.
  function melodico(a,b){
    const d=Math.abs(b.abs-a.abs), s=Math.abs(midi(b)-midi(a));
    const simple=d%7, so=s-12*Math.floor(d/7);
    const JUSTOS={0:0,3:5,4:7};            // unísono, 4.ª, 5.ª
    const MAY={1:2,2:4,5:9,6:11};          // 2.ª, 3.ª, 6.ª, 7.ª mayores
    let cal;
    if(simple in JUSTOS){ const j=JUSTOS[simple]; cal = so===j?'justa': so>j?'aumentada':'disminuida'; }
    else { const m=MAY[simple]; cal = so===m?'mayor': so===m-1?'menor': so>m?'aumentada':'disminuida'; }
    return {pasos:d, semis:s, cal, nombre:(d+1)+'.ª '+cal};
  }

  function comprobar(key, acordes, voces){
    const faltas=[];
    const n=acordes.length;
    const f=(regla,evento,vs,texto)=>faltas.push({regla, evento, voces:vs, texto});
    const V = k => [0,1,2,3].map(v=>voces[v][k]);   // disposición del evento k (S,A,T,B)

    // Rol de cada nota en su acorde (o null si no pertenece).
    function rolDe(ch, p){
      const t = ch.tones.find(t=>t.letter===letra(p.abs) && t.alter===p.alter);
      return t ? t : null;
    }
    const roles = [];   // roles[k][v] = tono del acorde o null
    for(let k=0;k<n;k++){
      roles[k]=V(k).map(p=>rolDe(acordes[k],p));
      roles[k].forEach((t,v)=>{ if(!t) f('acorde',k,[v],NOMBRE_VOZ[v]+': nota ajena al acorde '+acordes[k].romano); });
    }

    for(let k=0;k<n;k++){
      const ch=acordes[k], d=V(k), r=roles[k];
      // N1 tesituras
      d.forEach((p,v)=>{ if(p.abs<RANGO[v][0]||p.abs>RANGO[v][1]) f('N1',k,[v],NOMBRE_VOZ[v]+' fuera de tesitura'); });
      // N2 distancias
      if(d[0].abs-d[1].abs>7) f('N2',k,[0,1],'soprano–contralto a más de una 8.ª');
      if(d[1].abs-d[2].abs>7) f('N2',k,[1,2],'contralto–tenor a más de una 8.ª');
      if(d[2].abs-d[3].abs>14) f('N2',k,[2,3],'tenor–bajo a más de una 15.ª');
      // N3 cruces
      for(let v=0;v<3;v++) if(midi(d[v])<midi(d[v+1])) f('N3',k,[v,v+1],'cruce '+NOMBRE_VOZ[v]+'/'+NOMBRE_VOZ[v+1]);
      // bajo = nota grave del acorde
      if(r[3] && r[3].rol!==ch.tones[ch.bass].rol) f('acorde',k,[3],'el bajo no es la nota de la inversión ('+ch.romano+')');
      // N10 tríadas disminuidas solo en 1.ª inversión
      if(ch.calidad.triada==='dim' && !ch.septima && ch.inv!==1) f('N10',k,[],'tríada disminuida fuera de 1.ª inversión');
      // N11 acordes completos / duplicaciones prohibidas
      const presentes = new Set(r.filter(Boolean).map(t=>t.rol));
      const cuenta = {}; r.filter(Boolean).forEach(t=>{ cuenta[t.rol]=(cuenta[t.rol]||0)+1; });
      if(presentes.size < ch.tones.length){
        const falta = ch.tones.map(t=>t.rol).filter(x=>!presentes.has(x));
        let ok=false;
        if(ch.septima && falta.length===1 && falta[0]==='5' && cuenta.F===2) ok=true;   // V7 sin 5.ª, fundamental doblada
        if(!ch.septima && ch.grado===1 && ch.inv===0 && k===n-1 && k>0 && acordes[k-1].septima
           && falta.length===1 && falta[0]==='5' && cuenta.F===3){
          const prevRoles=new Set(roles[k-1].filter(Boolean).map(t=>t.rol));
          if(prevRoles.size===4) ok=true;                                              // I final tras V7 completo
        }
        if(!ok) f('N11',k,[],'acorde incompleto (falta '+falta.join(',')+')');
      }
      ch.dup.nunca.forEach(rol=>{ if((cuenta[rol]||0)>1) f('DUP',k,[],'duplicación prohibida de la '+rol+' en '+ch.romano); });
      if(ch.dup.oblig && (cuenta[ch.dup.oblig]||0)<2) f('DUP',k,[],'en '+ch.romano+' debe duplicarse la '+ch.dup.oblig);
      // N7 sensible doblada · N8 7.ª doblada
      const sens = d.filter(p=>rolDe(ch,p) && rolDe(ch,p).deg===7).length;
      if(sens>1) f('N7',k,[],'sensible duplicada');
      if((cuenta['7']||0)>1) f('N8',k,[],'7.ª duplicada');

      if(k===0) continue;
      const a=V(k-1), ra=roles[k-1], chA=acordes[k-1];
      // N3 superposición
      for(let v=0;v<4;v++){
        if(v>0 && midi(d[v])>midi(a[v-1])) f('N3',k,[v],NOMBRE_VOZ[v]+' sobrepasa la nota anterior de '+NOMBRE_VOZ[v-1]);
        if(v<3 && midi(d[v])<midi(a[v+1])) f('N3',k,[v],NOMBRE_VOZ[v]+' baja de la nota anterior de '+NOMBRE_VOZ[v+1]);
      }
      // N4 paralelas · N6 dim → justa desde el bajo
      for(let i=0;i<4;i++) for(let j=i+1;j<4;j++){
        const ia=intervalo(a[i],a[j]), ib=intervalo(d[i],d[j]);
        const mueven = a[i].abs!==d[i].abs && a[j].abs!==d[j].abs;
        if(mueven && esOctava(ia) && esOctava(ib)) f('N4',k,[i,j],'8.as paralelas '+NOMBRE_VOZ[i]+'/'+NOMBRE_VOZ[j]);
        if(mueven && esQuinta(ia) && esQuinta(ib)) f('N4',k,[i,j],'5.as paralelas '+NOMBRE_VOZ[i]+'/'+NOMBRE_VOZ[j]);
        if(j===3 && esQuintaDim(ia) && esQuinta(ib)) f('N6',k,[i,j],'5.ª disminuida → 5.ª justa con el bajo');
      }
      // N5 directas entre extremas
      {
        const mS=d[0].abs-a[0].abs, mB=d[3].abs-a[3].abs, ib=intervalo(d[0],d[3]);
        if(mS!==0 && mB!==0 && Math.sign(mS)===Math.sign(mB) && Math.abs(mS)>1 && (esOctava(ib)||esQuinta(ib)))
          f('N5',k,[0,3],'directa de '+(esOctava(ib)?'8.ª':'5.ª')+' entre las extremas');
      }
      // N12 / N13 melódicas
      for(let v=0;v<4;v++){
        const m=melodico(a[v],d[v]);
        if(m.pasos===0) continue;
        if(m.pasos===6 || m.pasos>(v===3?7:5)) f('N13',k,[v],NOMBRE_VOZ[v]+': salto de '+m.nombre);
        else if(m.cal==='aumentada') f('N12',k,[v],NOMBRE_VOZ[v]+': '+m.nombre+' melódica');
        else if(m.cal==='disminuida'){
          if(m.pasos!==4) f('N12',k,[v],NOMBRE_VOZ[v]+': '+m.nombre+' melódica');
          else {
            // 5.ª disminuida: resuelve por grado en dirección contraria
            const dir=Math.sign(d[v].abs-a[v].abs);
            const sig = k+1<n ? voces[v][k+1] : null;
            if(!sig || Math.abs(sig.abs-d[v].abs)!==1 || Math.sign(sig.abs-d[v].abs)!==-dir)
              f('N12',k,[v],NOMBRE_VOZ[v]+': 5.ª disminuida sin resolver por grado contrario');
          }
        }
      }
      // N7 resolución de la sensible (si el acorde siguiente no la contiene)
      if(!ch.tones.some(t=>t.deg===7)) for(let v=0;v<4;v++){
        const t=ra[v]; if(!t || t.deg!==7) continue;
        const dest=r[v];
        const sube = dest && dest.deg===1 && d[v].abs===a[v].abs+1;
        if(sube) continue;
        const interna = v===1||v===2;
        const baja = interna && dest && dest.deg===5 && d[v].abs===a[v].abs-2 && ch.grado===1 && r[v-1] && r[v-1].deg===1;
        if(!baja) f('N7',k,[v],NOMBRE_VOZ[v]+': la sensible no resuelve');
      }
      // N8 resolución de la 7.ª
      for(let v=0;v<4;v++){
        const t=ra[v]; if(!t || t.rol!=='7') continue;
        const baja = d[v].abs===a[v].abs-1, queda = d[v].abs===a[v].abs;
        if(!baja && !queda) f('N8',k,[v],NOMBRE_VOZ[v]+': la 7.ª no resuelve descendiendo');
        if(baja) for(let u=0;u<4;u++){
          if(u===v || !ra[u] || ra[u].rol!=='F' || !r[u]) continue;
          if(r[u].deg===r[v].deg && d[u].abs!==a[u].abs) f('N8',k,[u],NOMBRE_VOZ[u]+': la fundamental dobla la resolución de la 7.ª');
        }
      }
      // N9 6/4 cadencial
      if(chA.cadencial64){
        if(ch.grado!==5) f('N9',k,[],'el 6/4 cadencial no va a V');
        if(Math.abs(d[3].abs-a[3].abs)%7!==0) f('N9',k,[3],'el bajo del 6/4 cadencial no se mantiene (ni salta de 8.ª)');
        for(let v=0;v<3;v++){
          const t=ra[v]; if(!t) continue;
          if((t.rol==='F'||t.rol==='3') && d[v].abs!==a[v].abs-1) f('N9',k,[v],NOMBRE_VOZ[v]+': la '+(t.rol==='F'?'6.ª':'4.ª')+' del 6/4 no baja por grado');
        }
      }
    }
    return faltas;
  }

  const api = { comprobar, melodico, intervalo };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else global.CuatroVocesCheck = api;
})(typeof window !== 'undefined' ? window : globalThis);
/* fin del módulo */
