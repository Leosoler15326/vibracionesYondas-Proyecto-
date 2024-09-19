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
let g = 9.81;
let l = 1; // Longitud inicial del péndulo
let k = 3; // Constante del resorte
let m = 1; // Masa del péndulo
let amplitude_pendulo = 0.2; // Amplitud inicial angular del péndulo (en radianes)
let amplitude_resorte = 100; // Amplitud inicial del resorte en píxeles

// Limitar la amplitud angular del péndulo a un máximo de 0.2618 radianes (~15 grados)
const MAX_ANGLE = 0.2618;  // 15 grados en radianes

// Frecuencia angular combinada
let omega_combinada;
calculateOmegaCombinada(); // Inicializar la frecuencia combinada

// Fase inicial
let phi = 0;

// Cantidad máxima de puntos a mostrar en la gráfica
const maxDataPoints = 100;

function animate() {
    if (!animacionActiva) return; // Detener si se ha pulsado "Parar Simulación"

    const time = Date.now() / 1000; // Tiempo en segundos
    
    // Movimiento del péndulo: θ(t) = θ₀ * cos(ω * t + φ)
    let angle = amplitude_pendulo * Math.cos(omega_combinada * time + phi);
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

// Función para actualizar las gráficas en tiempo real
function actualizarGraficas() {
    let x = amplitude_resorte * Math.cos(omega_combinada * t + phi);
    let theta = amplitude_pendulo * Math.cos(omega_combinada * t + phi);

    // Añadir nuevos valores a las gráficas
    xtChart.data.labels.push(t.toFixed(1));
    xtChart.data.datasets[0].data.push(x);
    angleChart.data.labels.push(t.toFixed(1));
    angleChart.data.datasets[0].data.push(theta);

    // Mantener un rango en el eje X (últimos 100 puntos), pero permitir que los nuevos se muestren
    if (xtChart.data.labels.length > maxDataPoints) {
        // Solo eliminamos los puntos más antiguos
        xtChart.data.labels = xtChart.data.labels.slice(-maxDataPoints);
        xtChart.data.datasets[0].data = xtChart.data.datasets[0].data.slice(-maxDataPoints);
    }

    if (angleChart.data.labels.length > maxDataPoints) {
        // Solo eliminamos los puntos más antiguos
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
                        text: 'Desplazamiento (x) en píxeles'
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
                    min: -0.3,
                    max: 0.3, // Mantener el rango del eje Y fijo
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

// Función para recalcular la frecuencia angular combinada
function calculateOmegaCombinada() {
    let omega_resorte = Math.sqrt(k / m); // Frecuencia angular del resorte
    let omega_pendulo = Math.sqrt(g / l); // Frecuencia angular del péndulo
    omega_combinada = Math.sqrt(omega_resorte ** 2 + omega_pendulo ** 2); // Frecuencia angular combinada
}

// Evento del botón "Calcular" que actúa como iniciar/pausar
calculateBtn.addEventListener('click', () => {
    // Capturar valores de los inputs de longitud, masa y constante del resorte
    l = parseFloat(document.getElementById('length').value);
    m = parseFloat(document.getElementById('mass').value);
    k = parseFloat(document.getElementById('springConstant').value);

    // Recalcular las frecuencias angulares con los nuevos valores
    calculateOmegaCombinada();

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
});
