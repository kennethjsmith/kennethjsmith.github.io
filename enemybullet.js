class EnemyBullet {
    constructor(game, x, y) {
        this.game = game;
        this.SPEED = 460; // TODO, we can probably make a "stats" class for bullets, for dif types of guns
        this.range = 200; //how many updates, ie this bullet will travel speed*range
        this.removeFromWorld = false;


        this.level1SpriteSheet = ASSET_MANAGER.getAsset("./sprites/enemy_bullet1.png");
        this.level2SpriteSheet = ASSET_MANAGER.getAsset("./sprites/enemy_bullet2.png");

        if (this.game.camera.level == "level1") {
            this.spritesheet = this.level1SpriteSheet;
        }
        else this.spritesheet = this.level2SpriteSheet;

        this.SIZE = 12; // find better way to get this pizel width
        this.SCALE = 2;
        this.xMap = x;
        this.yMap = y;
        //TODO: trajectory would be better if calculated in gun and passed in
        // in a perfect worlt the trajectory would be the slope of the barrel and the barrel would be rotated to always point directly at the crosshair

        this.xDistance = this.xMap - this.game.goop.midpoint.x;
        this.yDistance = this.yMap - this.game.goop.midpoint.y;

        this.diagonal = Math.sqrt((this.xDistance * this.xDistance) + (this.yDistance * this.yDistance));

        this.xTrajectory = this.xDistance / this.diagonal;
        this.yTrajectory = this.yDistance / this.diagonal;


        // normalize the trajectory
        this.xVelocity = -this.xTrajectory * this.SPEED;
        this.yVelocity = -this.yTrajectory * this.SPEED;

        // for DEBUG
        //this.game.ctx.fillRect(this.xMap,this.yMap,1,1);

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
        this.game.tileGrid.forEach(row => {
            row.forEach(tile => {
                let type = tile.type;
                if ((type == "wall") && this.boundingBox.collide(tile.BB)) {
                    this.removeFromWorld = true;
                } else if (type == "north_wall" && this.boundingBox.collide(tile.BB.upper)) {
                    this.removeFromWorld = true;
                } else if (type == "south_wall" && this.boundingBox.collide(tile.BB.lower)) {
                    this.removeFromWorld = true;
                }
                // add tiles to draw on top                
                if (type == "south_wall" && this.boundingBox.getProjectedBigBB().collide(tile.BB.upper)) this.game.tilesToDrawOnTop.push(tile); // this will always redraw the tile
                if (type == "wall" && this.boundingBox.getProjectedBigBB().collide(tile.BB)) this.game.tilesToDrawOnTop.push(tile); // this will always redraw the tile
                if (type == "north_wall" && this.boundingBox.collide(tile.BB.upper) && this.boundingBox.top < tile.BB.bottom) this.game.tilesToDrawOnTop.push(tile);
            });
        });



        // check collisions with goop
        if (this.game.goop.hurtBox && this.boundingBox.collide(this.game.goop.hurtBox)) {
            this.game.goop.takeDamage(0.5);
            this.removeFromWorld = true;
        }

        this.game.entities.forEach(entity => {
            if (entity instanceof Terrain && entity.type == "pillar" && this.boundingBox.collide(entity.boundingBox)) {
                this.removeFromWorld = true;
            };

        });


        this.range--;
        if (this.range == 0) this.removeFromWorld = true;

    };

    updateBoundingBox() {
        this.boundingBox = new BoundingBox(this.xMap, this.yMap, this.spriteWidth, this.spriteWidth);
    };


    draw(ctx) {
        this.animations.drawFrame(this.game.clockTick, ctx, this.xMap - this.game.camera.x - this.spriteWidth / 2, this.yMap - this.game.camera.y - this.spriteWidth / 2, this.SCALE);

        if (this.game.debug) {
            ctx.strokeStyle = 'red';
            ctx.strokeRect(Math.floor(this.boundingBox.left - this.game.camera.x), Math.floor(this.boundingBox.top - this.game.camera.y), this.spriteWidth, this.spriteHeight - this.shadowHeight);
        }
    };
};