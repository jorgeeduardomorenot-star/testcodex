// Matter.js module aliases
const { Engine, Render, Runner, World, Bodies, Body, Mouse, MouseConstraint, Events, Composite, Constraint } = Matter;

// Game state
let engine, render, runner, world;
let canvas;
let candy, omNom;
let ropes = [];
let stars = [];
let collectedStars = 0;
let currentLevel = 1;
let gameWon = false;
let candyFed = false;

// Mouse tracking for rope cutting
let isMouseDown = false;
let mouseStartPos = { x: 0, y: 0 };
let mouseEndPos = { x: 0, y: 0 };

// Canvas dimensions
const canvasWidth = 700;
const canvasHeight = 500;

// Initialize the game
function init() {
    canvas = document.getElementById('gameCanvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Create engine
    engine = Engine.create();
    world = engine.world;
    world.gravity.y = 1;

    // Create renderer
    render = Render.create({
        canvas: canvas,
        engine: engine,
        options: {
            width: canvasWidth,
            height: canvasHeight,
            wireframes: false,
            background: 'transparent'
        }
    });

    Render.run(render);

    // Create runner
    runner = Runner.create();
    Runner.run(runner, engine);

    // Setup mouse controls for cutting
    setupMouseControls();

    // Load first level
    loadLevel(currentLevel);

    // Setup button events
    document.getElementById('restartBtn').addEventListener('click', restartLevel);
    document.getElementById('nextBtn').addEventListener('click', nextLevel);

    // Collision detection
    Events.on(engine, 'collisionStart', handleCollisions);

    // Game loop
    requestAnimationFrame(gameLoop);
}

function setupMouseControls() {
    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        isMouseDown = true;
        mouseStartPos = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    });

    canvas.addEventListener('mousemove', (e) => {
        if (isMouseDown) {
            const rect = canvas.getBoundingClientRect();
            mouseEndPos = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        }
    });

    canvas.addEventListener('mouseup', () => {
        if (isMouseDown) {
            checkRopeCut();
        }
        isMouseDown = false;
    });

    // Touch support
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        isMouseDown = true;
        mouseStartPos = {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
        };
    });

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (isMouseDown) {
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            mouseEndPos = {
                x: touch.clientX - rect.left,
                y: touch.clientY - rect.top
            };
        }
    });

    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (isMouseDown) {
            checkRopeCut();
        }
        isMouseDown = false;
    });
}

function checkRopeCut() {
    ropes.forEach((rope, index) => {
        if (rope.constraint && lineIntersectsConstraint(mouseStartPos, mouseEndPos, rope)) {
            World.remove(world, rope.constraint);
            rope.constraint = null;
            ropes.splice(index, 1);
        }
    });
}

function lineIntersectsConstraint(p1, p2, rope) {
    if (!rope.constraint || !rope.constraint.bodyA || !rope.constraint.bodyB) return false;

    const r1 = rope.constraint.bodyA.position;
    const r2 = rope.constraint.bodyB.position;

    // Check if lines intersect
    return lineIntersect(p1, p2, r1, r2);
}

function lineIntersect(p1, p2, p3, p4) {
    const s1_x = p2.x - p1.x;
    const s1_y = p2.y - p1.y;
    const s2_x = p4.x - p3.x;
    const s2_y = p4.y - p3.y;

    const s = (-s1_y * (p1.x - p3.x) + s1_x * (p1.y - p3.y)) / (-s2_x * s1_y + s1_x * s2_y);
    const t = (s2_x * (p1.y - p3.y) - s2_y * (p1.x - p3.x)) / (-s2_x * s1_y + s1_x * s2_y);

    return (s >= 0 && s <= 1 && t >= 0 && t <= 1);
}

function loadLevel(level) {
    // Clear existing objects
    World.clear(world, false);
    ropes = [];
    stars = [];
    collectedStars = 0;
    gameWon = false;
    candyFed = false;

    // Update UI
    document.getElementById('level').textContent = level;
    document.getElementById('nextBtn').disabled = true;
    updateStarDisplay();

    // Create walls
    const wallThickness = 50;
    const ground = Bodies.rectangle(canvasWidth / 2, canvasHeight + 25, canvasWidth, wallThickness, {
        isStatic: true,
        render: { fillStyle: '#8b4513' }
    });
    const leftWall = Bodies.rectangle(-25, canvasHeight / 2, wallThickness, canvasHeight, {
        isStatic: true,
        render: { fillStyle: '#8b4513' }
    });
    const rightWall = Bodies.rectangle(canvasWidth + 25, canvasHeight / 2, wallThickness, canvasHeight, {
        isStatic: true,
        render: { fillStyle: '#8b4513' }
    });

    World.add(world, [ground, leftWall, rightWall]);

    // Create Om Nom (the character to feed)
    omNom = Bodies.rectangle(canvasWidth / 2, canvasHeight - 60, 80, 60, {
        isStatic: true,
        isSensor: true,
        render: {
            fillStyle: '#4CAF50',
            sprite: {
                texture: null
            }
        },
        label: 'omNom'
    });
    World.add(world, omNom);

    // Create candy
    candy = Bodies.circle(canvasWidth / 2, 100, 20, {
        density: 0.04,
        restitution: 0.3,
        friction: 0.1,
        render: {
            fillStyle: '#FF69B4'
        },
        label: 'candy'
    });
    World.add(world, candy);

    // Level-specific configurations
    if (level === 1) {
        // Simple level with one rope
        const anchor = Bodies.circle(canvasWidth / 2, 50, 5, {
            isStatic: true,
            render: { fillStyle: '#333' }
        });
        World.add(world, anchor);

        const rope = Constraint.create({
            bodyA: anchor,
            bodyB: candy,
            length: 50,
            stiffness: 0.9,
            render: {
                strokeStyle: '#8B4513',
                lineWidth: 3
            }
        });
        World.add(world, rope);
        ropes.push({ constraint: rope });

        // Add stars
        createStar(canvasWidth / 2 - 80, 200);
        createStar(canvasWidth / 2, 250);
        createStar(canvasWidth / 2 + 80, 200);

    } else if (level === 2) {
        // Two ropes in a V shape
        const anchor1 = Bodies.circle(canvasWidth / 2 - 100, 50, 5, {
            isStatic: true,
            render: { fillStyle: '#333' }
        });
        const anchor2 = Bodies.circle(canvasWidth / 2 + 100, 50, 5, {
            isStatic: true,
            render: { fillStyle: '#333' }
        });
        World.add(world, [anchor1, anchor2]);

        const rope1 = Constraint.create({
            bodyA: anchor1,
            bodyB: candy,
            stiffness: 0.9,
            render: {
                strokeStyle: '#8B4513',
                lineWidth: 3
            }
        });
        const rope2 = Constraint.create({
            bodyA: anchor2,
            bodyB: candy,
            stiffness: 0.9,
            render: {
                strokeStyle: '#8B4513',
                lineWidth: 3
            }
        });
        World.add(world, [rope1, rope2]);
        ropes.push({ constraint: rope1 }, { constraint: rope2 });

        // Add stars
        createStar(canvasWidth / 2 - 120, 180);
        createStar(canvasWidth / 2, 280);
        createStar(canvasWidth / 2 + 120, 180);

    } else if (level === 3) {
        // Level with obstacles
        const anchor = Bodies.circle(canvasWidth / 2, 50, 5, {
            isStatic: true,
            render: { fillStyle: '#333' }
        });
        World.add(world, anchor);

        const rope = Constraint.create({
            bodyA: anchor,
            bodyB: candy,
            length: 80,
            stiffness: 0.9,
            render: {
                strokeStyle: '#8B4513',
                lineWidth: 3
            }
        });
        World.add(world, rope);
        ropes.push({ constraint: rope });

        // Add obstacles
        const obstacle1 = Bodies.rectangle(canvasWidth / 2 - 100, 200, 100, 20, {
            isStatic: true,
            angle: Math.PI / 6,
            render: { fillStyle: '#795548' }
        });
        const obstacle2 = Bodies.rectangle(canvasWidth / 2 + 100, 200, 100, 20, {
            isStatic: true,
            angle: -Math.PI / 6,
            render: { fillStyle: '#795548' }
        });
        World.add(world, [obstacle1, obstacle2]);

        // Add stars
        createStar(canvasWidth / 2 - 150, 150);
        createStar(canvasWidth / 2, 300);
        createStar(canvasWidth / 2 + 150, 150);

    } else {
        // Random challenging level
        const anchor1 = Bodies.circle(canvasWidth / 2 - 80, 80, 5, {
            isStatic: true,
            render: { fillStyle: '#333' }
        });
        const anchor2 = Bodies.circle(canvasWidth / 2 + 80, 80, 5, {
            isStatic: true,
            render: { fillStyle: '#333' }
        });
        World.add(world, [anchor1, anchor2]);

        const rope1 = Constraint.create({
            bodyA: anchor1,
            bodyB: candy,
            stiffness: 0.9,
            render: {
                strokeStyle: '#8B4513',
                lineWidth: 3
            }
        });
        const rope2 = Constraint.create({
            bodyA: anchor2,
            bodyB: candy,
            stiffness: 0.9,
            render: {
                strokeStyle: '#8B4513',
                lineWidth: 3
            }
        });
        World.add(world, [rope1, rope2]);
        ropes.push({ constraint: rope1 }, { constraint: rope2 });

        // Add moving obstacles
        const platform = Bodies.rectangle(canvasWidth / 2, 250, 150, 20, {
            isStatic: true,
            render: { fillStyle: '#795548' }
        });
        World.add(world, platform);

        // Add stars
        createStar(canvasWidth / 2 - 140, 200);
        createStar(canvasWidth / 2, 320);
        createStar(canvasWidth / 2 + 140, 200);
    }
}

function createStar(x, y) {
    const star = Bodies.circle(x, y, 15, {
        isStatic: true,
        isSensor: true,
        render: {
            fillStyle: '#FFD700'
        },
        label: 'star'
    });
    World.add(world, star);
    stars.push({ body: star, collected: false });
}

function handleCollisions(event) {
    event.pairs.forEach(pair => {
        const { bodyA, bodyB } = pair;

        // Check if candy collected a star
        if ((bodyA.label === 'candy' && bodyB.label === 'star') ||
            (bodyB.label === 'candy' && bodyA.label === 'star')) {
            const starBody = bodyA.label === 'star' ? bodyA : bodyB;
            const star = stars.find(s => s.body === starBody && !s.collected);
            if (star) {
                star.collected = true;
                collectedStars++;
                World.remove(world, starBody);
                updateStarDisplay();
            }
        }

        // Check if candy reached Om Nom
        if ((bodyA.label === 'candy' && bodyB.label === 'omNom') ||
            (bodyB.label === 'candy' && bodyA.label === 'omNom')) {
            if (!candyFed) {
                candyFed = true;
                setTimeout(() => {
                    winLevel();
                }, 500);
            }
        }
    });
}

function updateStarDisplay() {
    for (let i = 1; i <= 3; i++) {
        const starElement = document.getElementById(`star${i}`);
        if (i <= collectedStars) {
            starElement.classList.add('collected');
            starElement.textContent = '★';
        } else {
            starElement.classList.remove('collected');
            starElement.textContent = '☆';
        }
    }
}

function winLevel() {
    if (gameWon) return;
    gameWon = true;
    document.getElementById('nextBtn').disabled = false;

    // Visual feedback
    const ctx = canvas.getContext('2d');
    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = 'rgba(76, 175, 80, 0.9)';
    ctx.textAlign = 'center';
    ctx.fillText('Level Complete!', canvasWidth / 2, canvasHeight / 2);
}

function restartLevel() {
    loadLevel(currentLevel);
}

function nextLevel() {
    currentLevel++;
    loadLevel(currentLevel);
}

function gameLoop() {
    // Draw cutting line
    if (isMouseDown) {
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(mouseStartPos.x, mouseStartPos.y);
        ctx.lineTo(mouseEndPos.x, mouseEndPos.y);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    requestAnimationFrame(gameLoop);
}

// Initialize game when page loads
window.addEventListener('load', init);
