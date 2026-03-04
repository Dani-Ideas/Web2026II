let number1;
let number2;

function compareNumbers(){

    // Generar números aleatorios del 1 al 100
    number1 = Math.floor(Math.random() * 100) + 1;
    number2 = Math.floor(Math.random() * 100) + 1;

    let message;

    if(number1 === number2){
        message = "Los números son iguales\n" +
                  "El número 1 es: " + number1 + 
                  ", el número 2 es: " + number2;
    } else {
        message = "Los números son diferentes\n" +
                  "El número 1 es: " + number1 + 
                  ", el número 2 es: " + number2;
    }

    // Mostrar en pantalla en lugar de consola
    document.getElementById("output").textContent = message;

    // También lo imprime en consola por si quieres verlo
    console.log(message);
}