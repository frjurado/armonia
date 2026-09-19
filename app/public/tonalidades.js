/* ============================================================
   tonalidades.js — tabla de tonalidades por trimestre
   ------------------------------------------------------------
   Fuente única de las tonalidades válidas (Plan-Armonia.md §2):
   4 por trimestre, acumulativas; al final de 4.º, las 24.
   Cada entrada: { tonic (letra, mayúscula), sig (armadura: +♯/−♭),
   mode ('major'|'minor'), nombre, trimestre }.
   Con 6 alteraciones hay dos enarmónicos; ambos figuran, y la
   familia elige (`enarmonico` enlaza con el otro). Nunca 7.
   Sin DOM; global TONALIDADES en navegador, module.exports en Node.
   ============================================================ */
(function (global) {
  'use strict';

  const T = [
    // Trimestre 1 (3.º)
    {tonic:'C', sig: 0, mode:'major', nombre:'Do mayor',   trimestre:1},
    {tonic:'G', sig: 1, mode:'major', nombre:'Sol mayor',  trimestre:1},
    {tonic:'A', sig: 0, mode:'minor', nombre:'La menor',   trimestre:1},
    {tonic:'D', sig:-1, mode:'minor', nombre:'Re menor',   trimestre:1},
    // Trimestre 2 (3.º)
    {tonic:'F', sig:-1, mode:'major', nombre:'Fa mayor',   trimestre:2},
    {tonic:'D', sig: 2, mode:'major', nombre:'Re mayor',   trimestre:2},
    {tonic:'E', sig: 1, mode:'minor', nombre:'Mi menor',   trimestre:2},
    {tonic:'G', sig:-2, mode:'minor', nombre:'Sol menor',  trimestre:2},
    // Trimestre 3 (3.º)
    {tonic:'B', sig:-2, mode:'major', nombre:'Si♭ mayor',  trimestre:3},
    {tonic:'A', sig: 3, mode:'major', nombre:'La mayor',   trimestre:3},
    {tonic:'B', sig: 2, mode:'minor', nombre:'Si menor',   trimestre:3},
    {tonic:'C', sig:-3, mode:'minor', nombre:'Do menor',   trimestre:3},
    // Trimestre 4 (4.º)
    {tonic:'E', sig:-3, mode:'major', nombre:'Mi♭ mayor',  trimestre:4},
    {tonic:'E', sig: 4, mode:'major', nombre:'Mi mayor',   trimestre:4},
    {tonic:'F', sig: 3, mode:'minor', nombre:'Fa♯ menor',  trimestre:4},
    {tonic:'F', sig:-4, mode:'minor', nombre:'Fa menor',   trimestre:4},
    // Trimestre 5 (4.º)
    {tonic:'A', sig:-4, mode:'major', nombre:'La♭ mayor',  trimestre:5},
    {tonic:'B', sig: 5, mode:'major', nombre:'Si mayor',   trimestre:5},
    {tonic:'C', sig: 4, mode:'minor', nombre:'Do♯ menor',  trimestre:5},
    {tonic:'B', sig:-5, mode:'minor', nombre:'Si♭ menor',  trimestre:5},
    // Trimestre 6 (4.º)
    {tonic:'D', sig:-5, mode:'major', nombre:'Re♭ mayor',  trimestre:6},
    {tonic:'F', sig: 6, mode:'major', nombre:'Fa♯ mayor',  trimestre:6, enarmonico:'Sol♭ mayor'},
    {tonic:'G', sig:-6, mode:'major', nombre:'Sol♭ mayor', trimestre:6, enarmonico:'Fa♯ mayor'},
    {tonic:'G', sig: 5, mode:'minor', nombre:'Sol♯ menor', trimestre:6},
    {tonic:'E', sig:-6, mode:'minor', nombre:'Mi♭ menor',  trimestre:6, enarmonico:'Re♯ menor'},
    {tonic:'D', sig: 6, mode:'minor', nombre:'Re♯ menor',  trimestre:6, enarmonico:'Mi♭ menor'}
  ];

  // Tonalidades acumuladas hasta el trimestre t (1–6), ambas incluidas.
  function hastaTrimestre(t){ return T.filter(k => k.trimestre <= t); }
  // Solo las del trimestre t.
  function delTrimestre(t){ return T.filter(k => k.trimestre === t); }
  function porNombre(nombre){ return T.find(k => k.nombre === nombre) || null; }

  const api = { TODAS: T, hastaTrimestre, delTrimestre, porNombre };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else global.TONALIDADES = api;
})(typeof window !== 'undefined' ? window : globalThis);
