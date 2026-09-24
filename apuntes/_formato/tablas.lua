-- Solo para el HTML: cada tabla, dentro de un <div class="tabla">.
--
-- En el móvil una tabla puede no caber a lo ancho, y sin contenedor lo
-- que se desplaza es la página entera (con un hueco vacío al lado del
-- texto). Con él, se desplaza solo la tabla: ver .tabla en apuntes.css.
-- Una <table> no puede hacerlo por sí misma sin dejar de ser tabla
-- (con display:block pierde el reparto de columnas a todo lo ancho).

function Table(tabla)
  return pandoc.Div({ tabla }, { class = "tabla" })
end
