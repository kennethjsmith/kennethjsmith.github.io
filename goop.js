class Goop {
    constructor(game) { // these starting locations should possibly be based on xMidpoint and yMidpoint of the sprite
        this.game = game;
        this.game.goop = this;
        this.level1SpriteSheet = ASSET_MANAGER.getAsset("./sprites/goop.png");
        this.level2SpriteSheet = ASSET_MANAGER.getAsset("./sprites/goop2.png");

        this.SCALE = 2;
        this.xMap = this.game.camera.startXPlayer;
        this.yMap = this.game.camera.startYPlayer;
        this.handOffset = { x: 32*this.SCALE, y: 27*this.SCALE };
        this.spriteWidth = 39 * this.SCALE; // scaled width
        this.spriteHeight = 43 * this.SCALE; // scaled height
        this.heightOffset = this.spriteHeight / 2;
        this.widthOffset = this.spriteWidth / 2;
        this.midpoint = {x: this.xMap + this.widthOffset, y: this.yMap + this.heightOffset };
        this.shadowHeight = 5 * this.SCALE;

        if (this.game.camera.level == "level1") {
            this.spritesheet = this.level1SpriteSheet;
            this.gun = new Gun("uzi", this.game, true);
            this.game.gun = this.gun;
        } else if (this.game.camera.level == "level2") {
             this.spritesheet = this.level2SpriteSheet;
             this.gun = new Gun(this.game.gun.type, this.game, true);
             this.game.gun = this.gun;
        //     this.gun = new Gun("bubble", this.game, true);
        } 

        //this.alt_spritesheet = ASSET_MANAGER.getAsset("./sprites/grep.png");
        
        this.facing = "right"; // left or right
        this.state = "vibing"; // walking or vibin

        this.stats = new PlayerStats(this.game.camera.health, false, 15, 0, false, 10, 0)
        this.velocity = { x: 0, y: 0 };

        this.animations = new Map;

        this.loadAnimations();
        this.updateBoundingBox();
        this.animation = this.animations.get("right").get("vibing");
    };

    loadAnimations() {
        this.animations.set("left", new Map);
        this.animations.set("right", new Map);

        this.animations.get("left").set("walking", new Animator(this.spritesheet, 0, 0, 39, 43, 8, .1));
        this.animations.get("left").set("vibing", new Animator(this.spritesheet, 624, 0, 39, 43, 8, .15));
        this.animations.get("left").set("hurt", new Animator(this.spritesheet, 1248, 0, 39, 43, 2, .1));
        this.animations.get("left").set("dying", new Animator(this.spritesheet, 1404, 0, 39, 43, 2, .1));
        this.animations.get("left").set("dead", new Animator(this.spritesheet, 1443, 0, 39, 43, 1, 1));


        this.animations.get("right").set("walking", new Animator(this.spritesheet, 312, 0, 39, 43, 8, .1));
        this.animations.get("right").set("vibing", new Animator(this.spritesheet, 936, 0, 39, 43, 8, .15));
        this.animations.get("right").set("hurt", new Animator(this.spritesheet, 1326, 0, 39, 43, 2, .1));
        this.animations.get("right").set("dying", new Animator(this.spritesheet, 1482, 0, 39, 43, 2, .1));
        this.animations.get("right").set("dead", new Animator(this.spritesheet, 1521, 0, 38, 43, 1, 1));

    };

    update() {
        const WALK = 400;
        const DIAGONAL = Math.sqrt(Math.pow(WALK, 2) / 2);
        this.velocity.x = 0;
        this.velocity.y = 0;

        if (this.stats.hurtTimer >= this.stats.hurtTimeout) this.stats.hurt = false;

        // update the velocity
        // evaluates to (left XOR right) AND (up XOR down)
        if ((this.game.left ? !this.game.right : this.game.right) && (this.game.up ? !this.game.down : this.game.down)) {
            this.velocity.x = (this.game.left) ? -DIAGONAL : DIAGONAL;
            this.velocity.y = (this.game.up) ? -DIAGONAL : DIAGONAL;
        } else {
            if (this.game.left) this.velocity.x += -WALK;
            if (this.game.right) this.velocity.x += WALK;
            if (this.game.up) this.velocity.y += -WALK;
            if (this.game.down) this.velocity.y += WALK;
        }

        // check for wall collisions
        let collisionOccurred = false;
        this.game.tileGrid.forEach( row => {
            row.forEach( tile => {
                let type = tile.type;
                if (type == "north_wall" && (this.boundingBox.getXProjectedBB(this.velocity.x * this.game.clockTick).collide(tile.BB.lower) || this.boundingBox.getXProjectedBB(this.velocity.x * this.game.clockTick).collide(tile.BB.upper))) {
                    this.velocity.x = 0;
                    collisionOccurred = true;
                }
                if (type == "north_wall" && (this.boundingBox.getYProjectedBB(this.velocity.y * this.game.clockTick).collide(tile.BB.lower) || this.boundingBox.getYProjectedBB(this.velocity.y * this.game.clockTick).collide(tile.BB.upper))) {
                    this.velocity.y = 0;
                    collisionOccurred = true;
                }
                if (type == "wall" && this.boundingBox.getXProjectedBB(this.velocity.x * this.game.clockTick).collide(tile.BB)) {
                    this.velocity.x = 0;
                    collisionOccurred = true;
                }
                if (type == "wall" && this.boundingBox.getYProjectedBB(this.velocity.y * this.game.clockTick).collide(tile.BB)) {
                    this.velocity.y = 0;
                    collisionOccurred = true;
                }
                if (type == "south_wall" && this.boundingBox.getXProjectedBB(this.velocity.x * this.game.clockTick).collide(tile.BB.lower)) {
                    this.velocity.x = 0;
                    collisionOccurred = true;
                }
                if (type == "south_wall" && this.boundingBox.getYProjectedBB(this.velocity.y * this.game.clockTick).collide(tile.BB.lower)) {
                    this.velocity.y = 0;
                    collisionOccurred = true;
                }
                
                // add tiles to draw on top                
                if (type == "south_wall" && this.boundingBox.getProjectedBigBB().collide(tile.BB.upper)) this.game.tilesToDrawOnTop.push(tile); // this will always redraw the tile
                if (type == "wall" && this.boundingBox.getProjectedBigBB().collide(tile.BB)) this.game.tilesToDrawOnTop.push(tile); // this will always redraw the tile
                if (type == "north_wall" && this.boundingBox.getProjectedBigBB().collide(tile.BB.upper) && this.boundingBox.top < tile.BB.upper.bottom) this.game.tilesToDrawOnTop.push(tile);
            });
        });

        if (collisionOccurred) this.updateBoundingBox();

        this.game.entities.forEach(entity => {
            let xProjectedBB = collisionOccurred ? this.boundingBox : this.boundingBox.getXProjectedBB(this.velocity.x * this.game.clockTick);
            let yProjectedBB = collisionOccurred ? this.boundingBox : this.boundingBox.getYProjectedBB(this.velocity.y * this.game.clockTick);

            if (entity instanceof Terrain && entity.type == "pillar") {
                if (xProjectedBB.collide(entity.boundingBox)) {
                    this.velocity.x = 0;
                    collisionOccurred = true;
                } else if (yProjectedBB.collide(entity.boundingBox)) {
                    this.velocity.y = 0;
                    collisionOccurred = true;
                }
            } 
            else if (entity instanceof Jar && entity.status != "broken") {
                if (xProjectedBB.collide(entity.boundingBox)) {
                    this.velocity.x = 0;
                    collisionOccurred = true;
                } else if (yProjectedBB.collide(entity.boundingBox)) {
                    this.velocity.y = 0;
                    collisionOccurred = true;
                }
            } 
            
            if ((!this.stats.hurt || this.stats.hurtTimer >= this.stats.hurtTimeout) 
                && (entity instanceof Slime || entity instanceof HorrorSlime || entity instanceof Boss) 
                && !entity.stats.dead 
                && this.game.camera.play) {
                    
                this.stats.hurtTimer = 0;
                this.stats.hurt = false;
                let xProjectedBB = collisionOccurred ? this.hurtBox : this.hurtBox.getXProjectedBB(this.velocity.x * this.game.clockTick);
                let yProjectedBB = collisionOccurred ? this.hurtBox : this.hurtBox.getYProjectedBB(this.velocity.y * this.game.clockTick);

                if (xProjectedBB.collide(entity.boundingBox)) {
                    this.game.camera.health-= entity.stats.damageDealt;
                    collisionOccurred = true;
                    this.stats.hurt = true;
                } else if (yProjectedBB.collide(entity.boundingBox)) {
                    this.game.camera.health-= entity.stats.damageDealt; 
                    collisionOccurred = true;
                    this.stats.hurt = true;
                } 
                
            }
        });

            
        if (!this.game.camera.lose && !this.game.camera.win) {
            // update the positions
            this.xMap += this.velocity.x * this.game.clockTick;
            this.yMap += this.velocity.y * this.game.clockTick;
            this.game.crosshair.xMap += this.velocity.x * this.game.clockTick;
            this.game.crosshair.yMap += this.velocity.y * this.game.clockTick;
    
            this.updateBoundingBox();
            
            // update the states
            if (this.velocity.x > 0) {
                this.facing = "right";
                this.state = "walking";
            } else if (this.velocity.x < 0) {
                this.facing = "left";
                this.state = "walking";
            } else if (this.velocity.y != 0) {
                this.state = "walking";
            } else if (this.velocity.x == 0 && this.velocity.y == 0) {
                this.state = "vibing";
            } else {
                
            }

            this.gun.update();

        }
        this.game.camera.update();
        this.game.crosshair.update();            

        this.animation = this.animations.get(this.facing).get(this.state);
        // update the animation
        if (this.stats.hurt) {
            if (this.game.camera.health <= 0) {
                this.stats.dead = true;
            } else if (this.stats.hurtTimer < this.stats.hurtTimeout) this.animation = this.animations.get(this.facing).get("hurt");
            this.stats.hurtTimer++;
        }
        // update the animation
        if (this.stats.dead) {
            if (this.stats.dyingTimer < this.stats.dyingTimeout) {
                this.animation = this.animations.get(this.facing).get("dying");
                this.stats.dyingTimer++;
            } else {
                this.animation = this.animations.get(this.facing).get("dead");
            }
        }
        this.midpoint = {x: this.xMap + this.widthOffset, y: this.yMap + this.heightOffset };
        
    };

    draw(ctx) {
        this.animation.drawFrame(this.game.clockTick, ctx, Math.floor(this.xMap-this.game.camera.x), Math.floor(this.yMap-this.game.camera.y), this.SCALE);
        this.gun.draw(ctx);
        if (this.game.debug) {
            drawBoundingBox(this.hurtBox, ctx, this.game, "red");
            drawBoundingBox(this.boundingBox, ctx, this.game, "white");
            ctx.strokeStyle = 'red'; 
            // draws midpoint
            ctx.strokeRect(Math.floor(this.midpoint.x - this.game.camera.x), Math.floor(this.midpoint.y - this.game.camera.y), 2, 2);
        }
    };

    updateBoundingBox() {
        this.hurtBox = new BoundingBox(this.xMap+10, this.yMap+10, this.spriteWidth-20, this.spriteHeight - this.shadowHeight - 10);
        this.boundingBox = new BoundingBox(this.xMap+5, this.yMap + 2*(this.spriteHeight/3), this.spriteWidth-10, (this.spriteHeight/3)-this.shadowHeight);//+5 x, -10 width for narrower box
    };


    takeDamage(damage) {
        if ((!this.stats.hurt || this.stats.hurtTimer >= this.stats.hurtTimeout) && !this.stats.dead && this.game.camera.play) {
            this.stats.hurtTimer = 0;
            this.game.camera.health -= damage;
            if (this.game.camera.health <= 0) {
                this.stats.dead = true;
            } else this.stats.hurt = true;
        }
    }
};