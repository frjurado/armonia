/* ============================================================
   4.º · Unidad 0 — Prolongación: UI común a los tres tipos
   ------------------------------------------------------------
   Las tres páginas (c4u0-prolongacion-prol/-frase/-periodo.html)
   son iguales salvo el tipo y la ayuda: cada una fija
   `window.PROL_TIPO` (1, 2 o 3) antes de cargar este fichero.
   La lógica musical vive en c4u0-prolongacion-core.js; aquí solo
   se pinta y se escucha. Antes de revelar se ve y suena SOLO el
   bajo (y, en el tipo 1, la tonalidad como dato).
   ============================================================ */
(function(){
  'use strict';
  const TIPO = window.PROL_TIPO || 1;
  const P = window.Prolongacion;
  const $ = ArmoniaEj.$;
  let tk=null, level=1, current=null, revelado=false;

  const dato = () => (TIPO===1 && current) ? current.key.nombre : null;

  function renderSVG(){
    if(!tk || !current) return;
    tk.loadData(P.toMEI(current, revelado
      ? {cifrados:true, tramos:true, dato:dato(), saltoFrase:true}
      : {ocultas:[0,1,2], dato:dato(), saltoFrase:true}));
    $('notation').innerHTML = tk.renderToSVG(1);
    ArmoniaEj.apilarCifras($('notation'));
    // corchete de cada etiqueta de tramo hasta su último acorde; abierto (sin
    // gancho) si solapa con el siguiente: la bisagra prolongación–cadencia
    if(revelado){
      const tr=current.est.tramos;
      ArmoniaEj.corchetesTramo($('notation'), tr.map((t,i)=>({etiqueta:'tramo'+i, hasta:'s'+t.hasta,
        abierto: !!tr[i+1] && tr[i+1].desde===t.hasta})));
    }
  }

  function newExercise(){
    current = P.generar(TIPO, level);
    revelado=false;
    $('lvl').textContent = level;
    $('lvlNote').textContent = P.NIVELES[level-1] || '';
    $('answer').className='answer';
    $('btnReveal').disabled=false;
    $('btnSimilar').style.display='none';
    $('btnHarder').style.display='none';
    renderSVG();
    play();
  }

  function reveal(){
    if(!current) return;
    revelado=true;
    const a=current.json.answer;
    const sep='<span class="sep-q">·</span>';
    // Titular: tonalidad (si no era el dato) y la forma. Los acordes no se
    // repiten aquí: salen cifrados en la partitura, con sus alternativas.
    $('ansQ').innerHTML = (TIPO===1 ? '' : `<span class="ton">${a.tonalidad}</span>${sep}`)
      + `<span>${a.resumen}</span>`;
    $('ansDet').innerHTML = '<ul class="tramos">'
      + a.tramos.map(t=>`<li><b>${t.compases}</b> · ${t.texto}</li>`).join('') + '</ul>';
    $('answer').className='answer show';
    $('btnReveal').disabled=true;
    $('btnSimilar').style.display='';
    $('btnHarder').style.display = level<P.MAX_NIVEL ? '' : 'none';
    renderSVG();
    play();
  }

  async function play(){
    if(!current) return;
    try{ await ArmoniaEj.tocar(P.midis(current, revelado ? null : {voces:[3]})); }
    catch(e){ ArmoniaEj.audioNoDisponible($('btnListen')); }
  }

  $('btnReveal').onclick = reveal;
  $('btnSimilar').onclick = ()=>newExercise();
  $('btnHarder').onclick = ()=>{ level=Math.min(level+1,P.MAX_NIVEL); newExercise(); };
  $('btnListen').onclick = play;

  // Primer ejercicio inmediato (texto + botones funcionan ya, sin esperar a Verovio)
  newExercise();

  // El periodo va en dos sistemas, uno por frase (<sb/> en el MEI), los dos
  // del mismo ancho: el último se justifica siempre (minLastJustification 0;
  // por defecto Verovio solo lo estira si ya ocupa el 80 %).
  ArmoniaEj.initVerovio(
    Object.assign({scale:60, pageWidth:1000}, TIPO===3 ? {breaks:'encoded', minLastJustification:0} : {}),
    t=>{ tk=t; renderSVG(); },
    msg=>{ $('notation').innerHTML='<span class="ph">'+msg+'</span>'; }
  );
})();
