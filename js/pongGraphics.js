function run(){
    var splash = document.getElementById('splash');
    var splashPaused = document.getElementById('splashPaused');
    var rows = document.getElementById('rows');
    splash.style['display']='none';

    //Definindo posições e tamanhos relativos ao tamanho da janela
    var width = window.innerWidth*0.98;
    var height = window.innerHeight*0.98;
    var halfWidth = width/2;
    var halfHeight = height/2;
    var boxSize = {x:width*.015,y:height*.15,z:10};
    var padPosition = width*0.45;
    var radius = Math.floor(height*.02);

    //Criando e definindo posição da camera    
    var camera = new THREE.OrthographicCamera( -halfWidth, halfWidth, halfHeight, - halfHeight, .1, 1000);
    camera.position.z = 20;
    


    //Loading pointers and setting position
        // Element e point counter for leftPad
        var lPpointCounterElement = document.getElementById('leftPad');
        var lPpointCounter = 0;
        lPpointCounterElement.style['left']='10%';
        lPpointCounterElement.style['color']='rgba(208,18,18,0.7)';
        lPpointCounterElement.innerHTML = lPpointCounter;
        // Element e point counter for rightPad
        var rPpointCounterElement = document.getElementById('rightPad');
        var rPpointCounter = 0;
        rPpointCounterElement.style['right']='10%';
        rPpointCounterElement.style['color']='rgba(18,208,192,0.7)';
        rPpointCounterElement.innerHTML = rPpointCounter;

    //Configurando renderer
        var renderer = new THREE.WebGLRenderer({antialias:false});
        renderer.setSize( width, height);
        renderer.shadowMap.Enable= true;


    //Adicionando Canvas ao documento.
        document.body.appendChild( renderer.domElement );
        var canvas = renderer.domElement;

    //Materials
        var lMaterial = new THREE.MeshLambertMaterial( { color: 0x12D3C2 } );
        var rMaterial = new THREE.MeshLambertMaterial( { color: 0xD31212 } );
        var ballMaterial = new THREE.MeshLambertMaterial( { color: 0xFEFEFE } );

    //Geometries
        //bola
        var circle = new THREE.SphereGeometry( radius,90,90 );
        var ball = new THREE.Mesh( circle, ballMaterial );
        var point = radius/Math.sqrt(2);
        var circunPoints = [
            { x:    0    , y:  radius },
            { x:    0    , y: -radius },
            { x:  radius , y:    0    },
            { x: -radius , y:    0    },
            { x:  point  , y:  point  },
            { x:  point  , y: -point  },
            { x: -point  , y:  point  },
            { x: -point  , y: -point  },
        ];

        //pads
        var box = new THREE.BoxGeometry( boxSize.x,boxSize.y,boxSize.z );
        var leftPad = new THREE.Mesh( box , lMaterial );
        var rightPad = new THREE.Mesh( box , rMaterial );
        rightPad.position.x =   padPosition;
        leftPad.position.x  =  -padPosition;

        leftPad.geometry.computeBoundingBox();
        rightPad.geometry.computeBoundingBox();


        var lBoundingHelper = new THREE.BoundingBoxHelper(leftPad, 0xFF0000);
        var rBoundingHelper = new THREE.BoundingBoxHelper(rightPad, 0x0000FF);
        lBoundingHelper.update();
        lBoundingHelper.update();

        var recomputeBounds = function(){
            lBoundingHelper.update();
            rBoundingHelper.update();
        }

    //Criando luzes

        var light = new THREE.AmbientLight( 0xFAFADA);
        var spotLight1 = new THREE.SpotLight(0xD31212);
        var spotLight2 = new THREE.SpotLight(0x12D3C2);

        light.position.z=100;
        spotLight1.position.x+=13;
        spotLight2.position.x-=13;

        spotLight1.intensity = 1.5;
        spotLight2.intensity = 1.5;

        spotLight1.castShadow = true;
        spotLight2.castShadow = true;

    //Criando Scene e adicionando Meshs
        var scene = new THREE.Scene();
        scene.background=0xFEFEFE;
        scene.add(spotLight1);
        scene.add(spotLight2);
        scene.add( rightPad );
        scene.add( leftPad );
        scene.add( light );
        scene.add( ball );

    //Verificador de colisao
        var diagonalAngle = (boxSize.x)/(boxSize.y);
        var collisionRange = padPosition - (boxSize.x/2) -1;
        var verifyCollision = function () {
            //CODIGO USANDO BOUNDING BOX
            recomputeBounds();
            if(ball.position.x < - collisionRange || ball.position.x > collisionRange){
                for(var i=0;i<8;i++){
                    var point = new THREE.Vector3( circunPoints[i].x+ball.position.x , circunPoints[i].y+ball.position.y , 0 );
                    var delta;
                    if(rBoundingHelper.box.containsPoint(point))
                            delta = {x: rightPad.position.x - point.x, y: rightPad.position.y - point.y};
                    else if(lBoundingHelper.box.containsPoint(point))
                            delta = {x: leftPad.position.x - point.x, y: leftPad.position.y - point.y};
                    if(delta){
                        var anglePoint = delta.x/delta.y;
                        
                        if(anglePoint.x - anglePoint.y < 0){
                            increaseYSpeed();
                            invertYSpeed();
                        }
                        else{
                            increaseXSpeed();
                            invertXSpeed();
                        }
                        
                        moveBall();
                        return;
                    }
                }
            }
        };

    //Movimentos da bola

        //Vetor de velocidade para bola
        var v0 = {x:Math.random()*3+5, y: Math.random()*8};

        //define novo move vector [v0]
        var setMoveVector = function(){
            v0 = {x:Math.random()*3+5, y: Math.random()*8};
        }

        //Quatro funções que alteram a movimentação da bola
        var increaseYSpeed = function() {
            v0.y=v0.y*1.1;
            if(v0.y>3) v0.y=3;
        }
        var increaseXSpeed = function() {
            v0.x=v0.x*1.3;
            if(v0.x>10) v0.x=10;
        }
        var invertXSpeed = function(){
            v0.x=-v0.x;
        }
        var invertYSpeed = function(){
            v0.y=-v0.y;
        }

        //função para movimentação da bola a cada frame
        // futuramente devera computar os pontos
        var moveBall = function () {
            if(ball.position.x+v0.x < -halfWidth){
                ball.position.x=0;
                ball.position.y=0;
                v0 = {x:Math.random()*3+5, y: Math.random()*3};
                v0.x=-v0.x;
                updatePoints('right');
                return;
            }
            else{
                if(ball.position.x+v0.x > halfWidth) {
                    ball.position.x=0;
                    ball.position.y=0;
                    v0 = {x:Math.random()*3+5, y: Math.random()*3};
                    v0.x=-v0.x;
                    updatePoints('left');
                    return;
                }
                else{ball.position.x+=v0.x;}
            }
            if(ball.position.y+v0.y < -halfHeight){
                ball.position.y=-(halfHeight-radius);
                v0.y=-v0.y;
            }
            else{
                if(ball.position.y+v0.y> halfHeight) {
                    ball.position.y=(halfHeight-radius);
                    v0.y=-v0.y;
                }
                else{ball.position.y+=v0.y;	}
            }
        };

        //Atualiza a pontuação
        var updatePoints = function(side){
            switch (side) {
                case 'left':
                    if(lPpointCounter>8){
                        lPpointCounter=0;
                        lPpointCounterElement.innerHTML= lPpointCounter;
                        rPpointCounter=0;
                        rPpointCounterElement.innerHTML= rPpointCounter;
                        confirm("ESQUERDA GANHOU!!!\n\n\nDeseja jogar novamente?");
                    }
                    else lPpointCounterElement.innerHTML= ++lPpointCounter;
                    break;
                case 'right':
                    if(rPpointCounter>8){
                        lPpointCounter=0;
                        lPpointCounterElement.innerHTML= lPpointCounter;
                        rPpointCounter=0;
                        rPpointCounterElement.innerHTML= rPpointCounter;
                        alert("DIREITA GANHOU!!!\n\n\nDeseja jogar novamente?");
                    }
                    else rPpointCounterElement.innerHTML= ++rPpointCounter;
                    break;
            }
        }

    //Movimentos do leftPad
        var lastY;
        //listener para leftPad acompanhar movimento do mouse.
        window.addEventListener('mousemove', function (e) {
            lastY = leftPad.position.y;
            leftPad.position.y=-(e.clientY-halfHeight);
        },false);

    //Movimentos do rightPad
        //move para a posicao passada por pareametro
        var moveRPad = function (targetY) {
            rightPad.position.y= targetY
        };
        //move o rightPad de acordo com o input do teclado
        var moveRPadKeyboard = function(){
            if(!released){
                if(keyCode == 37 || keyCode == 38){
                    rightPad.position.y =  ((rightPad.position.y + incrementRPad) > halfHeight ) ? halfHeight : (rightPad.position.y + incrementRPad);
                }
                else if(keyCode == 39 || keyCode == 40){
                    rightPad.position.y =  ((rightPad.position.y-incrementRPad) < - halfHeight) ? -halfHeight : (rightPad.position.y-incrementRPad);
                }
            }
        };
        //variaveis de controle para deslocamentos
        var released = true;
        var keyCode;
        var incrementRPad = height*.02;
        //listeners para quando o usuario pressionar uma tecla
        //alterando os valores de released e keyCode
        window.addEventListener('keydown',function(e) {
            if(e.keyCode ==80 ) pause();
            if(36 < e.keyCode && e.keyCode < 41){
                e.preventDefault();
                released = false;
                keyCode = e.keyCode;
            }
        },false);
        window.addEventListener('keyup', function(e){
            if(36 < e.keyCode && e.keyCode < 41){
                e.preventDefault();
                released=true;
                keyCode = e.keyCode;
            }
        },false);

    //Pausa e retomada de jogo
    var paused = false;
    function pause(){
        paused = !paused;
        if(!paused){
            update();
            splash.style['display']='none';
        }else{            
            
            rows.style['display']='none';            
            splashPaused.style['display']='block';
            splash.style['display']='block';
        }   
    }
    //Update função recursiva [callback] utilizada para executar o jogo e atualizações dos frames
    var update = function () {
        //usando callback
        if(!paused){
            requestAnimationFrame(update);
            moveBall(verifyCollision(renderer.render(scene, camera, moveRPadKeyboard())));
        }
    };


    //rederiza a cena e inicia os updates.
    renderer.render(scene, camera);
    update();
}
