// Game Configuration
const CONFIG = {
    ROWS: 5,
    COLS: 9,
    CELL_WIDTH: 80,
    CELL_HEIGHT: 100,
    ZOMBIE_SPEED: 0.3,
    PROJECTILE_SPEED: 5,
    SUN_FALL_SPEED: 1,
    STARTING_SUN: 150,
    ZOMBIE_SPAWN_INTERVAL: 8000,
    SUN_DROP_INTERVAL: 10000,
};

// Plant Types
const PLANT_TYPES = {
    sunflower: {
        icon: '🌻',
        cost: 50,
        health: 100,
        cooldown: 24000,
        produce: () => ({ type: 'sun', amount: 25 })
    },
    peashooter: {
        icon: '🌱',
        cost: 100,
        health: 100,
        cooldown: 1500,
        shoot: () => ({ damage: 20, icon: '🟢', type: 'normal' })
    },
    wallnut: {
        icon: '🥜',
        cost: 50,
        health: 400,
        cooldown: null
    },
    snowpea: {
        icon: '❄️',
        cost: 175,
        health: 100,
        cooldown: 1500,
        shoot: () => ({ damage: 20, icon: '❄️', type: 'ice' })
    },
    cherrybomb: {
        icon: '💣',
        cost: 150,
        health: 100,
        cooldown: 3000,
        explode: () => ({ damage: 1800, radius: 1 })
    }
};

// Zombie Types
const ZOMBIE_TYPES = {
    normal: { icon: '🧟', health: 100, damage: 50, speed: 0.3 },
    cone: { icon: '🧟‍♂️', health: 200, damage: 50, speed: 0.3 },
    bucket: { icon: '🧟‍♀️', health: 350, damage: 50, speed: 0.25 }
};

// Game State
class Game {
    constructor() {
        this.suns = CONFIG.STARTING_SUN;
        this.score = 0;
        this.wave = 1;
        this.plants = [];
        this.zombies = [];
        this.projectiles = [];
        this.suns_falling = [];
        this.selectedPlant = null;
        this.shovelMode = false;
        this.gameOver = false;
        this.zombiesKilled = 0;
        this.init();
    }

    init() {
        this.createBoard();
        this.setupPlantSelector();
        this.startGameLoop();
        this.startSunDrops();
        this.startZombieWaves();
        this.setupRestart();
        this.updateUI();
    }

    createBoard() {
        const board = document.getElementById('gameBoard');
        board.innerHTML = '';

        for (let row = 0; row < CONFIG.ROWS; row++) {
            for (let col = 0; col < CONFIG.COLS; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.addEventListener('click', (e) => this.handleCellClick(e));
                board.appendChild(cell);
            }
        }
    }

    setupPlantSelector() {
        const plantCards = document.querySelectorAll('.plant-card');
        plantCards.forEach(card => {
            card.addEventListener('click', () => {
                if (!card.classList.contains('disabled')) {
                    this.shovelMode = false;
                    document.getElementById('shovelBtn').classList.remove('selected');
                    plantCards.forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                    this.selectedPlant = card.dataset.plant;
                }
            });
        });

        document.getElementById('shovelBtn').addEventListener('click', () => {
            this.selectedPlant = null;
            plantCards.forEach(c => c.classList.remove('selected'));
            this.shovelMode = !this.shovelMode;
            document.getElementById('shovelBtn').classList.toggle('selected');
        });
    }

    handleCellClick(e) {
        const cell = e.currentTarget;
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);

        if (this.shovelMode) {
            this.removePlant(row, col);
            return;
        }

        if (this.selectedPlant) {
            this.placePlant(row, col, this.selectedPlant);
        }
    }

    placePlant(row, col, type) {
        const plantConfig = PLANT_TYPES[type];

        if (this.suns < plantConfig.cost) {
            return;
        }

        if (this.plants.some(p => p.row === row && p.col === col)) {
            return;
        }

        this.suns -= plantConfig.cost;

        const plant = {
            type,
            row,
            col,
            health: plantConfig.health,
            maxHealth: plantConfig.health,
            lastAction: Date.now(),
            element: null
        };

        this.plants.push(plant);
        this.renderPlant(plant);
        this.updateUI();

        // Cherry bomb explodes immediately
        if (type === 'cherrybomb') {
            setTimeout(() => this.explodeCherryBomb(plant), 500);
        }
    }

    removePlant(row, col) {
        const plantIndex = this.plants.findIndex(p => p.row === row && p.col === col);
        if (plantIndex !== -1) {
            const plant = this.plants[plantIndex];
            if (plant.element) {
                plant.element.remove();
            }
            this.plants.splice(plantIndex, 1);
        }
    }

    renderPlant(plant) {
        const plantConfig = PLANT_TYPES[plant.type];
        const cell = document.querySelector(`[data-row="${plant.row}"][data-col="${plant.col}"]`);

        const plantEl = document.createElement('div');
        plantEl.className = 'plant';
        plantEl.innerHTML = plantConfig.icon;

        const healthBar = document.createElement('div');
        healthBar.className = 'plant-health';
        healthBar.textContent = plant.health;
        plantEl.appendChild(healthBar);

        cell.appendChild(plantEl);
        plant.element = plantEl;
    }

    explodeCherryBomb(plant) {
        const config = PLANT_TYPES.cherrybomb.explode();

        // Create explosion visual
        const explosion = document.createElement('div');
        explosion.className = 'explosion';
        explosion.innerHTML = '💥';
        explosion.style.left = `${plant.col * (CONFIG.CELL_WIDTH + 5) + CONFIG.CELL_WIDTH / 2}px`;
        explosion.style.top = `${plant.row * (CONFIG.CELL_HEIGHT + 5) + CONFIG.CELL_HEIGHT / 2}px`;
        document.getElementById('gameBoard').appendChild(explosion);

        setTimeout(() => explosion.remove(), 500);

        // Damage zombies in radius
        this.zombies.forEach(zombie => {
            const rowDiff = Math.abs(zombie.row - plant.row);
            const colDiff = Math.abs(Math.floor(zombie.position / CONFIG.CELL_WIDTH) - plant.col);

            if (rowDiff <= config.radius && colDiff <= config.radius) {
                zombie.health -= config.damage;
            }
        });

        // Remove the cherry bomb
        this.removePlant(plant.row, plant.col);
    }

    spawnZombie() {
        if (this.gameOver) return;

        const row = Math.floor(Math.random() * CONFIG.ROWS);
        const types = Object.keys(ZOMBIE_TYPES);
        const typeIndex = Math.min(Math.floor(this.wave / 2), types.length - 1);
        const zombieType = types[Math.floor(Math.random() * (typeIndex + 1))];
        const config = ZOMBIE_TYPES[zombieType];

        const zombie = {
            type: zombieType,
            row,
            position: CONFIG.COLS * CONFIG.CELL_WIDTH,
            health: config.health,
            maxHealth: config.health,
            damage: config.damage,
            speed: config.speed,
            slowed: false,
            eating: false,
            element: null
        };

        this.zombies.push(zombie);
        this.renderZombie(zombie);
    }

    renderZombie(zombie) {
        const config = ZOMBIE_TYPES[zombie.type];
        const zombieEl = document.createElement('div');
        zombieEl.className = 'zombie';
        zombieEl.innerHTML = config.icon;
        zombieEl.style.left = `${zombie.position}px`;
        zombieEl.style.top = `${zombie.row * (CONFIG.CELL_HEIGHT + 5)}px`;

        const healthBar = document.createElement('div');
        healthBar.className = 'zombie-health';
        healthBar.textContent = zombie.health;
        zombieEl.appendChild(healthBar);

        document.getElementById('gameBoard').appendChild(zombieEl);
        zombie.element = zombieEl;
    }

    updateZombies() {
        this.zombies.forEach(zombie => {
            if (zombie.health <= 0) {
                if (zombie.element) zombie.element.remove();
                this.zombies.splice(this.zombies.indexOf(zombie), 1);
                this.zombiesKilled++;
                this.score += 10;
                this.updateUI();
                return;
            }

            // Check if zombie is eating a plant
            const col = Math.floor(zombie.position / CONFIG.CELL_WIDTH);
            const plant = this.plants.find(p => p.row === zombie.row && p.col === col);

            if (plant && zombie.position <= col * CONFIG.CELL_WIDTH + CONFIG.CELL_WIDTH / 2) {
                zombie.eating = true;
                // Damage plant every second
                if (!zombie.lastBite || Date.now() - zombie.lastBite > 1000) {
                    plant.health -= zombie.damage;
                    zombie.lastBite = Date.now();

                    if (plant.health <= 0) {
                        this.removePlant(plant.row, plant.col);
                        zombie.eating = false;
                    } else if (plant.element) {
                        const healthBar = plant.element.querySelector('.plant-health');
                        if (healthBar) healthBar.textContent = plant.health;
                    }
                }
            } else {
                zombie.eating = false;
                const speed = zombie.slowed ? zombie.speed * 0.5 : zombie.speed;
                zombie.position -= speed;
            }

            // Reset slow effect
            if (zombie.slowed && Date.now() - zombie.slowedTime > 3000) {
                zombie.slowed = false;
            }

            // Check if zombie reached the house
            if (zombie.position <= -50) {
                this.endGame(false);
                return;
            }

            if (zombie.element) {
                zombie.element.style.left = `${zombie.position}px`;
                const healthBar = zombie.element.querySelector('.zombie-health');
                if (healthBar) healthBar.textContent = Math.ceil(zombie.health);

                if (zombie.slowed) {
                    zombie.element.style.filter = 'hue-rotate(180deg)';
                }
            }
        });
    }

    updatePlants() {
        this.plants.forEach(plant => {
            const config = PLANT_TYPES[plant.type];
            const now = Date.now();

            // Sunflower produces suns
            if (plant.type === 'sunflower' && config.produce) {
                if (now - plant.lastAction > config.cooldown) {
                    plant.lastAction = now;
                    this.createSunFromPlant(plant);
                }
            }

            // Shooters shoot projectiles
            if ((plant.type === 'peashooter' || plant.type === 'snowpea') && config.shoot) {
                if (now - plant.lastAction > config.cooldown) {
                    // Check if there's a zombie in this row
                    const zombieInRow = this.zombies.some(z => z.row === plant.row);
                    if (zombieInRow) {
                        plant.lastAction = now;
                        this.shootProjectile(plant);
                    }
                }
            }

            // Update health display
            if (plant.element) {
                const healthBar = plant.element.querySelector('.plant-health');
                if (healthBar) {
                    healthBar.textContent = plant.health;
                    const healthPercent = plant.health / plant.maxHealth;
                    if (healthPercent < 0.3) {
                        healthBar.style.color = '#f00';
                    } else if (healthPercent < 0.6) {
                        healthBar.style.color = '#ff0';
                    }
                }
            }
        });
    }

    shootProjectile(plant) {
        const config = PLANT_TYPES[plant.type].shoot();

        const projectile = {
            row: plant.row,
            position: (plant.col + 0.5) * CONFIG.CELL_WIDTH,
            damage: config.damage,
            icon: config.icon,
            type: config.type,
            element: null
        };

        this.projectiles.push(projectile);
        this.renderProjectile(projectile);
    }

    renderProjectile(projectile) {
        const projEl = document.createElement('div');
        projEl.className = 'projectile';
        projEl.innerHTML = projectile.icon;
        projEl.style.left = `${projectile.position}px`;
        projEl.style.top = `${projectile.row * (CONFIG.CELL_HEIGHT + 5) + CONFIG.CELL_HEIGHT / 2 - 10}px`;

        document.getElementById('gameBoard').appendChild(projEl);
        projectile.element = projEl;
    }

    updateProjectiles() {
        this.projectiles.forEach(projectile => {
            projectile.position += CONFIG.PROJECTILE_SPEED;

            // Check collision with zombies
            const hitZombie = this.zombies.find(z => {
                return z.row === projectile.row &&
                       Math.abs(z.position - projectile.position) < 30;
            });

            if (hitZombie) {
                hitZombie.health -= projectile.damage;

                if (projectile.type === 'ice') {
                    hitZombie.slowed = true;
                    hitZombie.slowedTime = Date.now();
                }

                if (projectile.element) projectile.element.remove();
                this.projectiles.splice(this.projectiles.indexOf(projectile), 1);
                return;
            }

            // Remove if off screen
            if (projectile.position > CONFIG.COLS * CONFIG.CELL_WIDTH + 50) {
                if (projectile.element) projectile.element.remove();
                this.projectiles.splice(this.projectiles.indexOf(projectile), 1);
                return;
            }

            if (projectile.element) {
                projectile.element.style.left = `${projectile.position}px`;
            }
        });
    }

    createSunFromPlant(plant) {
        const sun = {
            x: plant.col * (CONFIG.CELL_WIDTH + 5) + CONFIG.CELL_WIDTH / 2,
            y: plant.row * (CONFIG.CELL_HEIGHT + 5) + CONFIG.CELL_HEIGHT / 2,
            value: 25,
            element: null
        };

        this.suns_falling.push(sun);
        this.renderSun(sun);
    }

    dropSunFromSky() {
        if (this.gameOver) return;

        const sun = {
            x: Math.random() * (CONFIG.COLS * (CONFIG.CELL_WIDTH + 5) - 60),
            y: -60,
            targetY: Math.random() * (CONFIG.ROWS * (CONFIG.CELL_HEIGHT + 5) - 100),
            value: 25,
            falling: true,
            element: null
        };

        this.suns_falling.push(sun);
        this.renderSun(sun);
    }

    renderSun(sun) {
        const sunEl = document.createElement('div');
        sunEl.className = 'sun';
        sunEl.innerHTML = '☀️';
        sunEl.style.left = `${sun.x}px`;
        sunEl.style.top = `${sun.y}px`;

        sunEl.addEventListener('click', () => {
            this.collectSun(sun);
        });

        document.getElementById('gameBoard').appendChild(sunEl);
        sun.element = sunEl;

        // Auto-disappear after 10 seconds
        setTimeout(() => {
            if (this.suns_falling.includes(sun)) {
                if (sun.element) sun.element.remove();
                this.suns_falling.splice(this.suns_falling.indexOf(sun), 1);
            }
        }, 10000);
    }

    updateSuns() {
        this.suns_falling.forEach(sun => {
            if (sun.falling && sun.y < sun.targetY) {
                sun.y += CONFIG.SUN_FALL_SPEED;
                if (sun.element) {
                    sun.element.style.top = `${sun.y}px`;
                }
            }
        });
    }

    collectSun(sun) {
        this.suns += sun.value;
        this.score += 5;
        if (sun.element) sun.element.remove();
        this.suns_falling.splice(this.suns_falling.indexOf(sun), 1);
        this.updateUI();
    }

    updateUI() {
        document.getElementById('sunCount').textContent = this.suns;
        document.getElementById('waveNumber').textContent = this.wave;
        document.getElementById('score').textContent = this.score;

        // Update plant card availability
        document.querySelectorAll('.plant-card').forEach(card => {
            const cost = parseInt(card.dataset.cost);
            if (this.suns >= cost) {
                card.classList.remove('disabled');
            } else {
                card.classList.add('disabled');
            }
        });
    }

    startGameLoop() {
        this.gameLoopInterval = setInterval(() => {
            if (!this.gameOver) {
                this.updatePlants();
                this.updateZombies();
                this.updateProjectiles();
                this.updateSuns();
            }
        }, 50);
    }

    startSunDrops() {
        this.sunDropInterval = setInterval(() => {
            this.dropSunFromSky();
        }, CONFIG.SUN_DROP_INTERVAL);
    }

    startZombieWaves() {
        let zombieCount = 0;
        const maxZombiesPerWave = 5 + this.wave * 2;

        this.zombieSpawnInterval = setInterval(() => {
            if (this.gameOver) return;

            this.spawnZombie();
            zombieCount++;

            if (zombieCount >= maxZombiesPerWave) {
                clearInterval(this.zombieSpawnInterval);

                // Start next wave after delay
                setTimeout(() => {
                    if (!this.gameOver) {
                        this.wave++;
                        this.updateUI();
                        zombieCount = 0;
                        this.startZombieWaves();
                    }
                }, 15000);
            }
        }, CONFIG.ZOMBIE_SPAWN_INTERVAL / (1 + this.wave * 0.1));
    }

    endGame(won) {
        this.gameOver = true;
        clearInterval(this.gameLoopInterval);
        clearInterval(this.sunDropInterval);
        clearInterval(this.zombieSpawnInterval);

        const gameOverEl = document.getElementById('gameOver');
        const titleEl = document.getElementById('gameOverTitle');
        const messageEl = document.getElementById('gameOverMessage');

        if (won) {
            titleEl.textContent = '¡Victoria!';
            titleEl.style.color = '#FFD700';
            messageEl.textContent = `Has completado la oleada ${this.wave}. Puntuación: ${this.score}`;
        } else {
            titleEl.textContent = 'Game Over';
            titleEl.style.color = '#FF4444';
            messageEl.textContent = `Los zombies llegaron a tu casa. Oleada: ${this.wave}, Puntos: ${this.score}`;
        }

        gameOverEl.classList.remove('hidden');
    }

    setupRestart() {
        document.getElementById('restartBtn').addEventListener('click', () => {
            location.reload();
        });
    }
}

// Start the game when page loads
window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
