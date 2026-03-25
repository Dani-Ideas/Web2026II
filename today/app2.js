    let productos = [
        { nombre: "camisa", precio: 100 ,stock: 15},
        { nombre: "zapato", precio: 200 ,stock: 1},
        { nombre: "pantalon", precio: 300 ,stock: 20},
        { nombre: "calcetin", precio: 400 ,stock: 5}
    ];

    let carrito = [];
    let option;

    do {
        option = Number(prompt(mostrarMenu()));

        if (isNaN(option) || option < 1 || option > productos.length + 2) {
            console.log("Opción no válida");
        } else if (option >= 1 && option <= productos.length) {
            agregarCarrito(option - 1);
        } else if (option === productos.length + 1) {
            mostrarCarritoTotal();
        }

    } while (option !== productos.length + 2);

    console.log("Gracias por su compra");

    function mostrarMenu() {
        let menu = "Seleccione un producto:\n";

        for (let i = 0; i < productos.length; i++) {
            menu += `${i + 1}.- ${productos[i].nombre} - $${productos[i].precio}\n`;
        }

        menu += `${productos.length + 1}.- Ver carrito y total\n`;
        menu += `${productos.length + 2}.- Salir\n`;

        return menu;
    }

    function agregarCarrito(index) {
        let productoSeleccion = productos[index];
        carrito.push(productoSeleccion);
        console.log(`Producto agregado: ${productoSeleccion.nombre}`);
    }

    function mostrarCarritoTotal() {
        if (carrito.length === 0) {
            console.log("El carrito está vacío");
        } else {
            let mensajeCarrito = "Carrito de compras:\n";
            let total = 0;

            for (let i = 0; i < carrito.length; i++) {
                mensajeCarrito += `${i + 1}.- ${carrito[i].nombre} - $${carrito[i].precio}\n`;
                total += carrito[i].precio;
            }

            console.log(mensajeCarrito);
            console.log("Total: $" + total);
        }
    }
        /**
         * un menu en donde me permita agrega objeto al arreglo productos
         * // poner un contador a cada objeto de ropa , y un numero limite de stock y una logica de un numero maximo de compra de articulos, no se puede compar mas camisas de las que hay en la tienda
         */