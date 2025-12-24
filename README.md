# Servicios de Data, Analytics y Automatización – Cotizador Web

Este repositorio contiene el proyecto final del curso de **JavaScript de Coderhouse**, desarrollado por mi persona (**Diego Chiang**).  
Se trata de una web estática que permite a potenciales clientes armar una cotización de servicios relacionados con data, analytics, simulación y automatización.

El proyecto está pensado como un sitio de presentación profesional y, al mismo tiempo, como un flujo simple de cotización que pueda correrse tanto de forma estática (GitHub Pages) como en un entorno local.

---

## 1. Descripción general

La aplicación simula un proceso de cotización de servicios:

1. El usuario explora un **catálogo de servicios** filtrable.
2. Agrega uno o varios servicios a una **cotización** (carrito), ajustando cantidades.
3. Revisa el resumen de la cotización y, si está conforme, completa sus **datos de contacto**.
4. La aplicación genera un **resumen final** que se muestra en una pantalla de éxito.

Toda la lógica de interacción está desarrollada en JavaScript “vainilla” (sin frameworks de frontend), utilizando buenas prácticas vistas en el curso.

---

## 2. Funcionalidades principales

- **Catálogo dinámico de servicios**
  - Los servicios se cargan desde un archivo `data.json` mediante `fetch`.
  - Filtros por:
    - Categoría (Business Intelligence, Analytics, Simulación, Automatización, Formación).
    - Herramienta principal.
    - Enfoque (Operaciones, Proyectos, Finanzas, etc.).
  - Buscador por nombre de servicio.

- **Cotización (carrito)**
  - Agregado de servicios al carrito desde el catálogo.
  - Manejo de **cantidad por servicio** (sumar/restar unidades).
  - Cálculo de:
    - Total de servicios.
    - Total de horas estimadas.
    - Costo total estimado.
  - Persistencia en **localStorage** para mantener el estado entre páginas.
  - Opción para **vaciar toda la cotización** con confirmación visual.

- **Checkout**
  - Formulario para capturar:
    - Nombre completo.
    - Correo electrónico.
    - Empresa o proyecto.
    - Sector.
    - Comentarios adicionales.
  - Validaciones básicas en el lado del cliente.
  - Resumen de la cotización en una tabla:
    - Servicio, categoría, cantidad, subtotal y horas.
  - Deshabilitado del formulario y botones cuando no hay ítems en la cotización.
  - Uso de popups de confirmación para:
    - Vaciar el resumen de cotización.
    - Confirmar el envío de la solicitud.

- **Pantalla de éxito**
  - Muestra el nombre y correo del contacto.
  - Tabla con el detalle final de la cotización (servicios, subtotales, horas).
  - Totales de servicios, horas y costo.
  - Limpieza del carrito al finalizar el flujo.

---

## 3. Estructura principal del proyecto

```text
.
├── index.html                # Catálogo de servicios
├── pages/
│   ├── carrito.html          # Resumen de cotización (carrito)
│   ├── checkout.html         # Datos de contacto y envío
│   └── exito.html            # Resumen final de la solicitud
├── css/
│   └── styles.css            # Estilos generales del sitio
├── js/
│   ├── catalogo.js           # Lógica del catálogo y filtros (fetch a data.json)
│   ├── carrito.js            # Lógica del carrito y resumen
│   ├── checkout.js           # Lógica del formulario y armado del pedido
│   ├── exito.js              # Render de la pantalla final
│   └── constantes/
│       └── constantes.js     # Constantes compartidas
├── data/
│   └── data.json             # Catálogo de servicios (datos en formato JSON)
└── assets/
    ├── logo/                 # Logotipos
    └── servicios/            # Imágenes de los servicios
```

---

## 4. Tecnologías utilizadas

- **HTML5** para la estructura de las páginas.
- **CSS3** para el diseño responsive y la presentación visual.
- **JavaScript (ES6+)** para:
  - Manejo del DOM.
  - Lógica de negocio (cotización, totales, validaciones, etc.).
  - Uso de `fetch` para cargar datos desde un archivo JSON.
  - Uso de `localStorage` para persistir la cotización y datos del cliente.
- **SweetAlert2** para diálogos de confirmación y mensajes de éxito en:
  - Vaciado de carrito.
  - Vaciado del resumen en checkout.
  - Confirmación de envío de la solicitud.

---

## 5. Ejecución del proyecto

### 5.1. Ejecución como sitio estático

El proyecto está preparado para funcionar como **web estática**, por ejemplo, en GitHub Pages.  
En este escenario no se requiere ningún servidor adicional, ya que GitHub sirve los archivos por `https` y `fetch` puede acceder al `data.json` sin problemas.

### 5.2. Ejecución local

Si se desea ejecutar el proyecto de forma local, es importante tener en cuenta que:

- Al tratar de abrir el archivo `index.html` directamente con doble clic, es probable que ocurran errores en `fetch` al intentar leer `data.json` por políticas de seguridad del navegador.
- Por ello, es necesario levantar un **servidor local** sencillo.

La forma más cómoda es utilizando la extensión **Live Server** en Visual Studio Code:

1. Abrir la carpeta del proyecto en VS Code.
2. Instalar la extensión **Live Server** (si todavía no está instalada).
3. En el explorador de archivos, hacer clic derecho sobre `index.html`.
4. Seleccionar **“Open with Live Server”**.
5. El proyecto se abrirá en una URL similar a:
   ```text
   http://127.0.0.1:5500/index.html
   ```
   Desde ahí todo el flujo del sitio (catálogo, carrito, checkout y éxito) funcionará correctamente.

---

## 6. Flujo de navegación recomendado

1. Entrar a `index.html` (catálogo de servicios).
2. Filtrar y/o buscar servicios de interés.
3. Agregar uno o más servicios a la cotización, ajustando la cantidad deseada.
4. Ir a la sección de **Cotización**:
   - Desde el botón de cotización en la navegación.
   - O directamente a `pages/carrito.html`.
5. Revisar el detalle, ajustar cantidades o vaciar la cotización si es necesario.
6. Continuar al **checkout** (`pages/checkout.html`), completar los datos de contacto y enviar.
7. Revisar el resumen final en `pages/exito.html`.

---

## 7. Autor

Proyecto desarrollado por **Diego Chiang** como trabajo final del curso de **JavaScript de Coderhouse**.
()
