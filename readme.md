# 💻 TecnoStock - Catálogo y Gestión de Pedidos

**TecnoStock** es una aplicación web para consultar productos tecnológicos y armar pedidos, hecha con **JavaScript nativo**, Web Components y CSS responsivo, sin dependencias ni frameworks externos.

---

## 🚀 Cómo ejecutar el proyecto

> ⚠️ **Importante:** el proyecto usa **módulos de JavaScript** y `fetch()` sobre un JSON local. Por seguridad del navegador no funciona con doble clic sobre `index.html`; necesita un servidor HTTP.


## 📦 Funcionalidades implementadas

### 1. Catálogo y carga asíncrona (RF-01)
* Carga los 12 productos desde `data/products.json` con `fetch()`.
* **Validación de integridad:** descarta registros inválidos (IDs no numéricos o negativos, nombre vacío, precio no positivo, stock negativo o campos con tipo incorrecto).
* Muestra estados de **cargando**, **sin resultados** y **error** en `#mensajeEstado`.

### 2. Búsqueda, filtros y ordenamiento (RF-02)
* Búsqueda en tiempo real por nombre o descripción, sin distinguir mayúsculas ni minúsculas.
* Cuatro botones fijos de categoría: **Todos, Periféricos, Componentes y Mantenimiento**.
* Checkbox **"Solo disponibles"** que deja únicamente productos activos con stock mayor a cero.
* Selector de orden: relevancia, precio de menor a mayor, precio de mayor a menor, nombre A-Z y nombre Z-A (`localeCompare`).
* Botón **"Limpiar filtros"** que restablece todo sin recargar la página.

### 3. Web Components y eventos personalizados (RF-05 y RF-06)
* `<product-card>`: tarjeta autónoma que despacha `producto-agregar` con `bubbles` y `composed`. Si el producto está inactivo o sin existencias, desactiva el botón y muestra "Agotado".
* `<product-list>`: instancia las tarjetas y avisa cuando no hay resultados.
* `<shopping-cart>`: dibuja las líneas del pedido y despacha `carrito-cambiar`, `carrito-eliminar`, `carrito-vaciar` y `pedido-confirmar`.

### 4. Carrito y reglas de negocio (RF-03 y RF-04)
* No permite agregar ni subir cantidades por encima del stock real.
* El botón `-` baja la cantidad pero nunca por debajo de 1.
* **Descuento del 10 %** automático cuando el subtotal llega a **$300.000 COP** o más; si no, el resumen indica cuánto falta para el descuento.
* Importes en pesos colombianos con `toLocaleString("es-CO")`.

### 5. Confirmación del pedido (RF-08)
* Verifica que el carrito no esté vacío y vuelve a validar la disponibilidad de cada artículo.
* Genera un identificador único de pedido (ejemplo: `TECNO-M7X2K9`).
* Abre un `<dialog>` con las líneas compradas, subtotal, descuento y total.
* El carrito se vacía solo cuando la compra se confirma.

### 6. Persistencia con LocalStorage (RF-07)
* Guarda el carrito en la clave `carritoPagina` tras cada cambio.
* Al recargar (`F5`) valida el JSON, descarta líneas corruptas y ajusta cantidades al stock disponible.

### 7. Diseño adaptable y accesible (RF-09)
* Dos cortes en `css/styles.css`:
  * **Móvil (hasta 767 px):** catálogo a 2 columnas y carrito como panel deslizante a pantalla completa.
  * **Tablet (768 px o más):** catálogo a 3 columnas y avisos en la esquina.
  * **Escritorio (1024 px o más):** catálogo a 4 columnas.


