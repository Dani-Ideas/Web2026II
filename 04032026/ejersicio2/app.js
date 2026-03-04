// lineas literales
let nombre ="Aaron";
function saludar(nombre){
    console.log(
        `hola 
        como 
        estas 
        ${nombre}`);
}
console.log(`Tu nombre es ${nombre.toUpperCase}`);

//operador ternario
let  nombreUser= "Aaron";
let estado =false;
// es equivalente a un if else
console.log(`${estado ? `Ganaste: `: `Perdiste: `}${nombreUser}`);
// uno de los mayores probelmas con var se puede sobre escribir que siente un scoper mayor
// lety es equivalente a var per su scope es menor por ende menor a una sobre escritura menor y menores errores
var estadoVar =true;
if (estado){
    var estadoVar = false;
}
console.log(estadoVar);
let estadoLet= true;
if (estadoLet){
    let estadoLet=false;
}
console.log(estadoLet)
for (let i=0; i<10;i++){
    console.log(i);
}
console.log(i);//aqui para el interprete por que i no es declarado ya que solo vive en for