# AdFree Pro - Extensión Chrome (MV3)

Bloqueador de anuncios con funciones "premium" implementadas gratis, usando la API `declarativeNetRequest` de Chrome Manifest V3.

## Características

- Bloqueo de red de anuncios y trackers conocidos.
- Reglas de bloqueo personalizadas (red y cosméticas).
- Mejoras en YouTube: ocultar overlays, saltar/adelantar anuncios.
- Bloqueo de avisos de cookies.
- Ocultar popups, videos flotantes y formularios de registro.

## Cargar en Chrome

1. Abre `chrome://extensions/`.
2. Activa **Modo desarrollador** (arriba a la derecha).
3. Haz clic en **Cargar descomprimida**.
4. Selecciona la carpeta `adfree-pro`.

## Iconos (opcional)

Para publicar en Chrome Web Store, añade iconos PNG de 16x16, 48x48 y 128x128 en la carpeta `icons/` y añade la sección correspondiente en `manifest.json`.

## Limitaciones

- MV3 limita el número de reglas dinámicas (5.000) y estáticas (~30.000).
- YouTube lucha activamente contra los bloqueadores, por lo que el bloqueo puede requerir actualizaciones frecuentes.
- Algunos sitios pueden romperse por reglas cosméticas demasiado genéricas; puedes ajustarlas o añadir excepciones en las opciones.
