#!/usr/bin/env node
/* ============================================================
   generar-fichas.js — fichas generadas a partir de un modelo
   ------------------------------------------------------------
   Uso:  node herramientas/generar-fichas.js <modelo> [opciones]
           --cuantas 10       cuántas fichas (por defecto, 10)
           --semilla 1        la ficha n lleva la semilla 1000·s + n
           --salida dir       dónde se escriben (por defecto,
                              tmp/generadas/<modelo>/)
           --ejercicios 1,3   solo esos ejercicios del modelo (prueba
                              de un tipo; entonces no se exigen las
                              condiciones de la cabecera, como «menores»)

   El modelo (fichas/modelos/<modelo>.md) dice qué ejercicios lleva la
   ficha y con qué condiciones. Para cada ejercicio, un adaptador pide
   el material al núcleo de la app que lo genera (bajo-cifrado-core.js…)
   y lo escribe como un bloque ```lilypond de ficha, con los mismos
   comandos que una escrita a mano. Antes de darlo por bueno, lo pasa
   por el verificador (comprobar-fichas.js): sin discrepancias y
   cumpliendo las condiciones del modelo; si no, otro intento.

   Las fichas salen como .md; los PDF, con construir.py y su ruta.

   SEMILLA. Los núcleos sortean con Math.random; aquí se sustituye por un
   generador con semilla antes de cada ficha, así que una ficha se puede
   rehacer idéntica (mientras no cambien los núcleos). Sin tocar la app.

   Plan: informes/2026-10-29-plan-fichas-generadas.md, §2.3.
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const APP = path.join(RAIZ, '..', 'app', 'public');
const V = require('./comprobar-fichas.js');
const BC = require(path.join(APP, 'ejercicios', 'bajo-cifrado-core.js'));
const TON = require(path.join(APP, 'tonalidades.js'));

// mulberry32: pequeño, rápido y suficiente para sortear ejercicios.
function aleatorio(semilla) {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const elige = lista => lista[Math.floor(Math.random() * lista.length)];
// Un número de las condiciones («8», «2–4», «al menos 4»): uno al azar.
const numero = (c, defecto) => !c ? defecto : c.max === Infinity ? c.min : c.min + Math.floor(Math.random() * (c.max - c.min + 1));

// Altura de la app ({letter, alter, oct}) → nota de LilyPond (inglés, absoluta).
function ly(p) {
  const alt = { 1: 's', '-1': 'f', 2: 'ss', '-2': 'ff' }[p.alter] || '';
  const oct = p.oct > 3 ? "'".repeat(p.oct - 3) : ','.repeat(3 - p.oct);
  return p.letter.toLowerCase() + alt + oct;
}
const CIRCULOS = { 1: '①', 2: '②', 3: '③', 4: '④', 5: '⑤', 6: '⑥', 7: '⑦' };

/* ---------- adaptadores: condiciones + tonalidad → bloque lilypond ---------- */

// Grados y cifrado (como c3u1-f2): un bajo cifrado de bajo-cifrado-core.js;
// encima, el acorde en posición cerrada (el `agudo` de la app) y su cifrado
// americano. El primero, entre \modelo y \finModelo si se pide.
// El final (en I o en V) se sortea una vez por ejercicio, en `ctx`, con la
// proporción de la app: si se sorteara en cada intento, los que descarta el
// verificador (los finales en I gastan antes la repetición) lo desviarían.
const FINAL_EN_V = 0.35;
function gradosBajoCifrado(reglas, key, ctx) {
  if (!ctx.fin) ctx.fin = Math.random() < FINAL_EN_V ? 'V' : 'I';
  const inst = BC.generar(2, { key, n: numero(reglas.acordes, 8), fin: ctx.fin });
  if (!inst) return null;
  const modelo = reglas.modelo === 'sí';
  const arriba = [], abajo = [];
  inst.acordes.forEach((a, k) => {
    const [ini, fin] = modelo && k === 0 ? ['\\modelo ', ' \\finModelo'] : ['', ''];
    arriba.push(`  ${ini}\\encima "${a.americano}" \\analitico <${a.agudo.map(ly).join(' ')}>1${fin}`);
    const figuras = a.cifras.length ? `\\figuras "${a.cifras.join('/')}" ` : '';
    // en estado fundamental, las cifras del bajo (♯; 5/3 o 5/♯ tras el 6/4
    // cadencial) van también en el romano: «V♯», «V5/3»
    const cifrasRomano = a.inv === 0 ? a.cifras.join('/') : a.cifrasRomano;
    const grado = `\\gradoBajo "${a.gradoBajo.acc}${CIRCULOS[a.gradoBajo.num]}" \\acorde "${a.romano}${cifrasRomano}"`;
    abajo.push(`  ${figuras}${ini}${grado}${fin} ${ly(a.bajo)}1`);
  });
  return `arriba = {\n${arriba.join('\n')}\n}\nabajo = {\n${abajo.join('\n')}\n}\n`;
}

const ADAPTADOR = {
  'grados-bajo-cifrado': gradosBajoCifrado,
};

/* ---------- una ficha ---------- */

const INTENTOS = 200;

// Las tonalidades de cada ejercicio: de las del modelo y, si se exigen, con
// tantas en menor como pida la cabecera.
function tonalidades(modelo, n, global) {
  const lista = (modelo.global.tonalidades || TON.delTrimestre(1).map(t => t.nombre));
  for (let i = 0; i < INTENTOS; i++) {
    const tonos = Array.from({ length: n }, () => elige(lista));
    const menores = tonos.filter(t => /menor$/.test(t)).length;
    const m = global && modelo.global.menores;
    if (!m || (menores >= m.min && menores <= m.max)) return tonos;
  }
  throw new Error('no encuentro tonalidades que cumplan la cabecera del modelo');
}

function ejercicio(ap, tono, reglas) {
  const f = ADAPTADOR[ap.attr.tipo];
  if (!f) throw new Error(`no hay adaptador para el tipo ${ap.attr.tipo}`);
  const key = TON.porNombre(tono), ctx = {};      // ctx: lo que se sortea una vez por ejercicio
  for (let i = 0; i < INTENTOS; i++) {
    const codigo = f(reglas, key, ctx);
    if (!codigo) continue;
    const r = V.comprobarApartado({ attr: { ...ap.attr, tono }, codigo });
    if (r.fallos.length || V.incumple(r.perfil, reglas).length) continue;
    return { codigo, avisos: r.avisos, intentos: i + 1 };
  }
  return null;
}

function atributosLinea(attr) {
  return Object.entries(attr).map(([k, v]) => `${k}="${v}"`).join(' ');
}

function generarFicha(modelo, numeroFicha, semilla, cuales) {
  Math.random = aleatorio(semilla);
  const aps = modelo.apartados.filter((_, i) => !cuales || cuales.includes(i + 1));
  const tonos = tonalidades(modelo, aps.length, !cuales);
  const n = String(numeroFicha).padStart(2, '0');
  const cab = modelo.cabecera;
  const partes = [
    '---',
    `title: "${cab.title} n.º ${n}"`,
    ...(cab.subtitle ? [`subtitle: "${cab.subtitle}"`] : []),
    '---', '',
    '<!-- guion:inicio -->', '',
    `> Generada con herramientas/generar-fichas.js del modelo ${modelo.nombre}` +
      ` (semilla ${semilla}${cuales ? `; solo los ejercicios ${cuales.join(', ')}` : ''}).`,
    '> No se edita a mano: se regenera.', '',
    '<!-- guion:fin -->', '',
  ];
  const avisos = [];
  aps.forEach((ap, i) => {
    const hecho = ejercicio(ap, tonos[i], ap.reglas);
    if (!hecho) throw new Error(`ejercicio ${i + 1} (${ap.attr.tipo}): ningún intento cumple el modelo`);
    hecho.avisos.forEach(a => avisos.push(`ejercicio ${i + 1}: ${a}`));
    const attr = { tipo: ap.attr.tipo, tono: tonos[i], ...(ap.attr.pide ? { pide: ap.attr.pide } : {}) };
    partes.push(`::: {.ejercicio ${atributosLinea(attr)}}`, '```lilypond', hecho.codigo.trimEnd(), '```');
    if (ap.nota) partes.push('', ap.nota);
    partes.push(':::', '');
  });
  return { texto: partes.join('\n'), avisos };
}

/* ---------- principal ---------- */

function main() {
  const args = process.argv.slice(2);
  const opcion = (nombre, defecto) => { const i = args.indexOf(nombre); return i >= 0 ? args[i + 1] : defecto; };
  const nombre = args.find((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--')));
  if (!nombre) { console.error('Uso: node herramientas/generar-fichas.js <modelo> [--cuantas n] [--semilla s] [--salida dir] [--ejercicios 1,2]'); process.exit(2); }
  const fichero = fs.existsSync(nombre) ? nombre : path.join(RAIZ, 'fichas', 'modelos', nombre.replace(/\.md$/, '') + '.md');
  const modelo = V.leerModelo(fichero);
  if (modelo.errores.length) { modelo.errores.forEach(e => console.error(`✗ ${e}`)); process.exit(1); }
  modelo.cabecera = V.leerFicha(fichero).cabecera;
  const cuantas = +opcion('--cuantas', 10), semilla = +opcion('--semilla', 1);
  const cuales = opcion('--ejercicios') ? opcion('--ejercicios').split(',').map(Number) : null;
  const salida = opcion('--salida', path.join(RAIZ, 'tmp', 'generadas', modelo.nombre));
  fs.mkdirSync(salida, { recursive: true });
  for (let n = 1; n <= cuantas; n++) {
    const s = semilla * 1000 + n;
    const { texto, avisos } = generarFicha(modelo, n, s, cuales);
    const destino = path.join(salida, `${modelo.nombre}-${String(n).padStart(2, '0')}.md`);
    fs.writeFileSync(destino, texto);
    console.log(`${path.relative(RAIZ, destino)} (semilla ${s})`);
    avisos.forEach(a => console.log(`  ! ${a}`));
  }
}

if (require.main === module) main();
module.exports = { generarFicha, ADAPTADOR, aleatorio };
