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
    const numericInputs = inputs.map(val => parseFloat(val));
    
    // Extract feature names and their scaling parameters
    const features = modelInfo.feature_names;
    const means = modelInfo.scaling_means;
    const stds = modelInfo.scaling_stds;
    
    // Scale the inputs: (input - mean) / std
    const scaledInputs = numericInputs.map((val, i) => (val - means[i]) / stds[i]);
    
    // Apply the feature importances (weights)
    let prediction = 0;
    for (let i = 0; i < features.length; i++) {
        const featureName = features[i];
        const importance = modelInfo.feature_importances[featureName];
        prediction += scaledInputs[i] * importance;
    }
    
    // Convert prediction to a 0-100 scale
    // Assuming the base prediction is around 70 with adjustments from feature impacts
    let finalPrediction = 70 + prediction;
    
    // Ensure prediction stays within 0-100 range
    finalPrediction = Math.min(Math.max(finalPrediction, 0), 100);
    
    // Return rounded to 1 decimal place
    return finalPrediction.toFixed(1);
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
    
    if (predictionValue >= 74) {
        gaugeImage.src = 'gauge-green.png'; // Green gauge
        gaugeImage.alt = 'Excelente rendimiento';
    } else if (predictionValue >= 60) {
        gaugeImage.src = 'gauge-yellow.png'; // Yellow gauge
        gaugeImage.alt = 'Buen rendimiento';
    } else {
        gaugeImage.src = 'gauge-red.png'; // Red gauge
        gaugeImage.alt = 'Rendimiento bajo';
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