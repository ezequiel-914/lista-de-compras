import { useState, type SubmitEvent } from 'react'; // Importa el estado del formulario y el tipo del evento de envío.
import './item.css'; // Carga los estilos del componente desde la misma carpeta.

export type ItemProps = { // Define los datos que necesita mostrar cada producto.
    nombre: string; // Guarda el nombre del producto como texto.
    precio: number; // Guarda el precio del producto como número.
    cantidad?: number; // Guarda cuántas unidades del producto se agregan, si se especifica.
    marca?: string; // Guarda la marca del producto, si se especifica.
}; // Termina la definición del tipo de las propiedades.

export function Item({ nombre, precio, cantidad = 1, marca }: ItemProps) { // Recibe los datos y usa una unidad si la cantidad no está definida.
    return (
        <div> {/* Agrupa la información de un producto. */}
            <h3>{nombre}: ${precio.toFixed(2)} X{cantidad}</h3> {/* Muestra el precio por unidad y la cantidad seleccionada. */}
            {cantidad > 1 && <small>Subtotal: {(precio * cantidad).toFixed(2)}$</small>} {/* Muestra el subtotal solo cuando se agregan varias unidades. */}
            {marca && <p>Marca: {marca}</p>} {/* Muestra la marca solo si fue ingresada. */}
            {/* Indica que aquí termina la información visual de este producto. */}
        </div>
    ); // Devuelve el contenido que se muestra para un producto.
}

type FormularioItemProps = { // Define las propiedades que necesita el formulario.
    productos: ItemProps[]; // Recibe los productos que ya están en la lista.
    onAgregar: (producto: ItemProps) => boolean; // Recibe la función que agrega el producto e indica si pudo hacerlo.
}; // Termina la definición de las propiedades del formulario.

export function FormularioItem({ productos, onAgregar }: FormularioItemProps) { // Crea el formulario para ingresar productos.
    const [nombre, setNombre] = useState(''); // Guarda el nombre escrito en el campo.
    const [precio, setPrecio] = useState(''); // Guarda el precio escrito en el campo.
    const [cantidad, setCantidad] = useState(''); // Guarda la cantidad escrita en el campo.
    const [marca, setMarca] = useState(''); // Guarda la marca escrita en el campo.
    const [error, setError] = useState(''); // Guarda un mensaje si falta algún dato.

    function manejarEnvio(event: SubmitEvent<HTMLFormElement>) { // Ejecuta esta función al enviar el formulario.
        event.preventDefault(); // Evita que la página se recargue al enviar el formulario.
        const precioNumero = Number(precio); // Convierte el precio de texto a número.
        const cantidadNumero = cantidad === '' ? 1 : Number(cantidad); // Usa una unidad si el campo quedó vacío.

        if (!nombre.trim() || precio === '' || !Number.isFinite(precioNumero) || !Number.isInteger(cantidadNumero) || cantidadNumero < 1) { // Comprueba que los datos sean válidos.
            setError('Completa todos los campos con datos válidos.'); // Muestra un aviso si hay datos faltantes o inválidos.
            return; // Detiene el envío mientras haya datos inválidos.
        } // Termina la comprobación de los campos.

        const nombreDuplicado = productos.some((producto) => producto.nombre.toLowerCase() === nombre.trim().toLowerCase()); // Comprueba si ya existe un producto con ese nombre.
        if (nombreDuplicado) { // Revisa si el nombre ya pertenece a otro producto.
            setError('Ya existe un producto con ese nombre.'); // Informa que no se puede agregar un nombre repetido.
            return; // Detiene el envío para evitar el duplicado.
        } // Termina la comprobación del nombre repetido.

        const productoNuevo: ItemProps = { nombre: nombre.trim(), precio: precioNumero, cantidad: cantidadNumero }; // Prepara el producto con una unidad como cantidad predeterminada.
        if (marca.trim()) { // Comprueba si se ingresó una marca.
            productoNuevo.marca = marca.trim(); // Agrega la marca solo cuando tiene un valor.
        } // Termina la comprobación de la marca.
        const agregado = onAgregar(productoNuevo); // Envía el producto y recibe si fue agregado.
        if (!agregado) { // Comprueba si la lista rechazó el producto.
            return; // Conserva los campos para que el usuario pueda corregir o revisar el producto.
        } // Termina la comprobación del resultado.

        setNombre(''); // Limpia el campo del nombre después de agregar.
        setPrecio(''); // Limpia el campo del precio después de agregar.
        setCantidad(''); // Limpia el campo de la cantidad después de agregar.
        setMarca(''); // Limpia el campo de la marca después de agregar.
        setError(''); // Quita cualquier mensaje de error anterior.
    } // Termina la función que procesa el formulario.

    return (
        <form onSubmit={manejarEnvio}> {/* Agrupa los campos para ingresar un producto nuevo. */}
            <label>Nombre: <input value={nombre} onChange={(event) => setNombre(event.target.value)} required /></label> {/* Permite escribir el nombre del producto. */}
            <label>Precio Unidad: <input type="number" min="0" step="0.01" value={precio} onChange={(event) => setPrecio(event.target.value)} required /></label> {/* Permite escribir el precio de una unidad. */}
            <label>Cantidad: <input type="number" min="1" step="1" value={cantidad} onChange={(event) => setCantidad(event.target.value)} /></label> {/* Permite ingresar una cantidad opcional de unidades. */}
            <label>Marca: <input value={marca} onChange={(event) => setMarca(event.target.value)} /></label> {/* Permite escribir una marca opcional. */}
            <button type="submit">Agregar producto</button> {/* Envía el producto para agregarlo a la lista. */}
            {error && <p role="alert">{error}</p>} {/* Muestra el error solo cuando existe. */}
        </form>
    ); // Devuelve el formulario que aparece en pantalla.
} // Termina el componente del formulario.

type EditarItemProps = {
    producto: ItemProps;
    indice: number;
    productos: ItemProps[];
    onGuardar: (indice: number, productoOriginal: ItemProps, productoActualizado: ItemProps) => void;
    onCancelar: () => void;
};

export function EditarItem({ producto, indice, productos, onGuardar, onCancelar }: EditarItemProps) {
    const [nombre, setNombre] = useState(producto.nombre);
    const [precio, setPrecio] = useState(String(producto.precio));
    const [cantidad, setCantidad] = useState(producto.cantidad?.toString() ?? '');
    const [marca, setMarca] = useState(producto.marca ?? '');
    const [error, setError] = useState('');

    function manejarEnvio(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        const precioNumero = Number(precio);
        const cantidadNumero = cantidad === '' ? 1 : Number(cantidad);

        if (!nombre.trim() || precio === '' || !Number.isFinite(precioNumero) || !Number.isInteger(cantidadNumero) || cantidadNumero < 1) {
            setError('Completa los campos obligatorios con datos válidos.');
            return;
        }

        const nombreDuplicado = productos.some((otroProducto, otroIndice) =>
            otroIndice !== indice && otroProducto.nombre.toLowerCase() === nombre.trim().toLowerCase()
        );
        if (nombreDuplicado) {
            setError('Ya existe un producto con ese nombre.');
            return;
        }

        const productoActualizado: ItemProps = {
            nombre: nombre.trim(),
            precio: precioNumero,
            cantidad: cantidadNumero,
        };
        if (marca.trim()) {
            productoActualizado.marca = marca.trim();
        }

        onGuardar(indice, producto, productoActualizado);
    }

    return (
        <div className="modal-editar-item" role="dialog" aria-modal="true" aria-labelledby="editar-item-titulo">
            <div className="modal-editar-item__contenido">
                <h2 id="editar-item-titulo">Editar producto</h2>
                <form onSubmit={manejarEnvio}>
                    <label>Nombre: <input value={nombre} onChange={(event) => setNombre(event.target.value)} required /></label>
                    <label>Precio Unidad: <input type="number" min="0" step="0.01" value={precio} onChange={(event) => setPrecio(event.target.value)} required /></label>
                    <label>Cantidad: <input type="number" min="1" step="1" value={cantidad} onChange={(event) => setCantidad(event.target.value)} /></label>
                    <label>Marca: <input value={marca} onChange={(event) => setMarca(event.target.value)} /></label>
                    {error && <p role="alert">{error}</p>}
                    <div className="modal-editar-item__botones">
                        <button type="submit">Guardar</button>
                        <button type="button" onClick={onCancelar}>Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}