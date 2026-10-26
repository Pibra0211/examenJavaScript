let carrito = cargarCarrito();
export function agregarAlCarrito(producto) {
  if (carrito[producto.id]) {
    carrito[producto.id].cantidad += 1;
  } else {
    carrito[producto.id] = {
      id: producto.id,
      titulo: producto.title,
      precio: producto.rice,
      cantidad: 1,
    };
  }
  guardarCarrito();
}

export function disminuirCantidad(id) {
  if (carrito[id]) {
    carrito[id].cantidad -= 1;
    if (carrito[id].cantidad <= 0) {
      delete carrito[id];
    }
    guardarCarrito();
  }
}

export function eliminarDelCarrito(id) {
  delete carrito[id];
  guardarCarrito();
}

export function calcularTotal() {
  let total = 0;
  Object.values(carrito).forEach((producto) => {
    total += producto.price * producto.cantidad;
  });
  return total;
}

export function contarUnidades() {
  let total = 0;
  Object.values(carrito).forEach((producto) => {
    total += producto.cantidad;
  });
  return total;
}

export function obtenerCarrito() {
  return carrito;
}

function guardarCarrito() {
  localStorage.setItem("carritoPagina", productos);
}

function cargarCarrito() {
    try {
        const carritoGuardado = localStorage.getItem("carritoPagina");
        if (carritoGuardado === null) {
            return {};
        }
        return JSON.parse(carritoGuardado);
    } 
    catch (error) {
        return {};
  }
}