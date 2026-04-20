document.getElementById("calculadora-form").addEventListener("submit",
function(event) {
event.preventDefault(); // Evita que el formulario se envíe y recargue la página
let numero1 = parseFloat(document.getElementById("num1").value.trim());
let numero2 = parseFloat(document.getElementById("num2").value.trim());

let operador = document.getElementById("operador").value;
let resultado;

switch (operador) {
case "sum":
resultado = numero1 + numero2;
break;
case "rest":
resultado = numero1 - numero2;
break;
case "mul":
resultado = numero1 * numero2;
break;
case "div":
if (numero2 !== 0) {
resultado = numero1 / numero2;
} else {
resultado = "Error: División por cero";
}
break;
default:
resultado = "Operador no válido";
}

document.getElementById("resultado").textContent = resultado;
});