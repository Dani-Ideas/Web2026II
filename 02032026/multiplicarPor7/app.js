function mostrarTabla() {

    let numero = 7;
    let i = 1;
    let tabla = document.getElementById("tabla");

    tabla.innerHTML = "";

    while (i <= 10) {
        let resultado = numero * i;

        let item = document.createElement("li");
        item.textContent = numero + " x " + i + " = " + resultado;

        tabla.appendChild(item);

        i++;
    }
}