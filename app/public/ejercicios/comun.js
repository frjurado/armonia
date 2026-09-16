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
  // Pizarra (≥ 1700 px de ancho de ventana; la del aula son 1920): la
  // partitura se dibuja un 50 % más grande. Solo multiplica `scale`, que
  // es tamaño en píxeles; `pageWidth` va en unidades de Verovio, así que
  // la disposición (qué cabe en un sistema) no cambia. Va a la par del
  // --main-w ancho de comun.css, que da sitio para ese 50 %.
  const VRV_FACTOR_PIZARRA = 1.5;
  function factorEscala(){
    return global.matchMedia && global.matchMedia('(min-width:1700px)').matches
      ? VRV_FACTOR_PIZARRA : 1;
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
  async function tocar(notas){
    const p=await getPiano();
    if(p.context.state!=='running') return;
    const now=p.context.currentTime;
    notas.forEach(n=>p.play(n.midi, now+(n.at||0), {duration:(n.dur!=null?n.dur:1.6)}));
  }
  function detener(){ if(piano) try{ piano.stop(); }catch(e){} }

  function audioNoDisponible(btn){ btn.textContent='(sin audio)'; btn.disabled=true; }

  global.ArmoniaEj = { $, initVerovio, tocar, detener, audioNoDisponible };
})(window);
