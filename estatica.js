// === EFECTO DE ESTÁTICA / RUIDO (Como en Nier) ===
function crearEfectoEstatica() {
    // 1. Crear un elemento canvas que cubra toda la pantalla
    const canvas = document.createElement('canvas');
    canvas.id = 'staticCanvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '9999'; // Por encima de todo
    canvas.style.pointerEvents = 'none'; // Para que no bloquee los clics
    canvas.style.opacity = '0.08'; // Muy sutil, se puede ajustar
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function generarEstatica() {
        const imageData = ctx.createImageData(canvas.width, canvas.height);
        const data = imageData.data;

        // Recorremos cada píxel y le asignamos un valor aleatorio en blanco y negro
        for (let i = 0; i < data.length; i += 4) {
            // Valor de gris (0-255) completamente aleatorio
            const value = Math.random() * 255;
            data[i] = value;     // Rojo
            data[i+1] = value;   // Verde
            data[i+2] = value;   // Azul
            // El canal Alfa (transparencia) lo dejamos a 255 para que sea opaco,
            // pero como la opacidad del canvas es 0.08, se ve muy sutil.
            data[i+3] = 255;     
        }

        ctx.putImageData(imageData, 0, 0);
        requestAnimationFrame(generarEstatica);
    }

    generarEstatica();
}

// Ejecutar la función para crear el efecto
crearEfectoEstatica();

// En tu script.js, añade esto al fondo
function createGrid() {
    const gridHelper = new THREE.GridHelper(20, 20, 0x00aaff, 0x004466);
    gridHelper.position.y = -2;
    scene.add(gridHelper);

    // Puntos en la cuadrícula
    const pointsGeometry = new THREE.BufferGeometry();
    const pointsCount = 400;
    const positions = new Float32Array(pointsCount * 3);
    for (let i = 0; i < pointsCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 30;
        positions[i] = Math.floor(positions[i] / 2) * 2; // Alinear a la cuadrícula
    }
    pointsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const pointsMaterial = new THREE.PointsMaterial({
        color: 0x00aaff,
        size: 0.05,
        transparent: true,
        opacity: 0.6,
    });
    const points = new THREE.Points(pointsGeometry, pointsMaterial);
    scene.add(points);
}