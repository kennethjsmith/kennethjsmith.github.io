class Bulb {
    constructor(game, x, y) {
        this.game = game;
        if (this.game.camera.level == "level1") this.spritesheet = ASSET_MANAGER.getAsset("./sprites/bulb1.png");
        else if (this.game.camera.level == "level2") this.spritesheet = ASSET_MANAGER.getAsset("./sprites/bulb2.png");

        this.scale = 5;
        this.spriteHeight = 8 * this.scale; // scaled height
        this.spriteWidth = 6 * this.scale; // scaled width

        this.xMap = x;
        this.yMap = y;

        this.animations = new Map;
        this.loadAnimations();
        this.updateBoundingBox();

        this.sparkle = false;
        this.animation = this.animations.get(this.sparkle);
    };

    loadAnimations() {
        this.animations.set(false, new Animator(this.spritesheet, 0, 0, 10, 12, 1, 1));
        this.animations.set(true, new Animator(this.spritesheet, 0, 0, 10, 12, 7, .08));
        this.animations.set("select", new Animator(this.spritesheet, 70, 0, 10, 12, 1, 1));
    };

    updateBoundingBox() {
        this.boundingBox = new BoundingBox(this.xMap, this.yMap, this.spriteWidth, this.spriteHeight);
    };

    update() {

        if (this.boundingBox.collide(this.game.goop.hurtBox)){
            this.sparkle = false;
            this.animation = this.animations.get("select");
            if (this.game.interact) {
                this.game.camera.seedPickedUp = true;
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