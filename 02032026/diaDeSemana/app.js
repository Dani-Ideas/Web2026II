function mostrarDia(){

    let numero = parseInt(document.getElementById("numero").value);
    let dia;

    switch(numero){
        case 1:
            dia = "Lunes";
            break;

        case 2:
            dia = "Martes";
            break;

        case 3:
            dia = "Miércoles";
            break;

        case 4:
            dia = "Jueves";
            break;

        case 5:
            dia = "Viernes";
            break;

        case 6:
            dia = "Sábado";
            break;

        case 7:
            dia = "Domingo";
            break;

        default:
            dia = "Número inválido. Ingresa un número del 1 al 7.";
    }

    document.getElementById("resultado").textContent = dia;
}