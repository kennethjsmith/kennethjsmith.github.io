class Flower {
    constructor(game, x, y, boundingBox) {
        this.game = game;

        // RNG 1, 2, 3
        this.random = Math.floor(Math.random() * 3) + 1;
        if (this.game.camera.level == "level1"){
            if (this.random == 1) this.spritesheet = ASSET_MANAGER.getAsset("./sprites/level1_flower1.png");
            else if (this.random == 2) this.spritesheet = ASSET_MANAGER.getAsset("./sprites/level1_flower2.png");
            else if (this.random == 3) this.spritesheet = ASSET_MANAGER.getAsset("./sprites/level1_flower3.png");
        }
        else if (this.game.camera.level == "level2"){
            if (this.random == 1) this.spritesheet = ASSET_MANAGER.getAsset("./sprites/level2_flower1.png");
            else if (this.random == 2) this.spritesheet = ASSET_MANAGER.getAsset("./sprites/level2_flower2.png");
            else if (this.random == 3) this.spritesheet = ASSET_MANAGER.getAsset("./sprites/level2_flower3.png");
        }

        this.scale = 5;
        this.spriteHeight = 20 * this.scale; // scaled height
        this.spriteWidth = 12 * this.scale; // scaled width
        this.heightOffset = this.spriteHeight - 15; // offset so that flowers spawn in the correct spot over dead slimes
        this.widthOffset = this.spriteWidth / 2; // offset so that flowers spawn in the correct spot over dead slimes
        
        this.xMap = x - this.widthOffset;
        this.yMap = y - this.heightOffset;
        this.boundingBox = boundingBox;
        const BUFFER = 10;
        this.boundingBox.midpoint.y -= BUFFER; 
        // this.midpoint = { x: this.xMap + this.widthOffset, y: this.yMap + this.heightOffset };

        // flower's state variables
        this.state = "growing"; // growing grown, or destroyed
        if (this.game.camera.play) this.game.camera.flowers++;

        this.animations = new Map;
        this.loadAnimations();

        this.animation = this.animations.get(this.state);
    };

    loadAnimations() {
        this.animations.set("growing", new Animator(this.spritesheet, 0, 0, 12, 20, 6, .2));
        this.animations.set("grown", new Animator(this.spritesheet, 60, 0, 12, 20, 1, .08));
        this.animations.set("destroyed", new Animator(this.spritesheet, 72, 0, 12, 20, 1, .08));
    };

    update() {
        if (this.animation.currentFrame() == 5) this.state = "grown";
        this.animation = this.animations.get(this.state);

        this.game.tileGrid.forEach(row => {
            row.forEach(tile => {
                let type = tile.type;
                if (type == "south_wall" && this.boundingBox.collide(tile.BB.upper)) this.game.tilesToDrawOnTop.push(tile); // this will always redraw the tile
            });
        });
    };

    draw(ctx) {
        this.animation.drawFrame(this.game.clockTick, ctx, this.xMap-this.game.camera.x, this.yMap-this.game.camera.y, this.scale);
    };
};