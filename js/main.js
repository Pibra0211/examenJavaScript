import {agregarAlCarrito,disminuirCantidad,eliminarDelCarrito,calcularTotal,contarUnidades,obtenerCarrito,} from "./carrito.js";
import { obtenerProductos } from "productos.js";
const productos = await obtenerProductos();

import {filtrarPorBusqueda,filtrarPorCategoria,ordenarProductos,} from "./filtros.js";

let categoriaActual = "todos";
let textoBusqueda = "";
let ordenActual = "default";

const listaCarrito = document.getElementById("listaDeCompras");
const totalElemento = document.getElementById("total");
const contadorElemento = document.querySelector(".cart-count");

const botonCarrito = document.getElementById("btnCarrito");
const panelCarrito = document.getElementById("panelCarrito");
const overlayCarrito = document.querySelector(".overlay-carrito");
const botonSalir = document.querySelector(".btn-salir");

const contenedor = document.querySelector(".grid-productos");

function aplicarFiltros() {
    let resultado = [...productos];
    resultado = filtrarPorCategoria(resultado, categoriaActual);
    resultado = filtrarPorBusqueda(resultado, textoBusqueda);
    resultado = ordenarProductos(resultado, ordenActual);
    renderProductos(resultado);
}

const inputBusqueda = document.querySelector("#inputBusqueda");
inputBusqueda.addEventListener("input", () => {
    textoBusqueda = inputBusqueda.value;
    aplicarFiltros();
});

const selectOrden = document.querySelector("#selectOrden");
selectOrden.addEventListener("change", () => {
    ordenActual = selectOrden.value;
    aplicarFiltros();
});

const navCategorias = document.querySelector(".categorias");
navCategorias.addEventListener("click", (evento) => {
    const boton = evento.target.closest("[data-category]");
    if (boton) {
        categoriaActual = boton.dataset.categoria;
        navCategorias.querySelectorAll("button").forEach((b) => {
            b.classList.toggle("activo", b === boton);
        });
        aplicarFiltros();
    }
});

function renderProductos(lista) {
    contenedor.innerHTML = "";

    if (lista.length === 0) {
        contenedor.innerHTML = `<p class="mensaje-sin-resultados">No se encontraron productos</p>`;
        return;
    }

    lista.forEach((producto) => {
        const tarjeta = document.createElement("div");
        tarjeta.innerHTML = `
            <h3>${producto.titulo}</h3>
            <p>$${producto.precio.toFixed(2)}</p>
            <button class="botonCarrito">💼︎</button>
        `;
    const btn = tarjeta.querySelector(".botonCarrito");
    btn.addEventListener("click", () => {
        agregarAlCarrito(producto);
        renderCarrito();
    });
    contenedor.appendChild(tarjeta);
  });
}

function renderCarrito() {
  listaCarrito.innerHTML = "";

  Object.values(obtenerCarrito()).forEach((entrada) => {
    const fila = document.createElement("li");
    fila.className = "item-carrito";
    fila.dataset.id = entrada.id;

    const precioPorUnidad =
      entrada.cantidad > 1
        ? `<p class="item-precio-unidad">($${entrada.price.toFixed(2)} c/u)</p>`
        : "";

    fila.innerHTML = `
            <div class="item-info">
                <div class="item-superior">
                    <h3 class="item-titulo">${entrada.titulo}</h3>
                    <button type="button" class="btn-eliminar" data-id="${entrada.id}" data-accion="eliminar" aria-label="Eliminar del carrito">🗑</button>
                </div>
                <div class="item-inferior">
                    <div>
                        <p class="item-precio">$${(entrada.precio * entrada.cantidad).toFixed(2)}</p>
                        ${precioPorUnidad}
                    </div>
                    <div class="stepper">
                        <button type="button" class="btn-cantidad" data-id="${entrada.id}" data-accion="disminuir" aria-label="Disminuir cantidad">−</button>
                        <span class="cantidad">${entrada.cantidad}</span>
                        <button type="button" class="btn-cantidad" data-id="${entrada.id}" data-accion="aumentar" aria-label="Aumentar cantidad">+</button>
                    </div>
                </div>
            </div>
        `;

    listaCarrito.appendChild(fila);
  });

  totalElemento.textContent = "$" + calcularTotal().toFixed(2);
  contadorElemento.textContent = contarUnidades();
}

listaCarrito.addEventListener("click", (evento) => {
  const boton = evento.target.closest("[data-accion]");
  if (!boton) {
    return;
  }

  const id = boton.dataset.id;
  const accion = boton.dataset.accion;

  if (accion === "aumentar") {
    const entrada = obtenerCarrito()[id];
    if (entrada) {
      agregarAlCarrito(entrada);
    }
  } else if (accion === "disminuir") {
    disminuirCantidad(id);
  } else if (accion === "eliminar") {
    eliminarDelCarrito(id);
  }

  renderCarrito();
});

function abrirCarrito() {
  panelCarrito.classList.add("abierto");
  overlayCarrito.classList.add("abierto");
  document.body.classList.add("carrito-abierto");
  botonCarrito.setAttribute("aria-expanded", "true");
  botonSalir.focus();
}

function cerrarCarrito() {
  panelCarrito.classList.remove("abierto");
  overlayCarrito.classList.remove("abierto");
  document.body.classList.remove("carrito-abierto");
  botonCarrito.setAttribute("aria-expanded", "false");
  botonCarrito.focus();
}

botonCarrito.addEventListener("click", abrirCarrito);
botonSalir.addEventListener("click", cerrarCarrito);
overlayCarrito.addEventListener("click", cerrarCarrito);

document.addEventListener("keydown", (evento) => {
  if (evento.key === "Escape" && panelCarrito.classList.contains("abierto")) {
    cerrarCarrito();
  }
});

renderProductos(productos);
renderCarrito();
