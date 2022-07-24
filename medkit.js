class Medkit {
    constructor(game, x, y) {
        this.game = game;
        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/health_drop.png");

        this.scale = 4;
        this.spriteHeight = 12 * this.scale; // scaled height
        this.spriteWidth = 12 * this.scale; // scaled width

        this.xMap = x;
        this.yMap = y;

        this.animations = new Map;
        this.loadAnimations();
        this.updateBoundingBox();

        this.sparkle = false;
        this.animation = this.animations.get(this.sparkle);
    };

    loadAnimations() {
        this.animations.set(false, new Animator(this.spritesheet, 0, 0, 12, 12, 1, 1));
        this.animations.set(true, new Animator(this.spritesheet, 0, 0, 12, 12, 7, .08));
        this.animations.set("select", new Animator(this.spritesheet, 84, 0, 12, 12, 1, 1));
    };

    updateBoundingBox() {
        this.boundingBox = new BoundingBox(this.xMap, this.yMap, this.spriteWidth, this.spriteHeight);
    };

    update() {

        if (this.boundingBox.collide(this.game.goop.hurtBox)){
            this.sparkle = false;
            this.animation = this.animations.get("select");
            if (this.game.interact) {
                if (this.game.camera.health <= 2) this.game.camera.health++;
                else this.game.camera.health = 3;
                this.removeFromWorld = true;
            }
        } else {
            this.animation = this.animations.get(this.sparkle);
            if (this.sparkle && this.animation.isDone()) {
                this.sparkle = false;
                this.animation = this.animations.get(this.sparkle);
            } else if (!this.sparkle && this.animation.isDone()) {
                this.sparkle = true;
                this.animation = this.animations.get(this.sparkle);
            }
        }
    };

    draw(ctx) {
        this.animation.drawFrame(this.game.clockTick, ctx, this.xMap-this.game.camera.x, this.yMap-this.game.camera.y, this.scale);
    };

};