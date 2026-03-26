let productos = [
    { nombre: "camisa", precio: 100, stock: 15 },
    { nombre: "zapato", precio: 200, stock: 1 },
    { nombre: "pantalon", precio: 300, stock: 20 },
    { nombre: "calcetin", precio: 400, stock: 5 }
];

let carrito = [];
let option;

do {
    option = Number(prompt(mostrarMenu()));

    if (isNaN(option) || option < 1 || option > productos.length + 2) {
        alert("Opción no válida");
    } else if (option >= 1 && option <= productos.length) {
        agregarCarrito(option - 1);
    } else if (option === productos.length + 1) {
        mostrarCarritoTotal();
    }

} while (option !== productos.length + 2);

alert("Gracias por su compra");

function mostrarMenu() {
    let menu = "Seleccione un producto:\n\n";

    for (let i = 0; i < productos.length; i++) {
        menu += `${i + 1}.- ${productos[i].nombre} - $${productos[i].precio} (Stock: ${productos[i].stock})\n`;
    }

    menu += `\n${productos.length + 1}.- Ver carrito y total\n`;
    menu += `${productos.length + 2}.- Salir\n`;

    return menu;
}

function agregarCarrito(index) {
    let productoSeleccion = productos[index];

    if (productoSeleccion.stock <= 0) {
        alert(`No hay stock disponible de ${productoSeleccion.nombre}`);
        return;
    }
    carrito.push(productoSeleccion);
    productoSeleccion.stock--;

    alert(`Producto agregado: ${productoSeleccion.nombre}\nStock restante: ${productoSeleccion.stock}`);
}

function mostrarCarritoTotal() {
    if (carrito.length === 0) {
        alert("El carrito está vacío");
    } else {
        let mensajeCarrito = "Carrito de compras:\n\n";
        let total = 0;

        for (let i = 0; i < carrito.length; i++) {
            mensajeCarrito += `${i + 1}.- ${carrito[i].nombre} - $${carrito[i].precio}\n`;
            total += carrito[i].precio;
        }

        mensajeCarrito += `\nTotal: $${total}`;

        alert(mensajeCarrito);
    }
}