let numeroSecreto = Math.floor(Math.random() * 10) + 1;

function verificar() {
    let intento = Number(document.getElementById("numero").value);
    let resultado = document.getElementById("resultado");

    if (!intento) {
        resultado.textContent = "⚠️ Ingresa un número.";
        return;
    }

    if (intento === numeroSecreto) {
        resultado.textContent = "🎉 ¡Correcto! Adivinaste el número.";
    } else {
        resultado.textContent = "❌ Incorrecto. Intenta otra vez.";
    }
}