function ejecutarOperaciones(){

    let A = true;
    let B = false;

    let resultado = "";

    // AND
    resultado += "AND (A && B): " + (A && B) + "\n";

    // OR
    resultado += "OR (A || B): " + (A || B) + "\n";

    // NOT
    resultado += "NOT (!A): " + (!A) + "\n";

    // XOR (A diferente de B)
    let xor = (A && !B) || (!A && B);
    resultado += "XOR: " + xor + "\n";

    // NAND (negación del AND)
    let nand = !(A && B);
    resultado += "NAND: " + nand + "\n";

    // NOR (negación del OR)
    let nor = !(A || B);
    resultado += "NOR: " + nor + "\n";

    // XNOR (negación del XOR)
    let xnor = !xor;
    resultado += "XNOR: " + xnor + "\n";

    document.getElementById("resultado").textContent = 
        "Valores usados:\nA = " + A + "\nB = " + B + "\n\nResultados:\n" + resultado;

    console.log(resultado);
}