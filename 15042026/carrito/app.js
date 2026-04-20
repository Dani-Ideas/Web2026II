// arreglo donde se agregaran los productos
const carrito = [];

// clase Producto
class Producto {
    constructor(nombre, precio) {
        this.nombre = nombre;
        this.precio = precio;
    }
}

function agregarProducto(carrito, producto, cantidad) {
    const indice = carrito.findIndex(item => 
    item.producto.nombre === producto.nombre &&
    item.producto.precio === producto.precio
    );

    if (indice !== -1) {
        carrito[indice].cantidad += cantidad;
    } else {
        carrito.push({ producto, cantidad });
    }

    mostrarCarrito(carrito);
}

function mostrarCarrito(carrito) {
    const listaCarrito = document.getElementById("carrito");
    listaCarrito.innerHTML = "";

    carrito.forEach(item => {
        const li = document.createElement("li");
        li.textContent = `${item.producto.nombre} - $${item.producto.precio} x ${item.cantidad}`;
        listaCarrito.appendChild(li);
    });
}

// evento del formulario
document.getElementById("formulario").addEventListener("submit", function(event) {
    event.preventDefault();

    const nombreProducto = document.getElementById("nombre").value.trim();
    const precioProducto = parseFloat(document.getElementById("precio").value).toFixed(2);
    const cantidadProducto = parseInt(document.getElementById("cantidad").value);

    if (!nombreProducto || isNaN(precioProducto) || isNaN(cantidadProducto)||precioProducto===0) {
        alert("Por favor completa todos los campos correctamente");
        return;
    }

    const nuevoProducto = new Producto(nombreProducto, parseFloat(precioProducto));

    agregarProducto(carrito, nuevoProducto, cantidadProducto);

    // limpiar formulario
    document.getElementById("formulario").reset();
});