/* =========================
   Formato de moneda
   ========================= */

function formatMoney(n) {
  return MONEDA + " " + (+n || 0).toFixed(2);
}

/* =========================
   Storage de datos
   ========================= */

const LS_KEY_COTIZACION = "cotizacionServicios";
const LS_KEY_DATOS_CLIENTE = "datosCliente";
const LS_KEY_PEDIDO = "pedidoActual";

function getCotizacion() {
  let raw = localStorage.getItem(LS_KEY_COTIZACION);
  return raw ? JSON.parse(raw) : [];
}

function setDatosCliente(datos) {
  localStorage.setItem(LS_KEY_DATOS_CLIENTE, JSON.stringify(datos));
}

function getDatosCliente() {
  let raw = localStorage.getItem(LS_KEY_DATOS_CLIENTE);
  return raw ? JSON.parse(raw) : null;
}

function setPedidoActual(pedido) {
  localStorage.setItem(LS_KEY_PEDIDO, JSON.stringify(pedido));
}

/* =========================
   Referencias del DOM
   ========================= */

let elYear = document.getElementById("year");

let resumenBody = document.getElementById("resumen-items");
let rTotalServicios = document.getElementById("resumen-total-servicios");
let rTotalHoras = document.getElementById("resumen-total-horas");
let rTotalCosto = document.getElementById("resumen-total-costo");

let btnVaciarCheckout = document.getElementById("btn-vaciar-checkout");

let formCheckout = document.getElementById("form-checkout");
let inputNombre = document.getElementById("nombre");
let inputEmail = document.getElementById("email");
let inputEmpresa = document.getElementById("empresa");
let selectSector = document.getElementById("sector");
let textareaMensaje = document.getElementById("mensaje");

let errorNombre = document.getElementById("error-nombre");
let errorEmail = document.getElementById("error-email");
let errorEmpresa = document.getElementById("error-empresa");

/* =========================
   Cálculo de totales
   ========================= */

function calcularTotales(cotizacion) {
  return cotizacion.reduce(
    function (acc, item) {
      let cantidad = Number(item.cantidad) || 1;
      let horas = Number(item.horasEstimadas) || 0;
      let precio = Number(item.precioReferencia) || 0;

      acc.totalServicios += cantidad;
      acc.totalHoras += horas * cantidad;
      acc.totalCosto += precio * cantidad;

      return acc;
    },
    { totalServicios: 0, totalHoras: 0, totalCosto: 0 }
  );
}

/* =========================
   Render de resumen
   ========================= */

function renderResumen() {
  if (!resumenBody) return;

  let cotizacion = getCotizacion();
  resumenBody.innerHTML = "";

  if (!cotizacion.length) {
    let trVacio = document.createElement("tr");
    trVacio.innerHTML =
      '<td colspan="5">No tienes servicios en tu cotización.</td>';
    resumenBody.appendChild(trVacio);

    if (rTotalServicios) rTotalServicios.textContent = "0";
    if (rTotalHoras) rTotalHoras.textContent = "0 h";
    if (rTotalCosto) rTotalCosto.textContent = formatMoney(0);

    if (formCheckout) {
      formCheckout.classList.add("form-disabled");
    }

    if (btnVaciarCheckout) {
      btnVaciarCheckout.disabled = true;
    }

    return;
  }

  if (formCheckout) {
    formCheckout.classList.remove("form-disabled");
  }

  if (btnVaciarCheckout) {
    btnVaciarCheckout.disabled = false;
  }

  cotizacion.forEach(function (item) {
    let tr = document.createElement("tr");

    let cantidad = Number(item.cantidad) || 1;
    let horas = Number(item.horasEstimadas) || 0;
    let precio = Number(item.precioReferencia) || 0;

    let subtotalItem = precio * cantidad;
    let horasTotalesItem = horas * cantidad;

    tr.innerHTML = `
      <td>${item.nombre}</td>
      <td>${item.categoria}</td>
      <td>${cantidad}</td>
      <td>${formatMoney(subtotalItem)}</td>
      <td>${horasTotalesItem} h</td>
    `;

    resumenBody.appendChild(tr);
  });

  let totales = calcularTotales(cotizacion);
  let totalServicios = totales.totalServicios;
  let totalHoras = totales.totalHoras;
  let totalCosto = totales.totalCosto;

  if (rTotalServicios) {
    rTotalServicios.textContent = String(totalServicios);
  }

  if (rTotalHoras) {
    rTotalHoras.textContent = totalHoras + " h";
  }

  if (rTotalCosto) {
    rTotalCosto.textContent = formatMoney(totalCosto);
  }
}

/* =========================
   Validación de formulario
   ========================= */

function mostrarError(input, elError, mensaje) {
  input.classList.add("input-error");
  elError.textContent = mensaje;
  elError.style.display = "block";
}

function limpiarError(input, elError) {
  input.classList.remove("input-error");
  elError.textContent = "";
  elError.style.display = "none";
}

function validarFormulario() {
  let esValido = true;

  let nombre = inputNombre ? inputNombre.value.trim() : "";
  let email = inputEmail ? inputEmail.value.trim() : "";
  let empresa = inputEmpresa ? inputEmpresa.value.trim() : "";

  if (!nombre) {
    mostrarError(inputNombre, errorNombre, "Ingresa tu nombre.");
    esValido = false;
  } else {
    limpiarError(inputNombre, errorNombre);
  }

  if (!email) {
    mostrarError(inputEmail, errorEmail, "Ingresa tu correo.");
    esValido = false;
  } else if (email.indexOf("@") === -1 || email.indexOf(".") === -1) {
    mostrarError(inputEmail, errorEmail, "Ingresa un correo válido.");
    esValido = false;
  } else {
    limpiarError(inputEmail, errorEmail);
  }

  if (!empresa) {
    mostrarError(
      inputEmpresa,
      errorEmpresa,
      "Ingresa el nombre de la empresa o proyecto."
    );
    esValido = false;
  } else {
    limpiarError(inputEmpresa, errorEmpresa);
  }

  return esValido;
}

/* =========================
   Submit y armado de pedido
   ========================= */

function onSubmitCheckout(e) {
  if (e && e.preventDefault) {
    e.preventDefault();
  }

  let cotizacion = getCotizacion();

  if (!cotizacion.length) {
    return;
  }

  if (!validarFormulario()) {
    return;
  }

  let datosCliente;
  let pedido;

  try {
    datosCliente = {
      nombre: inputNombre ? inputNombre.value.trim() : "",
      email: inputEmail ? inputEmail.value.trim() : "",
      empresa: inputEmpresa ? inputEmpresa.value.trim() : "",
      sector: selectSector ? selectSector.value : "",
      mensaje: textareaMensaje ? textareaMensaje.value.trim() : "",
    };

    setDatosCliente(datosCliente);

    let totales = calcularTotales(cotizacion);
    let totalServicios = totales.totalServicios;
    let totalHoras = totales.totalHoras;
    let totalCosto = totales.totalCosto;

    pedido = {
      cliente: datosCliente,
      items: cotizacion,
      totales: {
        servicios: totalServicios,
        horas: totalHoras,
        costo: totalCosto,
      },
      fecha: new Date().toISOString(),
    };

    setPedidoActual(pedido);
    localStorage.removeItem(LS_KEY_DATOS_CLIENTE);
  } catch (error) {
    console.error("Error al armar el pedido:", error);

    if (typeof Swal !== "undefined") {
      Swal.fire({
        title: "Error",
        text: "Hubo un problema al armar la solicitud. Intenta nuevamente.",
        icon: "error",
      });
    } else {
      alert("Hubo un problema al armar la solicitud. Intenta nuevamente.");
    }

    return;
  }

  if (typeof Swal !== "undefined") {
    Swal.fire({
      title: "Solicitud enviada",
      text: "Tu cotización fue enviada correctamente. Te escribiré pronto al correo indicado.",
      icon: "success",
      confirmButtonText: "Ver resumen",
    }).then(function () {
      window.location.href = "exito.html";
    });
  } else {
    window.location.href = "exito.html";
  }
}

/* =========================
   Datos previos y año
   ========================= */

function cargarDatosClientePrevios() {
  let datos = getDatosCliente();
  if (!datos) return;

  if (datos.nombre) {
    inputNombre.value = datos.nombre;
  }
  if (datos.email) {
    inputEmail.value = datos.email;
  }
  if (datos.empresa) {
    inputEmpresa.value = datos.empresa;
  }
  if (datos.sector) {
    selectSector.value = datos.sector;
  }
  if (datos.mensaje && textareaMensaje) {
    textareaMensaje.value = datos.mensaje;
  }
}

function setYear() {
  if (elYear) {
    elYear.textContent = new Date().getFullYear();
  }
}

/* =========================
   Eventos e inicio
   ========================= */

if (btnVaciarCheckout) {
  btnVaciarCheckout.addEventListener("click", function () {
    if (typeof Swal === "undefined") {
      localStorage.removeItem(LS_KEY_COTIZACION);
      renderResumen();
      return;
    }

    Swal.fire({
      title: "¿Vaciar cotización?",
      text: "Se eliminarán todos los servicios de tu resumen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, vaciar",
      cancelButtonText: "Cancelar",
    }).then(function (result) {
      if (result.isConfirmed) {
        localStorage.removeItem(LS_KEY_COTIZACION);
        renderResumen();

        Swal.fire({
          title: "Cotización vaciada",
          text: "Tu resumen se vació correctamente.",
          icon: "success",
          timer: 1800,
          showConfirmButton: false,
        });
      }
    });
  });
}

setYear();
renderResumen();
cargarDatosClientePrevios();

if (formCheckout) {
  formCheckout.onsubmit = onSubmitCheckout;
}
