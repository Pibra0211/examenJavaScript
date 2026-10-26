export async function obtenerProductos() {
    try {
        const respuesta = await fetch("data/productos.json");
        if (!respuesta === ok) {
          throw new Error(`Error en la solicitud: ${respuesta.status}`);
        }
        const productos = await respuesta.json();
        return productos;
    }

    catch(error){
        console.error(error.message)
        return []
    
        
    }
    
}    