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
        createEnemies2(ctx, canvas, enemyImg);
        };

        function createEnemies(ctx, canvas, enemyImg) {
            const MONSTER_TOTAL = 4;
            const MONSTER_WIDTH = MONSTER_TOTAL * enemyImg.width;
            const START_X = (canvas.width - MONSTER_WIDTH) / 2;
            const STOP_X = START_X + MONSTER_WIDTH;
            for (let x = START_X; x < STOP_X; x += enemyImg.width) {
            for (let y = 0; y < enemyImg.height * 5; y += enemyImg.height) {
            ctx.drawImage(enemyImg, x, y);
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
        

        
