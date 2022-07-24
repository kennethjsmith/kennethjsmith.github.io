class HorrorSlime {
    constructor(game, x, y) {
        this.game = game;
        this.xMap = x;
        this.yMap = y;

        this.level1SpriteSheet = ASSET_MANAGER.getAsset("./sprites/horror_slime.png");
        this.level1SplatSheet = ASSET_MANAGER.getAsset("./sprites/horror_slime_splat.png");
        this.level2SpriteSheet = ASSET_MANAGER.getAsset("./sprites/horror_slime2.png");
        this.level2SplatSheet = ASSET_MANAGER.getAsset("./sprites/horror_slime_splat2.png");

        if (this.game.camera.level == "level1") {
            this.spritesheet = this.level1SpriteSheet;
            this.splatsheet = this.level1SplatSheet;
        } else {
            this.spritesheet = this.level2SpriteSheet; 
            this.splatsheet = this.level2SplatSheet;
        }    
        this.scale = 4;

        this.shootingCooldown = 1;

        // alien's state variables
        this.facing = "right"; // left or right
        this.state = "vibing"; // walking or vibing

        this.spriteHeight = 21 * this.scale; // scaled height
        this.spriteWidth = 24 * this.scale; // scaled width
        this.shadowHeight = 2 * this.scale;
        this.heightOffset = this.spriteHeight / 2; // used for finding teh midpoint
        this.widthOffset = this.spriteWidth / 2; // udes for finding the midpoint
        this.midpoint = { x: this.xMap + this.widthOffset, y: this.yMap + this.heightOffset };
        this.radius = 4 * this.game.level.tileSize + this.widthOffset + this.heightOffset;

        this.stats = new EnemyStats(172, 11, false, 10, 0, false, 25, 0, 0.5, 50, 0);
        this.WALK = this.stats.speed;
        this.DIAGONAL = Math.sqrt(Math.pow(this.stats.speed, 2) / 2); //  based on WALK speed: 1^2 = 2(a^2); where a = x = y
        

        this.velocity = { x: this.randomDirection(), y: this.randomDirection() }
        while (this.velocity.x == 0 && this.velocity.y == 0) {
            this.velocity = { x: this.randomDirection(), y: this.randomDirection() };
        }
        this.updateBoundingBox();

        this.animations = new Map;
        this.loadAnimations();
        this.animation = this.animations.get("left").get("vibing");
    };

    loadAnimations() {
        this.animations.set("left", new Map);
        this.animations.set("right", new Map);

        this.animations.get("left").set("walking", new Animator(this.spritesheet, 0, 0, 24, 21, 6, .12));
        this.animations.get("left").set("vibing", new Animator(this.spritesheet, 288, 0, 24, 21, 5, .12));
        this.animations.get("left").set("hurt", new Animator(this.spritesheet, 528, 0, 24, 21, 1, 0.08));

        this.animations.get("right").set("walking", new Animator(this.spritesheet, 144, 0, 24, 21, 6, .12));
        this.animations.get("right").set("vibing", new Animator(this.spritesheet, 408, 0, 24, 21, 5, .12));
        this.animations.get("right").set("hurt", new Animator(this.spritesheet, 576, 0, 24, 21, 1, 0.08));

        this.animations.set("splat", new Animator(this.splatsheet, 0, 0, 32, 32, 9, .05));
    };

    randomDirection() {
        let choice = floor(Math.random() * 3);
        switch (choice) {
            case 0:
                return -this.stats.speed;
            case 1:
                return 0;
            case 2:
                return this.stats.speed;
        }
    };

    takeDamage(damage) {
        if (!this.stats.dead && (!this.stats.hurt || this.stats.hurtTimer >= this.stats.hurtTimeout)) {
            this.stats.hurtTimer = 0;
            this.stats.health -= damage;
            if (this.stats.health <= 0) {
                this.stats.hurt = false;
                this.animation = this.animations.get("splat");
                this.stats.dead = true;
            } else this.stats.hurt = true;
        }
    }

    update() {
        let velocityUpdated = false;



        if (this.stats.dead) {
            if (this.stats.deadTimer >= this.stats.deadTimeout) {
                this.removeFromWorld = true;
                this.game.addEntity(new Slime(this.game, this.boundingBox.x + this.boundingBox.width - 40, this.boundingBox.y)); // 40 is the size of a scaled slime
                this.game.addEntity(new Slime(this.game, this.boundingBox.x + this.boundingBox.width, this.boundingBox.y));
            } else {
                this.stats.deadTimer++;
                this.velocity.x = 0;
                this.velocity.y = 0;
            }
            this.game.tileGrid.forEach(row => {
                row.forEach(tile => {
                    let type = tile.type;
                    if (type == "south_wall" && this.boundingBox.collide(tile.BB.upper)) this.game.tilesToDrawOnTop.push(tile); // this will always redraw the tile
                });
            });
        } else if (this.stats.hurt) {
            this.stats.hurtTimer++;
            if (this.stats.hurtTimer <= this.stats.hurtTimeout / 2) {
                this.velocity.x = 0;
                this.velocity.y = 0;
            } else if (this.stats.hurtTimer >= this.stats.hurtTimeout) {
                this.stats.hurt = false;
                this.stats.hurtTimer = 0;
                this.velocity.x = this.randomDirection();
                this.velocity.y = this.randomDirection();
            }
            this.game.tileGrid.forEach(row => {
                row.forEach(tile => {
                    let type = tile.type;
                    if (type == "south_wall" && this.boundingBox.collide(tile.BB.upper)) this.game.tilesToDrawOnTop.push(tile); // this will always redraw the tile
                });
            });
        } else {

            // if there were no collisions and goop is within our radius, attempt to shoot + chase Goop
            if (!this.stats.attacking || this.stats.attackTimer >= this.stats.attackTimeout) {

                this.stats.attacking = true;
                this.stats.attackTimer = 0;
                let distance = Math.floor(Math.sqrt(
                    Math.pow((this.midpoint.x - this.game.goop.midpoint.x), 2)
                    + Math.pow((this.midpoint.y - this.game.goop.midpoint.y), 2)));
                if (distance <= this.radius) {
                    // shoot if able

                    if (this.shootingCooldown == 0) {
                        this.game.addEnemyBullet(new EnemyBullet(this.game, this.midpoint.x, this.midpoint.y));
                        this.shootingCooldown = 1;
                    }
                    this.shootingCooldown--;

                    if (this.game.goop.midpoint.x < this.xMap && this.game.goop.midpoint.y < this.yMap) { // if goop is NW of this slime
                        this.velocity.x = -this.WALK;
                        this.velocity.y = -this.WALK;
                    } else if (this.game.goop.midpoint.x > this.xMap && this.game.goop.midpoint.y > this.yMap) { // if goop is SE of this slime
                        this.velocity.x = this.WALK;
                        this.velocity.y = this.WALK;
                    } else if (this.game.goop.midpoint.x > this.xMap && this.game.goop.midpoint.y < this.yMap) { // if goop is NE of this slime
                        this.velocity.x = this.WALK;
                        this.velocity.y = -this.WALK;
                    } else if (this.game.goop.midpoint.x < this.xMap && this.game.goop.midpoint.y > this.yMap) {// if goop is SW of this slime
                        this.velocity.x = -this.WALK;
                        this.velocity.y = this.WALK;
                    } else if (this.game.goop.midpoint.y < this.yMap) { // if goop is N of this slime
                        this.velocity.y = -this.WALK;
                        this.velocity.x = 0;
                    } else if (this.game.goop.midpoint.y > this.yMap) { // else they are S of this slime
                        this.velocity.y = this.WALK;
                        this.velocity.x = 0;
                    } else if (this.game.goop.midpoint.x < this.xMap) { // if goop is W of this slime
                        this.velocity.x = -this.WALK;
                        this.velocity.y = 0;
                    } else { // otherwise goop is E of this slime
                        this.velocity.x = this.WALK;
                        this.velocity.y = 0;
                    }
                    velocityUpdated = true;

                } else {
                    this.stats.attacking = false;
                    this.stats.attackTimer = 0;
                }
            }

            if (velocityUpdated) this.updateBoundingBox();

            // collisions with other entities
            this.game.entities.forEach(entity => {

                let xProjectedBB = velocityUpdated ? this.hurtBox : this.hurtBox.getXProjectedBB(this.velocity.x * this.game.clockTick);
                let yProjectedBB = velocityUpdated ? this.hurtBox : this.hurtBox.getYProjectedBB(this.velocity.y * this.game.clockTick);
    
                if (entity instanceof Terrain && entity.type == "pillar") {
                    if (xProjectedBB.collide(entity.boundingBox) && (!yProjectedBB.collide(entity.boundingBox))) {
                        this.velocity.x = -this.velocity.x;
                        this.velocity.y = this.randomDirection();
                        if (velocityUpdated) this.updateBoundingBox();

                    } else if ((!xProjectedBB.collide(entity.boundingBox)) && (yProjectedBB.collide(entity.boundingBox))) {
                        this.velocity.y = -this.velocity.y;
                        this.velocity.x = this.randomDirection();
                        if (velocityUpdated) this.updateBoundingBox();

                    } else if (xProjectedBB.collide(entity.boundingBox) && yProjectedBB.collide(entity.boundingBox)) {
                        this.velocity.x = -this.velocity.x;
                        this.velocity.y = -this.velocity.y;
                        if (velocityUpdated) this.updateBoundingBox();
                    }
                }

                if (entity instanceof HorrorSlime && entity != this) {
                    // let xProjectedBB = velocityUpdated ? this.boundingBox : this.boundingBox.getXProjectedBB(this.velocity.x);
                    // let yProjectedBB = velocityUpdated ? this.boundingBox : this.boundingBox.getYProjectedBB(this.velocity.y);

                    // if (xProjectedBB.collide(entity.boundingBox)) {
                    //     this.velocity.x = -this.velocity.x;
                    //     this.velocity.y = this.randomDirection();
                    //     velocityUpdated = true;
                    // } else if (yProjectedBB.collide(entity.boundingBox)) {
                    //     this.velocity.y = -this.velocity.y;
                    //     this.velocity.x = this.randomDirection();
                    //     velocityUpdated = true;
                    // } 
                }
            });

            if (velocityUpdated) this.updateBoundingBox();

            // handle wall collisions
            this.game.tileGrid.forEach(row => {
                row.forEach(tile => {
                    let type = tile.type;
                    let xProjectedBB = velocityUpdated ? this.boundingBox : this.boundingBox.getXProjectedBB(this.velocity.x * this.game.clockTick);
                    let yProjectedBB = velocityUpdated ? this.boundingBox : this.boundingBox.getYProjectedBB(this.velocity.y * this.game.clockTick);

                    if (type == "wall") {
                        if (xProjectedBB.collide(tile.BB) && (!yProjectedBB.collide(tile.BB))) {
                            this.velocity.x = -this.velocity.x;
                            this.velocity.y = this.randomDirection();
                        } else if ((!xProjectedBB.collide(tile.BB)) && (yProjectedBB.collide(tile.BB))) {
                            this.velocity.y = -this.velocity.y;
                            this.velocity.x = this.randomDirection();
                        } else if (xProjectedBB.collide(tile.BB) && yProjectedBB.collide(tile.BB)) {
                            this.velocity.x = -this.velocity.x;
                            this.velocity.y = -this.velocity.y;
                        }
                    } else if (type == "north_wall") {
                        if ((xProjectedBB.collide(tile.BB.lower) || xProjectedBB.collide(tile.BB.upper)) && !(yProjectedBB.collide(tile.BB.lower) || yProjectedBB.collide(tile.BB.upper))) {
                            this.velocity.x = -this.velocity.x;
                            this.velocity.y = this.randomDirection();
                        } else if (!(xProjectedBB.collide(tile.BB.lower) || xProjectedBB.collide(tile.BB.upper)) && (yProjectedBB.collide(tile.BB.lower) || yProjectedBB.collide(tile.BB.upper))) {
                            this.velocity.y = -this.velocity.y;
                            this.velocity.x = this.randomDirection();
                        } else if ((xProjectedBB.collide(tile.BB.lower) || xProjectedBB.collide(tile.BB.upper)) && (yProjectedBB.collide(tile.BB.lower) || yProjectedBB.collide(tile.BB.upper))) {
                            this.velocity.x = -this.velocity.x;
                            this.velocity.y = -this.velocity.y;
                        }
                    } else if (type == "south_wall") {
                        if (xProjectedBB.collide(tile.BB.lower) && !(yProjectedBB.collide(tile.BB.lower))) {
                            this.velocity.x = -this.velocity.x;
                            this.velocity.y = this.randomDirection();
                        } else if (!(xProjectedBB.collide(tile.BB.lower)) && (yProjectedBB.collide(tile.BB.lower))) {
                            this.velocity.y = -this.velocity.y;
                            this.velocity.x = this.randomDirection();
                        } else if (xProjectedBB.collide(tile.BB.lower) && yProjectedBB.collide(tile.BB.lower)) {
                            this.velocity.x = -this.velocity.x;
                            this.velocity.y = -this.velocity.y;
                        }
                    }
                    if (velocityUpdated) this.updateBoundingBox();

                    //add tiles to draw on top
                    if (type == "south_wall" && this.boundingBox.collide(tile.BB.upper)) this.game.tilesToDrawOnTop.push(tile); // this will always redraw the tile
                    //if (velocityUpdated && type == "wall" && this.boundingBox.collide(tile.BB)) this.game.tilesToDrawOnTop.push(tile); // this will always redraw the tile
                    //if (velocityUpdated && type == "north_wall" && this.boundingBox.collide(tile.BB) && this.boundingBox.top < tile.BB.bottom) this.game.tilesToDrawOnTop.push(tile);
                });
            });
        }

        // update velocity if they are moving diagonally
        if (this.velocity.x != 0 && this.velocity.y != 0) {
            this.velocity.x = this.velocity.x > 0 ? this.DIAGONAL : -this.DIAGONAL;
            this.velocity.y = this.velocity.y > 0 ? this.DIAGONAL : -this.DIAGONAL;
        } else {
            if (this.velocity.x != 0) this.velocity.x = this.velocity.x > 0 ? this.WALK : -this.WALK;
            if (this.velocity.y != 0) this.velocity.y = this.velocity.y > 0 ? this.WALK : -this.WALK;
        }

        // update the positions
        this.xMap += this.velocity.x * this.game.clockTick;
        this.yMap += this.velocity.y * this.game.clockTick;
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

        // update the animation
        this.animation = this.animations.get(this.facing).get(this.state);

        if (this.stats.hurt) {
            this.animation = this.animations.get(this.facing).get("hurt");
        } else if (this.stats.dead) {
            this.animation = this.animations.get("splat");
        }

        this.midpoint = { x: this.xMap + this.widthOffset, y: this.yMap + this.heightOffset };
        if (this.stats.attacking) this.stats.attackTimer++;
    };

    updateBoundingBox() {
        this.hurtBox = new BoundingBox(this.xMap + 1, this.yMap, this.spriteWidth - 2, this.spriteHeight - this.shadowHeight);
        this.boundingBox = new BoundingBox(this.xMap + 5, this.yMap + 2 * (this.spriteHeight / 3), this.spriteWidth - 10, (this.spriteHeight / 3) - this.shadowHeight);//+5 x, -10 width for narrower box
    };

    draw(ctx) {
        this.animation.drawFrame(this.game.clockTick, ctx, this.xMap - this.game.camera.x, this.yMap - this.game.camera.y, this.scale);

        if (this.game.debug) {
            drawBoundingBox(this.hurtBox, ctx, this.game, "red");
            drawBoundingBox(this.boundingBox, ctx, this.game, "white");
            ctx.strokeStyle = 'red';
            // draws midpoint
            ctx.strokeRect(this.midpoint.x - this.game.camera.x, this.midpoint.y - this.game.camera.y, 2, 2);
            // Draws their radius
            ctx.beginPath();
            ctx.arc(this.midpoint.x - this.game.camera.x, this.midpoint.y - this.game.camera.y, this.radius, 0, Math.PI * 2, true);
            ctx.stroke();
        }
    };
};