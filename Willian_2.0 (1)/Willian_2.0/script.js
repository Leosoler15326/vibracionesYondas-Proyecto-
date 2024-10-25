const pendulum = document.querySelector('.pendulum');
const spring = document.querySelector('.spring');
const calculateBtn = document.getElementById('calculateBtn');
const movementType = document.getElementById('movement').value;
const Contenido = document.getElementById("ContenidoFormula");
const movementDropdown = document.getElementById('movement');
let gamma=0; // Coeficiente de amortiguamiento
let isAmortiguado = movementType === 'amortiguado';
let xtChart;
let angleChart;
let velocityChart;
let animacionActiva = false; // Controlar si la simulación está activa o no
let t = 0; // Tiempo inicial
const timeStep = 0.05; // Paso de tiempo
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
let phi = 0;
// Amplitudes
let amplitud = 0;

// Cantidad máxima de puntos a mostrar en la gráfica
const maxDataPoints = 150;
let c1,c2, m1, m2, dxp;
//******************************************************************************************************************* */
///--------------------------------------------------------------------------------------------------------------------------------------

//******************************************************************************************************************* */
///--------------------------------------------------------------------------------------------------------------------------------------
function formatWithSign(value) {
    return value >= 0 ? "+ " + value.toFixed(2) : "- " + Math.abs(value).toFixed(2);
}
function animate() {
    if (!animacionActiva) return; // Detener si se ha pulsado "Parar Simulación"
    const time = Date.now() / 1000; // Tiempo en segundos
    const movementType = document.getElementById('movement').value;
    let x, theta, velocidad;
    if (movementDropdown.value === "simple") {
        // Movimiento armónico simple
        theta = amplitud.toFixed(2) * Math.cos(omega_combinada * t + phi);
        velocidad = -amplitud.toFixed(2)*omega_combinada*Math.sin(omega_combinada*t + phi)
        x = l*theta
    } else if (movementDropdown.value === "amortiguado") {
        if (gamma**2 < omega_combinada**2) {
            // Movimiento subamortiguado
            console.log("Movimineto SubAmortiguado")
            let omega_d = Math.sqrt(omega_combinada ** 2 - gamma ** 2);
            theta = amplitud * Math.exp(-gamma * t) * Math.cos(omega_d * t + phi);
            velocidad=-amplitud*gamma*Math.exp(-gamma*t)*Math.cos(omega_d*t+phi)-amplitud*Math.exp(-gamma*t)*omega_d*Math.sin(omega_d*t+phi)
            x = l*theta;
        } else if (Math.abs(gamma**2 - omega_combinada**2) < 0.01) {  // Comparamos con tolerancia gama==omegacombinada
            // Amortiguamiento crítico
            c1 = theta0;
            c2 = omega0+theta0*gamma;
            theta = (c1 + t * c2) * Math.exp(-gamma * t);
            velocidad=-c1*gamma*Math.exp(-gamma*t)+c2*Math.exp(-gamma*t)-c2*t*Math.exp(-gamma*t)
            x = theta*l;
        } else if (gamma**2 > omega_combinada**2) {
            // Amortiguamiento sobreamortiguado
            m1 = -gamma+Math.sqrt(gamma**2-omega_combinada**2);
            m2 = -gamma-Math.sqrt(gamma**2-omega_combinada**2);
            c2=(omega0-(theta0*m1))/(m2-m1)
            c1=theta0-((omega0-(m1*theta0))/(m2-m1))
            theta = c1 * Math.exp(m1 * t) + c2 * Math.exp(m2 * t);
            velocidad=m1*c1*Math.exp(m1*t)+m2*c2*Math.exp(m2*t)
            x=theta*l
        }
    }
    else if(movementType === "forzado_sin_amortiguamiento"){
            theta= amplitud * Math.cos(omega_combinada * t +phi)+particulaXpSinAmortiguamineto();
            velocidad = -amplitud.toFixed(2)*omega_combinada*Math.sin(omega_combinada*t + phi)+dxp
            x=theta*l;
    }else{
        let xh;
        if (gamma**2 < omega_combinada**2) {
            // Movimiento subamortiguado
            console.log("Movimineto SubAmortiguado")
            let omega_d = Math.sqrt(omega_combinada ** 2 - gamma ** 2);
            xh=amplitud * Math.exp(-gamma * t) * Math.cos(omega_d * t + phi);
            theta = xh+particulaXpConAmortiguamineto();
            velocidad = -amplitud.toFixed(2)*omega_combinada*Math.sin(omega_combinada*t + phi)+dxp
            x = l*theta;
        } else if (Math.abs(gamma**2 - omega_combinada**2) < 0.01) {  // Comparamos con tolerancia gama==omegacombinada
            // Amortiguamiento crítico
            console.log("Movimineto Critico")
            c1 = theta0;
            c2 = omega0+theta0*gamma;
            xh=(c1 + t * c2) * Math.exp(-gamma * t);
            theta = xh+particulaXpConAmortiguamineto();
            velocidad = -c1*gamma*Math.exp(-gamma*t)+c2*Math.exp(-gamma*t)-c2*t*Math.exp(-gamma*t)+dxp
            x = theta*l;
        } else if (gamma**2 > omega_combinada**2) {
            // Amortiguamiento sobreamortiguado
            console.log("Movimineto sobreamoritgado")
            m1 = -gamma+Math.sqrt(gamma**2-omega_combinada**2);
            m2 = -gamma-Math.sqrt(gamma**2-omega_combinada**2);
            c2=(omega0-(theta0*m1))/(m2-m1)
            c1=theta0-((omega0-(m1*theta0))/(m2-m1))
            xh=c1 * Math.exp(m1 * t) + c2 * Math.exp(m2 * t);
            theta = xh+particulaXpConAmortiguamineto();
            velocidad=m1*c1*Math.exp(m1*t)+m2*c2*Math.exp(m2*t)+dxp
            x=theta*l
        }
        console.log("xh: "+xh.toFixed(3)+" xp: "+particulaXpConAmortiguamineto().toFixed(3));
    }
    

    // Aplicar la rotación del péndulo
    pendulum.style.transform = `rotate(${theta}rad)`;

    // Calcular el desplazamiento horizontal del péndulo en píxeles
    let pendulumX = 100 * Math.sin(theta);

    // Ajustar la longitud del resorte proporcionalmente al movimiento del péndulo
    let springLength = 151 - pendulumX;
    spring.style.width = `${Math.max(50, springLength)}px`;

    // Actualizar las gráficas cada 10 cuadros
    if (updateCounter % 3 === 0) {
        actualizarGraficas(theta, velocidad);
    }

    updateCounter++;

    requestAnimationFrame(animate); // Continuar la animación
}
// Función para actualizar las fórmulas basadas en el tipo de movimiento seleccionado
function actualizarFormula() {
    const movementType = movementDropdown.value; // Obtener el valor seleccionado del dropdown
    let formula, omegaCombinadaVal="", gammaVals="";

    // Mostrar siempre omega_combinada

    // Variables calculadas en el código
    let omegaD = Math.sqrt(omega_combinada ** 2 - gamma ** 2).toFixed(2); // Frecuencia amortiguada
    let gammaVal = gamma, frecuenciaext=""; 

    if (movementType === "simple") {
        // Fórmula para movimiento armónico simple
        let StringTheta = amplitud.toFixed(2) + " * cos(" + omega_combinada + " * t " + formatWithSign(phi) + ")";
        let StringX = l*amplitud.toFixed(2) + " * cos(" + omega_combinada + " * t " + formatWithSign(phi) + ")";
        formula = "Resorte: " + StringX + "<br>Péndulo: " + StringTheta;
    } else if (movementType === "amortiguado") {
        gammaVal;
        // Dependiendo de los valores de gamma y omega_combinada, seleccionamos la fórmula
        omegaCombinadaVal = "<br>ω_combinada = " + omega_combinada;
        gammaVals="<br>γ = "+gammaVal;
        if (gamma < omega_combinada) {
            // Subamortiguado
            let StringTheta = amplitud.toFixed(2) + " * e^(-" + gammaVal + " * t) * cos(" + omegaD + " * t " + formatWithSign(phi) + ")";
            let StringX = l*amplitud.toFixed(2) + " * e^(-" + gammaVal + " * t) * cos(" + omegaD + " * t " + formatWithSign(phi) + ")";
            formula = "<br>Subamortiguado: <br>Resorte: " + StringX + "<br>Péndulo: " + StringTheta + "<br>Donde: ω_d = √(" + omega_combinada+ "² - " + gammaVal + "²)";
        } else if (Math.abs(gamma - omega_combinada) < 0.01) {
            // Amortiguamiento crítico
            let StringTheta = "(" + c1+ " + "+c2 +" * t) * e^(-" + gammaVal + " * t)";
            let StringX = "(" + (c1*l).toFixed(2) + " + "+c2 +" * t) * e^(-" + gammaVal + " * t)";
            formula = "<br>Amortiguamiento Crítico: <br>Resorte: " + StringX + "<br>Péndulo: " + StringTheta;
        } else {
            // Sobreamortiguado
            let StringTheta = c1+" * e^(-(" + gammaVal.toFixed(2) + " + √(" + gammaVal.toFixed(2) + "² - " + omega_combinada + "²)) * t) + "+c2+" * e^(-(" + gammaVal.toFixed(2) + " - √(" + gammaVal.toFixed(2) + "² - " + omega_combinada+ "²)) * t)";
            let StringX = (c1*l).toFixed(2)+" * e^(-(" + gammaVal.toFixed(2) + " + √(" + gammaVal.toFixed(2) + "² - " + omega_combinada + "²)) * t) + "+c2+" * e^(-(" + gammaVal.toFixed(2) + " - √(" + gammaVal.toFixed(2) + "² - " + omega_combinada+ "²)) * t)";
            formula = "<br>Sobreamortiguado: <br>Resorte: " + StringX + "<br>Péndulo: " + StringTheta;
        }
    }else if (movementType === "forzado_sin_amortiguamiento") {
        // Fórmula para movimiento forzado sin amortiguamiento
        let StringTheta = amplitud + " * cos(" + omega_combinada + " * t " + formatWithSign(phi) + ") + ";
        frecuenciaext="ωf = "+wf+" <br> ωc = "+omega_combinada+"<br>";
        formula = StringTheta+calcularFormulaForzadoSinAmortiguamiento();
    }else if (movementType === "forzado_amortiguado") {
        // Fórmula para movimiento forzado sin amortiguamiento
        frecuenciaext="ωf = "+wf+" <br> ωc = "+omega_combinada+"<br>";
        if (gamma < omega_combinada) {
            // Subamortiguado
            let StringTheta = amplitud.toFixed(2) + " * e^(-" + gamma + " * t) * cos(" + omegaD + " * t " + formatWithSign(phi) + ")";
            let StringX = l*amplitud.toFixed(2) + " * e^(-" + gamma + " * t) * cos(" + omegaD + " * t " + formatWithSign(phi) + ")";
            formula = "<br>Subamortiguado: <br>Resorte: " + StringX+calcularFormulaForzadoConAmortiguamiento() + "<br>Péndulo: " + StringTheta+calcularFormulaForzadoConAmortiguamiento() + "<br>Donde: ω_d = √(" + omega_combinada+ "² - " + gammaVal + "²)";
        } else if (Math.abs(gamma - omega_combinada) < 0.01) {
            // Amortiguamiento crítico
            let StringTheta = "(" + c1 + " + "+c2 +" * t) * e^(-" + gammaVal + " * t)";
            let StringX = "(" + (c1*l).toFixed(2) + " + "+c2 +" * t) * e^(-" + gammaVal + " * t)";
            formula = "<br>Amortiguamiento Crítico: <br>Resorte: " + StringX+calcularFormulaForzadoConAmortiguamiento() + "<br>Péndulo: " + StringTheta+calcularFormulaForzadoConAmortiguamiento();
        } else {
            // Sobreamortiguado
            let StringTheta = c1+" * e^(-(" + gammaVal + " + √(" + gammaVal + "² - " + omega_combinada + "²)) * t) + "+c2+" * e^(-(" + gammaVal.toFixed(2) + " - √(" + gammaVal.toFixed(2) + "² - " + omega_combinada+ "²)) * t)";
            let StringX = (c1*l).toFixed(2)+" * e^(-(" + gammaVal+ " + √(" + gammaVal + "² - " + omega_combinada + "²)) * t) + "+c2+" * e^(-(" + gammaVal.toFixed(2) + " - √(" + gammaVal.toFixed(2) + "² - " + omega_combinada+ "²)) * t)";
            formula = "<br>Sobreamortiguado: <br>Resorte: " + StringX+calcularFormulaForzadoConAmortiguamiento() + "<br>Péndulo: " + StringTheta+calcularFormulaForzadoConAmortiguamiento();
        }
    }

    // Concatenar omegaCombinadaVal con la fórmula
    Contenido.innerHTML = omegaCombinadaVal +gammaVals + frecuenciaext + formula ;
}


// Función para actualizar las gráficas en tiempo real
function actualizarGraficas(prtheta, prvelocity) {
    // Validar si las gráficas ya están creadas y tienen la estructura de datos correcta
    if (angleChart && angleChart.data && angleChart.data.labels && angleChart.data.datasets[0].data) {
        // Añadir nuevos valores a la gráfica de ángulo
        angleChart.data.labels.push(t.toFixed(1));
        angleChart.data.datasets[0].data.push(prtheta);
        
        // Mantener un rango en la gráfica de ángulo (últimos maxDataPoints)
        if (angleChart.data.labels.length > maxDataPoints) {
            angleChart.data.labels = angleChart.data.labels.slice(-maxDataPoints);
            angleChart.data.datasets[0].data = angleChart.data.datasets[0].data.slice(-maxDataPoints);
        }

        // Actualizar la gráfica de ángulo
        angleChart.update();
    }

    // Verificar si la gráfica de velocidad está correctamente inicializada
    if (velocityChart && velocityChart.data && velocityChart.data.labels && velocityChart.data.datasets[0].data) {
        // Añadir nuevos valores a la gráfica de velocidad
        velocityChart.data.labels.push(t.toFixed(1));
        velocityChart.data.datasets[0].data.push(prvelocity);

        // Mantener un rango en la gráfica de velocidad (últimos maxDataPoints)
        if (velocityChart.data.labels.length > maxDataPoints) {
            velocityChart.data.labels = velocityChart.data.labels.slice(-maxDataPoints);
            velocityChart.data.datasets[0].data = velocityChart.data.datasets[0].data.slice(-maxDataPoints);
        }

        // Actualizar la gráfica de velocidad
        velocityChart.update();
    }

    t += timeStep; // Incrementar el tiempo
}


// Función para destruir las gráficas si ya existen
function destruirGraficas() {
    if (angleChart) {
        angleChart.destroy(); // Destruir la gráfica angleChart
    }
    if (velocityChart) {
        velocityChart.destroy(); // Destruir la gráfica de velocidad
        velocityChart = null;    // Reiniciar la variable para evitar problemas
    }
}

// Generar las gráficas nuevamente
function generarGraficas() {

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

    // Gráfica de Velocidad Angular (ω) vs Tiempo (t)
    const ctxVelocity = document.getElementById('velocityChart').getContext('2d');
    velocityChart = new Chart(ctxVelocity, {
        type: 'line',
        data: {
            labels: [], // Inicialmente vacío
            datasets: [{
                label: 'Velocidad Angular (ω) vs Tiempo (t)',
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
                    title: {
                        display: true,
                        text: 'Velocidad Angular (ω) en rad/s'
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
    omega_combinada = Math.sqrt(omega_resorte ** 2 + omega_pendulo ** 2).toFixed(2); // Frecuencia angular combinada
}

function calcularBPendulo(w0_pendulo, theta0_pendulo, gamma) {
    return (w0_pendulo + gamma * theta0_pendulo).toFixed(2);
}
function calculatePhi() {
    // Calcular la fase inicial del péndulo
    if (theta0 === 0) {
        if (omega0 === 0) {
            // Si theta0 y omega0 son 0, el péndulo está en reposo, fase indefinida pero podemos asumir 0
            phi = 0;
        } else if (omega0 > 0) {
            // Si theta0 es 0 pero omega0 es positivo, el péndulo está en equilibrio pasando hacia un lado positivo
            phi = Math.PI / 2; // 90 grados, está en el punto de equilibrio dirigiéndose a un máximo positivo
        } else {
            // Si theta0 es 0 pero omega0 es negativo, el péndulo está en equilibrio pasando hacia el lado negativo
            phi = (3 * Math.PI) / 2; // 270 grados, está en el punto de equilibrio dirigiéndose a un mínimo negativo
        }
    } else {
        let auxPhi;
        if(movementDropdown.value === "amortiguado" || movementDropdown.value === "forzado_amortiguado"){
            auxPhi = Math.abs(Math.atan(((omega0/theta0)+gamma)/omega_combinada));
            console.log("amortiguado auxphi " + auxPhi);
        }else if(movementDropdown.value === "simple"||movementDropdown.value === "forzado_sin_amortiguamiento"){//la homgonea depende de esta amplitud 
            auxPhi = Math.abs(Math.atan(omega0 / (-theta0 * omega_combinada)));
            console.log("simple auxphi " + auxPhi);
        }
        console.log("si theta es diferente de 0 es " + auxPhi);
        if (theta0 > 0 && omega0 > 0) {
            console.log("Cuadrante 4");
            // 4 cuadrante
            phi = auxPhi-2*Math.PI;
        } else if (theta0 < 0 && omega0 > 0) {
            console.log("cuadrante 3");
            // 3 cuadrante
            phi = Math.PI + auxPhi;
        } else if (theta0 < 0 && omega0 < 0) {
            console.log("cuadrante 3");
            // 2 cuadrante
            phi = Math.PI - auxPhi;
        } else if(theta0 > 0 && omega0 < 0){
            console.log("cuadrante 1");
            // 1 cuadrante
            phi = auxPhi;
        }else if(omega0===0){
            console.log("cuadrante 4s");
            if(theta0>0){
                // 4 cuadrante
                phi = 2*Math.PI-auxPhi;
            }else{
                // 3 cuadrante
                console.log("cuadrante 3s");
                phi = Math.PI + auxPhi;
            }
        }
    }
    console.log("Fase inicial: " + phi);
}
function calcularAmplitud() {
    if (omega0 === 0) {
        // Si omega0 es 0, el péndulo parte desde el reposo en la posición theta0
        amplitud = Math.abs(theta0);
    } else if (theta0 === 0) {
        // Si theta0 es 0, calculamos la amplitud usando omega0 y omega_combinada
        amplitud = Math.abs(omega0 / omega_combinada);
    } else if (phi === Math.PI || phi === (3 * Math.PI) / 2 || phi === Math.PI / 2) {
        // Si phi es un ángulo donde cos(phi) es 0 (evitar dividir entre 0)
        amplitud = Math.abs(omega0 / omega_combinada);
    } else {
        // Caso general, cuando theta0 y omega0 son diferentes de 0
        amplitud = Math.abs(theta0 / Math.cos(phi));
    }

    console.log("Amplitud: " + amplitud);

    // Verificar si la amplitud supera los 15 grados (0.2618 radianes)
    if (amplitud > 0.2618) {
        console.log("Advertencia: La amplitud supera los 15 grados.");
    }
}


calculateBtn.addEventListener('click', () => {
    // Obtener valores de los inputs
    l = parseFloat(document.getElementById('longitudPendulo').value);
    m = parseFloat(document.getElementById('masaPendulo').value);
    k = parseFloat(document.getElementById('constanteElastica').value);
    theta0 = parseFloat(document.getElementById('anguloInicial').value);
    omega0 = parseFloat(document.getElementById('velocidadInicialPendulo').value);
    xo = l * theta0; // Posición inicial del resorte

    // Recalcular parámetros del sistema
    calculateOmegaCombinada();
    calculatePhi();
    calcularAmplitud();
    // Verificar si se ha seleccionado el movimiento amortiguado
    let movementType = document.getElementById('movement').value;
    console.log('movementType  '+movementType)
    isAmortiguado = movementType === 'amortiguado';
    if (isAmortiguado) {
        gamma =  parseFloat(document.getElementById('coeficienteAmortiguamiento').value)/ (m *l);
    }
    if(movementType === 'forzado_sin_amortiguamiento' ){
        fo = parseFloat(document.getElementById('amplitudfuerza').value);
        wf = parseFloat(document.getElementById('frecuenciafuerzaExterna').value);
    }
    if(movementType === 'forzado_amortiguado'){
        fo = parseFloat(document.getElementById('amplitudfuerza').value);
        wf = parseFloat(document.getElementById('frecuenciafuerzaExterna').value);
        gamma =  parseFloat(document.getElementById('coeficienteAmortiguamiento').value)/ (m *l);
    }
    actualizarFormula();
    if (animacionActiva) {
        animacionActiva = false;
        calculateBtn.innerText = 'Generar Simulación';
    } else {
        t = 0; // Reiniciar el tiempo
        updateCounter = 0;

        destruirGraficas();
        generarGraficas();

        animacionActiva = true;
        calculateBtn.innerText = 'Detener Simulación';
    }
});
///--------------------------------------------------------------------------------------------------------------------------------------

let fo = document.getElementById('amplitudfuerza').value;
let wf = document.getElementById('frecuenciafuerzaExterna').value;

// Selecciona los elementos
const amplitudFuerza = document.getElementById('amplitudfuerza');
const amplitudFuerzaValue = document.getElementById('amplitudfuerza-value');
const frecuenciaFuerzaExterna = document.getElementById('frecuenciafuerzaExterna');
const frecuenciaFuerzaExternaValue = document.getElementById('frecuenciafuerzaExterna-value');

// Agrega eventos de cambio a los inputs
amplitudFuerza.addEventListener('input', () => {
    amplitudFuerzaValue.textContent = amplitudFuerza.value;
});
// Escuchar cambios en el dropdown de movimiento y actualizar la fórmula cuando se selecciona una opción
movementDropdown.addEventListener('change', actualizarFormula);
frecuenciaFuerzaExterna.addEventListener('input', () => {
    frecuenciaFuerzaExternaValue.textContent = frecuenciaFuerzaExterna.value;
});

// Actualiza los valores iniciales
amplitudFuerzaValue.textContent = amplitudFuerza.value;
frecuenciaFuerzaExternaValue.textContent = frecuenciaFuerzaExterna.value;

function  particulaXpConAmortiguamineto(prTheta){
    let c;
    c=(fo/m*l)**2/Math.sqrt((omega_combinada**2-wf**2)**2+(2*gamma*wf)**2);
    if (wf === 0) {
        prTheta =  c.toFixed(2) * Math.cos(wf* t);
        dxp=-c*wf*Math.sin(wf*t)
    } else if (wf === omega_combinada){//usamos el desface 
        let desface=Math.PI/2;
        prTheta =  c.toFixed(2) * Math.cos(wf* t-desface.toFixed(2));
        dxp=-c*wf*Math.sin(wf*t-desface.toFixed(2))
    } else {//Usamos el desface como PI
        let desface=Math.PI;
        prTheta =  c.toFixed(2)* Math.cos(wf* t - desface.toFixed(2));
        dxp=-c*wf*Math.sin(wf*t-desface.toFixed(2))
    }
    return prTheta;
}
function  particulaXpSinAmortiguamineto(prTheta){
    if (wf === omega_combinada) {
        c=(fo/m*l)/(2*omega_combinada);
        prTheta =  c  * Math.cos(omega_combinada * t);
        dxp=-c*omega_combinada*Math.sin(omega_combinada*t);
    } else if (wf < omega_combinada){//usamos el desface como 0
        c=(fo/m*l)/(omega_combinada ** 2 - wf ** 2);
        prTheta =  c.toFixed(2)  * Math.cos(wf* t );
        dxp=-c*wf*Math.sin(omega_combinada*t);
    } else {//Usamos el desface como PI
        let desface=Math.PI;
        c=(fo/m*l)/(wf ** 2 - omega_combinada ** 2);
        prTheta =  c.toFixed(2)*Math.cos(wf* t - desface);
        dxp=-c*wf*Math.sin(omega_combinada*t - desface);
    }
    return prTheta;
}     

function calcularFormulaForzadoSinAmortiguamiento(){
    let Xe;
    if (wf === omega_combinada) {
        c=(fo/l*m)/(2*omega_combinada);
        Xe =  c.toFixed(2) + " * t*cos(" + omega_combinada + "* t )";
    } else if (wf < omega_combinada){//usamos el desface como 0
        c=(fo/l*m)/(omega_combinada ** 2 - wf ** 2);
        Xe =  c.toFixed(2) + " * t*cos(" + wf + "* t )";
    } else {//Usamos el desface como PI
        let desface=Math.PI;
        c=(fo/l*m)/(wf ** 2 - omega_combinada ** 2);
        Xe =  c.toFixed(2) + " * t*cos(" + wf + "* t -"+desface+" )";
    }
    return Xe;
}

function calcularFormulaForzadoConAmortiguamiento(){
    let Xe;
    c=(fo/m*l)**2/Math.sqrt((omega_combinada**2-wf**2)**2+(2*gamma*wf)**2);
    if (wf === 0) {
        Xe =  c.toFixed(2) + " * t*cos(" + omega_combinada + "* t )";
    } else if (wf === omega_combinada){//usamos el desface 
        let desface=Math.PI/2;
        Xe =  c.toFixed(2) + " * t*cos(" + wf + "* t - "+desface.toFixed(2)+")";
    } else {//Usamos el desface como PI
        let desface=Math.PI
        c=(fo/l*m)/(wf ** 2 - omega_combinada ** 2);
        Xe =  c.toFixed(2) + " * t*cos(" + wf + "* t -"+desface.toFixed(2)+" )";
    }
    return Xe;
}
