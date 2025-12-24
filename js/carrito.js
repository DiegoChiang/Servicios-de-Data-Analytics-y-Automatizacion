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

let tbodyCarrito = document.getElementById("lista-cotizacion");
let textoVacio = document.getElementById("mensaje-vacio");
let totalServiciosEl = document.getElementById("total-servicios");
let totalHorasEl = document.getElementById("total-horas");
let totalCostoEl = document.getElementById("total-costo");
let btnVaciar = document.getElementById("btn-vaciar");
let cartCount = document.getElementById("cart-count");
let btnContinuarCarrito = document.getElementById("btn-continuar-carrito");

/* =========================
   Render de carrito
   ========================= */

function renderCarrito() {
  if (!tbodyCarrito) return;

  let cotizacion = getCotizacion();
  tbodyCarrito.innerHTML = "";

  if (!cotizacion.length) {
    if (textoVacio) {
      textoVacio.hidden = false;
    }
    if (btnVaciar) {
      btnVaciar.disabled = true;
    }
    if (btnContinuarCarrito) {
      btnContinuarCarrito.setAttribute("disabled", "disabled");
    }
    actualizarTotales(cotizacion);
    updateCartBadge();
    return;
  }

  if (textoVacio) {
    textoVacio.hidden = true;
  }
  if (btnVaciar) {
    btnVaciar.disabled = false;
  }
  if (btnContinuarCarrito) {
    btnContinuarCarrito.removeAttribute("disabled");
  }
  cotizacion.forEach(function (item) {
    let tr = document.createElement("tr");

    let cantidad = Number(item.cantidad) || 1;
    let horasTotalesItem = (Number(item.horasEstimadas) || 0) * cantidad;
    let costoItem = (Number(item.precioReferencia) || 0) * cantidad;

    tr.innerHTML =
      "<td>" +
      item.nombre +
      "</td>" +
      "<td>" +
      item.categoria +
      "</td>" +
      "<td>" +
      item.herramientaPrincipal +
      "</td>" +
      "<td>" +
      item.nivel +
      "</td>" +
      '<td class="col-cantidad">' +
      '<button type="button" class="btn-qty js-minus">−</button>' +
      '<span class="cantidad-valor">' +
      cantidad +
      "</span>" +
      '<button type="button" class="btn-qty js-plus">+</button>' +
      "</td>" +
      "<td>" +
      formatMoney(costoItem) +
      "</td>" +
      "<td>" +
      horasTotalesItem +
      " h</td>" +
      '<td><button type="button" class="btn-link js-remove">Eliminar</button></td>';

    tbodyCarrito.appendChild(tr);

    let btnRemove = tr.querySelector(".js-remove");
    if (btnRemove) {
      btnRemove.onclick = function () {
        eliminarDeCotizacion(item.id);
      };
    }

    let btnMinus = tr.querySelector(".js-minus");
    if (btnMinus) {
      btnMinus.onclick = function () {
        cambiarCantidad(item.id, -1);
      };
    }

    let btnPlus = tr.querySelector(".js-plus");
    if (btnPlus) {
      btnPlus.onclick = function () {
        cambiarCantidad(item.id, 1);
      };
    }
  });

  actualizarTotales(cotizacion);
  updateCartBadge();
}

/* =========================
   Totales de la cotización
   ========================= */

function actualizarTotales(cotizacion) {
  let totalServicios = cotizacion.reduce(function (acc, it) {
    return acc + (Number(it.cantidad) || 1);
  }, 0);

  let totalHoras = cotizacion.reduce(function (acc, it) {
    let cantidad = Number(it.cantidad) || 1;
    return acc + (Number(it.horasEstimadas) || 0) * cantidad;
  }, 0);

  let totalCosto = cotizacion.reduce(function (acc, it) {
    let cantidad = Number(it.cantidad) || 1;
    return acc + (Number(it.precioReferencia) || 0) * cantidad;
  }, 0);

  if (totalServiciosEl) {
    totalServiciosEl.textContent = String(totalServicios);
  }

  if (totalHorasEl) {
    totalHorasEl.textContent = totalHoras + " h";
  }

  if (totalCostoEl) {
    totalCostoEl.textContent = formatMoney(totalCosto);
  }
}

/* =========================
   Acciones de carrito
   ========================= */

function eliminarDeCotizacion(id) {
  let cotizacion = getCotizacion();

  let nuevaLista = cotizacion.filter(function (item) {
    return item.id !== id;
  });

  setCotizacion(nuevaLista);
  renderCarrito();
}

function vaciarCotizacion() {
  localStorage.removeItem(LS_KEY_COTIZACION);
  renderCarrito();
}

/* =========================
   Confirmación con SweetAlert2
   ========================= */

function confirmarVaciarCotizacion() {
  if (typeof Swal === "undefined") {
    vaciarCotizacion();
    return;
  }

  Swal.fire({
    title: "¿Vaciar cotización?",
    text: "Se eliminarán todos los servicios seleccionados.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, vaciar",
    cancelButtonText: "Cancelar",
  }).then(function (result) {
    if (result.isConfirmed) {
      vaciarCotizacion();

      Swal.fire({
        title: "Cotización vaciada",
        text: "Tu cotización se vació correctamente.",
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
      });
    }
  });
}

/* =========================
   Cantidad por servicio
   ========================= */

function cambiarCantidad(id, delta) {
  let cotizacion = getCotizacion();

  let index = cotizacion.findIndex(function (item) {
    return item.id === id;
  });

  if (index === -1) {
    return;
  }

  let item = cotizacion[index];
  let cantidadActual = Number(item.cantidad) || 1;
  let nuevaCantidad = cantidadActual + delta;

  if (nuevaCantidad <= 0) {
    cotizacion.splice(index, 1);
  } else {
    item.cantidad = nuevaCantidad;
  }

  setCotizacion(cotizacion);
  renderCarrito();
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
   Eventos e inicio
   ========================= */

if (btnVaciar) {
  btnVaciar.onclick = confirmarVaciarCotizacion;
}

renderCarrito();

if (btnContinuarCarrito) {
  btnContinuarCarrito.addEventListener("click", function (event) {
    if (btnContinuarCarrito.hasAttribute("disabled")) {
      event.preventDefault();
    }
  });
}
