class Jar {
    constructor(game, location, item) {
        this.game = game;
        this.xMap = location.x;
        this.yMap = location.y;
        this.item = item;

        this.level1SpriteSheet = ASSET_MANAGER.getAsset("./sprites/jar1.png");
        this.level2SpriteSheet = ASSET_MANAGER.getAsset("./sprites/jar2.png");

        if (this.game.camera.level == "level1") {
            this.spritesheet = this.level1SpriteSheet;
        } else {
            this.spritesheet = this.level2SpriteSheet; 
        }    
        this.scale = 4;
        this.status = "new";
        this.hurtTimer = 0;
        this.hurtTimeout = 10;

        this.spriteHeight = 16 * this.scale; // scaled height
        this.spriteWidth = 16 * this.scale; // scaled width
        this.shadowHeight = 2 * this.scale;
        this.heightOffset = this.spriteHeight / 2; // used for finding teh midpoint
        this.widthOffset = this.spriteWidth / 2; // udes for finding the midpoint
        this.midpoint = { x: this.xMap + this.widthOffset, y: this.yMap + this.heightOffset };

        this.updateBoundingBox();

        this.animations = new Map;
        this.loadAnimations();
        this.animation = this.animations.get("new");
    };

    loadAnimations() {
        this.animations.set("new", new Animator(this.spritesheet, 0, 0, 16, 16, 1, .12));
        this.animations.set("flash1", new Animator(this.spritesheet, 16, 0, 16, 16, 1, .12));
        this.animations.set("cracked", new Animator(this.spritesheet,  32, 0, 16, 16, 1, .12));
        this.animations.set("flash2", new Animator(this.spritesheet, 48, 0, 16, 16, 1, .12));
        this.animations.set("broken", new Animator(this.spritesheet, 64, 0, 16, 16, 1, .12));
    };

    takeDamage(damage) {
        if (this.status == "new") {
            this.hurtTimer = 0;
            this.status = "flash1";
        }
        
        if (this.status == "cracked") {
            this.hurtTimer = 0;
            this.status = "flash2";
        }
    }

    update() {
        if (this.status == "flash1"){
            this.hurtTimer++;
            if(this.hurtTimer == this.hurtTimeout){
                this.status = "cracked";
            }
        }
        if (this.status == "flash2"){
            this.hurtTimer++;
            if(this.hurtTimer == this.hurtTimeout){
                this.status = "broken";
                if (this.item) {
                    if (this.item == "laser") {
                        this.game.addEntity(new Gun("laser", this.game, false, this.xMap+5, this.yMap+20));
                    
                    } else if (this.item == "bubble") {
                        this.game.addEntity(new Gun("bubble", this.game, false, this.xMap+5, this.yMap+20));

                    } else if (this.item == "uzi") {
                        this.game.addEntity(new Gun("uzi", this.game, false, this.xMap+5, this.yMap+20)); // these magic #s center item over jar

                    } else if (this.item == "medkit") {
                        this.game.addEntity(new Medkit(this.game, this.xMap+5, this.yMap+20));
                        console.log("here");
                    }
                }
            }
        }
        this.animation = this.animations.get(this.status); 
    };

    updateBoundingBox() {
        this.hurtBox = new BoundingBox(this.xMap + 1, this.yMap, this.spriteWidth - 2, this.spriteHeight - this.shadowHeight);
        this.boundingBox = new BoundingBox(this.xMap + 5, this.yMap + 2 * (this.spriteHeight / 3), this.spriteWidth - 10, (this.spriteHeight / 3) - this.shadowHeight);//+5 x, -10 width for narrower box

    };

    draw(ctx) {
        this.animation.drawFrame(this.game.clockTick, ctx, Math.floor(this.xMap - this.game.camera.x), Math.floor(this.yMap - this.game.camera.y), this.scale);

        if (this.game.debug) {
            drawBoundingBox(this.hurtBox, ctx, this.game, "red");
            drawBoundingBox(this.boundingBox, ctx, this.game, "white");
            ctx.strokeStyle = 'red';
            // draws midpoint
            ctx.strokeRect(Math.floor(this.midpoint.x - this.game.camera.x), Math.floor(this.midpoint.y - this.game.camera.y), 2, 2);
            // Draws their radius
            ctx.beginPath();
            ctx.arc(Math.floor(this.midpoint.x - this.game.camera.x), Math.floor(this.midpoint.y - this.game.camera.y), this.radius, 0, Math.PI * 2, true);
            ctx.stroke();
        }
    };
};