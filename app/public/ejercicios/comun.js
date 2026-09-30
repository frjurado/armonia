/* ============================================================
   comun.js — utilidades compartidas por TODAS las páginas de
   ejercicios (app/ejercicios/*.html):
     · inicialización robusta de Verovio (detecta el runtime ya
       arrancado aunque onRuntimeInitialized haya disparado antes
       de engancharlo, y distingue los motivos de fallo)
     · audio por samples de piano (soundfont-player)
   Depende de los <script> de Verovio y soundfont-player
   (../vendor/), cargados por cada página.
   ============================================================ */
(function (global) {
  'use strict';

  const $ = id => document.getElementById(id);

  /* ---------- Verovio ---------- */
  // Margen izquierdo amplio por defecto: con pentagrama doble la llave (brace)
  // sobresale a la izquierda del sistema y con márgenes pequeños se corta.
  // Fuente musical: Leland (MuseScore), la misma familia que pone las
  // alteraciones en el texto (../vendor/fuentes/). Cambiar las dos a la vez.
  const VRV_DEFAULTS = {
    font:'Leland',
    scale:60, adjustPageHeight:true, pageWidth:900,
    header:'none', footer:'none', breaks:'none',
    pageMarginTop:15, pageMarginBottom:15,
    pageMarginLeft:60, pageMarginRight:20
  };
  // Pizarra: la partitura se dibuja un 50 % más grande. Se reconoce por
  // dos condiciones a la vez — ventana ancha (≥ 1700 px; la del aula son
  // 1920) Y puntero primario grueso (táctil) —, para no disparar en un
  // monitor de escritorio grande con ratón. Solo multiplica `scale`, que
  // es tamaño en píxeles; `pageWidth` va en unidades de Verovio, así que
  // la disposición (qué cabe en un sistema) no cambia; max-width:100% capa
  // el SVG al ancho de la tarjeta si se pasa. En un PC se puede probar
  // emulando «pointer: coarse» en las DevTools.
  const VRV_FACTOR_PIZARRA = 1.5;
  function factorEscala(){
    const mq = q => global.matchMedia && global.matchMedia(q).matches;
    return mq('(min-width:1700px)') && mq('(pointer:coarse)') ? VRV_FACTOR_PIZARRA : 1;
  }

  // initVerovio(opciones, onReady, onFail): crea el toolkit en cuanto el WASM
  // está listo y lo pasa a onReady(tk). onFail(mensaje) recibe un texto
  // legible con el motivo: el <script> no llegó (red), llegó pero el
  // navegador no lo ejecuta (demasiado antiguo para la sintaxis de la
  // build), o el runtime no arranca en ~90 s. Son 7 MB (el WASM va
  // incrustado): la primera visita con conexión lenta tarda; después queda
  // en la caché del navegador. Mientras, si hay un #notation con .ph, avisa.
  //
  // Cómo se sabe que el runtime está listo (Emscriptem, build 6.x de
  // Verovio): `Module.onRuntimeInitialized` se invoca UNA vez; si se engancha
  // tarde no vuelve a disparar, y esta build ya no expone `calledRun`. Lo
  // que sí hace es asignar los exports del WASM (p. ej.
  // `_vrvToolkit_constructor`) justo antes de inicializar, sin ceder el hilo
  // entre medias: si existen al mirarlos desde un timer, ya está listo.
  const VRV_PLAZO_MS = 90000;
  const MSG = {
    red:       'No se pudo descargar Verovio (revisa la conexión y recarga).',
    navegador: 'Este navegador no puede ejecutar Verovio: es demasiado antiguo. Prueba con una versión reciente de Chrome, Edge, Firefox o Safari.',
    toolkit:   'Verovio se cargó pero no pudo arrancar (ver la consola del navegador).',
    plazo:     'Verovio no ha terminado de cargar. Recarga la página; si la conexión es lenta, la primera vez puede tardar.'
  };
  function initVerovio(options, onReady, onFail){
    let done=false;
    const modulo = () => global.verovio && global.verovio.module;
    const listo  = m  => typeof m._vrvToolkit_constructor === 'function';
    function boot(){
      if(done) return; done=true;
      let tk;
      try{
        tk=new global.verovio.toolkit();
        const opts=Object.assign({}, VRV_DEFAULTS, options||{});
        opts.scale=Math.round(opts.scale*factorEscala());
        tk.setOptions(opts);
      }catch(e){ done=false; fail('toolkit', e); return; }
      onReady(tk);                     // fuera del try: un error de la página no es de Verovio
    }
    function fail(motivo, err){
      if(done) return; done=true;
      if(global.console) console.error('initVerovio:', motivo, err||'');
      if(onFail) onFail(MSG[motivo]||MSG.plazo);
    }
    // Engancha al módulo si ya existe; true si lo ha encontrado.
    function enganchar(){
      const m=modulo(); if(!m) return false;
      if(listo(m)) boot(); else m.onRuntimeInitialized = boot;
      return true;
    }
    const script=document.querySelector('script[src*="verovio"]');
    if(script){
      script.addEventListener('error', ()=>fail('red'));
      // load dispara tras ejecutarse el script: si no ha definido `verovio`,
      // lo ha abortado un error de sintaxis (navegador antiguo)
      script.addEventListener('load', ()=>{ if(!enganchar()) fail('navegador'); });
    }
    const t0=Date.now();
    (function wait(){                                              // respaldo por sondeo
      if(done) return;
      enganchar();
      const t=Date.now()-t0;
      if(t>=VRV_PLAZO_MS){ fail('plazo'); return; }
      if(t>=4000){                                                 // tarda: explicar por qué
        const ph=document.querySelector('#notation .ph');
        if(ph && ph.dataset.espera!=='1'){
          ph.dataset.espera='1';
          ph.textContent='Cargando motor de partitura… (7 MB; la primera vez puede tardar)';
        }
      }
      setTimeout(wait,50);
    })();
  }

  /* ---------- cifras apiladas en los <harm> ---------- */
  // Los grados con cifras van en el MEI como <rend>I</rend><rend rend="sup">6
  // </rend><rend rend="sub">4</rend> (Verovio descarta <fb> si el <harm> lleva
  // texto). Verovio escribe sup y sub uno TRAS otro en la misma línea, así que
  // «I⁶₄» sale en diagonal; esta función, tras insertar el SVG en el DOM,
  // retrocede cada cifra sub la anchura medida de la sup anterior para que
  // queden apiladas. Medir (y no estimar) hace que valga con cualquier fuente.
  function apilarCifras(root){
    if(!root || !root.querySelectorAll) return;
    root.querySelectorAll('g.harm text').forEach(text=>{
      const rends=Array.from(text.children).filter(c=>c.classList && c.classList.contains('rend'));
      for(let i=1;i<rends.length;i++){
        const prev=rends[i-1].querySelector('tspan.text'), cur=rends[i].querySelector('tspan.text');
        if(!prev || !cur) continue;
        const dyP=parseFloat(prev.getAttribute('dy')||'0'), dyC=parseFloat(cur.getAttribute('dy')||'0');
        // Solo una cifra sub (mismo cuerpo que la sup) se apila; un texto que
        // vuelve a la línea base tras la sup —el «)» de un acorde subordinado,
        // en Prolongación— tiene el cuerpo normal y sigue a continuación.
        const cuerpo = t => { const s=t.querySelector('tspan[font-size]'); return s ? parseFloat(s.getAttribute('font-size')) : NaN; };
        const cP=cuerpo(prev), cC=cuerpo(cur);
        const mismoCuerpo = !(cP>0 && cC>0) || Math.abs(cC-cP) < 0.15*cP;   // sin dato, como antes
        if(dyP<0 && dyC>0 && mismoCuerpo){
          try{ cur.setAttribute('dx', -prev.getComputedTextLength()); }catch(e){}
        }
      }
    });
  }

  /* ---------- corchete de tramo («Prol. I ────┐») ---------- */
  // corchetesTramo(root, [{etiqueta:'tramo0', hasta:'s5', abierto?}, …]): tras
  // insertar el SVG, prolonga cada etiqueta (id de un <reh>) con una línea
  // continua hasta el final de la nota `hasta`, acabada en un gancho hacia
  // abajo. Si la etiqueta siguiente está en el mismo sistema y más cerca, la
  // línea se para antes de ella. `abierto`: sin gancho, para el tramo que
  // SOLAPA con el siguiente (su último acorde es el primero del otro: la
  // bisagra entre prolongación y cadencia); la línea sigue así en la etiqueta
  // siguiente, sin cerrarse. Se mide en pantalla y se dibuja en las coordenadas de la
  // etiqueta, así que escala con el SVG. El color lo pone el CSS (path.corchete).
  function corchetesTramo(root, tramos){
    if(!root || !root.querySelector) return;
    const cajas = tramos.map(t=>{
      const et=root.querySelector('#'+t.etiqueta), nota=root.querySelector('#'+t.hasta);
      return (et && nota) ? {et, nota, r:et.getBoundingClientRect(), rn:nota.getBoundingClientRect()} : null;
    });
    cajas.forEach((c,i)=>{
      if(!c || !c.r.width) return;
      const ctm=c.et.getScreenCTM(); if(!ctm) return;
      const inv=ctm.inverse();
      const svg=c.et.ownerSVGElement;
      const local=(x,y)=>{ const p=svg.createSVGPoint(); p.x=x; p.y=y; return p.matrixTransform(inv); };
      const alto=c.r.height, hueco=alto*0.35;
      let x1=c.rn.right;
      const sig=cajas[i+1];
      if(sig && Math.abs(sig.r.top-c.r.top) < alto && sig.r.left-hueco < x1) x1=sig.r.left-hueco;
      const x0=c.r.right+hueco, y=c.r.top+alto*0.55;
      if(x1-x0 < alto) return;                        // no cabe una línea que se entienda
      const a=local(x0,y), b=local(x1,y), g=local(x1,y+alto*0.6);
      const d = tramos[i].abierto ? `M${a.x} ${a.y} L${b.x} ${b.y}` : `M${a.x} ${a.y} L${b.x} ${b.y} L${g.x} ${g.y}`;
      const unidad=Math.abs(local(0,alto).y-local(0,0).y);  // alto de la etiqueta, en unidades locales
      const path=document.createElementNS('http://www.w3.org/2000/svg','path');
      path.setAttribute('class','corchete');
      path.setAttribute('d', d);
      path.setAttribute('stroke-width', unidad*0.06);
      c.et.appendChild(path);
    });
  }

  /* ---------- audio ---------- */
  let piano=null;
  async function getPiano(){
    if(!piano){
      const ac=new (global.AudioContext||global.webkitAudioContext)();
      piano=await global.Soundfont.instrument(ac,'acoustic_grand_piano');
    }
    try{ await piano.context.resume(); }catch(e){}   // desbloquea audio tras gesto de usuario
    return piano;
  }

  // tocar([{midi, at, dur}, …]): programa las notas relativas a "ahora".
  // at en segundos (0 por defecto), dur en segundos (1.6 por defecto).
  // Lanza si el audio no está disponible: la página decide qué botón anular.
  // Si el contexto sigue suspendido (móvil: aún no ha habido un gesto del
  // usuario), no encola nada y vuelve en silencio: si se encolaran, al
  // primer toque sonarían de golpe todas las acumuladas. La página no
  // distingue este caso del normal; el usuario pulsa «Escuchar» y suena.
  // Cada llamada es una reproducción completa: antes de empezar se corta la
  // anterior (note off general), para que no se superpongan el bajo y la
  // solución, ni un ejercicio y el siguiente.
  let sonando=[];            // notas de la reproducción en curso (sonando o programadas)
  async function tocar(notas){
    detener();
    const p=await getPiano();
    if(p.context.state!=='running') return;
    detener();               // por si otra llamada se coló mientras cargaba el piano
    const now=p.context.currentTime;
    sonando = notas.map(n=>p.play(n.midi, now+(n.at||0), {duration:(n.dur!=null?n.dur:1.6)})).filter(Boolean);
  }
  // Para las notas de la reproducción en curso, una a una: piano.stop() recorre
  // TODAS las de la sesión (también las acabadas) y un error en una dejaría
  // sonando las demás.
  function detener(){
    sonando.forEach(nodo=>{ try{ nodo.stop(); }catch(e){} });
    sonando=[];
  }
  // Respuesta, Similar y Más difícil cortan siempre el audio, toque o no la
  // página algo después (fase de captura: antes que el manejador de la página).
  document.addEventListener('click', e=>{
    if(e.target.closest && e.target.closest('#btnReveal, #btnSimilar, #btnHarder')) detener();
  }, true);

  function audioNoDisponible(btn){ btn.textContent='(sin audio)'; btn.disabled=true; }

  /* ---------- vuelta al menú ---------- */
  // El enlace «← Menú» de cada página apunta a ../index.html a secas. Aquí
  // se le añade el nombre de fichero de esta página; el menú lo busca en
  // curriculum-data.js y abre la pestaña de curso y la unidad de las que
  // salió el ejercicio. Así ninguna página repite a qué curso pertenece:
  // el dato sigue estando solo en el curículo.
  function marcarEnlaceMenu(){
    const a = document.querySelector('a.back');
    if(!a) return;
    const fichero = location.pathname.split('/').pop();
    if(!fichero) return;
    a.href = a.getAttribute('href').split('#')[0] + '#de=' + encodeURIComponent(fichero);
  }
  if(document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', marcarEnlaceMenu);
  else marcarEnlaceMenu();

  global.ArmoniaEj = { $, initVerovio, apilarCifras, corchetesTramo, tocar, detener, audioNoDisponible };
})(window);
