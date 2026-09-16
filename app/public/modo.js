/* modo.js — en qué modo corre la app: 'dev' o 'publico'.
   Este fichero, tal como está en el repositorio, dice 'dev': en local y en
   la copia de desarrollo del sitio (…/armonia/dev/) se ve todo. Al montar
   la versión pública, sitio/montar.sh lo sobrescribe con 'publico', y el
   menú oculta las unidades sin `publico:true` en curriculum-data.js.
   Si no carga, index.html asume 'publico'. */
window.ARMONIA_MODO = 'dev';
