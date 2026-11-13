import { useState } from 'react'; // Importa el estado para poder modificar la lista de productos.
import './Lista.css'; // Carga los estilos de la lista de productos.
import { FormularioItem, Item, type ItemProps } from '../Item'; // Importa el formulario, el componente y el tipo de sus propiedades.

export function Lista() { // Define el componente que muestra todos los productos.
    const [productos, setProductos] = useState<ItemProps[]>([ // Guarda los productos y permite actualizar el array.
        { nombre: 'Arroz', precio: 29.99, marca: 'Coringa' }, // Agrega el primer producto.
        { nombre: 'Leche', precio: 19.5, marca: 'La Vaquita' }, // Agrega el segundo producto.
        { nombre: 'Pan', precio: 12, marca: 'El Horno' }, // Agrega el tercer producto.
    ]); // Termina el estado inicial con los productos de ejemplo.


    
    return (
        <div className="lista"> {/* Agrupa el título y la lista de productos. */}
            <h2>Lista de Productos</h2> {/* Muestra el título de la lista. */}
            <FormularioItem onAgregar={(productoNuevo) => setProductos((productosActuales) => [...productosActuales, productoNuevo])} /> {/* Agrega al estado el producto recibido del formulario. */}
            <ul> {/* Crea la lista HTML que contendrá los productos. */}
                {/* Recorre el array y crea un elemento visual por cada producto. */}
                {productos.map((producto, indice) => (
                    <li key={`${producto.nombre}-${indice}`}> {/* Usa el nombre y la posición para identificar cada elemento. */}
                        <Item {...producto} /> {/* Envía nombre, precio y marca al componente Item. */}
                        {/* Indica que aquí termina el elemento de esta lista. */}
                    </li>
                ))} {/* Termina el recorrido del array de productos. */}
                {/* Indica que aquí termina la lista HTML. */}
            </ul>
            {/* Indica que aquí termina el contenedor de la lista. */}
        </div>
    ); // Devuelve el contenido que aparece en pantalla.
}
