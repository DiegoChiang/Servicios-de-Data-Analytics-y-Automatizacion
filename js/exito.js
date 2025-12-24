/* =========================
   Formato de moneda
   ========================= */

function formatMoney(n) {
  return MONEDA + " " + (+n || 0).toFixed(2);
}

/* =========================
   Storage de pedido
   ========================= */

const LS_KEY_COTIZACION = "cotizacionServicios";
const LS_KEY_PEDIDO = "pedidoActual";

function getPedidoActual() {
  let raw = localStorage.getItem(LS_KEY_PEDIDO);
  return raw ? JSON.parse(raw) : null;
}

/* =========================
   Referencias del DOM
   ========================= */

let elYear = document.getElementById("year");
let elNombreCliente = document.getElementById("ok-nombre-cliente");
let elEmailCliente = document.getElementById("ok-email-cliente");
let elTotalServicios = document.getElementById("ok-total-servicios");
let elTotalHoras = document.getElementById("ok-total-horas");
let elTotalCosto = document.getElementById("ok-total-costo");
let tbodyItems = document.getElementById("ok-items");

/* =========================
   Render de pantalla final
   ========================= */

function renderResumenFinal() {
  if (elYear) {
    elYear.textContent = new Date().getFullYear();
  }

  let pedido = getPedidoActual();

  if (!pedido) {
    if (tbodyItems) {
      tbodyItems.innerHTML =
        '<tr><td colspan="4">No hay una cotización reciente para mostrar.</td></tr>';
    }
    if (elTotalServicios) elTotalServicios.textContent = "0";
    if (elTotalHoras) elTotalHoras.textContent = "0 h";
    if (elTotalCosto) elTotalCosto.textContent = formatMoney(0);
    return;
  }

  if (elNombreCliente && pedido.cliente && pedido.cliente.nombre) {
    elNombreCliente.textContent = pedido.cliente.nombre;
  }

  if (elEmailCliente && pedido.cliente && pedido.cliente.email) {
    elEmailCliente.textContent = pedido.cliente.email;
  }

  if (tbodyItems) {
    tbodyItems.innerHTML = "";

    let items = pedido.items || [];
    items.forEach((item) => {
      let tr = document.createElement("tr");

      let cantidad = Number(item.cantidad) || 1;
      let subtotalItem = (Number(item.precioReferencia) || 0) * cantidad;
      let horasTotalesItem = (Number(item.horasEstimadas) || 0) * cantidad;

      tr.innerHTML = `
    <td>${item.nombre}</td>
    <td>${item.categoria}</td>
    <td>${formatMoney(subtotalItem)}</td>
    <td>${horasTotalesItem} h</td>
  `;

      tbodyItems.appendChild(tr);
    });
  }

  let totalServicios = pedido.totales ? pedido.totales.servicios : 0;
  let totalHoras = pedido.totales ? pedido.totales.horas : 0;
  let totalCosto = pedido.totales ? pedido.totales.costo : 0;

  if (elTotalServicios) {
    elTotalServicios.textContent = String(totalServicios);
  }

  if (elTotalHoras) {
    elTotalHoras.textContent = totalHoras + " h";
  }

  if (elTotalCosto) {
    elTotalCosto.textContent = formatMoney(totalCosto);
  }

  localStorage.removeItem(LS_KEY_COTIZACION);
}

/* =========================
   Inicio
   ========================= */

renderResumenFinal();
