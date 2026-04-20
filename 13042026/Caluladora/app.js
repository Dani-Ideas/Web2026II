const pantalla = document.getElementById("pantalla");
const botones = document.querySelectorAll("button");
const btnIgual = document.getElementById("igual");
const btnClear = document.getElementById("clear");

// Agregar números y operadores
botones.forEach(boton => {
    boton.addEventListener("click", () => {
        const valor = boton.getAttribute("data-valor");
        if (valor) {
            pantalla.value += valor;
        }
    });
});

// Calcular resultado
btnIgual.addEventListener("click", () => {
    try {
        if (pantalla.value.includes("/0")) {
            pantalla.value = "Error";
            return;
        }
        pantalla.value = eval(pantalla.value);
    } catch {
        pantalla.value = "Error";
    }
});

// Limpiar pantalla
btnClear.addEventListener("click", () => {
    pantalla.value = "";
});