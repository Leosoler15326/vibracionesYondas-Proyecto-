//inicializacion de variables
let tipoMovimientoSelect,
constanteTorsionInput,
masaInput,
radioInput,
anguloInicialInput,
iniciarButton,
pararButton,
pendulo,
graficaCanvas,
ctx;

let StringTheta = "";
let intervalID = null;
let startTime = 0;

//------------------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
    tipoMovimientoSelect = document.getElementById("tipo_movimiento");
    constanteTorsionInput = document.getElementById("constante_torsion");
    masaInput = document.getElementById("masa");
    radioInput = document.getElementById("radio");
    anguloInicialInput = document.getElementById("anguloInicial");
    constanteAmortiguamientoInput = document.getElementById("constante_amortiguamiento");
    velocidadInicialInput = document.getElementById("velocidadInicial");
    iniciarButton = document.getElementById("iniciar");
    pararButton = document.getElementById("parar");
    pendulo = document.getElementById("pendulo");

    const graficaCanvas = document.getElementById("grafica");
    const graficaCanvas2 = document.getElementById("grafica2");
    var KE = 0,
    PE = 0,
    TE = 0;

    let chart = null;
    let chart2 = null;

let penduloHeight = document.getElementById("pendulo").offsetHeight;
let radioValue = 0.10; // Valor inicial del radio en metros


document.getElementById("radio").addEventListener("input", function() {
    radioValue = parseFloat(document.getElementById("radio").value);
    updatePendulum(radioValue);
});


function updatePendulum(radio) {
    // Actualizar el péndulo con el nuevo valor del radio
    let newWidth = penduloHeight + 50 * radio;
    document.getElementById("pendulo").style.height = newWidth + "px";
    
    let canvasSize = newWidth * 2; // Ajustar el tamaño del círculo al doble del nuevo ancho
    document.querySelector(".canvas-container").style.width = canvasSize + "px";
    document.querySelector(".canvas-container").style.height = canvasSize + "px";
    pendulo.style.transform = "rotate(" + theta + "rad)";
}


    function limpiarGrafica() {
        //reset grafica de anguo vs tiempo
        chart.data[0].x = [];
        chart.data[0].y = [];
        chart.layout.width= 0;
        chart.layout.height= 0;
        Plotly.newPlot(graficaCanvas, chart.data, chart.layout);

        //reset energia vs tiempo
        chart2.data[0].x = [];
        chart2.data[0].y = [];
        chart2.data[1].x = [];
        chart2.data[1].y = [];
        chart2.data[2].x = [];
        chart2.data[2].y = [];
        chart2.layout.width= 0;
        chart2.layout.height= 0;
        Plotly.newPlot(graficaCanvas2, chart2.data, chart2.layout);
        banderaSubamortiguado = false;
    }


  // Función para iniciar la simulación
    function iniciarSimulacion() {
        // Aquí colocarás la lógica para iniciar la simulación
        console.log("Simulación iniciada");
        animate(startTime); // Comenzar la animación
    }


    // Función para detener la simulación
    function detenerSimulacion() {
        // Aquí colocarás la lógica para detener la simulación
        console.log("Simulación detenida");
        cancelAnimationFrame(intervalID);
        intervalID = null;
    }


    function calcularEnergiaPotencial(Kappa, theta) {
        return (1 / 2) * Kappa * Math.pow(theta, 2);
    }


    function calcularEnergiaCinetica(inertia, dv) {
        return (1 / 2) * inertia * Math.pow(dv, 2);
    }

  // Función para actualizar la posición del péndulo
    function updatePosition(t, tipoMovimiento) {
        let theta;
        let masa = parseFloat(masaInput.value);
        let radio = parseFloat(radioInput.value);
        let inertia = (masa * (Math.pow(radio, 2)))/2;
        let v_0 = (parseFloat(velocidadInicialInput.value)*Math.PI)/180;
        let theta_0 = (parseFloat(anguloInicialInput.value) * Math.PI) / 180;
        switch (tipoMovimiento) {
        case "mas":
            var w_0 = Math.sqrt(parseFloat(constanteTorsionInput.value) / inertia);
            var fi = Math.atan(v_0 / ((w_0)* theta_0));
            fi = ajustarFi(fi, v_0, theta_0);
            var Amp = (theta_0/(Math.cos(fi)));

            theta = Amp *(Math.cos((w_0 * t) + fi));
            //Derivada de theta
            var dv = -w_0 * Amp * (Math.sin((w_0 * t) + fi));

            KE = calcularEnergiaCinetica(inertia, dv);
            PE = calcularEnergiaPotencial(parseFloat(constanteTorsionInput.value), theta);

            StringTheta =
            Amp.toFixed(2) + " * cos(" + w_0.toFixed(2) + "* t" + " + " + fi.toFixed(2) + ")";
            var Contenido = document.getElementById("ContenidoFormula");
            Contenido.textContent = "θ(t) = "+ StringTheta;
            TE = KE + PE;
            agregarDatoAGrafica(t, ((theta * 180) / Math.PI));
            agregarDatoAGrafica2(t, KE, PE, TE);
            break;
        case "amortiguado":
            constanteAmortiguamientoInput = document.getElementById(
            "constante_amortiguamiento"
            );
            var Beta = parseFloat(constanteAmortiguamientoInput.value);
            var w_0 = Math.sqrt(parseFloat(constanteTorsionInput.value) / inertia);
            w_0 =  Math.round(w_0 * 1e3) / 1e3; // Redondea a 8 decimales
            var gamma = Beta/(2* inertia); // Coeficiente de amortiguamiento
            gamma = Math.round(gamma * 1e3) / 1e3; // Redondea a 8 decimales
            // Frecuencia amortiguada
            var w_d = 0;
            
            if (Math.pow(gamma, 2) === Math.pow(w_0, 2)) {    // Criticamente amortiguado
            w_d = Math.sqrt(Math.pow(w_0, 2) - Math.pow(gamma, 2));
            var c1 = theta_0;
            var c2 = v_0 + c1;
            theta = (c1 + c2 * t) * Math.pow(Math.E, (-1*gamma) * t);

            StringTheta = "( "+ c1.toFixed(2) + " + " + c2.toFixed(2) + " * t )" + " * e^(-" + gamma.toFixed(2) + " * t)";

            } else {
            if (Math.pow(gamma, 2) < Math.pow(w_0, 2)) {  //Subamortiguado
                banderaSubamortiguado = true;
                w_d = Math.sqrt(Math.pow(w_0, 2) - Math.pow(gamma, 2));
                var fi = Math.atan(v_0 / ((-1*w_0) * theta_0));
                //var fi = (2*Math.PI*gamma)/ w_d;
                fi = ajustarFiAmortiguado(fi,theta_0, v_0, w_d, gamma);
                var C= (theta_0/Math.cos(fi)); 
                var Amp = C * Math.pow(Math.E, (-1*gamma) * t);                
                theta =  Amp * Math.cos((w_d * t) + fi);

                StringTheta =
                C.toFixed(2) + " * e^(-" + gamma.toFixed(2) + " * t" + ")" + " * cos(" + w_d.toFixed(2) + "* t" + " + " + fi.toFixed(2) + ")";
            }
            if (Math.pow(gamma, 2) > Math.pow(w_0, 2)) { /// Sobreamortiguado
                var m1 = -gamma + Math.sqrt(Math.pow(gamma, 2) - Math.pow(w_0, 2));
                var m2 = -gamma - Math.sqrt(Math.pow(gamma, 2) - Math.pow(w_0, 2));
                var c2 = (v_0 - (m1 * theta_0)) / (-m1 + m2);
                var c1 = theta_0 - c2;
                theta =
                (c1 * Math.pow(Math.E, m1 * t)) + (c2 * Math.pow(Math.E, m2 * t));

                StringTheta = c1.toFixed(2)+" * "+ "e^(" + m1.toFixed(2) + " * t) + " + c2.toFixed(2) + " * " + "e^(" + m2.toFixed(2) + " * t)";
            }
            }
            if (Math.pow(gamma, 2) < Math.pow(w_0, 2)) { // Sub amortiguado
            var expTerm = Math.pow(Math.E, -gamma * t);
            var dv = (C*(-1*gamma)*expTerm*Math.cos((w_d*t) + fi)) - (w_d * C * expTerm * Math.sin((w_d * t) + fi));

            KE = calcularEnergiaCinetica(inertia, dv);
            PE = calcularEnergiaPotencial(
                parseFloat(constanteTorsionInput.value),
                theta );
            TE = KE + PE;
            banderaSubamortiguado = true;
            agregarDatoAGrafica2(t, KE, PE, TE);
            }

            var Contenido = document.getElementById("ContenidoFormula");   
            Contenido.textContent = "θ(t) = "+ StringTheta;

            agregarDatoAGrafica(t, ((theta * 180) / Math.PI));
            
            break;

        case "forzado_sin_amortiguamiento":
            fuerzaExternaInput = document.getElementById("fuerza_Forzado");
            var w_0 = Math.sqrt(parseFloat(constanteTorsionInput.value) / inertia);
            w_0 =  Math.round(w_0 * 1e3) / 1e3; // Redondea a 3 decimales
            frecuenciaForzadoInput = document.getElementById("frecuencia_Forzado");
            var w_f = parseFloat(frecuenciaForzadoInput.value);
            w_f =  Math.round(w_f * 1e3) / 1e3; // Redondea a 3 decimales
            var F_0 = parseFloat(fuerzaExternaInput.value);

            if ((w_f === w_0)) {
                A = F_0 / (2* w_0);  // Caso de resonancia sin amortiguamiento
            } else{
                A =
                (F_0 /inertia)/Math.sqrt(Math.pow((2*w_f),2) + Math.pow(Math.pow(w_f, 2) - Math.pow(w_0, 2),2));
            }
            var solParticular = 0; //solucion particular
            solParticular = A * t * Math.sin(w_0 * t); //Caso Forzado sin amortiguamiento con resonancia

            StringTheta = " θe = " + A.toFixed(2) + " * t * sin(" + w_0.toFixed(2) +  " * t)";

            var Contenido = document.getElementById("ContenidoFormula");
            Contenido.textContent = "θ(t) =" + StringTheta;
            // Ángulo forzado
            theta = solParticular;

            agregarDatoAGrafica(t, ((theta * 180) / Math.PI));
            break;
        case "forzado_amortiguado":
            constanteAmortiguamientoInput = document.getElementById(
            "constante_amortiguamiento"
            );
            var Beta = parseFloat(constanteAmortiguamientoInput.value);
            fuerzaExternaInput = document.getElementById("fuerza_Forzado");
            var w_0 = Math.sqrt(parseFloat(constanteTorsionInput.value) / inertia);
            w_0 =  Math.round(w_0 * 1e3) / 1e3; // Redondea a 3 decimales
            var gamma = Beta/(2* inertia); // Coeficiente de amortiguamiento
            gamma = Math.round(gamma * 1e3) / 1e3; // Redondea a 8 decimales
            frecuenciaForzadoInput = document.getElementById("frecuencia_Forzado");
            var w_f = parseFloat(frecuenciaForzadoInput.value);
            w_f =  Math.round(w_f * 1e3) / 1e3; // Redondea a 3 decimales
            var F_0 = parseFloat(fuerzaExternaInput.value);
            var A = 0;
            if (w_f<w_0) {
            A =
                (F_0 /inertia)/Math.sqrt(Math.pow((2*gamma*w_f),2) + Math.pow(Math.pow(w_0, 2) - Math.pow(w_f, 2),2));
            } else {
                A =
                (F_0 /inertia)/Math.sqrt(Math.pow((2*gamma*w_f),2) + Math.pow(Math.pow(w_f, 2) - Math.pow(w_0, 2),2));
            }
            //Calular delta
            var delta = 0;
            if (w_f != w_0) {
            delta = Math.atan((2 * gamma * w_f)/(Math.pow(w_0, 2) - Math.pow(w_f, 2)));
            }
            delta = ajustarDelta(delta,w_f,w_0);

            var solParticular = 0;
            //solucion particular
            solParticular = A * Math.cos((w_f * t) - delta);     //Caso Forzafo con amortiguamiento

            StringTheta = " θe = " + A.toFixed(2) + " * cos(" + w_f.toFixed(2) +  " * t - " +  delta.toFixed(2) + ")";
        
            var Contenido = document.getElementById("ContenidoFormula");
            Contenido.textContent = "θ(t) =" + StringTheta;
            // Ángulo forzado
            theta = solParticular;

            agregarDatoAGrafica(t, ((theta * 180) / Math.PI));
            break;
        default:
            theta = 0;
            break;
        }
        // Actualizar posición del péndulo
        pendulo.style.transform = "rotate(" + theta + "rad)";
    }
  // Función de animación
  // Función de animación
    function animate(timestamp) {
        if (!intervalID) {
        // Verificamos si ya hay una animación en curso
        var tipoMovimiento = tipoMovimientoSelect.value;
        startTime = timestamp || performance.now();

        function step(currentTime) {
            var currentTime = performance.now();
            var elapsedTime = (currentTime - startTime) / 7000; // Tiempo transcurrido en segundos
            updatePosition(elapsedTime, tipoMovimiento);
            intervalID = requestAnimationFrame(step); // Siguiente cuadro de animación
        }

        intervalID = requestAnimationFrame(step);

        if (!chart) {
            generarGrafica();
        }
        }
    }

  //Funcion ajustarFi MAS
    function ajustarFi(fi, v_0, theta_0) {
        fi = Math.abs(fi);
        if (theta_0 > 0 && v_0 > 0) {
        fi = 2 * Math.PI - fi; //Cuadrante 4
        } else if (theta_0 < 0 && v_0 > 0) {
        fi = Math.PI + fi; //Cuadrante 3
        } else if (theta_0 < 0 && v_0 < 0) {
        fi = Math.PI - fi; //Cuadrante 2
        } else {
        fi = fi; //Cuadrante 1
        }
        return fi;
    }

  //Ajustar Fi Amortiguado
    function ajustarFiAmortiguado(fi, theta_0, v_0, w_d, gamma) {
        fi = Math.abs(fi);
        var verSeno = (v_0+theta_0*gamma)/(-1);

        if (theta_0 > 0 && verSeno < 0) {
        fi = 2 * Math.PI - fi; //Cuadrante 4
        } else if (theta_0 < 0 && verSeno < 0) {
        fi = Math.PI + fi; //Cuadrante 3
        } else if (theta_0 < 0 && verSeno > 0) {
        fi = Math.PI - fi; //Cuadrante 2
        } else {
        fi = fi; //Cuadrante 1
        }
        return fi;
    }


  //Funcion ajustar d
    function ajustarDelta(delta,w_f,w_0) {
        termCos = (Math.pow(w_0, 2) - Math.pow(w_f, 2));
        delta = Math.abs(delta);

        if (termCos < 0) {
        delta = Math.PI - delta; //Cuadrante 2
        } else {
        delta = delta; //Cuadrante 1
        }
        return delta;
    }


  // Evento clic del botón "Iniciar"
    iniciarButton.addEventListener("click", function () {
        if (!intervalID) {
        // Comprobamos si la animación ya está en curso
        iniciarSimulacion();
        }
    });

  // Evento clic del botón "Parar"
    pararButton.addEventListener("click", function () {
        if (intervalID) {
        // Comprobamos si hay una animación en curso
        detenerSimulacion();
        // Actualizar posición del péndulo
        pendulo.style.transform = "rotate(" + 0  + "rad)";
        StringTheta = "";
        limpiarGrafica();
        startTime = 0;
        }
    });


    // Agregar evento de cambio al select de tipo de movimiento
    tipoMovimientoSelect.addEventListener("change", function () {
        var tipoMovimiento = tipoMovimientoSelect.value;
        if (tipoMovimiento === "mas") {
        document.getElementById("otros_parametros_amortiguado").style.display =
            "none";
        document.getElementById("otros_parametros_forzado").style.display =
            "none";
        } else if (tipoMovimiento === "amortiguado") {
        document.getElementById("otros_parametros_amortiguado").style.display =
            "block";
        document.getElementById("otros_parametros_forzado").style.display =
            "none";
        } else if (tipoMovimiento === "forzado_sin_amortiguamiento") {
        document.getElementById("otros_parametros_amortiguado").style.display =
            "none";
        document.getElementById("otros_parametros_forzado").style.display = "block";
        }else if (tipoMovimiento === "forzado_amortiguado") {
        document.getElementById("otros_parametros_amortiguado").style.display =
            "block";
        document.getElementById("otros_parametros_forzado").style.display =
            "block";
        document.getElementById("otros_parametros_velocidadInicial").style.display =
            "none";
        }
    });



    function generarGrafica() {
        chart2 = {
            data: [
            {
                x: [],
                y: [],
                name: "Energía Cinética (KE)",
                mode: "lines",
                line: { color: "blue" },
            },
            {
                x: [],
                y: [],
                name: "Energía Potencial (PE)",
                mode: "lines",
                line: { color: "green" },
            },
            {
                x: [],
                y: [],
                name: "Energía Mecánica Total (TE)",
                mode: "lines",
                line: { color: "orange" },
            },
            ],
            layout: {
            title: "Energías vs Tiempo",
            xaxis: {
                title: "Tiempo (s)",
                range: [0, 10],
            },
            yaxis: {
                title: "Energía (J)",
            },
            width: 700, // Add this line
            height: 350, // Add this line
            },
        };
        if ((tipoMovimientoSelect.value === "mas") || ((tipoMovimientoSelect === "amortiguado") && (banderaSubamortiguado === true))) {
            Plotly.newPlot(graficaCanvas2, chart2.data, chart2.layout);
            } else{
            chart2.layout.width = 0;
            chart2.layout.height = 0;
            Plotly.newPlot(graficaCanvas2, chart2.data, chart2.layout);
            }

        
        chart = {
            data: [
                {
                x: [],
                y: [],
                name: "Ángulo vs Tiempo(oe)",
                mode: "lines",
                line: { color: "red" },
                
                },
            ],
            layout: {
                title: "Ángulo vs Tiempo",
                xaxis: {
                title: "Tiempo (s)",
                range: [0, 10],
                },
                yaxis: {
                title: "Ángulo (deg)",
                //range: [-1* Math.PI, Math.PI],
                },
                width: 700, // Add this line
                height: 350, // Add this line
            },
        };
        Plotly.newPlot(graficaCanvas, chart.data, chart.layout);

        

    }


    function agregarDatoAGrafica(tiempo, angulo) {
        if (graficaCanvas.data.length === 0) {
            Plotly.newPlot(graficaCanvas, [{ x: [0], y: [0], name: "Ángulo vs Tiempo", mode: "spline", line: { color: "rgb(75, 192, 192)" }, layout: {xaxis: {range : [0, 10]} } }]);
        }
        graficaCanvas.data[0].x.push(tiempo);
        graficaCanvas.data[0].y.push(angulo);
        Plotly.redraw(graficaCanvas);
    }


    function agregarDatoAGrafica2(tiempo, KE, PE, TE) {
    if (graficaCanvas2.data.length === 0) {
        Plotly.newPlot(graficaCanvas2, [
        { x: [0], y: [0], name: "Energía Cinética (KE)", mode: "spline", line: { color: "blue" }, layout: {xaxis: {range : [0, 10]} }},
        { x: [0], y: [0], name: "Energía Potencial (PE)", mode: "spline", line: { color: "green" }, layout: {xaxis: {range : [0, 10]} } },
        { x: [0], y: [0], name: "Energía Mecánica Total (TE)", mode: "spline", line: { color: "orange" }, layout: {xaxis: {range : [0, 10]} } }
        ]);
    }
    graficaCanvas2.data[0].x.push(tiempo);
    graficaCanvas2.data[0].y.push(KE);
    graficaCanvas2.data[1].x.push(tiempo);
    graficaCanvas2.data[1].y.push(PE);
    graficaCanvas2.data[2].x.push(tiempo);
    graficaCanvas2.data[2].y.push(TE);
    Plotly.redraw(graficaCanvas2);
    }

});
