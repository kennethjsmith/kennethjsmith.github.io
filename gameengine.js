// This game shell was happily modified from Googler Seth Ladd's "Bad Aliens" game and his Google IO talk in 2011

class GameEngine {
    constructor(options) {
        // What you will use to draw
        // Documentation: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
        this.ctx = null;

        // Context dimensions
        this.surfaceWidth = null;
        this.surfaceHeight = null;

        // Everything that will be updated and drawn each frame
        this.entities = [];
        // Entities to be added at the end of each update
        this.entitiesToAdd = [];

        // Everything that will be updated and drawn each frame
        this.bullets = [];
        // Entities to be added at the end of each update
        this.bulletsToAdd = [];

        // Everything that will be updated and drawn each frame
        this.enemyBullets = [];
        // Entities to be added at the end of each update
        this.enemyBulletsToAdd = [];

        this.tilesToDrawOnTop = [];

        // Information on the input
        this.click = null;
        this.clickedLocation = { x: null, y: null }
        this.mouseX = 0;
        this.mouseY = 0;
        this.x = 0; // these are used to track actual mouse position
        this.y = 0;

        this.wheel = null;
        this.camera = {x: 0, y: 0};

        this.pointerLockTimer = -1300;

        this.left = false;
        this.right = false;
        this.up = false;
        this.down = false;

        this.interactFlag = false;

        // THE KILL SWITCH
        this.running = false;

        this.debug = false;

        // Options and the Details
        this.options = options || {
            prevent: {
                contextMenu: true,
                scrolling: true,
            },
        };
    };

    init(ctx) {
        this.ctx = ctx;
        this.crosshair= new Crosshair(this);
        //what is this? vvv
        this.surfaceWidth = this.ctx.canvas.width;
        this.surfaceHeight = this.ctx.canvas.height;
        this.startInput();
        this.timer = new Timer();
    };

    start() {
        this.running = true;
        const gameLoop = () => {
            this.loop();
            if (this.running) {
                requestAnimFrame(gameLoop, this.ctx.canvas);
            }
        };
        gameLoop();
    };

    startInput() {


        //mouse position in canvas
        function getMousePos(canvas, e) {
            var rect = canvas.getBoundingClientRect();
            self.x = e.clientX - rect.left,//400 width of canvas. 300 height
            self.y = e.clientY - rect.top
        }

        var self = this;

        // on click, lock input
        this.ctx.canvas.onclick = () => {
            
            if (!self.locked) {
                let timeElapsed = (performance.now() - self.pointerLockTimer);
                if (self.pointerLockTimer && timeElapsed > 1300){
                    this.ctx.canvas.requestPointerLock({
                        unadjustedMovement: true,
                    });
                               
                    self.locked = true;
                    if (self.camera.title) {
                        self.mouseX = this.x + this.camera.x - (this.crosshair.spriteSize/2);
                        self.mouseY = this.y + this.camera.y - (this.crosshair.spriteSize/2);
                    }
                }
            }
            
            this.crosshair.update();
            this.camera.update();
        };

        // handle locked cursor movement
        document.addEventListener("pointerlockchange", lockChangeAlert, false);
        document.addEventListener("mozpointerlockchange", lockChangeAlert, false);

        function lockChangeAlert() {
            if (document.pointerLockElement === self.ctx.canvas || document.mozPointerLockElement === self.ctx.canvas) {
                document.addEventListener("mousemove", updatePosition, false);
                self.locked = true;
                self.pointerLockTimer = performance.now();
            } else {
                document.removeEventListener("mousemove", updatePosition, false);
                self.locked = false;
                self.pointerLockTimer = performance.now();
            }

        }

        function updatePosition(e) {
            self.mouseX = Math.min(Math.max(0, (self.mouseX += (e.movementX/4))), self.ctx.canvas.width - self.crosshair.spriteSize);
            self.mouseY = Math.min(Math.max(0, (self.mouseY += (e.movementY/4))), self.ctx.canvas.height - self.crosshair.spriteSize);
        }


        this.ctx.canvas.addEventListener("keydown", e => {
            switch (e.code) {
                case "KeyA":
                    this.left = true;
                    break;
                case "KeyD":
                    this.right = true;
                    break;
                case "KeyW":
                    this.up = true;
                    break;
                case "KeyS":
                    this.down = true;
                    break;
                case "KeyE":
                    if (!this.interactFlag) {
                        this.interact = true;
                        this.interactFlag = true;
                    }
                    break;     
            }
        }, false);

        this.ctx.canvas.addEventListener("keyup", e => {
            switch (e.code) {
                case "KeyA":
                    this.left = false;
                    break;
                case "KeyD":
                    this.right = false;
                    break;
                case "KeyW":
                    this.up = false;
                    break;
                case "KeyS":
                    this.down = false;
                    break;
                case "KeyE":
                    this.interact = false;
                    this.interactFlag = false;
                    break;    
            }
        }, false);

        this.ctx.canvas.addEventListener("mousemove", e => {
            getMousePos(this.ctx.canvas, e);
            if(this.locked){
                
                updatePosition(e);
                this.crosshair.update(); //update here since not in entities list, update after movement too so that camera updates
            }
        });

        this.ctx.canvas.addEventListener("mousedown", e => {
            this.clicked = true;
            getMousePos(this.ctx.canvas, e);
            ASSET_MANAGER.playAsset("dummy-path");
        });

        this.ctx.canvas.addEventListener("mouseup", e => {
            this.clicked = false;
        });

        this.ctx.canvas.addEventListener("wheel", e => {
            if (this.options.prevent.scrolling) {
                e.preventDefault(); // Prevent Scrolling
            }
            this.wheel = e;
        });

        this.ctx.canvas.addEventListener("contextmenu", e => {
            if (this.options.prevent.contextMenu) {
                e.preventDefault(); // Prevent Context Menu
            }
            //this.rightclick = getXandY(e);
        });

        this.mouseX = this.ctx.canvas.width/2 - this.crosshair.spriteSize/2;
        this.mouseY = this.ctx.canvas.height/2 - this.crosshair.spriteSize/2; 
    };

    addEntity(entity) {
        this.entitiesToAdd.push(entity);
    };

    addBullet(bullet) {
        this.bulletsToAdd.push(bullet);
    };

    addEnemyBullet(enemyBullet) {
        this.enemyBulletsToAdd.push(enemyBullet);
    };
    

    draw() {
        // Clear the whole canvas with transparent color (rgba(0, 0, 0, 0))
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        if (!this.camera.title) {   
            this.level.draw(this.ctx);

             //Player radius updates only
            for (let i = this.entities.length - 1; i >= 0; i--) {
                if (this.goop &&
                    (getDistance(this.entities[i].xMap, this.entities[i].yMap, this.goop.xMap, this.goop.yMap) < 800 //||
                        //this.entities[i] instanceof Goop || 
                        //this.entities[i] instanceof SceneManager
                        )) {
                    //if the player exists update things close to the player
                    let entity = this.entities[i];
                    entity.draw(this.ctx, this);

                } else if (!this.goop) {
                    //if no player update everythign so we dont crash
                    for (let i = this.entities.length - 1; i >= 0; i--) {
                        this.entities[i].draw(this.ctx, this);
                    }
                }
            }

            // draw goops gun --- > moved this into Goops draw method
            // this.goop.gun.draw(this.ctx);

            // Draw latest bullets first
            for (let i = this.bullets.length - 1; i >= 0; i--) {
                this.bullets[i].draw(this.ctx, this);
            }

            // Draw latest enemy bullets first
            for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
                this.enemyBullets[i].draw(this.ctx, this);
            }

            // draw south wall tiles on top of necessary entities
            if (this.tilesToDrawOnTop.length > 0) {
                this.tilesToDrawOnTop.forEach( tile => {
                    let image = tile.image;
                    let col = tile.col;
                    let row = tile.row;
                    let tileSize = this.level.tileSize;
                    let scale = this.level.scale;
                    image.drawFrame(this.clockTick, this.ctx, Math.floor((col * tileSize) - (this.camera.x)), Math.floor((row * tileSize) - (this.camera.y)), scale); 
                });
            }
        }
        if (this.camera.title || this.camera.pause || this.camera.lose || this.camera.win) {
            this.camera.draw(this.ctx);
            
        }

        if(!this.title) this.camera.hud.draw(this.ctx);
        this.crosshair.draw(this.ctx);
    };

    update() {
        
        this.tilesToDrawOnTop = [];

        //Player radius updates only
        for (let i = this.entities.length - 1; i >= 0; i--) {
            if (this.goop &&
                (getDistance(this.entities[i].xMap, this.entities[i].yMap, this.goop.xMap, this.goop.yMap) < 700 //||
                    //this.entities[i] instanceof Goop || 
                    //this.entities[i] instanceof Slime ||
                    //this.entities[i] instanceof HorrorSlime ||
                    //this.entities[i] instanceof Boss ||
                    //this.entities[i] instanceof SceneManager
                    )) {
                //if the player exists update things close to the player
                let entity = this.entities[i];
                entity.update(this);

            } else if (!this.goop) {
                //if no player update everythign so we dont crash
                this.entities.forEach(entity => entity.update(this));
            }
        }

        // Update Bullets
        this.bullets.forEach(bullet => bullet.update(this));
        // Update Enemy Bullets
        this.enemyBullets.forEach(enemyBullet => enemyBullet.update(this));


        // Remove dead things
        this.entities = this.entities.filter(entity => !entity.removeFromWorld);

        // Remove dead things
        this.bullets = this.bullets.filter(bullet => !bullet.removeFromWorld);

        // Remove dead things
        this.enemyBullets = this.enemyBullets.filter(enemyBullet => !enemyBullet.removeFromWorld);

        // Add new things
        this.entities = this.entities.concat(this.entitiesToAdd);
        this.entitiesToAdd = [];

        // Add new things
        this.bullets = this.bullets.concat(this.bulletsToAdd);
        this.bulletsToAdd = [];
        
        this.enemyBullets = this.enemyBullets.concat(this.enemyBulletsToAdd);
        this.enemyBulletsToAdd = [];

        this.camera.hud.update();
        this.crosshair.update();
        
        this.entities = insertionSort(this.entities);

        this.interact = false;
    };

    loop() {
        this.clockTick = this.timer.tick();
        this.update();
        this.draw();
    };

    get["deltaTime"]() { return this.clockTick; }

};