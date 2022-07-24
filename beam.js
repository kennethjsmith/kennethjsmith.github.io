class Beam {
    constructor(game) {
        this.game = game;
        this.SPEED = 1;
       // this.SPEED = 286; // TODO, we can probably make a "stats" class for bullets, for dif types of guns
        this.range = 700; //how many updates, ie this bullet will travel speed*range
        this.removeFromWorld = false;
        this.lifeLength = 10;

        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/laser_segments.png");

        this.SIZE = 12; // find better way to get this pizel width
        this.SCALE = 2;        
        this.xMap = this.game.gun.barrelTipXMap;
        this.yMap = this.game.gun.barrelTipYMap;
        
        this.xTrajectory = (this.game.gun.barrelTipXMap - this.game.gun.barrelMidXMap)/this.game.gun.bigR;
        this.yTrajectory = (this.game.gun.barrelTipYMap - this.game.gun.barrelMidYMap)/this.game.gun.bigR;

        // normalize the trajectory
        this.xVelocity = this.xTrajectory * this.SPEED;
        this.yVelocity = this.yTrajectory * this.SPEED;
        this.spriteWidth = this.SIZE * this.SCALE; 

        this.trackedTiles = []; // this adds tiles to draw on top each update
        this.segments = [];
        while (this.range > 0) {
            this.segments.push({ 
                x: this.xMap, 
                y: this.yMap, 
                boundingBox: this.addBoundingBox(this.xMap, this.yMap)});

            this.xMap += this.xVelocity;
            this.yMap += this.yVelocity;
            this.range--;
        }

        this.findEndPoint();

        this.animations = new Map;
        this.loadAnimations();        
        this.animations = this.animations.get("shot");
    };

    loadAnimations() {
        this.animations.set("shot", new Animator(this.spritesheet, 0, 0, 12, 12, 1, 1));
    };

    update() {
        // goes through enemies, gives them damage if there is a collision
        this.segments.forEach(segment => {
            this.game.entities.forEach(entity => {
                if (entity instanceof Slime || entity instanceof HorrorSlime || entity instanceof Boss || (entity instanceof Jar && entity.status != "broken")) {
                    if (entity.hurtBox && segment.boundingBox.collide(entity.hurtBox)) {
                        entity.takeDamage(this.game.gun.damage[this.game.gun.type]);
                    } 
                }
            });
        });

        this.lifeLength--;
        if (this.lifeLength == 0) this.removeFromWorld = true;

        this.trackedTiles.forEach(tile => this.game.tilesToDrawOnTop.push(tile));
    };

    addBoundingBox(x, y) {
        return new BoundingBox(x, y, this.spriteWidth, this.spriteWidth);
    };

    findEndPoint() {
        let endFound = false;

        // check collisions with walls to set the end point of the beam
        for (let i = 0; i < this.segments.length && endFound == false; i++) {
            let segment = this.segments[i];
            
            this.game.tileGrid.forEach( row => {
                row.forEach( tile => {
                    let type = tile.type;
                    if (type == "wall" && segment.boundingBox.collide(tile.BB)){
                        this.segments = this.segments.slice(0, i);
                        endFound = true;
                    } else if (type == "north_wall" && segment.boundingBox.collide(tile.BB.upper)) {
                        this.segments = this.segments.slice(0, i);
                        endFound = true;
                    } else if (type == "south_wall" && (segment.boundingBox.collide(tile.BB.lower) || segment.boundingBox.collide(tile.BB.upper))) {
                        if (segment.boundingBox.collide(tile.BB.lower)){
                            this.segments = this.segments.slice(0, i);
                            endFound = true;
                        }
                        this.game.tilesToDrawOnTop.push(tile);
                        this.trackedTiles.push(tile);
                    }
                });
            });

            this.game.entities.forEach( entity => {
                if (entity instanceof Terrain && entity.type == "pillar") {
                    if (segment.boundingBox.collide(entity.boundingBox)) {
                        this.segments = this.segments.slice(0, i);
                    }
                }
            });
        }
    };


    draw(ctx) {
        this.segments.forEach(segment => { 
            this.animations.drawFrame(this.game.clockTick, ctx, segment.x - this.game.camera.x - this.spriteWidth/2, segment.y - this.game.camera.y - this.spriteWidth/2, this.SCALE);
        });

    };
};