-- Cifrado de grados apilado, en el HTML y en el PDF.
--
-- En el .md se escribe un CÓDIGO, con la inversión a la anglosajona
-- (I6, I6/4, V7, V6/5, V4/3, V4/2), y aquí se convierte en el romano con
-- sus cifras apiladas, como en una partitura. Qué cifras salen para cada
-- código lo dice curriculum/cifrado.json, la misma tabla que usan los
-- ejemplos de LilyPond: cambiar de convención es cambiar esa tabla.
--
-- También se apilan las cifras sueltas de bajo cifrado (6/4, 6/3, 5/3,
-- 6/5, 4/3, 4/2: «el 6/4 cadencial»), que no dependen de la tabla.
-- Lo que no debe convertirse se escribe como código (`6/4`).
--
-- Se reconoce dentro de cualquier palabra de texto («I–VII6–I6» son tres
-- códigos), siempre que el romano no vaya pegado a otra letra o cifra.

local dir = PANDOC_SCRIPT_FILE:match("^(.*)[/\\]") or "."
local ruta = dir .. "/../../curriculum/cifrado.json"
local fichero = assert(io.open(ruta, "r"), "no encuentro " .. ruta)
local TABLA = pandoc.json.decode(fichero:read("a"), false)
fichero:close()

local DOMINANTE = {}
for _, r in ipairs(TABLA["dominante"]) do DOMINANTE[r] = true end

-- el más largo primero: si no, «VII6» se leería como «V» + «II6»
local ROMANOS = { "VII", "III", "VI", "IV", "II", "V", "I" }
local INVERSIONES = { "6/4", "6/5", "4/3", "4/2", "6", "7" }
local SUELTAS = { "6/4", "6/3", "5/3", "6/5", "4/3", "4/2" }
local SEPTIMA = { ["7"] = true, ["6/5"] = true, ["4/3"] = true, ["4/2"] = true }

local function cifras_de(romano, inversion)
  if SEPTIMA[inversion] then
    local tabla = DOMINANTE[romano] and "séptima de dominante" or "séptima"
    return TABLA[tabla][inversion]
  end
  return TABLA["tríada"][inversion]
end

-- ¿Lo que hay en la posición i puede empezar un código? No, si viene
-- pegado a una letra, una cifra, una barra o un punto («3.ª», «UD 1»).
-- Clases ASCII escritas a mano y no %w: %w depende de la configuración
-- regional, y en Windows toma por letra el último byte de «–» (así,
-- «I–V4/3» no se convertía).
local function libre_antes(s, i)
  return i == 1 or not s:sub(i - 1, i - 1):match("[A-Za-z0-9/.]")
end

local function libre_despues(s, j)
  return j > #s or not s:sub(j, j):match("[A-Za-z0-9/]")
end

local function empieza(s, i, lista)
  for _, x in ipairs(lista) do
    if s:sub(i, i + #x - 1) == x then return x end
  end
end

local function cadena_typst(s)
  return '"' .. s:gsub("\\", "\\\\"):gsub('"', '\\"') .. '"'
end

local function dibujar(romano, cifras)
  if FORMAT:match("typst") then
    local args = { cadena_typst(romano) }
    for _, c in ipairs(cifras) do args[#args + 1] = cadena_typst(c) end
    -- el «;» cierra la llamada: sin él, un «(» o un «[» que viniera
    -- detrás en el texto se tomaría como más argumentos
    return pandoc.RawInline("typst", "#cifra(" .. table.concat(args, ", ") .. ");")
  end
  local filas = {}
  for _, c in ipairs(cifras) do filas[#filas + 1] = "<span>" .. c .. "</span>" end
  local lectura = (romano .. " " .. table.concat(cifras, " ")):gsub("^ ", "")
  return pandoc.RawInline("html",
    '<span class="cifra" title="' .. lectura .. '">' .. romano ..
    '<span class="cifras">' .. table.concat(filas) .. '</span></span>')
end

local function trocear(s)
  local trozos, desde, i = {}, 1, 1
  while i <= #s do
    local hecho = false
    if libre_antes(s, i) then
      local romano = empieza(s, i, ROMANOS)
      local inversion = romano and empieza(s, i + #romano, INVERSIONES)
      local suelta = not romano and empieza(s, i, SUELTAS)
      local fin
      if inversion then
        fin = i + #romano + #inversion
      elseif suelta then
        fin = i + #suelta
      end
      if fin and libre_despues(s, fin) then
        if i > desde then trozos[#trozos + 1] = pandoc.Str(s:sub(desde, i - 1)) end
        if inversion then
          trozos[#trozos + 1] = dibujar(romano, cifras_de(romano, inversion))
        else
          trozos[#trozos + 1] = dibujar("", { suelta:match("^(%d)/(%d)$") })
        end
        desde, i, hecho = fin, fin, true
      end
    end
    if not hecho then i = i + 1 end
  end
  if desde == 1 then return nil end   -- nada que cambiar
  if desde <= #s then trozos[#trozos + 1] = pandoc.Str(s:sub(desde)) end
  return trozos
end

function Str(el)
  return trocear(el.text)
end
