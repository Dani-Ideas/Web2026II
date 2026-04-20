const pantalla = document.getElementById("pantalla");
const teclado = document.getElementById("teclado");

// Layout QWERTY LATAM simplificado
const layout = [
    ["1","2","3","4","5","6","7","8","9","0","-","=","Backspace"],
    ["Tab","q","w","e","r","t","y","u","i","o","p","´","+"],
    ["Caps","a","s","d","f","g","h","j","k","l","ñ","{","Enter"],
    ["Shift","z","x","c","v","b","n","m",",",".","-","Shift"],
    ["Space"],

    // Navegación
    ["Insert","Delete","Home","End","PgUp","PgDn"],

    // Numpad
    ["7","8","9"],
    ["4","5","6"],
    ["1","2","3"],
    ["0"]
];

function crearTeclado() {
    layout.forEach(fila => {
        const divFila = document.createElement("div");
        divFila.classList.add("fila");

        fila.forEach(tecla => {
            const btn = document.createElement("button");
            btn.textContent = tecla;
            btn.classList.add("tecla");

            if (["Space","Enter","Shift","Backspace"].includes(tecla)) {
                btn.classList.add("grande");
            }

            btn.addEventListener("click", () => manejarTecla(tecla));

            divFila.appendChild(btn);
        });

        teclado.appendChild(divFila);
    });
}

function manejarTecla(tecla) {
    switch (tecla) {
        case "Backspace":
            pantalla.value = pantalla.value.slice(0, -1);
            break;

        case "Space":
            pantalla.value += " ";
            break;

        case "Enter":
            pantalla.value += "\n";
            break;

        case "Tab":
            pantalla.value += "\t";
            break;

        case "Delete":
            pantalla.value = "";
            break;

        case "Home":
            pantalla.value = "Inicio-> " + pantalla.value;
            break;

        case "End":
            pantalla.value += " <-Fin";
            break;

        case "PgUp":
            pantalla.value += "[PgUp]";
            break;

        case "PgDn":
            pantalla.value += "[PgDn]";
            break;

        case "Insert":
            pantalla.value += "[INS]";
            break;

        default:
            pantalla.value += tecla;
    }
}

crearTeclado();