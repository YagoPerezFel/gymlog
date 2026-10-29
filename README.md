# GymLog

App web instalable (PWA) para registrar entrenamientos en el móvil. Sin dependencias ni compilación:
`index.html` + `app.js` + `sw.js`. Los datos se guardan en el propio móvil (localStorage).

Abre la URL en el móvil:
- Android (Chrome): menú ⋮ → *Añadir a pantalla de inicio* / *Instalar app*.
- iPhone (Safari): Compartir → *Añadir a pantalla de inicio* (necesario para las notificaciones en iOS).

En el móvil: Ajustes → *Buscar nuevas actualizaciones*. Los datos no se borran.

## Fotos de ejercicios
Vienen de [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (dominio público, Unlicense),
servidas por jsDelivr. `catalog.json` es una versión reducida (873 ejercicios con foto) con el grupo
muscular y el material en español. Las fotos necesitan internet la primera vez; después quedan guardadas.
