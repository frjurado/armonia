/* ============================================================
   comun.js — utilidades compartidas por TODAS las páginas de
   ejercicios (app/ejercicios/*.html):
     · inicialización robusta de Verovio (evita la condición de
       carrera cuando el WASM ya está en caché y
       onRuntimeInitialized no dispara)
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
  const VRV_DEFAULTS = {
    scale:60, adjustPageHeight:true, pageWidth:900,
    header:'none', footer:'none', breaks:'none',
    pageMarginTop:15, pageMarginBottom:15,
    pageMarginLeft:60, pageMarginRight:20
  };

  // initVerovio(opciones, onReady, onFail): crea el toolkit en cuanto el WASM
  // está listo y lo pasa a onReady(tk). onFail (opcional) se llama si el
  // <script> de Verovio falla al cargar, o si tras ~90 s sigue sin estar:
  // son 7 MB (el WASM va incrustado) y la primera visita con una conexión
  // lenta puede tardar bastante; después queda en la caché del navegador.
  // Mientras tanto, si hay un #notation con .ph, avisa de la espera.
  const VRV_PLAZO_MS = 90000;
  function initVerovio(options, onReady, onFail){
    let done=false;
    function boot(){
      if(done) return; done=true;
      const tk=new global.verovio.toolkit();
      tk.setOptions(Object.assign({}, VRV_DEFAULTS, options||{}));
      onReady(tk);
    }
    function fail(){ if(done) return; done=true; if(onFail) onFail(); }
    // fallo de red o 404 del script: avisar ya, sin agotar el plazo
    const script=document.querySelector('script[src*="verovio"]');
    if(script) script.addEventListener('error', fail);
    const t0=Date.now();
    (function wait(){
      if(done) return;
      if(global.verovio && global.verovio.module){
        if(global.verovio.module.calledRun){ boot(); return; }   // ya inicializado
        global.verovio.module.onRuntimeInitialized = boot;        // o lo hará al terminar
      }
      const t=Date.now()-t0;
      if(t>=VRV_PLAZO_MS){ fail(); return; }
      if(t>=4000){                                                // tarda: explicar por qué
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
  async function tocar(notas){
    const p=await getPiano();
    const now=p.context.currentTime;
    notas.forEach(n=>p.play(n.midi, now+(n.at||0), {duration:(n.dur!=null?n.dur:1.6)}));
  }
  function detener(){ if(piano) try{ piano.stop(); }catch(e){} }

  function audioNoDisponible(btn){ btn.textContent='(sin audio)'; btn.disabled=true; }

  global.ArmoniaEj = { $, initVerovio, tocar, detener, audioNoDisponible };
})(window);
