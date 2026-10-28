export class ProductCard extends HTMLElement {
  #producto = null;

  set data(producto) {
    this.#producto = producto;
    this.render();
  }

  get data() {
    return this.#producto;
  }

  connectedCallback() {
    if (this.#producto && this.childElementCount === 0) {
      this.render();
    }
  }

  render() {
    const producto = this.#producto;

    if (!producto) {
      return;
    }

    const { name, category, description, price, stock, active } = producto;
    const disponible = active === true && stock > 0;

    const categoria = document.createElement("span");
    categoria.className = "producto-categoria";
    categoria.textContent = category;

    const nombre = document.createElement("h3");
    nombre.className = "producto-nombre";
    nombre.textContent = name;

    const detalle = document.createElement("p");
    detalle.className = "producto-descripcion";
    detalle.textContent = description;

    const precio = document.createElement("p");
    precio.className = "producto-precio";
    precio.textContent = "$ " + price.toLocaleString("es-CO");

    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "botonCarrito";
    boton.disabled = !disponible;
    boton.textContent = disponible
      ? "Agregar"
      : active
        ? "Agotado"
        : "No disponible";
    boton.setAttribute(
      "aria-label",
      disponible
        ? `Agregar ${name} al carrito`
        : `${name} no disponible para agregar`,
    );

    if (disponible) {
      boton.addEventListener("click", () => this.emitirAgregar());
    }

    const filaCompra = document.createElement("div");
    filaCompra.className = "producto-compra";
    filaCompra.append(precio, boton);

    const estado = document.createElement("span");
    estado.className = "producto-estado";

    if (!active) {
      estado.classList.add("producto-estado--inactivo");
      estado.textContent = "No disponible";
    } else if (stock < 1) {
      estado.classList.add("producto-estado--agotado");
      estado.textContent = "Agotado";
    } else {
      estado.textContent = `Stock: ${stock}`;
    }

    this.replaceChildren(categoria, nombre, detalle, filaCompra, estado);
  }

  emitirAgregar() {
    if (!this.#producto) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent("producto-agregar", {
        bubbles: true,
        composed: true,
        detail: { id: this.#producto.id },
      }),
    );
  }
}

if (!customElements.get("product-card")) {
  customElements.define("product-card", ProductCard);
}
