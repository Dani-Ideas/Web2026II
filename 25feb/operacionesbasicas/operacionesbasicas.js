function obtenerNumeros(){
    let n1 = parseFloat(document.getElementById("num1").value);
    let n2 = parseFloat(document.getElementById("num2").value);
    return { n1, n2 };
}

function sumar(){
    let { n1, n2 } = obtenerNumeros();
    document.getElementById("resultado").textContent = "Resultado: " + (n1 + n2);
}

function restar(){
    let { n1, n2 } = obtenerNumeros();
    document.getElementById("resultado").textContent = "Resultado: " + (n1 - n2);
}

function multiplicar(){
    let { n1, n2 } = obtenerNumeros();
    document.getElementById("resultado").textContent = "Resultado: " + (n1 * n2);
}

function dividir(){
    let { n1, n2 } = obtenerNumeros();
    
    if(n2 === 0){
        document.getElementById("resultado").textContent = "No se puede dividir entre 0";
    } else {
        document.getElementById("resultado").textContent = "Resultado: " + (n1 / n2);
    }
}