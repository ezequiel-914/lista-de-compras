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
    let porcentajePresupuesto: number;
    if (total === 0) {
        porcentajePresupuesto = 0;
    } else if (presupuestoMaximo === null){
        porcentajePresupuesto = 0;
    } else if (presupuestoMaximo === 0) {
        porcentajePresupuesto = 100;
    } else {
        porcentajePresupuesto = (total / presupuestoMaximo) * 100;
    } // Calcula el porcentaje usado; sin límite definido, los productos cuentan como el 100%.
    const estadoPresupuesto = obtenerEstadoPresupuesto(porcentajePresupuesto); // Determina los colores y la sombra que corresponden al porcentaje.

    function iniciarCompra(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        if (presupuestoTexto.trim() === '') {
            setPresupuestoMaximo(null);
            setErrorPresupuesto('');
            setCompraIniciada(true);
            return;
        }

        const valorPresupuesto = Number(presupuestoTexto);
        if (!Number.isFinite(valorPresupuesto) || valorPresupuesto < 0) {
            setErrorPresupuesto('Ingresa un presupuesto válido.');
            return;
        }

        setPresupuestoMaximo(valorPresupuesto);
        setErrorPresupuesto('');
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
            <div className="lista lista--inicio">
                <h1>Preparar lista de compras</h1>
                <form className="formulario-inicio" onSubmit={iniciarCompra}>
                    <label htmlFor="presupuesto-maximo">Presupuesto máximo estimado: </label>
                    <input id="presupuesto-maximo" type="number" min="0" step="0.01" value={presupuestoTexto} onChange={(event) => setPresupuestoTexto(event.target.value)} />
                    {presupuestoTexto.trim() !== '' && (
                        <fieldset>
                            <legend>Tipo de presupuesto</legend>
                            <label><input type="radio" name="modo-presupuesto" value="flexible" checked={modoPresupuesto === 'flexible'} onChange={() => setModoPresupuesto('flexible')} /> Flexible: permite superar el límite.</label>
                            <label><input type="radio" name="modo-presupuesto" value="estricto" checked={modoPresupuesto === 'estricto'} onChange={() => setModoPresupuesto('estricto')} /> Estricto: bloquea productos que superen el límite.</label>
                        </fieldset>
                    )}
                    {errorPresupuesto && <p role="alert">{errorPresupuesto}</p>}
                    <button type="submit">
                        {presupuestoTexto.trim() === '' ? 'INICIAR SIN PRESUPUESTO MÁXIMO' : 'INICIAR CON ESTE PRESUPUESTO'}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className={`lista lista--${estadoPresupuesto}${presupuestoMaximo !== null ? ' lista--con-presupuesto' : ''}`}>
            <h2>Lista de Productos</h2>
            <FormularioItem productos={productos} onAgregar={agregarProducto} />
            <div className="lista-productos">
                <ul>
                    {productos.map((producto, indice) => (
                        <li className="producto-card" key={`${producto.nombre}-${indice}`}>
                            <Item {...producto} />
                            <div className="producto-card__acciones">
                                <button type="button" aria-label={`Editar ${producto.nombre}`} onClick={() => setProductoEnEdicion({ indice, producto })}>Editar</button>
                                <button type="button" aria-label={`Quitar ${producto.nombre}`} onClick={() => quitarProducto(indice)}>Quitar</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <div className={`resumen-compra ${presupuestoMaximo === null ? 'resumen-compra--sin-presupuesto' : `resumen-compra--${estadoPresupuesto}`}`}>
                <p><span>Total de la compra</span><strong>${total.toFixed(2)}</strong></p>
                {presupuestoMaximo !== null && (
                    <p><span>Presupuesto máximo</span><strong>${presupuestoMaximo.toFixed(2)}</strong></p>
                )}
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
