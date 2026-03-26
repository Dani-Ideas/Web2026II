const frutas = ['Mazana','pera','platano','jicama'];
/**
 * for (const fruta of frutas) {
    console.log(fruta);
}

*/
frutas.forEach(fruta => {
    console.log('la fruta es '+fruta);
});
frutas.forEach((fruta,index, array) => {
    console.log('la fruta es >'+fruta);
    console.log('El indice es >'+index);
    console.log('El indice es >'+array);
});
// ejemplo de objetos
 var carro = new Object();
 carro.marca= 'Ford';
 carro.modelo= 'Fiesta';
 carro.anio= 2003;
 console.log(carro);

 var miCarro = {
    marca: 'Ford',
    modelo: 'Fiesta',
    anio: 2003,
    multa: true,
    VideoColorSpace: 'RGB',
    fechaMultas: ['2024-05-10', '2025-01-15']
  };
  
  console.log(miCarro);
  // aqui hizo un ejemplo de como se puede agregar despues de vrado el objeto y empezo a habalar de JSON
  