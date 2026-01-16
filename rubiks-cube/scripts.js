// scripts.js - 3D Rubik's Cube Simulation

// Three.js setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(10, 10, 5);
scene.add(directionalLight);

// Cube group
const cubeGroup = new THREE.Group();
scene.add(cubeGroup);

// Colors for each face of the cube
const colors = {
    front: 0x00ff00, // green
    back: 0x0000ff,  // blue
    left: 0xff0000,  // red
    right: 0xffa500, // orange
    top: 0xffffff,   // white
    bottom: 0xffff00 // yellow
};

// Create 27 cubelets (3x3x3 grid) with colored faces
const cubelets = [];
for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
            const geometry = new THREE.BoxGeometry(0.95, 0.95, 0.95); // Slightly smaller to show gaps
            const materials = [
                new THREE.MeshLambertMaterial({ color: x === 1 ? colors.right : 0x000000 }), // Right face
                new THREE.MeshLambertMaterial({ color: x === -1 ? colors.left : 0x000000 }), // Left face
                new THREE.MeshLambertMaterial({ color: y === 1 ? colors.top : 0x000000 }), // Top face
                new THREE.MeshLambertMaterial({ color: y === -1 ? colors.bottom : 0x000000 }), // Bottom face
                new THREE.MeshLambertMaterial({ color: z === 1 ? colors.front : 0x000000 }), // Front face
                new THREE.MeshLambertMaterial({ color: z === -1 ? colors.back : 0x000000 }) // Back face
            ];
            const cubelet = new THREE.Mesh(geometry, materials);
            cubelet.position.set(x, y, z);
            cubelet.userData = { x, y, z }; // Store original position for move logic
            cubeGroup.add(cubelet);
            cubelets.push(cubelet);
        }
    }
}

// Mouse controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
camera.position.set(5, 5, 5);
controls.update();

// Animation variables
let isAnimating = false;
let animationQueue = [];
let paused = false;

// Move definitions (face turns with axis, layer, and angle)
const moves = {
    R: { axis: 'x', layer: 1, angle: Math.PI / 2 },     // Right face clockwise
    Ri: { axis: 'x', layer: 1, angle: -Math.PI / 2 },   // Right face counterclockwise
    L: { axis: 'x', layer: -1, angle: -Math.PI / 2 },   // Left face clockwise
    Li: { axis: 'x', layer: -1, angle: Math.PI / 2 },   // Left face counterclockwise
    U: { axis: 'y', layer: 1, angle: Math.PI / 2 },     // Top face clockwise
    Ui: { axis: 'y', layer: 1, angle: -Math.PI / 2 },   // Top face counterclockwise
    D: { axis: 'y', layer: -1, angle: -Math.PI / 2 },   // Bottom face clockwise
    Di: { axis: 'y', layer: -1, angle: Math.PI / 2 },   // Bottom face counterclockwise
    F: { axis: 'z', layer: 1, angle: Math.PI / 2 },     // Front face clockwise
    Fi: { axis: 'z', layer: 1, angle: -Math.PI / 2 },   // Front face counterclockwise
    B: { axis: 'z', layer: -1, angle: -Math.PI / 2 },   // Back face clockwise
    Bi: { axis: 'z', layer: -1, angle: Math.PI / 2 }    // Back face counterclockwise
};

// Function to perform a move
function performMove(moveName, animate = true) {
    const move = moves[moveName];
    if (!move) return;

    const axis = move.axis;
    const layer = move.layer;
    const angle = move.angle;

    // Find cubelets to rotate
    const toRotate = cubelets.filter(c => c.userData[axis] === layer);

    if (animate) {
        animationQueue.push({ toRotate, axis, angle });
    } else {
        // Instant move
        toRotate.forEach(cubelet => {
            cubelet.rotateOnWorldAxis(new THREE.Vector3(axis === 'x' ? 1 : 0, axis === 'y' ? 1 : 0, axis === 'z' ? 1 : 0), angle);
            // Update positions
            const pos = cubelet.position.clone();
            pos.applyAxisAngle(new THREE.Vector3(axis === 'x' ? 1 : 0, axis === 'y' ? 1 : 0, axis === 'z' ? 1 : 0), angle);
            cubelet.position.copy(pos);
            // Update userData
            const newPos = cubelet.userData;
            if (axis === 'x') {
                [newPos.y, newPos.z] = [newPos.z, -newPos.y];
            } else if (axis === 'y') {
                [newPos.x, newPos.z] = [newPos.z, -newPos.x];
            } else if (axis === 'z') {
                [newPos.x, newPos.y] = [newPos.y, -newPos.x];
            }
        });
    }
}

// Scramble function
function scramble() {
    const moveNames = Object.keys(moves);
    for (let i = 0; i < 20; i++) {
        const randomMove = moveNames[Math.floor(Math.random() * moveNames.length)];
        performMove(randomMove);
    }
}

// Simple solve sequence (hardcoded for demo)
const solveSequence = ['R', 'U', 'Ri', 'Ui', 'R', 'U', 'Ri', 'Ui']; // Example beginner moves
function solve() {
    solveSequence.forEach(move => performMove(move));
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    if (!paused && animationQueue.length > 0 && !isAnimating) {
        isAnimating = true;
        const { toRotate, axis, angle } = animationQueue.shift();
        const group = new THREE.Group();
        toRotate.forEach(c => {
            group.add(c);
        });
        cubeGroup.add(group);
        const rotationAxis = new THREE.Vector3(axis === 'x' ? 1 : 0, axis === 'y' ? 1 : 0, axis === 'z' ? 1 : 0);
        const startTime = Date.now();
        const duration = 500; // ms

        function rotate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const currentAngle = angle * progress;
            group.setRotationFromAxisAngle(rotationAxis, currentAngle);

            if (progress < 1) {
                requestAnimationFrame(rotate);
            } else {
                // Finalize
                group.setRotationFromAxisAngle(rotationAxis, angle);
                toRotate.forEach(cubelet => {
                    const worldPos = new THREE.Vector3();
                    cubelet.getWorldPosition(worldPos);
                    cubelet.position.copy(worldPos);
                    cubelet.rotation.set(0, 0, 0); // reset
                    group.remove(cubelet);
                    cubeGroup.add(cubelet);
                    // Update userData
                    const newPos = cubelet.userData;
                    if (axis === 'x') {
                        if (angle > 0) {
                            [newPos.y, newPos.z] = [newPos.z, -newPos.y];
                        } else {
                            [newPos.y, newPos.z] = [-newPos.z, newPos.y];
                        }
                    } else if (axis === 'y') {
                        if (angle > 0) {
                            [newPos.x, newPos.z] = [newPos.z, -newPos.x];
                        } else {
                            [newPos.x, newPos.z] = [-newPos.z, newPos.x];
                        }
                    } else if (axis === 'z') {
                        if (angle > 0) {
                            [newPos.x, newPos.y] = [newPos.y, -newPos.x];
                        } else {
                            [newPos.x, newPos.y] = [-newPos.y, newPos.x];
                        }
                    }
                });
                cubeGroup.remove(group);
                isAnimating = false;
            }
        }
        rotate();
    }

    controls.update();
    renderer.render(scene, camera);
}

// UI event listeners
document.getElementById('scramble').addEventListener('click', scramble);
document.getElementById('solve').addEventListener('click', solve);
document.getElementById('pause').addEventListener('click', () => paused = !paused);
document.getElementById('step').addEventListener('click', () => {
    if (animationQueue.length > 0) {
        paused = false;
    }
});
document.getElementById('reset').addEventListener('click', () => {
    // Reset cube (simplified)
    cubelets.forEach(cubelet => {
        cubelet.rotation.set(0, 0, 0);
        cubelet.position.set(cubelet.userData.x, cubelet.userData.y, cubelet.userData.z);
    });
    animationQueue = [];
});

// Start animation
animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});