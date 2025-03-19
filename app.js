// Datos del modelo (simulados - normalmente se cargarían desde model_info.json)

const modelInfo = {
    "feature_names": ["Hours Studied", "Previous Scores", "Extracurricular Activities", "Sleep Hours", "Sample Question Papers Practiced"],
    "feature_importances": {
        "Hours Studied": 0.37,
        "Previous Scores": 0.92,
        "Extracurricular Activities": 0.59,
        "Sleep Hours": 0.05,
        "Sample Question Papers Practiced": 0.04
    },
    "scaling_means": [7.55, 71.34, 0.51, 6.97, 2.83],
    "scaling_stds": [1.78, 13.21, 0.49, 0.98, 1.31]
};

// Guardar modelInfo en localStorage para que predict.js pueda acceder
localStorage.setItem('modelInfo', JSON.stringify(modelInfo));

// Inicializar la página cuando se cargue
document.addEventListener('DOMContentLoaded', function() {
    // Crear gráfico de importancia de características
    createFeaturesChart();
    
    // Configurar el formulario de predicción
    setupForm();
});

function createFeaturesChart() {
    const features = Object.keys(modelInfo.feature_importances);
    const importances = Object.values(modelInfo.feature_importances);
    
    // Traducir nombres de características para la visualización
    const featureLabels = {
        "Hours Studied": "Horas de estudio",
        "Previous Scores": "Calificaciones previas",
        "Extracurricular Activities": "Act. extracurriculares",
        "Sleep Hours": "Horas de sueño",
        "Sample Question Papers Practiced": "Exámenes de práctica"
    };
    
    const translatedFeatures = features.map(feature => featureLabels[feature] || feature);
    
    const ctx = document.createElement('canvas');
    document.getElementById('featuresChart').appendChild(ctx);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: translatedFeatures,
            datasets: [{
                label: 'Correlación',
                data: importances,
                backgroundColor: [
                    'rgba(219, 125, 42, 0.7)',
                    'rgba(219, 125, 42, 0.95)',
                    'rgba(219, 125, 42, 0.6)',
                    'rgba(219, 125, 42, 0.4)',
                    'rgba(219, 125, 42, 0.33)',
                ],
                borderColor: '#f39c12',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            plugins: {
                // ...existing plugins config...
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: 1.0, // Changed from 0.5 to 1.0 for 100% scale
                    ticks: {
                        callback: function(value) {
                            return `${(value * 100).toFixed(0)}%`;
                        }
                    }
                }
            }
        }
    });
}

function predictPerformance(inputs) {
    // Convert inputs to numeric values
    const [hoursStudied, previousScores, extracurricularActivities, sleepHours, sampleQuestionPapersPracticed] = 
        inputs.map(val => parseFloat(val));
    
    // Estos valores se obtienen del archivo model_coefficients.json
    const coefficients = {
        "Hours Studied": 2.852982053532593,
        "Previous Scores": 1.018434192334054,
        "Extracurricular Activities": 0.6128975819601041,
        "Sleep Hours": 0.4805597547118859,
        "Sample Question Papers Practiced": 0.19380214006990196,
        "intercept": -34.07558809191359
    };

    let prediction = coefficients.intercept;
    prediction += coefficients["Hours Studied"] * hoursStudied;
    prediction += coefficients["Previous Scores"] * previousScores;
    prediction += coefficients["Extracurricular Activities"] * extracurricularActivities;
    prediction += coefficients["Sleep Hours"] * sleepHours;
    prediction += coefficients["Sample Question Papers Practiced"] * sampleQuestionPapersPracticed;

    // Limitar la predicción entre 0 y 100
    prediction = Math.max(0, Math.min(100, prediction));
    
    // Return rounded to 1 decimal place
    return prediction.toFixed(1);
}

function setupForm() {
    const form = document.getElementById('predictionForm');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Recoger valores del formulario
        const hoursStudied = document.getElementById('hoursStudied').value;
        const previousScores = document.getElementById('previousScores').value;
        const extracurricular = document.getElementById('extracurricular').value;
        const sleepHours = document.getElementById('sleepHours').value;
        const papersPracticed = document.getElementById('papersPracticed').value;
        
        // Usar la función de predicción de predict.js
        const inputs = [hoursStudied, previousScores, extracurricular, sleepHours, papersPracticed];
        const prediction = predictPerformance(inputs);
        
        // Mostrar el resultado
        displayResult(prediction);
    });
}

function displayResult(prediction) {
    // Mostrar sección de resultados
    const resultSection = document.getElementById('resultSection');
    resultSection.style.display = 'block';
    
    // Actualizar valor numérico
    document.getElementById('predictionValue').textContent = prediction;
    
    // Actualizar gráfico de gauge
    updateGauge(prediction);
    
    // Mostrar interpretación
    updateInterpretation(prediction);
    
    // Scroll hasta el resultado
    resultSection.scrollIntoView({ behavior: 'smooth' });
}

function updateGauge(prediction) {
    const predictionValue = parseFloat(prediction);
    const gaugeContainer = document.querySelector('.gauge');
    
    // Calculate rotation (0 = 0°, 100 = 180°)
    const rotation = (predictionValue / 100) * 180;
    
    // Clear previous gauge content
    gaugeContainer.innerHTML = '';
    
    // Choose appropriate image based on prediction
    let gaugeImage = document.createElement('img');
    gaugeImage.style.width = '100%';
    gaugeImage.style.height = 'auto';
    // gaugeImage.style.transform = `rotate(${rotation}deg)`;
    gaugeImage.style.transformOrigin = 'bottom center';
    gaugeImage.style.transition = 'transform 1s ease-out';
    
    if (predictionValue >= 90) {
        gaugeImage.src = 'gauge-1.png';
        gaugeImage.alt = 'Rendimiento excepcional';
    } else if (predictionValue >= 80) {
        gaugeImage.src = 'gauge-2.png';
        gaugeImage.alt = 'Rendimiento muy bueno';
    } else if (predictionValue >= 70) {
        gaugeImage.src = 'gauge-3.png';
        gaugeImage.alt = 'Rendimiento adecuado';
    } else if (predictionValue >= 60) {
        gaugeImage.src = 'gauge-4.png';
        gaugeImage.alt = 'Rendimiento suficiente';
    } else {
        gaugeImage.src = 'gauge-5.png';
        gaugeImage.alt = 'Rendimiento por debajo de lo esperado';
    }
    
    // Add the image to the gauge
    gaugeContainer.appendChild(gaugeImage);
}

function updateInterpretation(prediction) {
    const predictionValue = parseFloat(prediction);
    const interpretationElement = document.getElementById('interpretation');
    
    let interpretation;
    
    if (predictionValue >= 90) {
        interpretation = `
            <strong>Rendimiento excepcional (${prediction}/100)</strong><br>
            El estudiante demuestra un dominio sobresaliente de los contenidos y competencias. 
            Se prevé que obtendrá resultados académicos extraordinarios.
        `;
    } else if (predictionValue >= 80) {
        interpretation = `
            <strong>Rendimiento muy bueno (${prediction}/100)</strong><br>
            El estudiante muestra una comprensión sólida de los contenidos y está bien 
            preparado académicamente. Se espera que tenga buenos resultados.
        `;
    } else if (predictionValue >= 70) {
        interpretation = `
            <strong>Rendimiento adecuado (${prediction}/100)</strong><br>
            El estudiante tiene una comprensión satisfactoria de los contenidos. 
            Hay espacio para mejorar, pero los resultados deberían ser aceptables.
        `;
    } else if (predictionValue >= 60) {
        interpretation = `
            <strong>Rendimiento suficiente (${prediction}/100)</strong><br>
            El estudiante tiene una comprensión básica pero podría beneficiarse de 
            reforzar ciertos aspectos de su preparación académica.
        `;
    } else {
        interpretation = `
            <strong>Rendimiento por debajo de lo esperado (${prediction}/100)</strong><br>
            El estudiante puede enfrentar dificultades académicas. Se recomienda 
            incrementar las horas de estudio y la práctica de exámenes, además de 
            asegurar un descanso adecuado.
        `;
    }
    
    interpretationElement.innerHTML = interpretation;
}