/**
 * app que lista tareas, agregar , estados, marcar tarea como attendido, si el camnbio de estado a tarea
 * if sintactico en linea
 */
let tareas =[];
function showMenu(){
    return parseInt(prompt(
        `Opciones disponibles
        1 - Agregar una tarea
        2 - Ver todas la stareas
        3 - Marcar tarea como completada
        4 - salir
        "Elige una opcion"
        `)
    );//temstring
}
function agregarTarea(){
    //funcion para agregag nuevas tareas
    let condition= true
    do {
        let mensaje = prompt(
            `Introduce el nombre de la tarea: \n`);
            if(mensaje){
                let tarea = {
                    nombre: mensaje,
                    estado: false
                  };
                  condition = false;
                  tareas.push(tarea);    
            }else{
                alert("El nombre de la tarea no puede estar vacio")
            }
    } while (condition);
}
function showTareas(){
    if(tareas.length===0){
        alert("La lista de tareas esta vacia");
    }else{
        let mensajeBase= "La lista de tareas es: \n";
        tareas.forEach((tarea,index) => {
            mensajeBase+=`${(index+1)}- ${tarea.nombre} , [${tarea.estado ? "Complreatada": "Pendiente"}]\n`;        
        });
        alert(mensajeBase);
    }
    
}
function marcarTareaCompletada(){
    let numero =parseInt(prompt("ingresa el numero de la tarea que quieres completar"))
    if (numero>0&&numero<=tareas.length){
        tareas[numero-1].estado=true;
        alert(
            `La Tarea : ${tareas[numero-1].nombre} a sido maracado como completada`
        )
    }else{
        alert("numero de tarea invalido");
    }
}
function inicioFlow(){
    let flag = true;
    while(flag){
        let option= showMenu();
        switch (option) {
            case 1:
                agregarTarea();
                break;
            case 2:
                showTareas();
                break;
            case 3:
                marcarTareaCompletada();
                break;
            case 4:
                flag= false
                break;
            default:
                alert("Elije una respuesta valida o te enviare a Duo para que se encage de ti\n 🦉");
                break;
        }
    }
}
inicioFlow();
// poner un contador a cada objeto de ropa , y un numero limite de stock y una logica de un numero maximo de compra de articulos, no se puede compar mas camisas de las que hay en la tienda
