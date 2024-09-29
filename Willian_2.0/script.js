const pendulum = document.querySelector('.pendulum');
const spring = document.querySelector('.spring');
const calculateBtn = document.getElementById('calculateBtn');
let xtChart;
let angleChart;
let animacionActiva = false; // Controlar si la simulación está activa o no
let t = 0; // Tiempo inicial
const timeStep = 0.1; // Paso de tiempo
let updateCounter = 0; // Contador para controlar la frecuencia de actualización
// Parámetros del sistema
let g = 9.81; // Gravedad
let l = 1; // Longitud del péndulo
let k = 1; // Constante del resorte
let m = 1; // Masa del pendulo
let theta0 = 0; // Ángulo inicial del péndulo
let xo = 0; // Posición inicial del resorte con respecto al péndulo
let omega0 = 0; // Velocidad angular inicial del péndulo La velocidad inicial del resorte es omega0*L
let omega_combinada;
// Frecuencia angular combinada
calculateOmegaCombinada(); // Inicializar la frecuencia combinada
// Fase iniciales
let phi_resorte = phi_pendulo = 0;
// Amplitudes
let amplitude_pendulo = amplitude_resorte = 0;

// Cantidad máxima de puntos a mostrar en la gráfica
const maxDataPoints = 100;
function formatWithSign(phi) {
    return (phi >= 0 ? "+" : "") + phi.toFixed(3);
}
function animate() {
    if (!animacionActiva) return; // Detener si se ha pulsado "Parar Simulación"

    const time = Date.now() / 1000; // Tiempo en segundos

    // Fórmula del péndulo (acoplado con el resorte)
    let StringTheta = amplitude_pendulo.toFixed(3) + " * cos(" + omega_combinada.toFixed(3) + "* t " + formatWithSign(phi_pendulo) + ")";
    let StringX = amplitude_resorte.toFixed(3) + " * cos(" + omega_combinada.toFixed(3) + "* t " + formatWithSign(phi_resorte) + ")";

    // Fórmula del resorte (acoplado con el péndulo)

    // Actualizar la visualización de la fórmula en la sección 4
    const Contenido = document.getElementById("ContenidoFormula");
    Contenido.innerHTML = "Resorte: x(t) = " + StringX + "<br>" + "Péndulo: θ(t) = " + StringTheta;
    

    // Movimiento acoplado del péndulo: θ(t) = θ₀ * cos(ω * t + φ)
    let angle = amplitude_pendulo * Math.cos(omega_combinada * time + phi_pendulo);
    pendulum.style.transform = `rotate(${angle}rad)`; // Aplicar la rotación angular en radianes
    
    // Calcular el desplazamiento horizontal del péndulo en píxeles
    let pendulumX = 100 * Math.sin(angle); // Convertir el ángulo en movimiento horizontal
    
    // Ajustar la longitud del resorte proporcionalmente al movimiento del péndulo
    let springLength = 150 - pendulumX; // Ajustar la longitud del resorte según la posición del péndulo
    spring.style.width = `${Math.max(50, springLength)}px`; // Evitar que el resorte se comprima demasiado


    // Actualizar gráficas en tiempo real cada 10 cuadros (ajustable)
    if (updateCounter % 10 === 0) { // Solo actualizamos la gráfica cada 10 cuadros
        actualizarGraficas();
    }

    updateCounter++; // Incrementar el contador de cuadros

    requestAnimationFrame(animate); // Continuar la animación
}

function actualizarFormulas() {
    let StringTheta = amplitude_pendulo.toFixed(3) + " * cos(" + omega_combinada.toFixed(3) + " * t " + formatWithSign(phi_pendulo) + ")";
    let StringX = amplitude_resorte.toFixed(3) + " * cos(" + omega_combinada.toFixed(3) + " * t " + formatWithSign(phi_resorte) + ")";
    
    // Actualizar la visualización de la fórmula en la sección 4
    const Contenido = document.getElementById("ContenidoFormula");
    Contenido.innerHTML = "Resorte: x(t) = " + StringX + "<br>" + "Péndulo: θ(t) = " + StringTheta;
}

// Función para actualizar las gráficas en tiempo real
function actualizarGraficas() {
    let x = amplitude_resorte * Math.cos(omega_combinada * t + phi_resorte);
    let theta = amplitude_pendulo * Math.cos(omega_combinada * t + phi_pendulo);

    // Añadir nuevos valores a las gráficas
    xtChart.data.labels.push(t.toFixed(1));
    xtChart.data.datasets[0].data.push(x);
    angleChart.data.labels.push(t.toFixed(1));
    angleChart.data.datasets[0].data.push(theta);

    // Mantener un rango en el eje X (últimos 100 puntos), pero permitir que los nuevos se muestren
    if (xtChart.data.labels.length > maxDataPoints) {
        xtChart.data.labels = xtChart.data.labels.slice(-maxDataPoints);
        xtChart.data.datasets[0].data = xtChart.data.datasets[0].data.slice(-maxDataPoints);
    }

    if (angleChart.data.labels.length > maxDataPoints) {
        angleChart.data.labels = angleChart.data.labels.slice(-maxDataPoints);
        angleChart.data.datasets[0].data = angleChart.data.datasets[0].data.slice(-maxDataPoints);
    }

    // Actualizar las gráficas
    xtChart.update(); // Actualizar la gráfica de desplazamiento
    angleChart.update(); // Actualizar la gráfica de ángulo

    t += timeStep; // Incrementar el tiempo
}

// Función para destruir las gráficas si ya existen
function destruirGraficas() {
    if (xtChart) {
        xtChart.destroy(); // Destruir la gráfica xtChart
    }
    if (angleChart) {
        angleChart.destroy(); // Destruir la gráfica angleChart
    }
}

// Generar las gráficas nuevamente
function generarGraficas() {
    // Inicializar la gráfica de Desplazamiento (x) vs Tiempo (t)
    const ctxXt = document.getElementById('xtChart').getContext('2d');
    xtChart = new Chart(ctxXt, {
        type: 'line',
        data: {
            labels: [], // Inicialmente vacío
            datasets: [{
                label: 'Desplazamiento (x) vs Tiempo (t)',
                data: [],
                borderColor: 'blue',
                borderWidth: 2,
                fill: false
            }]
        },
        options: {
            responsive: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Tiempo (t) en segundos'
                    }
                },
                y: {
                    min: -amplitude_resorte,
                    max: amplitude_resorte, // Mantener el rango del eje Y fijo
                    title: {
                        display: true,
                        text: 'Desplazamiento (x) m'
                    }
                }
            }
        }
    });

    // Inicializar la gráfica de Ángulo (θ) vs Tiempo (t)
    const ctxAngle = document.getElementById('angleChart').getContext('2d');
    angleChart = new Chart(ctxAngle, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Ángulo (θ) vs Tiempo (t)',
                data: [],
                borderColor: 'red',
                borderWidth: 2,
                fill: false
            }]
        },
        options: {
            responsive: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Tiempo (t) en segundos'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Ángulo (θ) en radianes'
                    }
                }
            }
        }
    });

    // Comenzar la actualización en tiempo real
    requestAnimationFrame(animate);
}

// Función para calcular la frecuencia angular combinada del sistema acoplado
function calculateOmegaCombinada() {
    let omega_resorte = Math.sqrt(k / m); // Frecuencia angular del resorte
    let omega_pendulo = Math.sqrt(g / l); // Frecuencia angular del péndulo
    omega_combinada = Math.sqrt(omega_resorte ** 2 + omega_pendulo ** 2); // Frecuencia angular combinada
}

function calculatePhi() {

    // Calcular la fase inicial del péndulo
    if (omega0 === 0) {
        console.log("1P");
        // Si la velocidad angular inicial es 0, la fase inicial es 0
        phi_pendulo = 0;
    } else if (theta0 === 0) {//entonces phi es pi/2 (+) o 3*pi/2(-) direccion velocidad angular
        console.log("2P");
        // Manejo para evitar división por cero si theta0 * omega_combinada es 0
        if(omega0>0){
            phi_resorte =phi_pendulo = Math.PI/2;
        }else{
            phi_resorte =phi_pendulo =3*Math.PI/2;
        }
    } else {
        console.log("3P");
        let auxPhi_pendulo =Math.atan(omega0 / (-theta0 * omega_combinada));
        phi_pendulo=auxPhi_pendulo;
    }
}

function calculateAmplitudeResorte() {
    if(theta0==0){
        console.log("ar");
        amplitude_resorte = omega0/omega_combinada;
    }else{
        console.log("a2r");
        amplitude_resorte = xo / Math.cos(phi_resorte); 
    }
}

function calculateAmplitudePendulo() {
    if(theta0==0){
        console.log("bp");
        amplitude_pendulo = omega0/omega_combinada;
    }else{
        console.log("b2p");
        amplitude_pendulo = theta0 / Math.cos(phi_pendulo);
    }
    // Verificar si la amplitud supera los 15 grados (0.2618 radianes)
}

calculateBtn.addEventListener('click', () => {
    // Capturar valores de los inputs
    l = parseFloat(document.getElementById('longitudPendulo').value);
    m = parseFloat(document.getElementById('masaPendulo').value);
    k = parseFloat(document.getElementById('constanteElastica').value);
    theta0 = parseFloat(document.getElementById('anguloInicial').value);
    omega0 = parseFloat(document.getElementById('velocidadInicialPendulo').value);
    xo = l*theta0; // Calcular la posición inicial del resorte acoplada al ángulo del péndulo

    calculatePhi(); // Calcular ambas fases
    calculateAmplitudeResorte(); // Calcular la amplitud del resorte
    calculateAmplitudePendulo(); // Calcular la amplitud del péndulo
    // Recalcular las frecuencias angulares con los nuevos valores
    calculateOmegaCombinada();
    // Verificar el ángulo máximo permitido
    if (amplitude_pendulo > 0.2618) {
        alert("La amplitud exceder los 15 grados.");
        destruirGraficas();
        return; // Detener la ejecución si el ángulo es demasiado grande
    }
    if (animacionActiva) {
        animacionActiva = false; // Pausar la animación
        calculateBtn.innerText = 'Generar Simulación'; // Cambiar el texto del botón
        calculateBtn.style.backgroundColor = ''; // Restaurar color original
    } else {
        // Reiniciar valores
        t = 0; // Reiniciar el tiempo
        updateCounter = 0;
        
        // Destruir las gráficas anteriores y reiniciarlas
        destruirGraficas();
        generarGraficas();

        animacionActiva = true; // Iniciar la animación
        calculateBtn.innerText = 'Detener Simulación'; // Cambiar el texto del botón
        calculateBtn.style.backgroundColor = 'red'; // Cambiar el color del botón
    }
    actualizarFormulas();
    console.log("p",amplitude_pendulo, "r",amplitude_resorte)
});