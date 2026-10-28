export async function obtenerProductos() {
  const respuesta = await fetch("data/products.json");
  if (!respuesta.ok) {
    throw new Error(`Error ${respuesta.status}`);
  }

  const datos = await respuesta.json();
  if (!Array.isArray(datos)) {
    throw new Error("El catálogo no tiene un formato válido");
  }

    return datos.filter(p =>
        Number.isInteger(p.id) && p.id > 0 &&
        typeof p.name === "string" && p.name.trim() !== "" &&
        typeof p.category === "string" &&
        typeof p.price === "number" && p.price > 0 &&
        Number.isInteger(p.stock) && p.stock >= 0 &&
        typeof p.active === "boolean"
    );
}    