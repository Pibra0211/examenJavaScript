const formatear = (valor) => "$ " + valor.toLocaleString("es-CO");

export class ShoppingCart extends HTMLElement {
  #info = {
    items: [],
    subtotal: 0,
    descuento: 0,
    total: 0,
    umbral: 300000,
    porcentaje: 10,
  };

  set info(datos) {
    if (datos) {
      this.#info = { ...this.#info, ...datos };
    }
    this.render();
  }

  get info() {
    return this.#info;
  }

  connectedCallback() {
    if (this.childElementCount === 0) {
      this.render();
    }
  }

  emitir(nombre, detail = {}) {
    this.dispatchEvent(
      new CustomEvent(nombre, { bubbles: true, composed: true, detail }),
    );
  }

  render() {
    const { items, subtotal, descuento, total, umbral, porcentaje } =
      this.#info;
    this.onclick = (evento) => this.manejarClick(evento);

    if (items.length === 0) {
      this.innerHTML = `
        <ul id="listaDeCompras" class="lista-carrito"></ul>
        <div class="mensaje-vacio">
          <p class="mensaje-vacio-icono" aria-hidden="true">🛒</p>
          <h3>Tu carrito está vacío</h3>
          <p>¡Vuelve a la tienda para empezar a comprar!</p>
        </div>
        <div class="panel-total" hidden></div>
      `;
      return;
    }

    const lineas = items
      .map(
        (item) => `
        <li class="item-carrito" data-id="${item.id}">
          <div class="item-info">
            <div class="item-superior">
              <h3 class="item-titulo">${item.name}</h3>
              <button type="button" class="btn-eliminar" data-accion="eliminar"
                aria-label="Eliminar ${item.name} del carrito">🗑</button>
            </div>
            <div class="item-inferior">
              <div>
                <p class="item-precio">${formatear(item.price * item.cantidad)}</p>
                <p class="item-precio-unidad">${formatear(item.price)} c/u</p>
              </div>
              <div class="stepper">
                <button type="button" class="btn-cantidad" data-accion="menos"
                  aria-label="Disminuir cantidad de ${item.name}">−</button>
                <span class="cantidad">${item.cantidad}</span>
                <button type="button" class="btn-cantidad" data-accion="mas"
                  aria-label="Aumentar cantidad de ${item.name}"
                  ${item.cantidad >= item.stock ? "disabled" : ""}>+</button>
              </div>
            </div>
          </div>
        </li>`,
      )
      .join("");

    this.innerHTML = `
      <ul id="listaDeCompras" class="lista-carrito">${lineas}</ul>
      <div class="mensaje-vacio" hidden></div>
      <div class="panel-total">
        <dl class="resumen-pedido">
          <div class="resumen-fila"><dt>Subtotal</dt><dd>${formatear(subtotal)}</dd></div>
          <div class="resumen-fila resumen-descuento">
            <dt>Descuento (${porcentaje} %)</dt>
            <dd>${descuento > 0 ? "- " + formatear(descuento) : formatear(0)}</dd>
          </div>
          <div class="resumen-fila resumen-total"><dt>Total</dt><dd>${formatear(total)}</dd></div>
        </dl>
        <p class="resumen-ayuda">${
          descuento > 0
            ? `Descuento del ${porcentaje} % aplicado por superar ${formatear(umbral)}.`
            : `Agrega ${formatear(Math.max(umbral - subtotal, 0))} más y obtienes ${porcentaje} % de descuento.`
        }</p>
        <div class="panel-acciones">
          <button type="button" class="btn-confirmar" data-accion="confirmar">Confirmar pedido</button>
          <button type="button" class="btn-secundario" data-accion="vaciar">Vaciar carrito</button>
        </div>
      </div>
    `;
  }

  manejarClick(evento) {
    const boton = evento.target.closest("[data-accion]");

    if (!boton) {
      return;
    }

    const accion = boton.dataset.accion;

    if (accion === "vaciar") {
      this.emitir("carrito-vaciar");
      return;
    }

    if (accion === "confirmar") {
      this.emitir("pedido-confirmar");
      return;
    }

    const id = Number(boton.closest(".item-carrito").dataset.id);

    if (accion === "menos") {
      this.emitir("carrito-cambiar", { id, delta: -1 });
    } else if (accion === "mas") {
      this.emitir("carrito-cambiar", { id, delta: 1 });
    } else if (accion === "eliminar") {
      this.emitir("carrito-eliminar", { id });
    }
  }
}

customElements.define("shopping-cart", ShoppingCart);
