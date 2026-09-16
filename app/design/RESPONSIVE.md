# Adaptación automática al dispositivo (pizarra ↔ móvil)

> **Estado (16-09-2026).** Aplicado el modo `compacto` (< 720 px) en
> `index.html` y `ejercicios/comun.css` tal como describe §4, más §5
> (audio: sin encolar notas con el contexto suspendido) y §6 (hovers bajo
> `@media(hover:hover)`, `:active`, `touch-action`, zona segura). **No** se
> ha adoptado la escala fluida de §3 ni los tokens de §2 por ancho: la
> premisa fue no cambiar nada por encima de 720 px, y los cortes que ya
> existían (860 px en ejercicios, 960 px en el menú) se conservan tal cual
> como modo `medio`. Pendiente de §5: rerenderizar con Verovio a
> `pageWidth` del contenedor en las partituras anchas (movimiento
> armónico), que hoy se reducen por CSS y quedan pequeñas en móvil.

Un solo código, un solo diseño. La adaptación se hace en CSS con **media queries** (nada de detección de user-agent ni de rutas distintas para móvil). Mockup móvil de referencia: `Versión móvil.dc.html` (raíz del proyecto), 390 px de ancho.

## 1. Requisitos previos

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```
Sin esta etiqueta el móvil renderiza la página a ~980 px y la encoge. Ya está en los mockups.

## 2. Puntos de corte

Tres modos, por **ancho de ventana** (`min-width`, mobile-first):

| Modo | Ancho | Dispositivo típico | Base tipográfica |
|---|---|---|---|
| `compacto` | < 720 px | móvil vertical | 16 px |
| `medio` | 720 – 1199 px | tablet, portátil | 16 px |
| `pizarra` | ≥ 1200 px | pizarra digital, monitor grande | 18 px (pizarra 1920: ~21 px) |

Además, un cuarto criterio **independiente del ancho**: si el dispositivo es táctil sin puntero fino (`(pointer: coarse)`), los objetivos táctiles suben al mínimo de 56 px aunque el ancho sea de escritorio.

```css
:root { --pad-x: 20px; --touch: 52px; --radius: 12px; }
@media (min-width: 720px)  { :root { --pad-x: 36px; --touch: 56px; } }
@media (min-width: 1200px) { :root { --pad-x: 56px; --touch: 64px; --radius: 14px; } }
@media (pointer: coarse)   { :root { --touch: max(var(--touch), 56px); } }
```

## 3. Escala tipográfica fluida

En lugar de fijar cada tamaño por corte, escalar con `clamp()` (mín. móvil, preferido fluido, máx. pizarra 1920):

```css
:root {
  --fs-display: clamp(32px, 2.4vw + 14px, 61px);   /* «Armonía» 32 → 46 (1440) → 61 (1920) */
  --fs-numeral: clamp(40px, 3.3vw + 10px, 85px);   /* numeral de unidad activa 40 → 64 → 85 */
  --fs-h2:      clamp(20px, 0.6vw + 14px, 35px);   /* título de unidad, título de ejercicio */
  --fs-tab:     clamp(19px, 0.4vw + 15px, 31px);
  --fs-body:    clamp(15px, 0.3vw + 12px, 24px);   /* botones, pregunta */
  --fs-small:   clamp(12px, 0.2vw + 10px, 19px);
}
```
Regla de la pizarra (≥ 1200 px): ningún texto por debajo de 24 px en pantalla real de 1920. Regla del móvil: ningún texto por debajo de 12 px, cuerpo ≥ 15 px.

## 4. Qué cambia en cada vista

### Menú
| Elemento | Pizarra (≥ 1200) | Compacto (< 720) |
|---|---|---|
| Cabecera | fila: título · motivo de pentagrama flexible · leyenda de modalidades | apilada: título, subtítulo corto («3.º y 4.º EE.PP.»), pentagrama de 22 px a ancho completo. **Leyenda oculta** (los iconos ya van en cada botón). |
| Pestañas de curso | inline, sufijo «— Diatónico» en la misma línea | dos pestañas `flex:1` a ancho completo; el sufijo pasa a segunda línea (12 px). |
| Unidad expandida | grid `120px 1fr`; numeral 64 px | flex; numeral 40 px junto al título (20 px). |
| Familias × modalidades | grid de 3 columnas | **una columna**: las tres familias apiladas, cada una con sus 3 botones a ancho completo (52 px alto). |
| Unidad colapsada | grid `120px 1fr auto`; texto «PRÓXIMAMENTE» + candado | grid `44px 1fr auto`; numeral 26 px, título 16 px; **solo el candado** (18 px). |
| Padding lateral | 56 px | 20 px |

```css
.familias { display: grid; grid-template-columns: 1fr; gap: 20px; }
@media (min-width: 720px) { .familias { grid-template-columns: repeat(3, 1fr); gap: 28px; } }
.leyenda { display: none; }
@media (min-width: 1200px) { .leyenda { display: flex; } }
```

### Ejercicio
| Elemento | Pizarra | Compacto |
|---|---|---|
| Barra superior | una fila: volver con texto · título · nivel a la derecha | dos filas: (1) volver **solo icono** 44×44 + título/subtítulo; (2) «Nivel» + tres botones `flex:1` de 44 px. |
| Cuerpo | grid `1fr 360px`, acciones en columna derecha | **una columna**; el bloque de acciones se convierte en **barra fija inferior** (`position: sticky; bottom: 0`) con fondo `#f7f7f4` y borde superior `#dcdcd6`. |
| Acciones | Escuchar (68) · Mostrar respuesta (68) · separador · Otro similar · Más difícil (64) apilados | fila 1: Escuchar **solo icono** 56×56 + Mostrar respuesta `flex:1` 56 px; fila 2: Otro similar · Más difícil en grid `1fr 1fr`, 52 px. |
| Partitura | SVG a tamaño fijo dentro de tarjeta 34 px de padding | SVG `width:100%` (`viewBox` + `height:auto`), tarjeta con padding 18/14 px. Verovio: rerenderizar con `pageWidth` = ancho del contenedor (ver §5). |
| Panel de respuesta | bajo la partitura, título 30 px | bajo la partitura, título 26 px; la barra inferior sigue visible. |
| Nota auxiliar | en la columna de acciones | bajo la tarjeta, centrada, 13 px; desaparece al revelar la respuesta. |

```css
.ejercicio { display: grid; grid-template-columns: 1fr; gap: 14px; }
.acciones  { position: sticky; bottom: 0; padding: 12px var(--pad-x) calc(12px + env(safe-area-inset-bottom)); }
@media (min-width: 720px) {
  .ejercicio { grid-template-columns: 1fr 360px; gap: 30px; }
  .acciones  { position: static; padding: 0; }
}
.btn-volver .texto, .btn-escuchar .texto { display: none; }
@media (min-width: 720px) { .btn-volver .texto, .btn-escuchar .texto { display: inline; } }
```

En modo `medio` (tablet) se usa el layout de pizarra con la escala fluida; sólo la barra de nivel conserva los 44 px.

## 5. Partitura y audio

- **Verovio**: al cambiar de tamaño (`ResizeObserver` sobre la tarjeta) volver a llamar a `setOptions({ pageWidth: ancho_px * (100 / scale), scale })` y `renderToSVG`. En < 720 px bajar `scale` a ~35–40 para que compás y notas quepan sin scroll horizontal.
- **mini-lilypond**: exportar el SVG con `viewBox` y sin `width`/`height` fijos; el contenedor lo escala.
- **Audio en móvil**: iOS/Android bloquean la reproducción automática. El primer acorde debe sonar tras un gesto: mostrar «Escuchar acorde» como acción inicial en lugar de reproducir al generar (el flujo de pizarra puede seguir reproduciendo automáticamente si `navigator.userActivation.hasBeenActive`).

## 6. Táctil y accesibilidad

- `touch-action: manipulation` en botones (evita el retardo de doble toque).
- Estados: sin depender de `:hover`; usar `:active` (150 ms) para feedback táctil. Envolver los hovers en `@media (hover: hover)`.
- Zona segura: `padding-bottom: env(safe-area-inset-bottom)` en la barra fija inferior.
- Todos los botones son `<button>` con `aria-label` cuando van solo icono (volver, escuchar).

## 7. Cómo probarlo

DevTools → modo dispositivo: iPhone 15 (393×852) y Pixel 8 (412×915) para `compacto`; iPad (1024) para `medio`; 1920×1080 con zoom 100 % para `pizarra`. Comprobar además «Emular pointer: coarse» a 1920 px para ver el mínimo táctil.
