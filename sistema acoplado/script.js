const lienzo = document.getElementById("lienzo");
const ctx = lienzo.getContext("2d");
const btnIniciar = document.getElementById("calculateBtn");
const botonAlternarSolucion = document.getElementById("botonAlternarSolucion");

const inputAngulo = document.getElementById("imputAnguloA");
const valorAngulo = document.getElementById("anguloA-value");
const inputAngulo2 = document.getElementById("imputAnguloB");
const valorAngulo2 = document.getElementById("anguloB-value");
const inputLongitud = document.getElementById("imputLongitudPendulo");
const valorLongitud = document.getElementById("longitudPendulo-value");
const inputAlturaResorte = document.getElementById("inputAlturaResorte");
const valorAlturaResorte = document.getElementById("alturaResorte-value");
const inputK1 = document.getElementById("imputConstanteElastica1");
const valorK1 = document.getElementById("constanteElastica1-value");
const inputK2 = document.getElementById("imputConstanteElastica2");
const valorK2 = document.getElementById("constanteElastica2-value");
const inputM1 = document.getElementById("imputMasaPendulo1");
const valorM1 = document.getElementById("masaPendulo1-value");
const inputM2 = document.getElementById("imputMasaPendulo2");
const valorM2 = document.getElementById("masaPendulo2-value");
// Graficas
const canvasGraficaAngulo = document.getElementById("graficaAnguloTiempo");
const ctxGraficaAngulo = canvasGraficaAngulo.getContext("2d");
let estadoGrafico = 0;//variable para saber en que grafica esta

// Constantes pendulo
const g = 9.81; // Aceleración debido a la gravedad
let masa1 = 1;
let masa2 = 1;
const pivotX = lienzo.width / 2; // Posición horizontal del pivote del péndulo
const pivotY = 100; // Posición vertical del pivote del péndulo
let positionChart;

let longitudBarra = 200; // Longitud de la barra del péndulo (dibujo)
let alturaResorte = 1;
let N1 = 0;
let N2 = 0;
let graficandoEstacionaria = false;
let distanciaPivote;
//MAS
let amplitud;
let animacionActiva = false;
let L = 2;
let h;
let K1=1;
let K2=1;
let w1;
let w2;
let A1;
let A2;
let B1;
let B2;
let k1; //relacion amplitud pendulo 1
let k2; //relacion amplitud pendulo 2
let solucionGeneralActiva = true;
// Calculo de la posicion del nuevo pivote (eje de rotacion ingresado).
inputAngulo.oninput = function () {
    valorAngulo.textContent = inputAngulo.value;
    N1 = inputAngulo.value;
    dibujarPendulo(N1, N2, longitudBarra, alturaResorte, masa1, masa2);
};
inputAngulo2.oninput = function () {
    valorAngulo2.textContent = inputAngulo2.value;
    N2 = inputAngulo2.value;
    dibujarPendulo(N1, N2, longitudBarra, alturaResorte, masa1, masa2);
};
inputLongitud.oninput = function () {
    valorLongitud.textContent = inputLongitud.value;
    longitudBarra = inputLongitud.value * 100;//para dibujar (no se si para calculos, mejor usar L)
    L = inputLongitud.value;
    let auxH = (L * inputAlturaResorte.value);
    valorAlturaResorte.textContent = parseInt((100 * inputAlturaResorte.value)) + "% = " + auxH.toFixed(2) + "m";
    dibujarPendulo(N1, N2, longitudBarra, alturaResorte, masa1, masa2);
};
inputAlturaResorte.oninput = function () {
    alturaResorte = inputAlturaResorte.value;
    let auxH = (L * inputAlturaResorte.value);
    valorAlturaResorte.textContent = parseInt((100 * inputAlturaResorte.value)) + "% = " + auxH.toFixed(2) + "m";
    dibujarPendulo(N1, N2, longitudBarra, alturaResorte, masa1, masa2);
};
inputK1.oninput = function () {
    valorK1.textContent = inputK1.value;
    K1 = inputK1.value;
    dibujarPendulo(N1, N2, longitudBarra, alturaResorte, masa1, masa2);
};
inputK2.oninput = function () {
    valorK2.textContent = inputK2.value;
    K2 = inputK2.value;
    dibujarPendulo(N1, N2, longitudBarra, alturaResorte, masa1, masa2);
};
inputM1.oninput = function () {
    valorM1.textContent = inputM1.value;
    masa1 = parseFloat(inputM1.value);
    dibujarPendulo(N1, N2, longitudBarra, alturaResorte, masa1, masa2);
};
inputM2.oninput = function () {
    valorM2.textContent = inputM2.value;
    masa2 = parseFloat(inputM2.value);
    dibujarPendulo(N1, N2, longitudBarra, alturaResorte, masa1, masa2);
};




// Boton iniciar simulacion
btnIniciar.addEventListener("click", function () {
    if (animacionActiva) {
        animacionActiva = false;
        btnIniciar.textContent = "Generar Simulación";
        actualizarPendulo();
    } else {
        if (N1 !=0 || N2!=0 ) {
            calcularVariables();
            graficarAnguloTiempo();
            animacionActiva = true;
            btnIniciar.textContent = "Detener Simulación";
            tiempoInicial = Date.now();
            actualizarPendulo();
        }
    }
});

//---------------------------- ECUACIONES Y CALCULOS -----------------------
function calcularWsub1() {
    let a = (2 * g) / L + K2 / masa2 + ((K1 * h * h) / (masa1 * L * L)) + (K2 / masa1);
    let b = ((g*g)/(L*L)) + ((K2*g)/(masa2*L)) + ((K1*h*h*g)/(masa1*L*L*L)) + ((K1*h*h*K2)/(masa1*L*L*masa2)) + ((g*K2)/(L*masa1));
    b = 4 * b;
    w1 = a+Math.sqrt(a*a - b);
    w1 = w1 / 2;//        w1^2
    console.log(
        "a= " + a +
        " b= "+b
    );
}

function calcularWsub2() {
    let a = (2 * g) / L + K2 / masa2 + ((K1 * h * h) / (masa1 * L * L)) + (K2 / masa1);
    let b = ((g * g) / (L * L)) + ((K2 * g) / (masa2 * L)) + ((K1 * h * h * g) / (masa1 * L * L * L)) + ((K1 * h * h * K2) / (masa1 * L * L * masa2)) + ((g * K2) / (L * masa1));
    b = 4 * b;
    w2 = a - Math.sqrt(a * a - b);
    w2 = w2 / 2;//        w2^2
}

function calcularAmplitudA1() {
    A1 = (k1*N1 - k1*k2*N2)/(k1-k2) ;
}
function calcularAmplitudB1() {
    B1 = (N1 - k2*N2) / (k1 - k2);
}
function calcularAmplitudA2() {
    A2 = (k1*k2*N2 - k2*N1) / (k1 - k2);
}
function calcularAmplitudB2() {
    B2 = (k1*N2 - N1) / (k1 - k2);
}
function calcularh() {
    h = L * inputAlturaResorte.value;
}
function calcularRelacionAmplitudes() {
    k1 = K2 / (K2 + ((K1 * h * h) / (L * L)) + ((g * masa1) / (L)) - (masa1 * w1));
    k2 = K2 / (K2 + ((K1 * h * h) / (L * L)) + ((g * masa1) / (L)) - (masa1 * w2));
    console.log(
        "L=" + L +
        " h=" + h +
        " m1=" + masa1 +
        " m2=" + masa2 +
        " K1=" + K1 +
        " K2=" + K2 +
        " g=" + g +
        " N1=" + N1 +
        " N2=" + N2 +
        " w1=" + w1 +
        " w2=" + w2 +
        " k1=" + k1 +
        " k2=" + k2 
    );
}
// Calculo del angulo en t = 0 (θ(0))
function calcularVariables() {
    pivoteCalcular();
    calcularh();
    calcularWsub1();
    calcularWsub2();
    calcularRelacionAmplitudes();
    calcularAmplitudA1();
    calcularAmplitudA2();
    calcularAmplitudB1();
    calcularAmplitudB2();
}

function ecuacionMovimientoPendulo1(segundos) {
    let ecuacion = A1 * Math.cos(Math.sqrt(w1) * segundos) + A2 * Math.cos(Math.sqrt(w2) * segundos);
    return ecuacion;
}

function ecuacionMovimientoPendulo2(segundos) {
    let ecuacion = B1 * Math.cos(Math.sqrt(w1) * segundos) - B2 * Math.cos(Math.sqrt(w2) * segundos);
    return ecuacion;
}
//---------------------------- DIBUJAR -----------------------
function pivoteCalcular() {
    distanciaPivote = 0.1 * (longitudBarra);
    distanciaPivote = parseFloat(distanciaPivote);
}
// Función para limpiar el lienzo en cada cuadro de animación
function limpiarLienzo() {
    ctx.clearRect(0, 0, lienzo.width, lienzo.height);
}

// Funciónes para dibujar resortes y pendulos en el lienzo
function dibujarResortePared(angulo, longitudBarra, h) {
    const extremoIX = pivotX + longitudBarra * Math.sin(angulo);
    const extremoIY = pivotY + longitudBarra * Math.cos(angulo);
    let x =
        0;
    let y = pivotY + ((longitudBarra+distanciaPivote)/2)*alturaResorte;

    let w = pivotX - 90 + (inputAlturaResorte.value) * (longitudBarra / 2) * Math.sin(angulo);

    let resorte = new Image();
    resorte.src = "resorteImg.png";
    ctx.drawImage(resorte, x, y - 24, w - x, 58);
}
function dibujarBarra(angulo, longitudBarra, masa) {
    const extremoX = pivotX + longitudBarra * Math.sin(angulo);
    const extremoY = pivotY + longitudBarra * Math.cos(angulo);

    // Dibujar la barra
    ctx.lineWidth = 8;
    ctx.strokeStyle = "#212321";

    ctx.beginPath();
    ctx.moveTo(
        pivotX - 90,
        pivotY
    );

    ctx.lineTo(
        extremoX - (longitudBarra / 2 - distanciaPivote) * Math.sin(angulo) - 90,
        extremoY - (longitudBarra / 2 - distanciaPivote) * Math.cos(angulo)
    );
    ctx.stroke();

    ctx.fillStyle = "0B0B0B";
    ctx.beginPath();
    ctx.arc(extremoX - (longitudBarra / 2 - distanciaPivote) * Math.sin(angulo) - 90, extremoY - (longitudBarra / 2 - distanciaPivote) * Math.cos(angulo), 20+masa, 0, 2 * Math.PI);// el 20 es el radio de la esfera
    ctx.fill();
}

function dibujarResorte(anguloI, anguloD, longitudBarra) {
    const extremoIX = pivotX + longitudBarra * Math.sin(anguloI);
    const extremoIY = pivotY + longitudBarra * Math.cos(anguloI);
    let x =
        extremoIX - (longitudBarra / 2 - distanciaPivote) * Math.sin(anguloI) - 90;
    let y = extremoIY - (longitudBarra / 2 - distanciaPivote) * Math.cos(anguloI);

    const extremoDX = pivotX + longitudBarra * Math.sin(anguloD);
    const extremoDY = pivotY + longitudBarra * Math.cos(anguloD);

    let w = extremoDX - (longitudBarra / 2 - distanciaPivote) * Math.sin(anguloD) + 90;

    let resorte = new Image();
    resorte.src = "resorteImg.png";
    ctx.drawImage(resorte, x, y - 24, w - x, 58);
}

function dibujarBarra2(angulo, longitudBarra, masa) {
    const extremoX = pivotX + longitudBarra * Math.sin(angulo);
    const extremoY = pivotY + longitudBarra * Math.cos(angulo);

    // Dibujar la barra
    ctx.lineWidth = 8;
    ctx.strokeStyle = "#212321";

    ctx.beginPath();
    ctx.moveTo(
        pivotX + 90,
        pivotY
    );

    ctx.lineTo(
        extremoX - (longitudBarra / 2 - distanciaPivote) * Math.sin(angulo) + 90,
        extremoY - (longitudBarra / 2 - distanciaPivote) * Math.cos(angulo)
    );
    ctx.stroke();

    ctx.fillStyle = "0B0B0B";
    ctx.beginPath();
    ctx.arc(extremoX - (longitudBarra / 2 - distanciaPivote) * Math.sin(angulo) + 90, extremoY - (longitudBarra / 2 - distanciaPivote) * Math.cos(angulo), 20+masa, 0, 2 * Math.PI);
    ctx.fill();
}

// Función para dibujar el péndulo en cada cuadro de animación
function dibujarPendulo(angulo, angulo2, longitudBarra, alturaResorte, masa1, masa2) {
    calcularVariables();
    limpiarLienzo();
    dibujarResortePared(angulo, longitudBarra, alturaResorte);
    dibujarBarra(angulo, longitudBarra, masa1);
    dibujarResorte(angulo, angulo2, longitudBarra);
    dibujarBarra2(angulo2, longitudBarra, masa2);
}

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!   IMPRIME ECUACIONES   !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
function actualizarPendulo() {
    if (animacionActiva) {
        // Obtener el tiempo actual
        const tiempoActual = Date.now();

        // Actualización del ángulo basado en el tiempo
        const segundos = (tiempoActual - tiempoInicial) / 1000; // Convertir milisegundos a segundos
        let angulo = ecuacionMovimientoPendulo1(segundos);
        let angulo2 = ecuacionMovimientoPendulo2(segundos);
        dibujarPendulo(angulo, angulo2, longitudBarra, alturaResorte, masa1, masa2);

        const segundosImprimir = "t";
        let frecuencia1 = Math.sqrt(w1);
        let frecuencia2 = Math.sqrt(w2);
        // Calcular el valor de la ecuación
        let ecuacionHTML;
        ecuacionHTML = `${A1.toFixed(3)}cos(${frecuencia1.toFixed(3)}*${segundosImprimir}) + ${A2.toFixed(3)}cos(${frecuencia2.toFixed(3) }*${segundosImprimir})`;

        let ecuacionMovimiento2;
        ecuacionMovimiento2 = `${B1.toFixed(3)}cos(${frecuencia1.toFixed(3)}*${segundosImprimir}) + ${B2.toFixed(3)}cos(${frecuencia2.toFixed(3)}*${segundosImprimir})`;

        // Actualizar el contenido del div con el resultado de la ecuación
        const ecuacionMov = document.getElementById("ecuacionMovimiento");
        ecuacionMov.textContent ="A = "+`${ecuacionHTML}`;
        const ecuacionMov2 = document.getElementById("ecuacionMovimiento2");
        ecuacionMov2.textContent = "B = " +`${ecuacionMovimiento2}`;
        requestAnimationFrame(actualizarPendulo); // Solicitar el siguiente cuadro de animación
    }
}
// ----------------------------- GRAFICAR ----------------------------------------

botonAlternarSolucion.addEventListener("click", alternarGrafico);
function alternarGrafico() {
    switch (estadoGrafico) {
        case 0:
            graficarSolucionGeneral();//angulo pendulo A y pendulo B vz tiempo
            estadoGrafico = 1;
            break;
        case 1:
            graficarSolucionBarra1();//angulo pendulo A vz tiempo
            estadoGrafico = 2;
            break;
        case 2:
            graficarSolucionBarra2();//angulo pendulo B vz tiempo
            estadoGrafico = 3;
            break;
        case 3:
            graficarVelocidadBarra1();//velocidad pendulo A vz tiempo
            estadoGrafico = 4;
            break;
        case 4:
            graficarVelocidadBarra2();//velocidad pendulo B vz tiempo
            estadoGrafico = 0;
            break;
        default:
            break;
    }
}
function graficarVelocidadBarra1(){
    if (positionChart) {
        positionChart.destroy();
    }

    const labels = [];
    const dataPendulo1 = [];

    for (let t = 0; t <= 15; t += 0.1) {
        labels.push(t.toFixed(1));


        const pendulo1 = 0;//ECUACION DE VELOCIDAD
        dataPendulo1.push(pendulo1);
    }

    positionChart = new Chart(ctxGraficaAngulo, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Velocidad Péndulo A",
                    data: dataPendulo1,
                    borderColor: "rgba(0, 100, 100, 1)",
                    backgroundColor: "rgba(0, 100, 100, 0.2)",
                    borderWidth: 1,
                },
            ],
        },
        options: {
            aspectRatio: 1,
            maintainAspectRatio: true,
            responsive: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Tiempo (s)",
                    },
                },
                y: {
                    title: {
                        display: true,
                        text: "Velocidad Péndulo A (rad/s)",
                    },
                },
            },
        },
    });
}
function graficarVelocidadBarra2() {
    if (positionChart) {
        positionChart.destroy();
    }

    const labels = [];
    const dataPendulo1 = [];

    for (let t = 0; t <= 15; t += 0.1) {
        labels.push(t.toFixed(1));


        const pendulo1 = 0;//ECUACION DE VELOCIDAD
        dataPendulo1.push(pendulo1);
    }

    positionChart = new Chart(ctxGraficaAngulo, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Velocidad Péndulo B",
                    data: dataPendulo1,
                    borderColor: "rgba(100, 99, 132, 1)", // Color rojo para el péndulo 2
                    backgroundColor: "rgba(100, 99, 132, 0.2)",
                    borderWidth: 1,
                },
            ],
        },
        options: {
            aspectRatio: 1,
            maintainAspectRatio: true,
            responsive: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Tiempo (s)",
                    },
                },
                y: {
                    title: {
                        display: true,
                        text: "Velocidad Péndulo B (rad/s)",
                    },
                },
            },
        },
    });
}
function graficarSolucionBarra1() {
    if (positionChart) {
        positionChart.destroy();
    }

    const labels = [];
    const dataPendulo1 = [];

    for (let t = 0; t <= 15; t += 0.1) {
        labels.push(t.toFixed(1));

        // Ecuación para pendulo1 usando la fórmula dada
        const pendulo1 = A1 * Math.cos(Math.sqrt(w1) * t) + A2 * Math.cos(Math.sqrt(w2) * t);
        dataPendulo1.push(pendulo1);
    }

    positionChart = new Chart(ctxGraficaAngulo, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Angulo Péndulo A",
                    data: dataPendulo1,
                    borderColor: "rgba(75, 192, 192, 1)",
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    borderWidth: 1,
                },
            ],
        },
        options: {
            aspectRatio: 1,
            maintainAspectRatio: true,
            responsive: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Tiempo (s)",
                    },
                },
                y: {
                    title: {
                        display: true,
                        text: "Angulo Péndulo A (rad)",
                    },
                },
            },
        },
    });
}
function graficarSolucionBarra2() {
    if (positionChart) {
        positionChart.destroy();
    }

    const labels = [];
    const dataPendulo2 = [];

    for (let t = 0; t <= 15; t += 0.1) {
        labels.push(t.toFixed(1));

        // Ecuación para pendulo2 usando la fórmula dada
        const pendulo2 = B1 * Math.cos(Math.sqrt(w1) * t) + B2 * Math.cos(Math.sqrt(w2) * t);
        dataPendulo2.push(pendulo2);
    }

    positionChart = new Chart(ctxGraficaAngulo, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Angulo Péndulo B",
                    data: dataPendulo2,
                    borderColor: "rgba(255, 99, 132, 1)", // Color rojo para el péndulo 2
                    backgroundColor: "rgba(255, 99, 132, 0.2)",
                    borderWidth: 1,
                },
            ],
        },
        options: {
            aspectRatio: 1,
            maintainAspectRatio: true,
            responsive: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Tiempo (s)",
                    },
                },
                y: {
                    title: {
                        display: true,
                        text: "Angulo Péndulo B (rad)",
                    },
                },
            },
        },
    });
}
function graficarSolucionGeneral() {
    if (positionChart) {
        positionChart.destroy();
    }

    const labels = [];
    const dataPendulo1 = [];
    const dataPendulo2 = [];

    for (let t = 0; t <= 15; t += 0.1) {
        labels.push(t.toFixed(1));
        
        // Ecuaciones para pendulo1 y pendulo2 usando las fórmulas dadas
        const pendulo1 = A1 * Math.cos(Math.sqrt(w1) * t) + A2 * Math.cos(Math.sqrt(w2) * t);
        dataPendulo1.push(pendulo1);

        const pendulo2 = B1 * Math.cos(Math.sqrt(w1) * t) + B2 * Math.cos(Math.sqrt(w2)*t);
        dataPendulo2.push(pendulo2);
    }

    positionChart = new Chart(ctxGraficaAngulo, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Angulo Péndulo A",
                    data: dataPendulo1,
                    borderColor: "rgba(75, 192, 192, 1)",
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    borderWidth: 1,
                },
                {
                    label: "Angulo Péndulo B",
                    data: dataPendulo2,
                    borderColor: "rgba(255, 99, 132, 1)", // Color rojo para el péndulo 2
                    backgroundColor: "rgba(255, 99, 132, 0.2)",
                    borderWidth: 1,
                },
            ],
        },
        options: {
            aspectRatio: 1,
            maintainAspectRatio: true,
            responsive: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Tiempo (s)",
                    },
                },
                y: {
                    title: {
                        display: true,
                        text: "Angulo Péndulo 1 (rad) / Angulo Péndulo 2 (rad)",
                    },
                },
            },
        },
    });

}
function graficarAnguloTiempo() {
    graficarSolucionGeneral();
}

// Llamar a la función para graficar el ángulo en el tiempo
// Iniciar la animación
// let tiempoInicial = Date.now(); // Registro del tiempo inicial
// actualizarPendulo(); // Comenzar la animación
