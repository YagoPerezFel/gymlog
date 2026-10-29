# GymLog

App web instalable (PWA) para registrar entrenamientos en el móvil. Sin dependencias ni compilación:
`index.html` + `app.js` + `sw.js`. Los datos se guardan en el propio móvil (localStorage).

## Probar en el PC
    python -m http.server 8000
y abre http://localhost:8000

## Instalar en el móvil
Las notificaciones y la instalación necesitan HTTPS, así que súbela a un hosting gratuito:
- **GitHub Pages**: sube esta carpeta a un repositorio → Settings → Pages → rama `main`.
- **Netlify Drop**: arrastra la carpeta a https://app.netlify.com/drop

Abre la URL en el móvil:
- Android (Chrome): menú ⋮ → *Añadir a pantalla de inicio* / *Instalar app*.
- iPhone (Safari): Compartir → *Añadir a pantalla de inicio* (necesario para las notificaciones en iOS).

## Actualizar
Al cambiar los archivos, sube `CACHE` en `sw.js` (p. ej. `gymlog-v2`) y vuelve a subirlos.

## Fotos de ejercicios
Vienen de [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (dominio público, Unlicense),
servidas por jsDelivr. `catalog.json` es una versión reducida (873 ejercicios con foto) con el grupo
muscular y el material en español. Las fotos necesitan internet la primera vez; después quedan guardadas.
