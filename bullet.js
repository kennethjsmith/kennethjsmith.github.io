class Bullet {
    constructor(type, game) {
        this.game = game;
        this.type = type;
        this.SPEED = 286; // TODO, we can probably make a "stats" class for bullets, for dif types of guns
        this.range = 100; //how many updates, ie this bullet will travel speed*range
        this.removeFromWorld = false;
        
        this.uziBullet = ASSET_MANAGER.getAsset("./sprites/bullet.png");
        this.bubbleBullet = ASSET_MANAGER.getAsset("./sprites/bubble.png");
        this.laserBullet = ASSET_MANAGER.getAsset("./sprites/bullet.png");

        if (this.type == "uzi") {
            this.spritesheet = this.uziBullet;
            this.SPEED = 1140;
        } else if (this.type == "bubble") {
            this.spritesheet = this.bubbleBullet;
            this.SPEED = 200;
        }

        this.SIZE = 12; // find better way to get this pizel width
        this.SCALE = 2;        
        this.xMap = this.game.gun.barrelTipXMap;
        this.yMap = this.game.gun.barrelTipYMap;
        
        this.xTrajectory = (this.game.gun.barrelTipXMap - this.game.gun.barrelMidXMap)/this.game.gun.bigR;
        this.yTrajectory = (this.game.gun.barrelTipYMap - this.game.gun.barrelMidYMap)/this.game.gun.bigR;

        // normalize the trajectory
        this.xVelocity = this.xTrajectory * this.SPEED;
        this.yVelocity = this.yTrajectory * this.SPEED;
        
        // for DEBUG
        // this.game.ctx.fillRect(this.xMap,this.yMap,1,1);

        // adjust x and y to center bullet sprite drawing over trajectory, trajectory*size/2
        this.spriteWidth = this.SIZE * this.SCALE; 

        this.animations = new Map;
        this.loadAnimations();
        this.updateBoundingBox();
        
        this.animations = this.animations.get("shot");
    };

    loadAnimations() {
        this.animations.set("shot", new Animator(this.spritesheet, 0, 0, 12, 12, 1, 1));
    };

    update() {

        this.xMap += this.xVelocity * this.game.clockTick;
        this.yMap += this.yVelocity * this.game.clockTick;
        this.updateBoundingBox();

        // check collisions with walls
        this.game.tileGrid.forEach( row => {
            row.forEach( tile => {
                let type = tile.type;
                if ((type == "wall") && this.boundingBox.collide(tile.BB)){
                    this.removeFromWorld = true;
                } else if (type == "north_wall" && this.boundingBox.collide(tile.BB.upper)) {
                    this.removeFromWorld = true;
                } else if (type == "south_wall" && this.boundingBox.collide(tile.BB.lower)) {
                    this.removeFromWorld = true;
                }
                

                // add tiles to draw on top  
                // TODO do we need these lines?              
                if (type == "south_wall" && this.boundingBox.collide(tile.BB.upper)) this.game.tilesToDrawOnTop.push(tile); // this will always redraw the tile
                //if (type == "wall" && this.boundingBox.collide(tile.BB)) this.game.tilesToDrawOnTop.push(tile); // this will always redraw the tile
                if (type == "north_wall" && this.boundingBox.collide(tile.BB.upper) && !this.game.goop.boundingBox.getProjectedBigBB().collide(tile.BB) && this.boundingBox.top < tile.BB.bottom) this.game.tilesToDrawOnTop.push(tile);
            });
        });

        

        // check collisions with entities
        this.game.entities.forEach(entity => {
            if (entity instanceof Slime || entity instanceof HorrorSlime || entity instanceof Boss || (entity instanceof Jar && entity.status != "broken")) {
                if (entity.hurtBox && this.boundingBox.collide(entity.hurtBox)) {
                    entity.takeDamage(this.game.gun.damage[this.game.gun.type]);
                    this.removeFromWorld = true;
                } 
            } else if (entity instanceof Terrain && entity.type == "pillar") {
                if (this.boundingBox.collide(entity.boundingBox)) {
                    this.removeFromWorld = true;
                }
            }
        });

        this.range--;
        if(this.range == 0) this.removeFromWorld = true;
        
    };

    updateBoundingBox() {
        this.boundingBox = new BoundingBox(this.xMap, this.yMap, this.spriteWidth, this.spriteWidth);
    };


    draw(ctx) {
        this.animations.drawFrame(this.game.clockTick, ctx, this.xMap - this.game.camera.x - this.spriteWidth/2, this.yMap - this.game.camera.y - this.spriteWidth/2, this.SCALE);

        if (this.game.debug) {
            ctx.strokeStyle = 'red';
            ctx.strokeRect(Math.floor(this.boundingBox.left - this.game.camera.x), Math.floor(this.boundingBox.top - this.game.camera.y), this.spriteWidth, this.spriteHeight - this.shadowHeight);
        }
    };
};