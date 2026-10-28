import { obtenerProductos } from "./api.js";
import "./product-list.js";
import "./carrito.js";

const CLAVE = "carritoPagina";
const UMBRAL = 300000;
const DESCUENTO = 10;

const $ = (sel) => document.querySelector(sel);
const fmt = (n) => "$ " + n.toLocaleString("es-CO");

let prods = [];
let cart = getStoredCart();
let categoria = "todos";
let busqueda = "";
let disponibles = false;
let orden = "default";
let temporizador = null;

const lista = $("#listaProductos");
const carritoEl = $("#carritoCompras");
const unidadesEl = $(".cart-count");
const estadoEl = $("#mensajeEstado");
const navCat = $("#navCategorias");
const buscador = $("#inputBusqueda");
const selectOrden = $("#selectOrden");
const checkDisp = $("#checkDisponibles");
const btnLimpiar = $("#btnLimpiar");
const panel = $("#panelCarrito");
const overlay = $(".overlay-carrito");
const btnCarrito = $("#btnCarrito");
const btnSalir = $(".btn-salir");

function msg(texto, tipo = "info") {
  let caja = $(".mensajes");

  if (!caja) {
    caja = document.createElement("p");
    caja.setAttribute("role", "status");
    caja.setAttribute("aria-live", "polite");
    document.body.append(caja);
  }

  caja.textContent = texto;
  caja.className = `mensajes mensajes--${tipo}`;
  caja.hidden = false;
  clearTimeout(temporizador);
  temporizador = setTimeout(() => (caja.hidden = true), 4000);
}

function estado(texto, tipo = "") {
  estadoEl.textContent = texto;
  estadoEl.className = tipo
    ? `estado-catalogo estado-catalogo--${tipo}`
    : "estado-catalogo";
  estadoEl.hidden = !texto;
}

function save() {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(cart));
  } catch {
    return;
  }
}

function getStoredCart() {
  try {
    const datos = JSON.parse(localStorage.getItem(CLAVE) ?? "[]");

    if (!Array.isArray(datos)) return [];

    return datos.filter(
      (i) =>
        Number.isInteger(i?.id) &&
        Number.isInteger(i?.cantidad) &&
        i.cantidad >= 1,
    );
  } catch {
    return [];
  }
}

function buscar(id) {
  return prods.find((p) => p.id === id);
}

function updateCart() {
  cart = cart.filter(({ id }) => {
    const p = buscar(id);
    return p && p.active && p.stock > 0;
  });

  cart.forEach((l) => (l.cantidad = Math.min(l.cantidad, buscar(l.id).stock)));

  const items = cart.map(({ id, cantidad }) => ({ ...buscar(id), cantidad }));
  const subtotal = items.reduce((suma, i) => suma + i.price * i.cantidad, 0);
  const unidades = items.reduce((suma, i) => suma + i.cantidad, 0);
  const descuento =
    subtotal >= UMBRAL ? Math.round((subtotal * DESCUENTO) / 100) : 0;

  carritoEl.info = {
    items,
    subtotal,
    descuento,
    total: subtotal - descuento,
    umbral: UMBRAL,
    porcentaje: DESCUENTO,
  };
  unidadesEl.textContent = String(unidades);
  btnCarrito.setAttribute(
    "aria-label",
    `Abrir carrito, ${unidades} unidad(es)`,
  );
  save();
}

function filter() {
  const txt = busqueda.toLowerCase().trim();
  const criterios = {
    "precio-asc": (a, b) => a.price - b.price,
    "precio-desc": (a, b) => b.price - a.price,
    "nombre-az": (a, b) => a.name.localeCompare(b.name, "es"),
    "nombre-za": (a, b) => b.name.localeCompare(a.name, "es"),
  };

  let res = prods;

  if (txt) {
    res = res.filter(
      ({ name, description }) =>
        name.toLowerCase().includes(txt) ||
        (description || "").toLowerCase().includes(txt),
    );
  }

  if (categoria !== "todos") {
    res = res.filter(
      ({ category }) => category.toLowerCase() === categoria.toLowerCase(),
    );
  }

  if (disponibles) {
    res = res.filter(({ active, stock }) => active && stock > 0);
  }

  lista.productos = criterios[orden]
    ? [...res].sort(criterios[orden])
    : [...res];
}

function agregar(id) {
  const p = buscar(id);
  const linea = cart.find((l) => l.id === id);
  const cantidad = (linea?.cantidad ?? 0) + 1;

  if (!p) return msg("Ese producto ya no existe en el catálogo.", "error");
  if (!p.active)
    return msg(`"${p.name}" no está disponible para la venta.`, "error");
  if (p.stock < 1) return msg(`"${p.name}" está agotado.`, "error");
  if (cantidad > p.stock)
    return msg(
      `"${p.name}": solo hay ${p.stock} unidad(es) en inventario.`,
      "error",
    );

  if (linea) linea.cantidad = cantidad;
  else cart.push({ id, cantidad: 1 });

  updateCart();
  msg(`Se agregó "${p.name}" al carrito.`, "exito");
}

function cambiar(id, delta) {
  const p = buscar(id);
  const linea = cart.find((l) => l.id === id);

  if (!p || !linea) return;
  if (linea.cantidad + delta < 1) return eliminar(id);
  if (linea.cantidad + delta > p.stock)
    return msg(
      `"${p.name}": no puede superar las ${p.stock} unidad(es) disponibles.`,
      "error",
    );

  linea.cantidad += delta;
  updateCart();
}

function eliminar(id) {
  const p = buscar(id);

  if (!cart.some((l) => l.id === id)) return;

  cart = cart.filter((l) => l.id !== id);
  updateCart();
  msg(`Se quitó "${p.name}" del carrito.`, "exito");
}

function vaciar() {
  if (!cart.length) return msg("El carrito ya está vacío.", "error");

  cart = [];
  updateCart();
  msg("Se vació el carrito.", "exito");
}

function resumen({ id, items, subtotal, descuento, total }) {
  const dialogo = document.createElement("dialog");
  dialogo.className = "dialogo-pedido";
  dialogo.innerHTML = `
    <h2>Pedido confirmado</h2>
    <p class="dialogo-etiqueta">${id}</p>
    <ul class="dialogo-lineas">
      ${items.map((i) => `<li><span>${i.name} × ${i.cantidad}</span><span>${fmt(i.price * i.cantidad)}</span></li>`).join("")}
    </ul>
    <dl class="resumen-pedido">
      <div class="resumen-fila"><dt>Subtotal</dt><dd>${fmt(subtotal)}</dd></div>
      <div class="resumen-fila resumen-descuento"><dt>Descuento (${DESCUENTO} %)</dt><dd>${descuento ? "- " + fmt(descuento) : fmt(0)}</dd></div>
      <div class="resumen-fila resumen-total"><dt>Total</dt><dd>${fmt(total)}</dd></div>
    </dl>
    <button type="button" class="btn-confirmar">Entendido</button>`;

  dialogo.querySelector("button").onclick = () => {
    if (typeof dialogo.close === "function") dialogo.close();
    dialogo.remove();
  };

  dialogo.addEventListener("close", () => dialogo.remove());
  document.body.append(dialogo);

  if (typeof dialogo.showModal === "function") dialogo.showModal();
  else dialogo.setAttribute("open", "");
}

function confirmar() {
  if (!cart.length)
    return msg(
      "El carrito está vacío. Agrega productos antes de confirmar.",
      "error",
    );

  const problema = cart
    .map(({ id, cantidad }) => {
      const p = buscar(id);

      if (!p) return "hay un producto que ya no existe en el catálogo.";
      if (!p.active) return `"${p.name}" ya no está disponible.`;
      if (cantidad > p.stock)
        return `"${p.name}" solo tiene ${p.stock} unidad(es).`;
      return null;
    })
    .find((mensaje) => mensaje !== null);

  if (problema) {
    updateCart();
    return msg(`No se puede confirmar el pedido: ${problema}`, "error");
  }

  const pedido = carritoEl.info;
  const id = "TECNO-" + Date.now().toString(36).toUpperCase();

  cart = [];
  updateCart();
  resumen({ id, ...pedido });
  msg(`Pedido ${id} confirmado.`, "exito");
}

function limpiar() {
  categoria = "todos";
  busqueda = "";
  disponibles = false;
  orden = "default";
  buscador.value = "";
  selectOrden.value = "default";
  checkDisp.checked = false;

  navCat.querySelectorAll("[data-category]").forEach((boton) => {
    const activo = boton.dataset.category === "todos";
    boton.classList.toggle("activo", activo);
    boton.setAttribute("aria-pressed", String(activo));
  });

  if (prods.length) filter();
}

function panelAbierto(abierto) {
  panel.classList.toggle("abierto", abierto);
  panel.setAttribute("aria-hidden", String(!abierto));
  overlay.classList.toggle("abierto", abierto);
  document.body.classList.toggle("carrito-abierto", abierto);
  btnCarrito.setAttribute("aria-expanded", String(abierto));
  (abierto ? btnSalir : btnCarrito).focus();
}

buscador.addEventListener("input", () => {
  busqueda = buscador.value;
  if (prods.length) filter();
});

selectOrden.addEventListener("change", () => {
  orden = selectOrden.value;
  if (prods.length) filter();
});

checkDisp.addEventListener("change", () => {
  disponibles = checkDisp.checked;
  if (prods.length) filter();
});

btnLimpiar.addEventListener("click", limpiar);

navCat.addEventListener("click", (evento) => {
  const boton = evento.target.closest("[data-category]");

  if (!boton) return;

  categoria = boton.dataset.category;

  navCat.querySelectorAll("[data-category]").forEach((candidato) => {
    const activo = candidato === boton;
    candidato.classList.toggle("activo", activo);
    candidato.setAttribute("aria-pressed", String(activo));
  });

  if (prods.length) filter();
});

document.addEventListener("producto-agregar", ({ detail }) => {
  if (Number.isInteger(detail?.id)) agregar(detail.id);
});

document.addEventListener("carrito-cambiar", ({ detail }) => {
  if (Number.isInteger(detail?.id)) cambiar(detail.id, detail.delta);
});

document.addEventListener("carrito-eliminar", ({ detail }) => {
  if (Number.isInteger(detail?.id)) eliminar(detail.id);
});

document.addEventListener("carrito-vaciar", vaciar);
document.addEventListener("pedido-confirmar", confirmar);
btnCarrito.addEventListener("click", () => panelAbierto(true));
btnSalir.addEventListener("click", () => panelAbierto(false));
overlay.addEventListener("click", () => panelAbierto(false));

document.addEventListener("keydown", (evento) => {
  if (evento.key === "Escape" && panel.classList.contains("abierto"))
    panelAbierto(false);
});

async function init() {
  estado("Cargando catálogo de productos...", "cargando");
  lista.hidden = true;

  try {
    prods = await obtenerProductos();

    if (!Array.isArray(prods))
      throw new Error("El catálogo no tiene un formato válido.");

    if (!prods.length) {
      estado(
        "El catálogo está vacío: no hay productos registrados en data/products.json.",
        "vacio",
      );
      updateCart();
      return;
    }

    estado("");
    lista.hidden = false;
    updateCart();
    filter();
  } catch (error) {
    estado(`No se pudo cargar el catálogo. ${error?.message ?? ""}`, "error");
    updateCart();
  }
}

init();
