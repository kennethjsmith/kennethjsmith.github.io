class Crosshair {
    constructor(game) {
        this.game = game;
        this.game.crosshair = this;
        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/crosshair.png");
        this.SIZE = 13; // find better way to get this pizel width
        this.SCALE = 3;
        this.spriteSize = this.SIZE * this.SCALE;

        this.xMap = null;
        this.yMap = null;
        this.xMidpoint = null;
        this.yMidpoint = null;


        //adjust x and y to center bullet sprite drawing over trajectory, trajectory*size/2
        this.spriteWidth = this.SIZE * this.SCALE;

        this.animations = new Map;
        this.loadAnimations();
        
        this.animations = this.animations.get("crosshair1");
    };

    loadAnimations() {
        this.animations.set("crosshair1", new Animator(this.spritesheet, 0, 0, this.SIZE, this.SIZE, 1, 1));
    };

    update() {
        this.xMap = this.game.mouseX + this.game.camera.x;
        this.yMap = this.game.mouseY + this.game.camera.y;

        this.xMidpoint = this.xMap + this.spriteSize/2;
        this.yMidpoint = this.yMap + this.spriteSize/2;
    };


    draw(ctx) {
        this.animations.drawFrame(this.game.clockTick, ctx, this.xMap-this.game.camera.x, this.yMap-this.game.camera.y, this.SCALE); //this had -9 on the x
    };
};