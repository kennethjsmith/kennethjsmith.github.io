class Terrain {
    constructor(game, type, x, y) {
        this.game = game;
        this.type = type;
        this.xMap = x;
        this.yMap = y;

        this.selectSprite(type);
        this.updateBoundingBox();
    };

    selectSprite(type) {
        if (this.game.camera.level == "level1") {
            if (type == "pillar") {
                this.sprite = new Animator(ASSET_MANAGER.getAsset("./sprites/level1_pillar.png"), 0, 0, 16, 44, 1, 1);
                this.scale = 5;
                this.spriteHeight = 44 * this.scale;
                this.spriteWidth = 16 * this.scale;
                this.spriteBaseHeight = 11 * this.scale;
                this.spriteBaseWidth = 7 * this.scale;
                this.shadowHeight = 13 * this.scale;

            } else if (type == "plant") {
                this.getRandomLevel1Plant();

            } else if (type == "wideplant") {
                this.sprite = new Animator(ASSET_MANAGER.getAsset("./sprites/level1_wideplant.png"), 0, 0, 32, 16, 1, 1);
                this.scale = 5;
                this.spriteHeight = 16 * this.scale;
                this.spriteWidth = 32 * this.scale;
                this.shadowHeight = 2 * this.scale;

            } else if (type == "wallplant") {
                this.getRandomLevel1WallPlant();

            } else if (type == "rock") {
                this.getRandomLevel1Rock();

            }


        } else if (this.game.camera.level = "level2") {
            if (type == "pillar") {
                this.sprite = new Animator(ASSET_MANAGER.getAsset("./sprites/level2_pillar.png"), 0, 0, 16, 44, 1, 1);
                this.scale = 5;
                this.spriteHeight = 44 * this.scale;
                this.spriteBaseHeight = 11 * this.scale;
                this.spriteBaseWidth = 7 * this.scale;
                this.spriteWidth = 16 * this.scale;
                this.shadowHeight = 13 * this.scale;


            } else if (type == "plant") {
                this.getRandomLevel2Plant();

            } else if (type == "wideplant") {
                this.sprite = new Animator(ASSET_MANAGER.getAsset("./sprites/level2_wideplant.png"), 0, 0, 32, 16, 1, 1);
                this.scale = 5;
                this.spriteHeight = 16 * this.scale;
                this.spriteWidth = 32* this.scale;
                this.shadowHeight = 2 * this.scale;

            } else if (type == "wallplant") {
                this.getRandomLevel2WallPlant();

            } else if (type == "rock") {
                this.getRandomLevel2Rock();

            }
        }
    }

    getRandomLevel1Plant() {
        var choice = floor(Math.random() * 100);
        if (choice < 50) {
            this.sprite = new Animator(ASSET_MANAGER.getAsset("./sprites/level1_plant1.png"), 0, 0, 12, 12, 1, 1);
            this.scale = 5;
            this.spriteHeight = 12 * this.scale;
            this.spriteWidth = 12 * this.scale;
            this.shadowHeight = 1 * this.scale;

        } else if (choice < 90) {
            this.sprite = new Animator(ASSET_MANAGER.getAsset("./sprites/level1_plant2.png"), 0, 0, 13, 8, 1, 1);
            this.scale = 5;
            this.spriteHeight = 8 * this.scale;
            this.spriteWidth = 13 * this.scale;
            this.shadowHeight = 1 * this.scale;

        } else {
            this.sprite = new Animator(ASSET_MANAGER.getAsset("./sprites/level1_plant3.png"), 0, 0, 12, 12, 1, 1);
            this.scale = 4;
            this.spriteHeight = 12 * this.scale;
            this.spriteWidth = 12 * this.scale;
            this.shadowHeight = 1 * this.scale;

        }
    }

    getRandomLevel2Plant() {
        var choice = floor(Math.random() * 100);
        if (choice < 50) {
            this.sprite = new Animator(ASSET_MANAGER.getAsset("./sprites/level2_plant1.png"), 0, 0, 12, 12, 1, 1);
            this.scale = 5;
            this.spriteHeight = 12 * this.scale;
            this.spriteWidth = 12 * this.scale;
            this.shadowHeight = 1 * this.scale;

        } else if (choice < 90) {
            this.sprite = new Animator(ASSET_MANAGER.getAsset("./sprites/level2_plant2.png"), 0, 0, 13, 8, 1, 1);
            this.scale = 5;
            this.spriteHeight = 8 * this.scale;
            this.spriteWidth = 13 * this.scale;
            this.shadowHeight = 1 * this.scale;

        } else {
            this.sprite = new Animator(ASSET_MANAGER.getAsset("./sprites/level2_plant3.png"), 0, 0, 12, 12, 1, 1);
            this.scale = 4;
            this.spriteHeight = 12 * this.scale;
            this.spriteWidth = 12 * this.scale;
            this.shadowHeight = 1 * this.scale;
        }
    }

    getRandomLevel1WallPlant() {
        var choice = floor(Math.random() * 100);
        if (choice < 50) {
            this.sprite = new Animator(ASSET_MANAGER.getAsset("./sprites/level1_wallplant.png"), 0, 0, 16, 16, 1, 1);
            this.scale = 4;
            this.spriteHeight = 16 * this.scale;
            this.spriteWidth =  16 * this.scale;
            this.shadowHeight = 0;

        } else {
            this.sprite = new Animator(ASSET_MANAGER.getAsset("./sprites/level1_wallplant2.png"), 0, 0, 16, 16, 1, 1);
            this.scale = 4;
            this.spriteHeight = 16 * this.scale;
            this.spriteWidth = 16 * this.scale;
            this.shadowHeight = 0;
        }
    }

    getRandomLevel2WallPlant() {
        var choice = floor(Math.random() * 100);
        if (choice < 50) {
            this.sprite = new Animator(ASSET_MANAGER.getAsset("./sprites/level2_wallplant.png"), 0, 0, 16, 16, 1, 1);
            this.scale = 4;
            this.spriteHeight = 16 * this.scale;
            this.spriteWidth =  16 * this.scale;
            this.shadowHeight = 0;

        } else {
            this.sprite = new Animator(ASSET_MANAGER.getAsset("./sprites/level2_wallplant2.png"), 0, 0, 16, 16, 1, 1);
            this.scale = 4;
            this.spriteHeight = 16 * this.scale;
            this.spriteWidth = 16 * this.scale;
            this.shadowHeight = 0;
        }
    }

    // sprite height, width, and shadow are all 0 so that rocks bounding box will be 0x0
    // this prevents the rocks from drawing on top of goop
    getRandomLevel1Rock() {
        var choice = floor(Math.random() * 100);
        if (choice < 50) {
            this.sprite = new Animator(ASSET_MANAGER.getAsset("./sprites/level1_rocks.png"), 0, 0, 14, 12, 1, 1);
            this.scale = 4;
            this.spriteHeight = 0 * this.scale;
            this.spriteWidth = 0 * this.scale;
            this.shadowHeight = 0;

        } else {
            this.sprite = new Animator(ASSET_MANAGER.getAsset("./sprites/level1_rocks2.png"), 0, 0, 16, 16, 1, 1);
            this.scale = 4;
            this.spriteHeight = 0 * this.scale;
            this.spriteWidth = 0 * this.scale;
            this.shadowHeight = 0;
        }
    }

    // sprite height, width, and shadow are all 0 so that rocks bounding box will be 0x0
    // this prevents the rocks from drawing on top of goop
    getRandomLevel2Rock() {
        var choice = floor(Math.random() * 100);
        if (choice < 50) {
            this.sprite = new Animator(ASSET_MANAGER.getAsset("./sprites/level2_rocks.png"), 0, 0, 14, 12, 1, 1);
            this.scale = 4;
            this.spriteHeight = 0;
            this.spriteWidth = 0;
            this.shadowHeight = 0;

        } else {
            this.sprite = new Animator(ASSET_MANAGER.getAsset("./sprites/level2_rocks2.png"), 0, 0, 16, 16, 1, 1);
            this.scale = 4;
            this.spriteHeight = 0;
            this.spriteWidth = 0;
            this.shadowHeight = 0;
        }
    }

    update() {
        
    };

    updateBoundingBox() {
        //this.boundingBox = new BoundingBox(this.xMap, this.yMap, this.spriteWidth, this.spriteHeight - this.shadowHeight);
        //this.hurtBox = new BoundingBox(this.xMap+1, this.yMap, this.spriteWidth-2, this.spriteHeight - this.shadowHeight);
        this.boundingBox = new BoundingBox(this.xMap, this.yMap + 2*(this.spriteHeight/3), this.spriteWidth, (this.spriteHeight/3)-this.shadowHeight);
        if (this.type == "pillar") {
            this.boundingBox = new BoundingBox(this.xMap + (4*this.scale), this.yMap + (24*this.scale), this.spriteBaseWidth, this.spriteBaseHeight);
        }
    };

    draw(ctx) {
        this.sprite.drawFrame(this.game.clockTick, ctx, Math.floor(this.xMap-this.game.camera.x), Math.floor(this.yMap-this.game.camera.y), this.scale);
    };



};