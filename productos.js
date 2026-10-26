export async function obtenerProductos() {
    try {
        const productos = await fetch("https://productos.json");
        if (productos === !ok) {
          throw new Error(`Error en la solicitud: ${productos.status}`);
        }
        return productos
    }

    catch(error){
        console.error(error.message)
        return []
    
        
    }
    
}    