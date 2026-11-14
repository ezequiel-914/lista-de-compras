import { useState, type SubmitEvent } from 'react';
import './item.css';

export type ItemProps = {
    nombre: string;
    precio: number;
    cantidad?: number;
    marca?: string;
};

export function Item({ nombre, precio, cantidad = 1, marca }: ItemProps) {
    return (
        <div className="producto-card__contenido">
            <div className="producto-card__encabezado">
                <h3 className="producto-card__nombre">{nombre.toUpperCase()}</h3>
                {marca && <p className="producto-card__marca">Marca: {marca.toUpperCase()}</p>}
            </div>
            <div className="producto-card__datos">
                <p><span>Precio</span><strong>${precio.toFixed(2)}</strong></p>
                <p><span>Cantidad</span><strong>{cantidad}</strong></p>
                {cantidad > 1 && <small>Subtotal: ${(precio * cantidad).toFixed(2)}</small>}
            </div>
        </div>
    );
}

type FormularioItemProps = {
    productos: ItemProps[];
    onAgregar: (producto: ItemProps) => boolean;
};

export function FormularioItem({ productos, onAgregar }: FormularioItemProps) {
    const [nombre, setNombre] = useState('');
    const [precio, setPrecio] = useState('');
    const [cantidad, setCantidad] = useState('');
    const [marca, setMarca] = useState('');
    const [error, setError] = useState('');

    function manejarEnvio(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        const precioNumero = Number(precio);
        const cantidadNumero = cantidad === '' ? 1 : Number(cantidad);

        if (!nombre.trim() || precio === '' || !Number.isFinite(precioNumero) || !Number.isInteger(cantidadNumero) || cantidadNumero < 1) {
            setError('Completa todos los campos con datos válidos.');
            return;
        }

        const nombreDuplicado = productos.some((producto) => producto.nombre.toLowerCase() === nombre.trim().toLowerCase());
        if (nombreDuplicado) {
            setError('Ya existe un producto con ese nombre.');
            return;
        }

        const productoNuevo: ItemProps = { nombre: nombre.trim().toUpperCase(), precio: precioNumero, cantidad: cantidadNumero };
        if (marca.trim()) {
            productoNuevo.marca = marca.trim();
        }
        const agregado = onAgregar(productoNuevo);
        if (!agregado) {
            return;
        }

        setNombre('');
        setPrecio('');
        setCantidad('');
        setMarca('');
        setError('');
    }

    return (
        <form className="formulario-item" onSubmit={manejarEnvio}>
            <label><span>Nombre</span><input value={nombre} onChange={(event) => setNombre(event.target.value.toUpperCase())} required /></label>
            <label><span>Precio unidad</span><input type="number" min="0" step="0.01" value={precio} onChange={(event) => setPrecio(event.target.value)} required /></label>
            <label><span>Cantidad</span><input type="number" min="1" step="1" value={cantidad} onChange={(event) => setCantidad(event.target.value)} /></label>
            <label><span>Marca</span><input value={marca} onChange={(event) => setMarca(event.target.value.toUpperCase())} /></label>
            <button type="submit">Agregar producto</button>
            {error && <p role="alert">{error}</p>}
        </form>
    );
}

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
    const [marca, setMarca] = useState((producto.marca ?? '').toUpperCase());
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
            nombre: nombre.trim().toUpperCase(),
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
                    <label>Nombre: <input value={nombre} onChange={(event) => setNombre(event.target.value.toUpperCase())} required /></label>
                    <label>Precio Unidad: <input type="number" min="0" step="0.01" value={precio} onChange={(event) => setPrecio(event.target.value)} required /></label>
                    <label>Cantidad: <input type="number" min="1" step="1" value={cantidad} onChange={(event) => setCantidad(event.target.value)} /></label>
                    <label>Marca: <input value={marca} onChange={(event) => setMarca(event.target.value.toUpperCase())} /></label>
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