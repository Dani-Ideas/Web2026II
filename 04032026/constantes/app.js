const estado = true;
//estado =false;//
if (estado){
    const estado =false;
    console.log(estado)// este tien un scope solo del if
}
console.log(estado)// este estado es el scopr gobal
//ejemplo de const mutable per no reasignable
const miArreglo=[];
miArreglo[0]=["Nuevo Elemeto"];
console.log(miArreglo);// aqui el console .log hace un recorrido automaticamente