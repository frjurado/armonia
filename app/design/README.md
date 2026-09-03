# Handoff: Rediseño «Armonía · Ejercicios breves» (opción 2b)

## Overview
Rediseño de una web educativa de ejercicios de armonía para conservatorio (3.º y 4.º de EE.PP.), usada en una **pizarra digital táctil** (smart board, ~1920×1080, el profesor toca directamente la pantalla). Dos vistas: el **menú** (selección de curso → unidad → familia de ejercicios → modalidad) y la **vista de ejercicio** (partitura + flujo «mostrar respuesta»).

La dirección elegida es "editorial entintada": layout sin barra lateral con tipografía serif de aire editorial, cabecera en azul intenso `#31506e`, esquinas suaves (12–14 px), y objetivos táctiles grandes.

## About the Design Files
Los archivos de este paquete son **referencias de diseño creadas en HTML** — prototipos que muestran el aspecto y comportamiento previstos, **no código de producción para copiar tal cual**. La tarea es **recrear estos diseños en el entorno existente del repo** (el prototipo actual es HTML/JS vanilla con un parser mini-LilyPond y render de partituras; si se elige un framework, usar el que mejor encaje con el proyecto) respetando sus patrones. Conservar la lógica existente (generación de ejercicios, audio, render Verovio/mini-lilypond) y aplicar esta capa visual.

## Fidelity
**High-fidelity (hifi)**: colores, tipografía, espaciados y estados finales. Recrear con precisión. Nota de escala: los mockups están maquetados a **1440 px de ancho de referencia (~75% de una pizarra 1920 px)**. En producción, o bien servir a 1440 px lógicos y dejar escalar al navegador, o multiplicar las medidas por ~1.33 para 1920 px nativos. Regla absoluta en pantalla real: **texto ≥ 24 px, objetivos táctiles ≥ 64 px**.

## Screens / Views

### 1. Menú (`mockup-menu.html`)
**Purpose**: elegir curso, ver unidades del curso, y lanzar un ejercicio (familia × modalidad).

**Layout**
- Sin barra lateral. Página de ancho completo sobre fondo `#f7f7f4`.
- **Cabecera entintada** (`#31506e`, texto blanco), padding `36px 56px 0`:
  - Izquierda: título "Armonía" (Source Serif 4, 46px/600, letter-spacing -0.015em) y subtítulo en itálica serif 19px, blanco al 65%.
  - Centro: motivo de pentagrama — franja flexible de 44px con `repeating-linear-gradient` horizontal (líneas blancas al 28%, 1px cada 10px).
  - Derecha: leyenda de las 3 modalidades con iconos (lupa=Identificación, auriculares=Audición, micrófono=Canto), 14px, blanco al 75%.
  - **Pestañas de curso** en la base de la cabecera: la activa es una pestaña con fondo `#f7f7f4` (se funde con el contenido), radios `12px 12px 0 0`, serif 23px/600 + sufijo sans 15px gris ("— Diatónico"); la inactiva `rgba(255,255,255,.1)` (hover `.18`), texto blanco al 75%.
- **Lista de unidades**, padding `8px 56px 48px`, filas separadas por `1px solid #dcdcd6`:
  - **Unidad expandida (activa)**: grid `120px 1fr`. Numeral serif gigante 64px/600 en `#31506e`. Título serif 26px/600. Debajo, grid de 3 columnas (gap 28px) — una por familia (Tríadas, Intervalos, Movimiento armónico), cada una con cabecera sans 17px/700 con borde inferior `#e6e6df`, y debajo 3 botones de modalidad apilados (gap 9px):
    - **Disponible**: fondo `#31506e`, texto blanco 16px/600, radio 12px, alto 56px, icono 19px; hover `#2a4459`.
    - **Bloqueado**: borde `1.5px dashed #dcdcd6`, texto `#c9c9c2`, mismo tamaño, sin interacción.
  - **Unidad colapsada**: grid `120px 1fr auto`, padding vertical 22px. Numeral serif 40px/400 `#c9c9c2`, título serif 21px `#6b6b66`, a la derecha candado + "PRÓXIMAMENTE" (14px, uppercase, letter-spacing .06em, `#a5a59e`). Hover de fila: fondo `#f2f1ec`. Al tocar una unidad colapsada disponible, se expande y colapsa la anterior.

**Contenido real** (curso 3.º): U1 «Introducción, morfología, conducción de voces» (activa); U2 «Tónica y dominante (E.F.; I6, V6, VII6)»; U3 «Subdominante; cadencia auténtica y semicadencia»; U4 «Inversiones de V7; 6/4 cadencial y de paso»; U5 «VI, IV y II; 6/4 bordadura; cadencia rota»; U6 «Secuencias diatónicas». Curso 4.º = Cromático (contenido pendiente).

### 2. Vista de ejercicio (`mockup-ejercicio.html`)
**Purpose**: mostrar un ejercicio generado (partitura), escucharlo, revelar la respuesta y encadenar el siguiente.

**Layout**
- **Barra superior entintada** `#31506e`, padding `16px 36px`, flex con gap 20px:
  - Botón volver «← Unidad 1 · Tríadas»: 52px de alto, radio 12px, fondo `rgba(255,255,255,.14)` (hover `.22`), 16px/600.
  - Título serif 24px/600 «Identificación de tríadas» + subtítulo 13px blanco al 60%.
  - Derecha: selector de **nivel** — etiqueta "Nivel" + 3 cuadrados de 40px, radio 10px; activo fondo blanco/texto `#31506e`; inactivos borde blanco al 35%. (En pizarra real conviene subirlos a ≥56px.)
- **Cuerpo**: contenedor centrado max-width 1240px, padding `34px 36px 46px`, **grid `1fr 360px`, gap 30px**:
  - **Columna izquierda**: pregunta centrada 18px `#6b6b66` (términos clave en negrita `#1d1d1b`); debajo, tarjeta de partitura — fondo blanco, borde `1px #dcdcd6`, radio 14px, padding 34px. El SVG del mockup es un placeholder: **sustituir por el render real (Verovio / mini-lilypond-parser del repo)**.
  - **Columna derecha (acciones)**, flex column gap 12px:
    - «Escuchar acorde» (secundario): 68px alto, borde `1.5px #dcdcd6`, radio 14px, fondo blanco, 18px/600, icono play; hover borde+texto `#31506e`.
    - «Mostrar respuesta» (primario): 68px alto, fondo `#31506e`, blanco, 18px/700, radio 14px; hover `#2a4459`.
    - Separador `1px #dcdcd6`; debajo «↻ Otro similar» y «↑ Más difícil» (64px, borde `#dcdcd6`, 17px/600), **deshabilitados (opacity .45) hasta revelar la respuesta**.
    - Nota auxiliar 13.5px `#a5a59e`.

## Interactions & Behavior
- **Menú**: cambiar pestaña de curso repuebla las unidades. Tocar botón de modalidad disponible navega al ejercicio. Botones bloqueados no responden (candado/«próximamente»).
- **Ejercicio (flujo «mostrar respuesta»)**:
  1. Al generar el ejercicio suena el acorde una vez y se muestra la partitura.
  2. «Escuchar acorde» lo repite (repetible).
  3. «Mostrar respuesta» revela la solución — insertar bajo la partitura (o sobre la columna) un panel de respuesta: fondo `#eef5f0`, borde `1px #bcd6c6`, radio 14px, título serif 30px/600 `#2e7d52` (p. ej. «Tríada mayor») + detalle 15px `#6b6b66`. A la vez, activa «Otro similar» y «Más difícil» (quitar opacity) y puede deshabilitar «Mostrar respuesta».
  4. «Otro similar» genera otro ejercicio del mismo nivel; «Más difícil» sube de nivel (actualiza el selector).
- **Niveles**: 1–3; el nivel 3 puede añadir preguntas extra (p. ej. inversión).
- Transiciones sobrias: 150–200 ms ease en hovers/estado; sin animaciones decorativas.
- Todo debe funcionar por toque directo (sin depender de hover para información esencial).

## State Management
- `cursoActivo` (3 | 4), `unidadExpandida` (id), catálogo de unidades/familias/modalidades con flag `disponible`.
- En ejercicio: `nivel` (1–3), `ejercicioActual` (datos generados), `respuestaMostrada` (bool) — controla panel de respuesta y habilitación de acciones de seguimiento.
- Datos de ejercicios: generados por la lógica existente del repo (parser mini-LilyPond + render).

## Design Tokens
**Colores**
- Fondo página: `#f7f7f4` · Superficies: `#ffffff`
- Azul primario (tinta): `#31506e` · hover: `#2a4459` · azul alterno del prototipo: `#3a5a78`
- Texto: `#1d1d1b` · secundario: `#6b6b66` · deshabilitado/mudo: `#a5a59e`, `#c9c9c2`
- Bordes: `#dcdcd6` · borde suave: `#e6e6df` · hover de fila: `#f2f1ec`
- Éxito (respuesta): texto `#2e7d52`, fondo `#eef5f0`, borde `#bcd6c6`
- Sobre azul: blanco con alfas .1/.14/.22/.28/.35/.5/.6/.65/.75

**Tipografía**
- Display/serif: **Source Serif 4** (Google Fonts) — títulos, numerales de unidad, pestañas. Itálica para subtítulos.
- UI/sans: **Source Sans 3** — botones, etiquetas, cuerpo.
- Escala (a 1440 px ref.): 46/26/24/23/21/18/17/16/15/14/13.5/13 px; numerales 64 y 40 px.

**Espaciado y forma**
- Padding de página: 56px lateral (menú), 36px (ejercicio). Gaps: 9/12/20/24/28/30px.
- Radios: botones 12–14px; tarjetas 14px; pestañas 12px arriba. **Nada de píldoras.**
- Alturas táctiles: botones de modalidad 56px; acciones de ejercicio 64–68px; volver 52px.
- Sombra: ninguna o mínima — la jerarquía se hace con tinta, bordes y tipografía.

## Assets
- Iconos: SVG inline de trazo (stroke 2, linecap/linejoin round), estilo Feather/Lucide: lupa, auriculares, micrófono, candado, play, flechas. Sin emojis.
- Fuentes: Google Fonts (Source Serif 4, Source Sans 3).
- Partituras: render en vivo (Verovio o el mini-lilypond-parser existente); el SVG del mockup es solo placeholder.

## Files
- `mockup-menu.html` — menú (curso 3.º, Unidad 1 expandida).
- `mockup-ejercicio.html` — vista de ejercicio (estado inicial, antes de revelar respuesta; el estado revelado se describe arriba).
