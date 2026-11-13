import { useState, type SubmitEvent } from 'react';
import './Lista.css';
import { EditarItem, FormularioItem, Item, type ItemProps } from '../Item';

type ModoPresupuesto = 'flexible' | 'estricto'; // Define los modos disponibles para el presupuesto.
type EstadoPresupuesto = 'lejos' | 'cerca' | 'muy-cerca' | 'critico'; // Define los estados visuales del presupuesto.

function obtenerEstadoPresupuesto(porcentaje: number): EstadoPresupuesto { // Elige el estado según el porcentaje usado.
    if (porcentaje >= 95) return 'critico'; // Desde el 95%, el estado es crítico.
    if (porcentaje >= 85) return 'muy-cerca'; // Desde el 85%, el estado está muy cerca del límite.
    if (porcentaje >= 75) return 'cerca'; // Desde el 75%, el estado está cerca del límite.
    return 'lejos'; // Por debajo del 75%, el estado está lejos del límite.
}

export function Lista() {
    const [productos, setProductos] = useState<ItemProps[]>([]);
    const [presupuestoTexto, setPresupuestoTexto] = useState(''); // Guarda el valor escrito en el campo del presupuesto.
    const [presupuestoMaximo, setPresupuestoMaximo] = useState<number | null>(null); // Guarda el presupuesto o null si no se eligió uno.
    const [modoPresupuesto, setModoPresupuesto] = useState<ModoPresupuesto>('flexible'); // Guarda si el límite será flexible o estricto.
    const [compraIniciada, setCompraIniciada] = useState(false);
    const [errorPresupuesto, setErrorPresupuesto] = useState(''); // Guarda un mensaje si el presupuesto no es válido.
    const [productoBloqueado, setProductoBloqueado] = useState(''); // Guarda el nombre del producto rechazado por el límite estricto.
    const [productoEnEdicion, setProductoEnEdicion] = useState<{ indice: number; producto: ItemProps } | null>(null);
    const total = productos.reduce((suma, producto) => suma + producto.precio * (producto.cantidad ?? 1), 0); // Suma el precio por unidad multiplicado por la cantidad o por uno.
    const porcentajePresupuesto = total === 0 ? 0 : presupuestoMaximo === null || presupuestoMaximo === 0 ? 100 : (total / presupuestoMaximo) * 100; // Calcula el porcentaje usado; sin límite definido, los productos cuentan como el 100%.
    const estadoPresupuesto = obtenerEstadoPresupuesto(porcentajePresupuesto); // Determina los colores y la sombra que corresponden al porcentaje.

    function iniciarConPresupuesto(event: SubmitEvent<HTMLFormElement>) { // Inicia la compra con el presupuesto ingresado.
        event.preventDefault();
        const valorPresupuesto = Number(presupuestoTexto); // Convierte el presupuesto ingresado a número.

        if (presupuestoTexto.trim() === '' || !Number.isFinite(valorPresupuesto) || valorPresupuesto < 0) { // Comprueba que el presupuesto sea válido.
            setErrorPresupuesto('Ingresa un presupuesto válido.');
            return;
        }

        setPresupuestoMaximo(valorPresupuesto);
        setCompraIniciada(true);
    }

    function iniciarSinPresupuesto() { // Inicia la compra sin establecer un límite máximo.
        setPresupuestoMaximo(null);
        setCompraIniciada(true);
    }

    function agregarProducto(productoNuevo: ItemProps) { // Agrega un producto si el modo de presupuesto lo permite.
        const nuevoTotal = total + productoNuevo.precio * (productoNuevo.cantidad ?? 1); // Calcula el total nuevo para compararlo con el límite.

        if (modoPresupuesto === 'estricto' && presupuestoMaximo !== null && nuevoTotal > presupuestoMaximo) { // Bloquea el producto si supera el presupuesto estricto.
            setProductoBloqueado(productoNuevo.nombre); // Guarda el nombre para mostrarlo en el aviso.
            return false;
        }

        setProductos((productosActuales) => [...productosActuales, productoNuevo]);
        return true;
    }

    function quitarProducto(indiceAQuitar: number) {
        setProductos((productosActuales) => productosActuales.filter((_, indice) => indice !== indiceAQuitar));
    }

    function guardarProductoEditado(indice: number, productoOriginal: ItemProps, productoActualizado: ItemProps) {
        const totalNuevo = total
            - productoOriginal.precio * (productoOriginal.cantidad ?? 1)
            + productoActualizado.precio * (productoActualizado.cantidad ?? 1);

        if (modoPresupuesto === 'estricto' && presupuestoMaximo !== null && totalNuevo > presupuestoMaximo) {
            setProductoBloqueado(productoActualizado.nombre);
            return;
        }

        setProductos((productosActuales) =>
            productosActuales.map((producto, indiceActual) =>
                indiceActual === indice ? productoActualizado : producto
            )
        );
        setProductoEnEdicion(null);
    }

    if (!compraIniciada) {
        return (
            <div className="lista">
                <h1>Preparar lista de compras</h1>
                <form onSubmit={iniciarConPresupuesto}>
                    <label htmlFor="presupuesto-maximo">Presupuesto máximo estimado: </label>
                    <input id="presupuesto-maximo" type="number" min="0" step="0.01" value={presupuestoTexto} onChange={(event) => setPresupuestoTexto(event.target.value)} required />
                    <fieldset>
                        <legend>Tipo de presupuesto</legend>
                        <label><input type="radio" name="modo-presupuesto" value="flexible" checked={modoPresupuesto === 'flexible'} onChange={() => setModoPresupuesto('flexible')} /> Flexible: permite superar el límite.</label>
                        <label><input type="radio" name="modo-presupuesto" value="estricto" checked={modoPresupuesto === 'estricto'} onChange={() => setModoPresupuesto('estricto')} /> Estricto: bloquea productos que superen el límite.</label>
                    </fieldset>
                    {errorPresupuesto && <p role="alert">{errorPresupuesto}</p>}
                    <button type="submit">Iniciar con presupuesto</button>
                    <button type="button" onClick={iniciarSinPresupuesto}>Iniciar sin presupuesto</button>
                </form>
            </div>
        );
    }

    return (
        <div className={`lista lista--${estadoPresupuesto}`}>
            <h2>Lista de Productos</h2>
            <FormularioItem productos={productos} onAgregar={agregarProducto} />
            <ul>
                {productos.map((producto, indice) => (
                    <li key={`${producto.nombre}-${indice}`}>
                        <Item {...producto} />
                        <button type="button" aria-label={`Editar ${producto.nombre}`} onClick={() => setProductoEnEdicion({ indice, producto })}>editar</button>
                        <button type="button" aria-label={`Quitar ${producto.nombre}`} onClick={() => quitarProducto(indice)}>quitar</button>
                    </li>
                ))}
            </ul>
            <div className={`resumen-compra resumen-compra--${estadoPresupuesto}`}>
                <p>Total de la compra: ${total.toFixed(2)}</p>
                {presupuestoMaximo !== null && <p>Presupuesto máximo: ${presupuestoMaximo.toFixed(2)}</p>}
            </div>
            {productoEnEdicion && (
                <EditarItem
                    key={productoEnEdicion.indice}
                    producto={productoEnEdicion.producto}
                    indice={productoEnEdicion.indice}
                    productos={productos}
                    onGuardar={guardarProductoEditado}
                    onCancelar={() => setProductoEnEdicion(null)}
                />
            )}
            {productoBloqueado && presupuestoMaximo !== null && ( // Muestra un aviso cuando el modo estricto bloquea un producto.
                <div className="aviso-presupuesto" role="alertdialog" aria-modal="true" aria-labelledby="titulo-aviso-presupuesto">
                    <div className="aviso-presupuesto__contenido">
                        <h2 id="titulo-aviso-presupuesto">Presupuesto excedido</h2>
                        <p>El producto {productoBloqueado} sobrepasa el límite presupuestário definido: {presupuestoMaximo.toFixed(2)}</p>
                        <button type="button" onClick={() => setProductoBloqueado('')}>Entendido</button>
                    </div>
                </div>
            )}
        </div>
    );
}
