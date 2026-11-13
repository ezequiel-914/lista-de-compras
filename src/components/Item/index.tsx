import { useState, type FormEvent } from 'react'; // Importa el estado del formulario y el tipo de su evento.
import './item.css'; // Carga los estilos del componente desde la misma carpeta.

export type ItemProps = { // Define los datos que necesita mostrar cada producto.
    nombre: string; // Guarda el nombre del producto como texto.
    precio: number; // Guarda el precio del producto como número.
    marca: string; // Guarda la marca del producto como texto.
}; // Termina la definición del tipo de las propiedades.

export function Item({ nombre, precio, marca }: ItemProps) { // Recibe los datos de un producto desde el componente padre.
    return (
        <div> {/* Agrupa la información de un producto. */}
            <h3>{nombre}</h3> {/* Muestra el nombre del producto. */}
            <p>Precio: ${precio.toFixed(2)}</p> {/* Muestra el precio con dos decimales. */}
            <p>Marca: {marca}</p> {/* Muestra la marca del producto. */}
            {/* Indica que aquí termina la información visual de este producto. */}
        </div>
    ); // Devuelve el contenido que se muestra para un producto.
}

type FormularioItemProps = { // Define las propiedades que necesita el formulario.
    onAgregar: (producto: ItemProps) => void; // Recibe la función que agrega el nuevo producto a la lista.
}; // Termina la definición de las propiedades del formulario.

export function FormularioItem({ onAgregar }: FormularioItemProps) { // Crea el formulario para ingresar productos.
    const [nombre, setNombre] = useState(''); // Guarda el nombre escrito en el campo.
    const [precio, setPrecio] = useState(''); // Guarda el precio escrito en el campo.
    const [marca, setMarca] = useState(''); // Guarda la marca escrita en el campo.
    const [error, setError] = useState(''); // Guarda un mensaje si falta algún dato.

    function manejarEnvio(event: FormEvent<HTMLFormElement>) { // Ejecuta esta función al enviar el formulario.
        event.preventDefault(); // Evita que la página se recargue al enviar el formulario.
        const precioNumero = Number(precio); // Convierte el precio de texto a número.

        if (!nombre.trim() || !marca.trim() || precio === '' || !Number.isFinite(precioNumero)) { // Comprueba que los datos sean válidos.
            setError('Completa todos los campos con datos válidos.'); // Muestra un aviso si hay datos faltantes o inválidos.
            return; // Detiene el envío mientras haya datos inválidos.
        } // Termina la comprobación de los campos.

        onAgregar({ nombre: nombre.trim(), precio: precioNumero, marca: marca.trim() }); // Envía el nuevo producto a la lista.
        setNombre(''); // Limpia el campo del nombre después de agregar.
        setPrecio(''); // Limpia el campo del precio después de agregar.
        setMarca(''); // Limpia el campo de la marca después de agregar.
        setError(''); // Quita cualquier mensaje de error anterior.
    } // Termina la función que procesa el formulario.

    return (
        <form onSubmit={manejarEnvio}> {/* Agrupa los campos para ingresar un producto nuevo. */}
            <label>Nombre: <input value={nombre} onChange={(event) => setNombre(event.target.value)} required /></label> {/* Permite escribir el nombre del producto. */}
            <label>Precio: <input type="number" min="0" step="0.01" value={precio} onChange={(event) => setPrecio(event.target.value)} required /></label> {/* Permite escribir un precio igual o mayor que cero. */}
            <label>Marca: <input value={marca} onChange={(event) => setMarca(event.target.value)} required /></label> {/* Permite escribir la marca del producto. */}
            <button type="submit">Agregar producto</button> {/* Envía el producto para agregarlo a la lista. */}
            {error && <p role="alert">{error}</p>} {/* Muestra el error solo cuando existe. */}
        </form>
    ); // Devuelve el formulario que aparece en pantalla.
} // Termina el componente del formulario.