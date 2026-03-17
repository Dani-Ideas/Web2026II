//funcion declarativas estan en cache
function aleatotio(min, max){
    return Math.floor(Math.random()*(max-min))+min;
}
console.log(aleatotio(5, 15));
//funciones expresadas no estan contempladas hasta que se usan
const miFuncion = function(min,max){
    return Math.floor(Math.random()*(max-min))+min;
}
console.log(aleatotio(50, 70));
