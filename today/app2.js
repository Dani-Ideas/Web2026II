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

    if (isNaN(option) || option < 1 || option > productos.length + 3) {
        alert("Opción no válida");
    } else if (option >= 1 && option <= productos.length) {
        agregarCarrito(option - 1);
    } else if (option === productos.length + 1) {
        mostrarCarritoTotal();
    } else if (option === productos.length + 2) {
        menuEmpleado();
    }

} while (option !== productos.length + 3);

alert("Gracias por su compra");

function mostrarMenu() {
    let menu = "Seleccione una opción:\n\n";

    for (let i = 0; i < productos.length; i++) {
        menu += `${i + 1}.- ${productos[i].nombre} - $${productos[i].precio} (Stock: ${productos[i].stock})\n`;
    }

    menu += `\n${productos.length + 1}.- Ver carrito y total\n`;
    menu += `${productos.length + 2}.- Menú empleado\n`;
    menu += `${productos.length + 3}.- Salir\n`;

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
        let mensaje = "Carrito de compras:\n\n";
        let total = 0;

        for (let i = 0; i < carrito.length; i++) {
            mensaje += `${i + 1}.- ${carrito[i].nombre} - $${carrito[i].precio}\n`;
            total += carrito[i].precio;
        }

        mensaje += `\nTotal: $${total}`;
        alert(mensaje);
    }
}

// 🔹 MENÚ EMPLEADO
function menuEmpleado() {
    let opcion;

    do {
        opcion = Number(prompt(
            "MENÚ EMPLEADO\n\n" +
            "1.- Agregar nuevo producto\n" +
            "2.- Aumentar stock de producto\n" +
            "3.- Volver\n"
        ));

        if (opcion === 1) {
            agregarProducto();
        } else if (opcion === 2) {
            aumentarStock();
        } else if (opcion !== 3) {
            alert("Opción no válida");
        }

    } while (opcion !== 3);
}

// 🔹 AGREGAR PRODUCTO
function agregarProducto() {
    let nombre = prompt("Ingrese nombre del producto:");
    let precio = Number(prompt("Ingrese precio:"));
    let stock = Number(prompt("Ingrese stock:"));

    if (!nombre || isNaN(precio) || isNaN(stock)) {
        alert("Datos inválidos");
        return;
    }

    productos.push({ nombre, precio, stock });
    alert("Producto agregado correctamente");
}

function aumentarStock() {
    let lista = "Seleccione producto para aumentar stock:\n\n";
    for (let i = 0; i < productos.length; i++) {
        lista += `${i + 1}.- ${productos[i].nombre} (Stock actual: ${productos[i].stock})\n`;
    }
    let opcion = Number(prompt(lista));
    if (isNaN(opcion) || opcion < 1 || opcion > productos.length) {
        alert("Opción no válida");
        return;
    }
    let cantidad = Number(prompt("¿Cuánto stock desea agregar?"));
    if (isNaN(cantidad) || cantidad <= 0) {
        alert("Cantidad inválida");
        return;
    }
    productos[opcion - 1].stock += cantidad;

    alert(`Stock actualizado. Nuevo stock: ${productos[opcion - 1].stock}`);
}