import "./product-card.js";

export class ProductList extends HTMLElement {
  #productos = [];
  #mensajeVacio = "No se encontraron productos con los filtros aplicados.";

  set productos(lista) {
    this.#productos = Array.isArray(lista) ? lista : [];
    this.render();
  }

  get productos() {
    return this.#productos;
  }

  set mensajeVacio(texto) {
    this.#mensajeVacio = String(texto || "");
  }

  connectedCallback() {
    if (this.childElementCount === 0) {
      this.render();
    }
  }

  render() {
    if (this.#productos.length === 0) {
      const mensaje = document.createElement("p");
      mensaje.className = "mensaje-sin-resultados";
      mensaje.textContent = this.#mensajeVacio;
      this.replaceChildren(mensaje);
      return;
    }

    const grilla = document.createElement("div");
    grilla.className = "grid-productos";

    for (const producto of this.#productos) {
      const tarjeta = document.createElement("product-card");
      tarjeta.data = producto;
      grilla.append(tarjeta);
    }

    this.replaceChildren(grilla);
  }
}

if (!customElements.get("product-list")) {
  customElements.define("product-list", ProductList);
}
