/* =========================
   Formato de moneda
   ========================= */

function formatMoney(n) {
  return MONEDA + " " + (+n || 0).toFixed(2);
}

/* =========================
   Storage de cotización
   ========================= */

const LS_KEY_COTIZACION = "cotizacionServicios";

function getCotizacion() {
  let raw = localStorage.getItem(LS_KEY_COTIZACION);
  return raw ? JSON.parse(raw) : [];
}

function setCotizacion(lista) {
  localStorage.setItem(LS_KEY_COTIZACION, JSON.stringify(lista));
}

/* =========================
   Referencias del DOM
   ========================= */

let cardsContainer = document.getElementById("servicios-container");
let filtroCategoria = document.getElementById("filtroCategoria");
let filtroHerramienta = document.getElementById("filtroHerramienta");
let filtroEnfoque = document.getElementById("filtroEnfoque");
let searchInput = document.getElementById("buscadorServicio");
let cartCount = document.getElementById("cart-count");

/* =========================
   Datos de catálogo (JSON)
   ========================= */
const URL_CATALOGO = "./data/data.json"; // relativo a index.html
let catalogoServicios = [];

/* =========================
   Render de catálogo
   ========================= */

function renderServicios(lista) {
  if (!cardsContainer) return;

  cardsContainer.innerHTML = "";

  lista.forEach((servicio) => {
    let card = document.createElement("article");
    let destacadoClase = servicio.destacado ? "card--destacado" : "";
    let simulacionBadge = servicio.incluyeSimulacion
      ? '<span class="badge badge-simulacion">Incluye simulación</span>'
      : "";

    card.className = "card " + destacadoClase;

    card.innerHTML = `
      <div class="card-img">
        <img src="assets/servicios/${servicio.img}" alt="${servicio.nombre}">
      </div>

      <div class="card-body">
        <h3 class="card-title">${servicio.nombre}</h3>
        <div class="card-meta">
          <span class="badge badge-categoria">${servicio.categoria}</span>
          <span class="badge badge-herramienta">${
            servicio.herramientaPrincipal
          }</span>
          <span class="badge badge-nivel">${servicio.nivel}</span>
          ${simulacionBadge}
        </div>
        <p class="card-desc">${servicio.descripcionCorta}</p>
      </div>

      <div class="card-footer">
        <div class="card-precio">
          <span class="label">Desde</span>
          <span class="valor">${formatMoney(servicio.precioReferencia)}</span>
        </div>
        <div class="card-horas">
          <span class="label">Esfuerzo estimado</span>
          <span class="valor">${servicio.horasEstimadas} h</span>
        </div>
        <div class="card-qty">
          <button type="button" class="btn-qty js-qty-minus">-</button>
          <span class="cantidad-valor js-qty-value">1</span>
          <button type="button" class="btn-qty js-qty-plus">+</button>
        </div>
        <button type="button" class="btn btn-primary js-add">
          Agregar a cotización
        </button>
      </div>
    `;

    cardsContainer.appendChild(card);

    let btnAdd = card.querySelector(".js-add");
    let qtyValue = card.querySelector(".js-qty-value");
    let btnPlus = card.querySelector(".js-qty-plus");
    let btnMinus = card.querySelector(".js-qty-minus");

    if (btnPlus && qtyValue) {
      btnPlus.onclick = function () {
        let actual = Number(qtyValue.textContent) || 1;
        qtyValue.textContent = String(actual + 1);
      };
    }

    if (btnMinus && qtyValue) {
      btnMinus.onclick = function () {
        let actual = Number(qtyValue.textContent) || 1;
        if (actual > 1) {
          qtyValue.textContent = String(actual - 1);
        }
      };
    }

    if (btnAdd) {
      btnAdd.onclick = function () {
        let cantidadSeleccionada = qtyValue
          ? Number(qtyValue.textContent) || 1
          : 1;

        agregarServicioACotizacion(servicio, btnAdd, cantidadSeleccionada);
      };
    }
  });
}

/* =========================
   Filtros y buscador
   ========================= */

function aplicaFiltros() {
  if (!catalogoServicios.length) {
    if (cardsContainer) {
      cardsContainer.innerHTML =
        "<p>No se pudo cargar el catálogo de servicios.</p>";
    }
    return;
  }

  let categoria = filtroCategoria ? filtroCategoria.value : "todos";
  let herramienta = filtroHerramienta ? filtroHerramienta.value : "todos";
  let enfoque = filtroEnfoque ? filtroEnfoque.value : "todos";
  let texto = searchInput ? searchInput.value.trim().toLowerCase() : "";

  let listaFiltrada = catalogoServicios.filter(function (servicio) {
    let ok = true;

    if (categoria && categoria !== "todos") {
      ok = ok && servicio.categoria === categoria;
    }

    if (herramienta && herramienta !== "todos") {
      ok = ok && servicio.herramientaPrincipal === herramienta;
    }

    if (enfoque && enfoque !== "todos") {
      ok = ok && servicio.enfoque === enfoque;
    }

    if (texto) {
      let nombreLower = servicio.nombre.toLowerCase();
      ok = ok && nombreLower.indexOf(texto) !== -1;
    }

    return ok;
  });

  renderServicios(listaFiltrada);
}

/* =========================
   Manejo de cotización
   ========================= */

function agregarServicioACotizacion(servicio, boton, cantidadSeleccionada) {
  let cotizacion = getCotizacion();

  let cantidad = Number(cantidadSeleccionada) || 1;

  let existente = cotizacion.find(function (item) {
    return item.id === servicio.id;
  });

  if (existente) {
    let cantidadActual = Number(existente.cantidad) || 1;
    existente.cantidad = cantidadActual + cantidad;
  } else {
    cotizacion.push({
      id: servicio.id,
      nombre: servicio.nombre,
      categoria: servicio.categoria,
      herramientaPrincipal: servicio.herramientaPrincipal,
      nivel: servicio.nivel,
      precioReferencia: servicio.precioReferencia,
      horasEstimadas: servicio.horasEstimadas,
      cantidad: cantidad,
    });
  }

  setCotizacion(cotizacion);
  updateCartBadge();

  if (boton) {
    let textoOriginal = boton.textContent;
    boton.disabled = true;
    boton.textContent = "Agregado ✓";

    setTimeout(function () {
      boton.disabled = false;
      boton.textContent = textoOriginal;
    }, 900);
  }
}

/* =========================
   Badge de carrito
   ========================= */

function updateCartBadge() {
  if (!cartCount) return;

  let cotizacion = getCotizacion();

  let totalServicios = cotizacion.reduce(function (acc, it) {
    return acc + (Number(it.cantidad) || 1);
  }, 0);

  cartCount.textContent = String(totalServicios);
}

/* =========================
   Carga inicial (fetch + try/catch)
   ========================= */

async function cargarCatalogo() {
  try {
    let respuesta = await fetch(URL_CATALOGO);

    if (!respuesta.ok) {
      throw new Error("No se pudo cargar el catálogo de servicios");
    }

    let data = await respuesta.json();
    catalogoServicios = data;

    aplicaFiltros();
  } catch (error) {
    console.error("Error al obtener servicios:", error);
    if (cardsContainer) {
      cardsContainer.innerHTML =
        "<p>No se pudo cargar el catálogo de servicios. Intenta nuevamente más tarde.</p>";
    }
  }
}

/* =========================
   Eventos e inicio
   ========================= */

if (filtroCategoria) {
  filtroCategoria.onchange = aplicaFiltros;
}

if (filtroHerramienta) {
  filtroHerramienta.onchange = aplicaFiltros;
}

if (filtroEnfoque) {
  filtroEnfoque.onchange = aplicaFiltros;
}

if (searchInput) {
  searchInput.oninput = aplicaFiltros;
}

updateCartBadge();
cargarCatalogo();
