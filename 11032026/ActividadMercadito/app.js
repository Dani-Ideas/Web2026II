// preguntar que fruta quiere con confirm
// user puede dar un true y false  y al final me lite las frutas , que le suer escriba que fruta
//uasr lista , confirm y cuanto se le va a cobrar
function iniciarCompra(){

    let frutas = [];
    let total = 0;
    let continuar = true;

    while(continuar){

        // pedir fruta
        let fruta = prompt("¿Qué fruta quieres comprar?");

        if(fruta){
            frutas.push(fruta);

            // precio aleatorio entre 1 y 10
            let precio = Math.floor(Math.random() * 10) + 1;
            total += precio;

            alert(fruta + " cuesta $" + precio);
        }

        // preguntar si desea continuar
        continuar = confirm("¿Quieres agregar otra fruta?");
    }

    let lista = document.getElementById("lista");
    let totalTexto = document.getElementById("total");

    if(frutas.length > 0){
        lista.textContent = "Frutas compradas: " + frutas.join(", ");
        totalTexto.textContent = "Total a pagar: $" + total;
    } else {
        lista.textContent = "No compraste nada.";
        totalTexto.textContent = "";
    }
}