class EventEmitter {
    constructor() {
        this.listeners = {};
    }
    on(message, listener) {
        if (!this.listeners[message]) {
            this.listeners[message] = [];
        }
        this.listeners[message].push(listener);
    }
    emit(message, payload = null) {
        if (this.listeners[message]) {
            this.listeners[message].forEach((l) => l(message, payload));
        }
    }
    clear() {
        this.listeners = {};
    }
}

const Messages = {
    KEY_EVENT_UP: "KEY_EVENT_UP",
    KEY_EVENT_DOWN: "KEY_EVENT_DOWN",
    KEY_EVENT_LEFT: "KEY_EVENT_LEFT",
    KEY_EVENT_RIGHT: "KEY_EVENT_RIGHT",
    KEY_EVENT_SPACE: "KEY_EVENT_SPACE",
    KEY_EVENT_ENTER: "KEY_EVENT_ENTER",
    COLLISION_ENEMY_LASER: "COLLISION_ENEMY_LASER",
    COLLISION_ENEMY_HERO: "COLLISION_ENEMY_HERO",
    GAME_END_LOSS: "GAME_END_LOSS",
    GAME_END_WIN: "GAME_END_WIN",
};

let heroImg,
    enemyImg,
    laserImg,
    explosionImg,
    lifeImg,
    starBackground,
    canvas,
    ctx,
    gameObjects = [],
    hero,
    gameLoopId,
    eventEmitter = new EventEmitter();

class GameObject {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.dead = false;
        this.type = "";
        this.width = 0;
        this.height = 0;
        this.img = undefined;
    }

    rectFromGameObject() {
        return {
            top: this.y,
            left: this.x,
            bottom: this.y + this.height,
            right: this.x + this.width,
        };
    }

    draw(ctx) {
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }
}

class Hero extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 99;
        this.height = 75;
        this.type = "Hero";
        this.cooldown = 0;
        this.life = 3;
        this.points = 0;
    }

    fire() {
        if (this.canFire()) {
            const laserX = this.x + this.width / 2 - 4.5;
            const laserY = this.y - 10;
            gameObjects.push(new Laser(laserX, laserY));
            this.cooldown = 500;
            let id = setInterval(() => {
                if (this.cooldown > 0) {
                    this.cooldown -= 100;
                } else {
                    clearInterval(id);
                }
            }, 100);
        }
    }

    canFire() {
        return this.cooldown === 0;
    }

    decrementLife() {
        this.life--;
        if (this.life === 0) {
            this.dead = true;
        }
    }

    incrementPoints() {
        this.points += 100;
    }
}

class Enemy extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 98;
        this.height = 50;
        this.type = "Enemy";
        let id = setInterval(() => {
            if (this.y < canvas.height - this.height) {
                this.y += 5;
            } else {
                clearInterval(id);
            }
        }, 300);
    }
}

class Laser extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 9;
        this.height = 33;
        this.type = "Laser";
        this.img = laserImg;
        let id = setInterval(() => {
            if (this.y > 0) {
                this.y -= 15;
            } else {
                this.dead = true;
                clearInterval(id);
            }
        }, 100);
    }
}

class CollisionEffect extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 98;
        this.height = 50;
        this.img = explosionImg;
        this.lifetime = 300;
        setTimeout(() => {
            this.dead = true;
        }, this.lifetime);
    }
}

function loadTexture(path) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = path;
        img.onload = () => {
            resolve(img);
        };
    });
}

let smallHeroes = [];

const mainHeroWidth = 90;
const mainHeroHeight = 90;

const smallHeroWidth = 45;
const smallHeroHeight = 45;

function createHero() {
    hero = new Hero(canvas.width / 2 - 45, canvas.height - canvas.height / 4);
    hero.img = heroImg;
    hero.width = mainHeroWidth;
    hero.height = mainHeroHeight;
    gameObjects.push(hero);

    const leftSmallHero = new Hero(
        canvas.width / 2 - mainHeroWidth / 2 - smallHeroWidth - 10,
        canvas.height - canvas.height / 4 + (smallHeroHeight * 3) / 4
    );
    const rightSmallHero = new Hero(
        canvas.width / 2 + mainHeroWidth / 2 + 10,
        canvas.height - canvas.height / 4 + (smallHeroHeight * 3) / 4
    );

    leftSmallHero.img = heroImg;
    rightSmallHero.img = heroImg;

    leftSmallHero.width = smallHeroWidth;
    leftSmallHero.height = smallHeroHeight;
    rightSmallHero.width = smallHeroWidth;
    rightSmallHero.height = smallHeroHeight;

    gameObjects.push(leftSmallHero);
    gameObjects.push(rightSmallHero);

    smallHeroes.push(leftSmallHero, rightSmallHero);
}

let autoAttackTimers = []; 

function startAutoAttack() {
    autoAttackTimers.forEach(clearInterval); 
    autoAttackTimers = []; 

    smallHeroes.forEach((smallHero) => {
        const timerId = setInterval(() => {
            if (!smallHero.dead) {
                smallHero.fire();
            }
        }, 1000);
        autoAttackTimers.push(timerId); 
    });
}


function createEnemies() {
    const MONSTER_TOTAL = 5;
    const MONSTER_WIDTH = MONSTER_TOTAL * 98;
    const START_X = (canvas.width - MONSTER_WIDTH) / 2;
    const STOP_X = START_X + MONSTER_WIDTH;
    for (let x = START_X; x < STOP_X; x += 98) {
        for (let y = 0; y < 50 * 5; y += 50) {
            const enemy = new Enemy(x, y);
            enemy.img = enemyImg;
            gameObjects.push(enemy);
        }
    }
}

function randomcreateEnemies() {
    const ENEMY_COUNT = 30; // 한 번에 생성할 적의 수 (조정 가능)

    for (let i = 0; i < ENEMY_COUNT; i++) {
        // 무작위 X 위치 (캔버스 너비 내)
        const x = Math.random() * (canvas.width - 98); // 적의 너비를 고려하여 범위 조정
        // 무작위 Y 위치 (화면 상단 외부에서 시작)
        const y = Math.random() * -canvas.height; // 적들이 화면 밖에서 내려오도록 설정

        // 적 객체 생성
        const enemy = new Enemy(x, y);
        enemy.img = enemyImg;

        // 게임 오브젝트 배열에 추가
        gameObjects.push(enemy);
    }
}


function intersectRect(r1, r2) {
    return !(
        r2.left > r1.right ||
        r2.right < r1.left ||
        r2.top > r1.bottom ||
        r2.bottom < r1.top
    );
}

function updateGameObjects() {
    const enemies = gameObjects.filter((go) => go.type === "Enemy" && !go.dead);
    const lasers = gameObjects.filter((go) => go.type === "Laser" && !go.dead);

    lasers.forEach((laser) => {
        enemies.forEach((enemy) => {
            if (intersectRect(laser.rectFromGameObject(), enemy.rectFromGameObject())) {
                eventEmitter.emit(Messages.COLLISION_ENEMY_LASER, {
                    first: laser,
                    second: enemy,
                });
            }
        });
    });

    enemies.forEach((enemy) => {
        const heroRect = hero.rectFromGameObject();
        if (intersectRect(heroRect, enemy.rectFromGameObject())) {
            eventEmitter.emit(Messages.COLLISION_ENEMY_HERO, { enemy });
        }
    });

    gameObjects = gameObjects.filter((go) => !go.dead);
}

function drawLife() {
    const START_POS = canvas.width - 180;
    for (let i = 0; i < hero.life; i++) {
        ctx.drawImage(lifeImg, START_POS + 45 * (i + 1), canvas.height - 37);
    }
}

function drawPoints() {
    ctx.font = "30px Arial";
    ctx.fillStyle = "red";
    ctx.textAlign = "left";
    ctx.fillText('Points:'+ hero.points, 10, canvas.height - 20);
}

function endGame(win) {
    clearInterval(gameLoopId);
    setTimeout(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = "30px Arial";
        ctx.fillStyle = win ? "green" : "red";
        ctx.textAlign = "center";
        ctx.fillText(
            win
                ? "Victory!!! Press [Enter] to start a new game"
                : "Game Over!!! Press [Enter] to restart",
            canvas.width / 2,
            canvas.height / 2
        );
    }, 200);
}

function resetGame() {
    if (gameLoopId) {
        clearInterval(gameLoopId); 
    }

    gameObjects = [];
    smallHeroes = [];

    eventEmitter.clear();

    initGame();
    startGameLoop();
}


function startGameLoop() {
    gameLoopId = setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = ctx.createPattern(starBackground, "repeat");
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawPoints();
        drawLife();
        updateGameObjects();
        gameObjects.forEach((go) => go.draw(ctx));
    }, 100);
}

function updateSmallHeroesPosition() {
    const offsetX = smallHeroWidth + 10; 
    const offsetY = (smallHeroHeight * 3) / 4; 

    smallHeroes[0].x = hero.x - offsetX;
    smallHeroes[0].y = hero.y + offsetY;

    smallHeroes[1].x = hero.x + hero.width + 10;
    smallHeroes[1].y = hero.y + offsetY;
}

function initGame() {
    gameObjects = []; 
    smallHeroes = []; 

    createEnemies();
    randomcreateEnemies(); 
    createHero(); 

    eventEmitter.on(Messages.KEY_EVENT_UP, () => {
        hero.y -= 5;
        updateSmallHeroesPosition();
    });
    eventEmitter.on(Messages.KEY_EVENT_DOWN, () => {
        hero.y += 5;
        updateSmallHeroesPosition();
    });
    eventEmitter.on(Messages.KEY_EVENT_LEFT, () => {
        hero.x -= 5;
        updateSmallHeroesPosition();
    });
    eventEmitter.on(Messages.KEY_EVENT_RIGHT, () => {
        hero.x += 5;
        updateSmallHeroesPosition();
    });
    eventEmitter.on(Messages.KEY_EVENT_SPACE, () => {
        if (hero.canFire()) hero.fire();
    });
    eventEmitter.on(Messages.KEY_EVENT_ENTER, resetGame);

    eventEmitter.on(Messages.COLLISION_ENEMY_LASER, (_, { first, second }) => {
        first.dead = true;
        second.dead = true;
        hero.incrementPoints();
        if (gameObjects.filter((go) => go.type === "Enemy" && !go.dead).length === 0) {
            eventEmitter.emit(Messages.GAME_END_WIN);
        }
        gameObjects.push(new CollisionEffect(second.x, second.y));
    });
    eventEmitter.on(Messages.COLLISION_ENEMY_HERO, (_, { enemy }) => {
        enemy.dead = true;
        hero.decrementLife();
        if (hero.life === 0) {
            eventEmitter.emit(Messages.GAME_END_LOSS);
        }
    });

    eventEmitter.on(Messages.GAME_END_WIN, () => endGame(true));
    eventEmitter.on(Messages.GAME_END_LOSS, () => endGame(false));

    startAutoAttack();
}

window.onload = async () => {
    canvas = document.getElementById("myCanvas");   
    ctx = canvas.getContext("2d");

    heroImg = await loadTexture("assets/player.png");
    enemyImg = await loadTexture("assets/enemyShip.png");
    laserImg = await loadTexture("assets/laserRed.png");
    explosionImg = await loadTexture("assets/laserGreenShot.png");
    lifeImg = await loadTexture("assets/life.png");
    starBackground = await loadTexture("assets/starBackground.png");

    initGame();
    startGameLoop();

    window.addEventListener("keydown", (e) => {

        const keysToPrevent = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"];
        if (keysToPrevent.includes(e.key)) e.preventDefault();

        if (e.code === "ArrowUp") eventEmitter.emit(Messages.KEY_EVENT_UP);
        if (e.code === "ArrowDown") eventEmitter.emit(Messages.KEY_EVENT_DOWN);
        if (e.code === "ArrowLeft") eventEmitter.emit(Messages.KEY_EVENT_LEFT);
        if (e.code === "ArrowRight") eventEmitter.emit(Messages.KEY_EVENT_RIGHT);
        if (e.code === "Space") eventEmitter.emit(Messages.KEY_EVENT_SPACE);
        if (e.code === "Enter") eventEmitter.emit(Messages.KEY_EVENT_ENTER);
    });
};