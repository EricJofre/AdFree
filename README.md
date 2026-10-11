# AdFree Pro - Extensión Chrome (MV3)

Bloqueador de anuncios con funciones "premium" implementadas gratis, usando la API `declarativeNetRequest` de Chrome Manifest V3.

## Características

- Bloqueo de red de anuncios y trackers conocidos.
- Reglas de bloqueo personalizadas (red y cosméticas).
- Mejoras en YouTube: ocultar overlays, saltar/adelantar anuncios.
- Bloqueo de avisos de cookies.
- Ocultar popups, videos flotantes y formularios de registro.

## Cómo instalar en Chrome

### 1. Descargar el código

- **Con Git** (recomendado):
  ```bash
  git clone https://github.com/EricJofre/AdFree.git
  cd AdFree
  ```
- **Sin Git**: ve a [https://github.com/EricJofre/AdFree](https://github.com/EricJofre/AdFree), haz clic en **Code > Download ZIP** y descomprime el archivo.

### 2. Abrir Chrome en modo desarrollador

1. Escribe `chrome://extensions/` en la barra de direcciones y presiona Enter.
2. Activa el interruptor **Modo desarrollador** (arriba a la derecha).

### 3. Cargar la extensión

1. Haz clic en el botón **Cargar descomprimida**.
2. Selecciona la carpeta `adfree-pro` (la que contiene `manifest.json`).
3. Chrome instalará la extensión y aparecerá el icono en la barra de herramientas.

### 4. Fijarla (opcional)

1. Haz clic en el icono de extensiones (🧩) en Chrome.
2. Junto a **AdFree Pro**, haz clic en el pin 📌 para fijarla.

### 5. Configurar

Haz clic derecho en el icono y selecciona **Opciones** para activar/desactivar funciones o añadir reglas personalizadas.

## Iconos (opcional)

Para publicar en Chrome Web Store, añade iconos PNG de 16x16, 48x48 y 128x128 en la carpeta `icons/` y añade la sección correspondiente en `manifest.json`.

## Limitaciones

- MV3 limita el número de reglas dinámicas (5.000) y estáticas (~30.000).
- YouTube lucha activamente contra los bloqueadores, por lo que el bloqueo puede requerir actualizaciones frecuentes.
- Algunos sitios pueden romperse por reglas cosméticas demasiado genéricas; puedes ajustarlas o añadir excepciones en las opciones.
