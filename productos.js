export async function obtenerProductos() {
    try {
        const respuesta = await fetch ("https://productos.json");
        if (respuesta === !ok){
            throw new Error(`Error en la solicitud: ${respuesta.status}`);
        }
        return productos
    }

    catch(error){
        console.error(error.message)
        return []
    

    }
    
}    