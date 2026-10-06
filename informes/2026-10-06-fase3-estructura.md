# Fase 3: estructura (esquema, menú, nombres, enlaces con los apuntes)

*6 de octubre de 2026. Tercera fase del plan de
[la revisión tras el uso en clase](2026-10-05-revision-tras-clase.md).*

## Qué se ha hecho

- **Nombres por material.** 28 ficheros de la app renombrados (`unidad0-acordes-tipo.html`
  → `acordes-tipo.html`, `c4u0-cadencias-core.js` → `cadencias-core.js`…) y sus globales
  (`U0Acordes` → `Acordes`, `Morfologia` → `BajoCifrado`, `Familia3` → `Movimientos`…), con
  todas sus referencias. La página de Bajo cifrado es `bajo-cifrado-lectura.html`.
  `familia2-intervalos-*` se queda hasta fundirse con `intervalos-*` en la fase 4. Las URL
  públicas de los ejercicios cambian; la del QR (la raíz), no.
- **Un solo esquema en `curriculum-data.js`**: unidades (con `id`, el mismo que el del
  apunte) → familias → `consignas`. Desaparecen los modos id/au/ct; las dos familias
  ocultas de la UD 1 pasan a consignas con icono propio (lupa, auriculares, micrófono).
- **Menú en filas**: una fila por familia, con sus consignas a la derecha; en móvil, como
  antes. Se abre en una unidad con `#ud=c3u1`.
- **Enlaces entre apuntes y ejercicios**, con el diseño acordado (`app/docs/Modelo-ejercicios.md`
  §3.1): en cada ejercicio, «Apuntes · 1.2 Cifrado de grados» delante de «Ayuda»; en el
  menú, «Apuntes de la unidad»; en los apuntes, «Ejercicios» en la cabecera y «Para
  practicar» al final de cada epígrafe citado. El PDF, sin enlaces.

## Decisiones tomadas

Las del diseño (granularidad consigna ↔ subepígrafe más «Ejercicios» por unidad, «Para
practicar», PDF sin enlaces, enlace en el menú) las tomó el profesor antes de implementar.
Al implementar:

- **Una sola declaración**, en `curriculum-data.js` (`apuntes` de cada consigna). Los
  apuntes la leen con Node al construirse (el fichero termina en `module.exports`).
- **`apuntes/enlaces.js`**, generado por `construir.py`: las unidades publicadas y el
  título de cada epígrafe citado. La app lo carga si existe: de él saca el texto del botón
  y sabe si la unidad está publicada. Sin él no pinta enlaces, así que nunca enlaza a una
  página inexistente y sigue funcionando sola. No contradice la jerarquía: la declaración
  está en el currículo; los apuntes solo publican su índice.
- **Los enlaces van solo en las copias publicadas** (`build/sitio/`): `build/` queda como
  sale de Pandoc, y así cambiar los datos no obliga a recompilar las unidades.
- **El primer epígrafe** de la lista es el del botón del ejercicio; todos reciben su «Para
  practicar». *Intervalos con grados* cita c3u0 §2 y c3u1 §1.2 (los grados con
  circunflejo); *Acordes con grados*, c3u1 §1.1. Las asignaciones, revisables, están en
  `curriculum-data.js`.
- **Anclas.** Son las que Pandoc saca del título; si un título cambia, `construir.py`
  avisa de cada consigna que cite un ancla inexistente (probado rompiendo una a propósito).

## Cómo se ha validado

- Sitio montado (`sitio/montar.sh` en modo dev) y recorrido en Chrome sin interfaz: menú,
  ejercicios y apuntes; todos los enlaces internos responden y todas las anclas existen;
  `#ud=` y `#de=` abren la unidad debida; capturas en escritorio y móvil.
- Las 18 páginas de ejercicio con sus nombres nuevos: cargan sin errores, y las migradas
  no se mueven al revelar.
- Validaciones masivas (`tests/masivo-*.js`, con `masivo-bajo-cifrado.js` renombrado): 0
  fallos, 0 infracciones, 0 problemas de render.

## Queda

- Fase 4 (contenido): Intervalos y Acordes de la UD 0 en pentagrama doble y sin niveles,
  generador de intervalos único y consigna Consonancia, «Oír» (con `?oir`) en Cadencias ·
  Tipo, y Movimiento armónico tras mejorar `contrapunto-core.js`.
- Al publicar, quien tenga guardada la dirección de un ejercicio concreto la encontrará
  rota (cambian los nombres); desde el menú y el QR, nada cambia.
