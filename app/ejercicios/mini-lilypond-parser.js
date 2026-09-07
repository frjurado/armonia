/* ============================================================
   mini-LilyPond — parser
   ------------------------------------------------------------
   Convierte la cadena de contenido musical de UNA voz (campo
   `music` del JSON) en un modelo de eventos. Implementa la
   gramática de `Gramatica-mini-lilypond.md`:
     · notas, acordes <...>, silencios r (visible) y s (invisible)
     · alteraciones inglesas: s / f / ss / ff
     · octava absoluta: c = C3, c' = C4 (do central)
     · duraciones 1 2 4 8 16 32 con puntillos, y ARRASTRE
       (si falta, hereda la anterior; negra por defecto)
     · ligadura de prolongación ~ (se adjunta a la nota/acorde previo)
     · bar check | (valida el cuadre del compás dado en opts.time)
   Uso:
     const { parseVoice } = require('./mini-lilypond-parser');  // Node
     MiniLily.parseVoice(str, { time: "4/4" });                 // navegador
   ============================================================ */
(function (global) {
  'use strict';

  const LETTER_SEMITONE = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
  const ACCID = { ss: 2, s: 1, ff: -2, f: -1 };

  // Duración (en redondas) de {base, dots}: 1/base * (2 - (1/2)^dots)
  function durValue(d) { return (1 / d.base) * (2 - Math.pow(0.5, d.dots)); }
  function meterToWhole(t) { const p = t.split('/').map(Number); return p[0] / p[1]; }
  function lastPlayable(evs) {
    for (let k = evs.length - 1; k >= 0; k--)
      if (evs[k].type === 'note' || evs[k].type === 'chord') return evs[k];
    return null;
  }

  function parseVoice(src, opts) {
    opts = opts || {};
    const time = opts.time || null;
    const measureLen = time ? meterToWhole(time) : null;
    const s = String(src);
    let i = 0;
    const events = [];
    const errors = [];
    let lastDur = { base: 4, dots: 0 };   // arrastre: negra al inicio
    let total = 0;                        // acumulado en redondas

    const EPS = 1e-9;
    const isWs = c => c === ' ' || c === '\t' || c === '\n' || c === '\r';
    const isLetter = c => c >= 'a' && c <= 'g';
    function ws() { while (i < s.length && isWs(s[i])) i++; }

    function readDuration() {
      const m = /^(1|2|4|8|16|32)(\.*)/.exec(s.slice(i));
      if (!m) return null;
      i += m[0].length;
      return { base: parseInt(m[1], 10), dots: m[2].length };
    }
    function applyDur() {
      const d = readDuration();
      if (d) { lastDur = d; return d; }
      return { base: lastDur.base, dots: lastDur.dots };
    }
    function readPitch() {
      const letter = s[i]; i++;
      let alter = 0;
      const two = s.slice(i, i + 2);
      if (two === 'ss' || two === 'ff') { alter = ACCID[two]; i += 2; }
      else { const one = s[i]; if (one === 's' || one === 'f') { alter = ACCID[one]; i++; } }
      let oct = 3;
      if (s[i] === "'") { while (s[i] === "'") { oct++; i++; } }
      else if (s[i] === ',') { while (s[i] === ',') { oct--; i++; } }
      const midi = (oct + 1) * 12 + LETTER_SEMITONE[letter] + alter;
      return { letter, alter, octave: oct, midi };
    }

    while (i < s.length) {
      ws(); if (i >= s.length) break;
      const c = s[i];

      if (c === '|') {                               // bar check
        i++;
        if (measureLen == null) {
          errors.push('Bar check "|" sin compás definido (pos ' + i + ')');
        } else {
          const r = total % measureLen;
          if (Math.abs(r) > EPS && Math.abs(r - measureLen) > EPS)
            errors.push('Bar check no cuadra: acumulado ' + total +
                        ' no es múltiplo de ' + measureLen + ' (pos ' + i + ')');
        }
        continue;
      }

      if (c === '~') {                               // ligadura de prolongación
        i++;
        const prev = lastPlayable(events);
        if (!prev) errors.push('Ligadura "~" sin nota previa (pos ' + i + ')');
        else prev.tie = true;
        continue;
      }

      if (c === '<') {                               // acorde
        i++; ws();
        const notes = [];
        while (i < s.length && s[i] !== '>') {
          if (!isLetter(s[i])) { errors.push('Carácter inesperado en acorde: "' + s[i] + '" (pos ' + i + ')'); i++; ws(); continue; }
          notes.push(readPitch()); ws();
        }
        if (s[i] !== '>') errors.push('Acorde sin cierre ">" (pos ' + i + ')');
        else i++;
        const d = applyDur();
        events.push({ type: 'chord', notes, base: d.base, dots: d.dots, tie: false });
        total += durValue(d);
        continue;
      }

      if (c === 'r' || c === 's') {                  // silencio (visible / invisible)
        i++;
        const d = applyDur();
        events.push({ type: 'rest', visible: c === 'r', base: d.base, dots: d.dots });
        total += durValue(d);
        continue;
      }

      if (isLetter(c)) {                             // nota
        const p = readPitch();
        const d = applyDur();
        events.push({ type: 'note', letter: p.letter, alter: p.alter, octave: p.octave,
                      midi: p.midi, base: d.base, dots: d.dots, tie: false });
        total += durValue(d);
        continue;
      }

      errors.push('Carácter inesperado: "' + c + '" (pos ' + i + ')');
      i++;
    }

    return { events, errors, totalDuration: total };
  }

  const api = { parseVoice, durValue, meterToWhole };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else global.MiniLily = api;
})(typeof window !== 'undefined' ? window : globalThis);
