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
    }


class GameObject {
    constructor(x, y) {
    this.x = x;
    this.y = y;
    this.dead = false; // 객체가 파괴되었는지 여부
    this.type = ""; // 객체 타입 (영웅/적)
    this.width = 0; // 객체의 폭
    this.height = 0; // 객체의 높이
    this.img = undefined; // 객체의 이미지
    }
    draw(ctx) {
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height); 
    //캔버스에 이미지 그리기
    }
    }


    class Hero extends GameObject {
        constructor(x, y) {
        super(x, y);
        (this.width = 99), (this.height = 75);
        this.type = 'Hero';
        this.speed = { x: 0, y: 0 };
        }
        }

        class Enemy extends GameObject {
            constructor(x, y) {
            super(x, y);
            this.width = 98;
            this.height = 50;
            this.type = "Enemy";
            // 적 캐릭터의 자동 이동 (Y축 방향)
            let id = setInterval(() => {
            if (this.y < canvas.height - this.height) {
            this.y += 5; // 아래로 이동
            } else {
            console.log('Stopped at', this.y);
            clearInterval(id); // 화면 끝에 도달하면 정지
            }
            }, 300);
            }
            }


            let onKeyDown = function (e) {
                console.log(e.keyCode);
                switch (e.keyCode) {
                case 37: // 왼쪽 화살표
                case 39: // 오른쪽 화살표
                case 38: // 위쪽 화살표
                case 40: // 아래쪽 화살표
                case 32: // 스페이스바
                e.preventDefault();
                break;
                default:
                break;
                }
                };

                const Messages = {
                    KEY_EVENT_UP: "KEY_EVENT_UP",
                    KEY_EVENT_DOWN: "KEY_EVENT_DOWN",
                    KEY_EVENT_LEFT: "KEY_EVENT_LEFT",
                    KEY_EVENT_RIGHT: "KEY_EVENT_RIGHT",
                    };
                    let heroImg,
                    enemyImg,
                    laserImg,
                    canvas, ctx,
                    gameObjects = [],
                    hero,
                    eventEmitter = new EventEmitter();

window.addEventListener('keydown', onKeyDown);

window.addEventListener("keyup", (evt) => {
    if (evt.key === "ArrowUp") {
    eventEmitter.emit(Messages.KEY_EVENT_UP);
    } else if (evt.key === "ArrowDown") {
    eventEmitter.emit(Messages.KEY_EVENT_DOWN);
    } else if (evt.key === "ArrowLeft") {
    eventEmitter.emit(Messages.KEY_EVENT_LEFT);
    } else if (evt.key === "ArrowRight") {
    eventEmitter.emit(Messages.KEY_EVENT_RIGHT);
    }
});

function loadTexture(path) {
    return new Promise((resolve) => {
    const img = new Image();
    img.src = path;
    img.onload = () => {
    resolve(img);
    };
    })
    }

    window.onload = async() => {
        const canvas = document.getElementById("myCanvas");
        const ctx = canvas.getContext("2d");
        const heroImg = await loadTexture('assets/player.png')
        const enemyImg = await loadTexture('assets/enemyShip.png')
        const laserImg = await loadTexture("assets/laserRed.png");

        // 새 배경 이미지 로드
        const backgroundImg = await loadTexture('assets/starBackground.png');
        // 배경 이미지를 반복적으로 채울 패턴 생성
        const pattern = ctx.createPattern(backgroundImg, 'repeat'); // 'repeat' 또는 원하는 반복 방식 설정
        // 배경을 패턴으로 채우기
        ctx.fillStyle = pattern; 
        ctx.fillRect(0, 0, canvas.width, canvas.height); // 전체 캔버스를 배경 이미지로 채운다

        //ctx.fillStyle = 'black';
        //ctx.fillRect(0,0, canvas.width, canvas.height);

        const heroWidth = 30;  // 보조 우주선 크기
        const heroHeight = 30; // 보조 우주선 크기

        ctx.drawImage(heroImg, canvas.width/2 - 45, canvas.height - (canvas.height/4), ); 
        ctx.drawImage(heroImg, canvas.width/2 - 75, canvas.height - (canvas.height/4)+30,heroWidth,heroHeight ); 
        ctx.drawImage(heroImg, canvas.width/2 + 55, canvas.height - (canvas.height/4)+30,heroWidth,heroHeight ); 
        createEnemies(ctx, canvas, enemyImg);

       /*let gameLoopId = setInterval(() => {
            // 화면 초기화
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // 게임 객체 그리기
            drawHero(); // 플레이어 캐릭터
            drawEnemies(); // 적들
            drawStaticObjects(); // 배경과 같은 정적인 요소
            }, 200); // 200ms마다 실행
*/


initGame();
let gameLoopId = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGameObjects(ctx);
    }, 100) 

        };

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
    

        function createEnemies2(ctx,canvas,enemyImg){      
            const i =5;
            for(let x =0; x<i; x++){
                line=i-x;
                const startx = (canvas.width - (enemyImg.width *line)) /2;
                const starty = x*enemyImg.height;
                for(let y=0; y<line; y++){
                    const locx = startx + y*enemyImg.width;
                    const locy = starty;
                    ctx.drawImage(enemyImg,locx,locy);

                }
            }
        }

        //chatgpt
        function createEnemies3(ctx, canvas, enemyImg) {
            const NUM_ROWS = 5; // 피라미드의 총 행 수
            const ENEMY_SPACING_X = enemyImg.width; // 적 간의 수평 간격 (0 간격)
            const ENEMY_SPACING_Y = enemyImg.height; // 적 간의 수직 간격 (0 간격)
        
            // 피라미드 형태로 적 배치
            for (let row = 0; row < NUM_ROWS; row++) {
                const enemiesInRow = NUM_ROWS - row; // 첫 번째 행에는 5개, 두 번째 행에는 4개, ...
        
                // 각 행의 시작 X 위치를 계산하여 적들이 중앙에 배치되도록 합니다
                const rowStartX = (canvas.width - (enemyImg.width * enemiesInRow)) / 2; // 간격 없애기
                const rowStartY = row * ENEMY_SPACING_Y; // 각 행의 Y 위치는 행 번호에 비례
        
                // 현재 행에 있는 각 적들의 X 위치와 Y 위치를 계산
                for (let col = 0; col < enemiesInRow; col++) {
                    const x = rowStartX + col * ENEMY_SPACING_X; // 각 적의 X 위치 (간격 없이 바로 붙여서 배치)
                    const y = rowStartY; // Y 위치는 고정
                    ctx.drawImage(enemyImg, x, y); // 적 이미지 그리기
                }
            }
        }



        function initGame() {
            gameObjects = [];
            createEnemies();
            createHero();
            eventEmitter.on(Messages.KEY_EVENT_UP, () => {
            hero.y -=5 ;
            })
            eventEmitter.on(Messages.KEY_EVENT_DOWN, () => {
            hero.y += 5;
            });
            eventEmitter.on(Messages.KEY_EVENT_LEFT, () => {
            hero.x -= 5;
            });
            eventEmitter.on(Messages.KEY_EVENT_RIGHT, () => {
            hero.x += 5;
            });
            }
        

            function createHero() {
                hero = new Hero(
                canvas.width / 2 - 45,
                canvas.height - canvas.height / 4
                );
                hero.img = heroImg;
                gameObjects.push(hero);
                }

                function drawGameObjects(ctx) {
                    gameObjects.forEach(go => go.draw(ctx));
                    }


        
