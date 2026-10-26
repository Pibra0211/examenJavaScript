export function filtrarPorCategoria(productos, categoria){
    if (categoria === "todos")
        return productos
    
    else 
        return productos.filter(producto => producto.categoria === categoria)
}

export function filtrarPorBusqueda(productos, texto) {
  if (texto === "") return productos;
  else
    return productos.filter(
      (producto) =>
        producto.title.toLowerCase().includes(texto.toLowerCase()) ||
        producto.description.toLowerCase().includes(texto.toLowerCase()),
    );
}

export function ordenarProductos(productos, criterio) {
  const copia = [...productos];
  if (criterio === "precio-asc")
    return copia.sort((a, b) => a.price - b.price);

  else if (criterio === "precio-desc")
    return copia.sort((a, b) => b.price - a.price);

  else if (criterio === "nombre-az")
    return copia.sort((a, b) => a.title.localeCompare(b.title));

  else if (criterio === "nombre-za")
    return copia.sort((a, b) => b.title.localeCompare(a.title));

  else return copia;
}
