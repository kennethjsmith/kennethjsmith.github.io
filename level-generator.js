class LevelGenerator {

    constructor(game, width, height) {
        this.game = game;

        this.level1SpriteSheet = ASSET_MANAGER.getAsset("./sprites/level1.png");
        this.level2SpriteSheet = ASSET_MANAGER.getAsset("./sprites/level2.png");
        if (this.game.camera.level == "level1") this.spritesheet = this.level1SpriteSheet;
        else this.spritesheet = this.level2SpriteSheet;
        this.tileGrid = [];

        this.levelAssets = new Map;
        this.loadWalls();
        this.loadGround();
        
        this.height = height; // each increment of height is 16 pixels
        this.width = width; // each increment of width is 16 pixels
        this.tilePixelSize = 16;
        this.scale = 5;
        this.tileSize = this.scale * this.tilePixelSize;

        this.setup();
        this.createFloors();
        this.postProcessGrid();
        this.spawnLevel();
        this.addBoundingBoxes(); 
        this.game.tileGrid = this.tileGrid;  
    };

    setup() {

        // create gridspapce (2d array)
        // set every cell to be an empty gridspace
        this.grid = [];
        for (let row = 0; row < this.height; row++) {
            this.grid.push([]);
            for (let col = 0; col < this.width; col++) {
                this.grid[row][col] = ("empty");
            }
        }

        // fill every space in the sprite grid with a filler ground
        for (let row = 0; row < this.height; row++) {
            this.tileGrid.push([]);
            for (let col = 0; col < this.width; col++) {
                this.tileGrid[row][col] = 
                {   
                    type: "empty",
                    BB: null, 
                    image: this.levelAssets.get("ground").get("filler")                     
                };
            }
        }

        this.maxWalkers = 15; 
        this.chanceWalkerChangeDir = 0.1;
        this.chanceWalkerSpawn = 0.3;
        this.chanceWalkerDestroy = 0.25;
        this.percentToFill = 0.45; 

        // create empty list of walkers
        this.walkers = [];

        // put a walker at the center of the grid, give it random direction
        let walker = { 
            direction: this.randomDirection(), 
            row: floor(this.height / 2), 
            col: floor(this.width / 2) }

        // add it to the list of walkers
        this.walkers.push(walker);
    };

    randomDirection() {
        var choice = floor(Math.random() * 4);
        switch (choice) {
            case 0:
                return "S";
            case 1:
                return "W";
            case 2: 
                return "N";
            case 3: 
                return "E";
        }
    };

    createFloors() {
        var numFloors = 0;
        var iteration = 0;
        var edgeBuffer = 10;
        
        do {
             //avoid the boarder of the grid
             for (let i = 0; i < this.walkers.length; i++) {
                let currWalker = this.walkers[i];
                if (currWalker.row <= edgeBuffer) currWalker.row = edgeBuffer + 1;
                if (currWalker.row >= this.height - edgeBuffer) currWalker.row = this.height - edgeBuffer - 1;
                if (currWalker.col <= edgeBuffer) currWalker.col = edgeBuffer + 1;
                if (currWalker.col >= this.width - edgeBuffer) currWalker.col = this.width - edgeBuffer - 1;
                this.walkers[i] = currWalker;
            }
        
            // foreach walker in the list of walkers:
            // create a 3x3 floorspace where the walker currently is
            this.walkers.forEach (curr => {
                this.grid[curr.row][curr.col] = "floor";
                this.grid[curr.row+1][curr.col] = "floor";
                this.grid[curr.row+2][curr.col] = "floor";

                this.grid[curr.row][curr.col+1] = "floor";
                this.grid[curr.row+1][curr.col+1] = "floor";
                this.grid[curr.row+2][curr.col+1] = "floor";

                this.grid[curr.row][curr.col+2] = "floor";
                this.grid[curr.row+1][curr.col+2] = "floor";
                this.grid[curr.row+2][curr.col+2] = "floor";

                numFloors++;
            })

            // chance to destroy the walker
            let walkerCount = this.walkers.length;
            for (let i = 0; i < walkerCount; i++) {
                if (Math.random() < this.chanceWalkerDestroy && this.walkers.length > 1) {
                    this.walkers.splice(i, 1);
                    break;
                }
            }

            // chance for walker to pick a new direction
            for (let i = 0; i < this.walkers.length; i++) {
                let currWalker = this.walkers[i];
                if (Math.random() < this.chanceWalkerChangeDir) {
                    currWalker.direction = this.randomDirection();
                    this.walkers[i] = currWalker;
                }
            }

            // chance to spawn a new walker
            let numChecks = this.walkers.length;
            for (let i = 0; i < numChecks; i++) {
                if (Math.random() < this.chanceWalkerSpawn && this.walkers.length < this.maxWalkers) {
                    let currWalker = this.walkers[i];
                    this.walkers.push({ direction: this.randomDirection(), row: currWalker.row, col: currWalker.col })
                }
            }

            // move the walkers
            for (let i = 0; i < this.walkers.length; i++) {
                let currWalker = this.walkers[i];
                let direction = currWalker.direction;
                switch (direction) {
                    case "S":
                        currWalker.row = currWalker.row - 1;
                        break;
                    case "W":
                        currWalker.col = currWalker.col - 1;
                        break;
                    case "N": 
                        currWalker.row = currWalker.row + 1;
                        break;
                    default: 
                        currWalker.col = currWalker.col + 1;
                        break;
                }
                this.walkers[i] = currWalker;
            }

            // check to exit the loop
            if (numFloors / (this.width * this.height) > this.percentToFill) break;
            iteration++;
        } while (iteration < 1000); // early termination if we are going for too long
    };

    // removes all non-floor spaces that are only 1 square wide OR 1 square tall
    postProcessGrid() {
        let cleanGrid = false;
        while (!cleanGrid) {
            cleanGrid = true;
            for (var row = 1; row < this.height - 1; row++) {
                for (var col = 1; col < this.width - 1; col++) {
                    let curr = this.grid[row][col];
                    let northOfCurr = this.grid[row - 1][col];
                    let westOfCurr = this.grid[row][col - 1];
                    let nwOfCurr = this.grid[row - 1][col - 1];
                    let southOfCurr = this.grid[row + 1][col];
                    let seOfCurr = this.grid[row + 1][col + 1]
                    let eastOfCurr = this.grid[row][col + 1];
                    let neOfCurr = this.grid[row - 1][col + 1];
                    let swOfCurr = this.grid[row + 1][col - 1];

                    if (curr == "empty") {
                        if (northOfCurr == "floor" && southOfCurr == "floor") {
                            this.grid[row][col] = "floor";
                            cleanGrid = false;
                        }

                        if (eastOfCurr == "floor" && westOfCurr == "floor") {
                            this.grid[row][col] = "floor"; 
                            cleanGrid = false;
                        }

                        if (southOfCurr == "floor" 
                            && neOfCurr == "floor" 
                            && eastOfCurr == "empty" 
                            && westOfCurr == "empty"
                            && northOfCurr == "empty") {
                                this.grid[row + 1][col] = "empty"
                                cleanGrid = false;
                        }  

                        if (southOfCurr == "floor" 
                        && nwOfCurr == "floor" 
                        && eastOfCurr == "empty" 
                        && westOfCurr == "empty"
                        && northOfCurr == "empty") {
                            this.grid[row + 1][col] = "empty"
                            cleanGrid = false;
                    }  
                    }
                }
            }
        }

    };

    spawnLevel() {

        for (var row = 1; row < this.height - 1; row++) {
            for (var col = 1; col < this.width - 1; col++) {
                let curr = this.grid[row][col];
                let northOfCurr = this.grid[row - 1][col];
                let westOfCurr = this.grid[row][col - 1];
                let nwOfCurr = this.grid[row - 1][col - 1];
                let southOfCurr = this.grid[row + 1][col];
                let seOfCurr = this.grid[row + 1][col + 1]
                let eastOfCurr = this.grid[row][col + 1];
                let neOfCurr = this.grid[row - 1][col + 1];
                let swOfCurr = this.grid[row + 1][col - 1];

                if (curr == "floor") {
                    if (nwOfCurr == "empty" && northOfCurr == "empty" && westOfCurr == "empty") {
                        this.tileGrid[row][col] = 
                        { 
                            type: "floor",
                            BB: null, 
                            image: this.levelAssets.get("ground").get("shadow").get("corner"),
                            row: row,
                            col: col 
                        };

                    } else if (nwOfCurr == "empty" && northOfCurr == "floor" && westOfCurr == "floor") {
                        this.tileGrid[row][col] = 
                        { 
                            type: "floor",
                            BB: null, 
                            image: this.levelAssets.get("ground").get("shadow").get("invertedCorner"),
                            row: row,
                            col: col 
                        };

                    } else if (nwOfCurr == "floor" && northOfCurr == "floor" && westOfCurr == "empty") {
                        this.tileGrid[row][col] = 
                        { 
                            type: "floor",
                            BB: null, 
                            image: this.levelAssets.get("ground").get("shadow").get("west").get("gradient"),
                            row: row,
                            col: col 
                        };

                    } else if (northOfCurr == "empty" && nwOfCurr == "floor" && westOfCurr == "floor") {
                        this.tileGrid[row][col] = 
                        { 
                            type: "floor",
                            BB: null, 
                            image: this.levelAssets.get("ground").get("shadow").get("north").get("gradient"),
                            row: row,
                            col: col 
                        };

                    } else if (northOfCurr == "empty") {
                        this.tileGrid[row][col] = 
                        { 
                            type: "floor",
                            BB: null, 
                            image: this.randomNorthGround(),
                            row: row,
                            col: col 
                        };

                    } else if (westOfCurr == "empty") {
                        this.tileGrid[row][col] = 
                        { 
                            type: "floor",
                            BB: null, 
                            image: this.randomWestGround(),
                            row: row,
                            col: col 
                        };

                    } else {
                        this.tileGrid[row][col] = 
                        {
                            type: "floor",
                            BB: null, 
                            image: this.randomGround(),
                            row: row,
                            col: col 
                        };
                    }

                } else if (curr == "empty") {

                    if (this.isNorthSouthWallTop(row, col, northOfCurr, southOfCurr, eastOfCurr, westOfCurr)) {
                        this.tileGrid[row][col] = 
                        { 
                            type: "south_wall",
                            BB: null, 
                            image: this.levelAssets.get("wall").get("wallTop").get("northSouth"),
                            row: row,
                            col: col
                        };
                    
                    } else if (this.isEastWestWallTop(seOfCurr, swOfCurr, northOfCurr, southOfCurr, eastOfCurr, westOfCurr)) {
                        this.tileGrid[row][col] = 
                        { 
                            type: "wall",
                            BB: null, 
                            image: this.levelAssets.get("wall").get("wallTop").get("eastWest"),
                            row: row,
                            col: col
                        };
                
                    } else if (this.isNECornerSWInvertedCorner(row, col, southOfCurr, westOfCurr, swOfCurr, eastOfCurr, northOfCurr)) {
                        this.tileGrid[row][col] = 
                        { 
                            type: "south_wall",
                            BB: null, 
                            image: this.levelAssets.get("wall").get("wallTop").get("neCornerSWInvertedCorner"),
                            row: row,
                            col: col
                        };
                    
                    } else if (this.isSECornerNWInvertedCorner(row, col, nwOfCurr, westOfCurr, northOfCurr, southOfCurr, swOfCurr, seOfCurr)) {
                        this.tileGrid[row][col] = 
                        {   
                            type: "wall",
                            BB: null, 
                            image:  this.levelAssets.get("wall").get("wallTop").get("seCornerNWInvertedCorner"),
                            row: row,
                            col: col
                        };

                    } else if (this.isSWCornerNEInvertedCorner(row, col, northOfCurr, southOfCurr, eastOfCurr, swOfCurr, seOfCurr, neOfCurr)) {
                        this.tileGrid[row][col] = 
                        { 
                            type: "wall",
                            BB: null, 
                            image: this.levelAssets.get("wall").get("wallTop").get("swCornerNEInvertedCorner"),
                            row: row,
                            col: col
                        };

                    } else if (this.isNWCornerSEInvertedCorner(row, col, northOfCurr, nwOfCurr, westOfCurr, neOfCurr, southOfCurr, eastOfCurr, seOfCurr)) {
                        this.tileGrid[row][col] = 
                        { 
                            type: "south_wall",
                            BB: null, 
                            image: this.levelAssets.get("wall").get("wallTop").get("nwCornerSEInvertedCorner"),
                            row: row,
                            col: col
                        };

                    } else if (this.isSECornerNECorner(row, col, westOfCurr, southOfCurr, swOfCurr, northOfCurr, eastOfCurr, neOfCurr, seOfCurr, nwOfCurr)){
                        this.tileGrid[row][col] = 
                        { 
                            type: "wall",
                            BB: null, 
                            image: this.levelAssets.get("wall").get("wallTop").get("seCornerNECorner"),
                            row: row,
                            col: col
                        };
                    
                    } else if (this.isSWCornerNWCorner(row, col, westOfCurr, southOfCurr, swOfCurr, northOfCurr, eastOfCurr, neOfCurr, seOfCurr, nwOfCurr)) {
                        this.tileGrid[row][col] = 
                        { 
                            type: "wall",
                            BB: null, 
                            image: this.levelAssets.get("wall").get("wallTop").get("swCornerNWCorner"),
                            row: row,
                            col: col
                        };

                    } else if (this.isSECornerNWCorner(row, col, westOfCurr, southOfCurr, swOfCurr, northOfCurr, eastOfCurr, neOfCurr, seOfCurr, nwOfCurr)) {
                        this.tileGrid[row][col] = 
                        {   
                            type: "south_wall",
                            BB: null, 
                            image: this.levelAssets.get("wall").get("wallTop").get("seCornerNWCorner"),
                            row: row,
                            col: col
                        };

                    } else if (this.isNWallSECorner(row, col, northOfCurr, nwOfCurr, westOfCurr, southOfCurr, swOfCurr)) {
                        this.tileGrid[row][col] = 
                        { 
                            type: "wall",
                            BB: null, 
                            image: this.levelAssets.get("wall").get("wallTop").get("nWallSECorner"),
                            row: row,
                            col: col
                        };

                    } else if (this.isWWallSECorner(row, col, southOfCurr, northOfCurr, eastOfCurr, westOfCurr)) {
                        this.tileGrid[row][col] = 
                        { 
                            type: "south_wall",
                            BB: null, 
                            image: this.levelAssets.get("wall").get("wallTop").get("wWallSECorner"),
                            row: row,
                            col: col
                        };

                    } else if (this.isEWallNWCorner(row, col, southOfCurr, northOfCurr, eastOfCurr, westOfCurr)) {
                        this.tileGrid[row][col] = 
                        { 
                            type: "wall",
                            BB: null, 
                            image: this.levelAssets.get("wall").get("wallTop").get("eWallNWCorner"),
                            row: row,
                            col: col
                        };
                                                
                    } else if (this.isWWallNECorner(row, col, southOfCurr, northOfCurr, westOfCurr, eastOfCurr)) {
                        this.tileGrid[row][col] = 
                        { 
                            type: "wall",
                            BB: null, 
                            image: this.levelAssets.get("wall").get("wallTop").get("wWallNECorner"),
                            row: row,
                            col: col
                        };

                    } else if (this.isEWallSWCorner(northOfCurr, eastOfCurr, southOfCurr, neOfCurr, swOfCurr)) {
                        this.tileGrid[row][col] = 
                        { 
                            type: "south_wall",
                            BB: null, 
                            image: this.levelAssets.get("wall").get("wallTop").get("eWallSWCorner"),
                            row: row,
                            col: col
                        };

                    } else if (this.isSWallNECorner(row, col, northOfCurr, eastOfCurr, westOfCurr, southOfCurr, swOfCurr)) {
                        this.tileGrid[row][col] = 
                        { 
                            type: "south_wall",
                            BB: null, 
                            image: this.levelAssets.get("wall").get("wallTop").get("sWallNECorner"),
                            row: row,
                            col: col
                        };

                    } else if (this.isNWallSWCorner(row, col, northOfCurr, eastOfCurr, southOfCurr, westOfCurr, neOfCurr)) {
                        this.tileGrid[row][col] = 
                        { 
                            type: "wall",
                            BB: null, 
                            image: this.levelAssets.get("wall").get("wallTop").get("nWallSWCorner"),
                            row: row,
                            col: col
                        };

                    } else if (this.isSWallNWCorner(row, col, northOfCurr, eastOfCurr, westOfCurr, southOfCurr, seOfCurr)) {
                        this.tileGrid[row][col] = 
                        { 
                            type: "south_wall",
                            BB: null, 
                            image: this.levelAssets.get("wall").get("wallTop").get("sWallNWCorner"),
                            row: row,
                            col: col
                        };

                    } else if (this.isEastNorthSouthWallTop(row, col, northOfCurr, westOfCurr, southOfCurr)) {
                        this.tileGrid[row][col] = 
                        { 
                            type: "south_wall",
                            BB: null, 
                            image: this.levelAssets.get("wall").get("wallTop").get("eastNorthSouth"),
                            row: row,
                            col: col
                        };
                
                    } else if (this.isWestNorthSouthWallTop(row, col, southOfCurr, northOfCurr, eastOfCurr)) {
                        this.tileGrid[row][col] = 
                        { 
                            type: "south_wall",
                            BB: null, 
                            image: this.levelAssets.get("wall").get("wallTop").get("westNorthSouth"),
                            row: row,
                            col: col
                        };
                
                    } else if (this.isInvertedNWCornerTop(row, col, seOfCurr, southOfCurr)) {
                        this.tileGrid[row][col] = 
                        { 
                            type: "wall",
                            BB: null, 
                            image: this.randomInvertedNWCornerTop(),
                            row: row,
                            col: col
                        };

                    } else if (this.isInvertedNECornerTop(row, col, swOfCurr, southOfCurr)) {
                        this.tileGrid[row][col] = 
                        { 
                            type: "wall",
                            BB: null, 
                            image: this.randomInvertedNECornerTop(),
                            row: row,
                            col: col
                        };

                    } else if (this.isInvertedSWCornerTop(northOfCurr, southOfCurr, eastOfCurr, westOfCurr)) {
                        this.tileGrid[row][col] = 
                        { 
                            type: "south_wall",
                            BB: null, 
                            image: this.levelAssets.get("wall").get("invertedCorner").get("sw"),
                            row: row,
                            col: col
                        };
                    
                    } else if (this.isInvertedSECornerTop(eastOfCurr, northOfCurr, southOfCurr, westOfCurr)) {
                        this.tileGrid[row][col] = 
                        { 
                            type: "south_wall",
                            BB: null, 
                            image: this.levelAssets.get("wall").get("invertedCorner").get("se"),
                            row: row,
                            col: col
                        };
                    
                    } else if (this.isNWCornerTop(row, col, seOfCurr, eastOfCurr, southOfCurr)) {
                        this.tileGrid[row][col] = 
                        { 
                            type: "wall",
                            BB: null, 
                            image: this.levelAssets.get("wall").get("corner").get("nw"),
                            row: row,
                            col: col
                        };

                    } else if (this.isSWCornerTop(northOfCurr, eastOfCurr, neOfCurr)) {
                        this.tileGrid[row][col] = 
                        { 
                            type: "wall",
                            BB: null, 
                            image: this.levelAssets.get("wall").get("corner").get("sw"),
                            row: row,
                            col: col
                        };
                    
                    } else if (this.isSECornerTop(westOfCurr, northOfCurr, nwOfCurr)) {
                        this.tileGrid[row][col] = 
                        { 
                            type: "wall",
                            BB: null, 
                            image: this.levelAssets.get("wall").get("corner").get("se"),
                            row: row,
                            col: col
                        };
                    
                    } else if (this.isNECornerTop(row, col, southOfCurr, swOfCurr, westOfCurr)) {
                        this.tileGrid[row][col] = 
                        { 
                            type: "wall",
                            BB: null, 
                            image: this.levelAssets.get("wall").get("corner").get("ne"),
                            row: row,
                            col: col
                        };
                    
                    } else if (this.isNWCorner(northOfCurr, eastOfCurr, seOfCurr, southOfCurr)) {
                        this.tileGrid[row][col] = 
                        { 
                            type: "north_wall",
                            BB: null, 
                            image: this.levelAssets.get("wall").get("nWall").get("nwCorner"),
                            row: row,
                            col: col
                        };

                    } else if (this.isNECorner(northOfCurr, westOfCurr, swOfCurr, southOfCurr)) {
                        this.tileGrid[row][col] = 
                        { 
                            type: "north_wall",
                            BB: null, 
                            image: this.levelAssets.get("wall").get("nWall").get("neCorner"),
                            row: row,
                            col: col
                        };

                    } else if (southOfCurr == "floor") {
                        this.tileGrid[row][col] = 
                        { 
                            type: "north_wall",
                            BB: null, 
                            image: this.randomNorthWall(),
                            row: row,
                            col: col
                        };

                        if (this.tileGrid[row][col].image != this.levelAssets.get("wall").get("nWall").get("cracked1")
                            && this.tileGrid[row - 1][col].image == this.levelAssets.get("ground").get("filler")) {                                
                            this.tileGrid[row - 1][col] = 
                            { 
                                type: "wall",
                                BB: null, 
                                image: this.randomNorthWallTop(),
                                row: row,
                            col: col
                            };
                        } else if (this.tileGrid[row][col].image == this.levelAssets.get("wall").get("nWall").get("cracked1")
                            && this.tileGrid[row - 1][col].image != this.levelAssets.get("ground").get("filler")) {
                            this.tileGrid[row][col] = 
                            { 
                                type: "north_wall",
                                BB: null, 
                                image: this.randomNorthWall(),
                                row: row,
                                col: col
                            };
                        }
                    
                    } else if (this.isWestWallTop(northOfCurr, neOfCurr, eastOfCurr, seOfCurr, southOfCurr)) {
                        this.tileGrid[row][col] = 
                        { 
                            type: "wall",
                            BB: null, 
                            image: this.levelAssets.get("wall").get("wallTop").get("west"),
                            row: row,
                            col: col
                        };

                    } else if (this.isEastWallTop(northOfCurr, nwOfCurr, swOfCurr, southOfCurr)) {
                        this.tileGrid[row][col] = 
                        { 
                            type: "wall",
                            BB: null, 
                            image: this.levelAssets.get("wall").get("wallTop").get("east"),
                            row: row,
                            col: col
                        };

                    } else if (northOfCurr == "floor") {
                        this.tileGrid[row][col] = 
                        { 
                            type: "south_wall",
                            BB: null, 
                            image: this.randomSouthWallTop(),
                            row: row,
                            col: col
                        };

                    } else if (westOfCurr == "floor") {
                        this.tileGrid[row][col] = 
                        { 
                            type: "wall",
                            BB: null, 
                            image: this.levelAssets.get("wall").get("wallTop").get("east"),
                            row: row,
                            col: col
                        };
                        
                    } else if (eastOfCurr == "floor") {
                        this.tileGrid[row][col] = 
                        { 
                            type: "wall",
                            BB: null, 
                            image: this.levelAssets.get("wall").get("wallTop").get("west"),
                            row: row,
                            col: col
                        };
                    }
                }
            }
        }
    };

    isNWCornerTop(row, col, seOfCurr, eastOfCurr, southOfCurr) {
        if (row + 2 < this.height - 1
            && seOfCurr == "empty" 
            && eastOfCurr == "empty" 
            && southOfCurr == "empty" 
            && this.grid[row + 2][col] == "empty" // south south
            && this.grid[row + 2][col + 1] == "floor" // south south east
            ) {
                return true;
        } else return false;
    };

    isSWCornerTop(northOfCurr, eastOfCurr, neOfCurr) {
        if (northOfCurr == "empty"
            && eastOfCurr == "empty"
            && neOfCurr == "floor") {
                return true;
        } else return false;
    };

    isSECornerTop(westOfCurr, northOfCurr, nwOfCurr) {
        if (westOfCurr == "empty"
            && northOfCurr == "empty"
            && nwOfCurr == "floor") {
                return true;
        } else return false;
    };

    isNECornerTop(row, col, southOfCurr, swOfCurr, westOfCurr) {
        if (row + 2 < this.height - 1
            && southOfCurr == "empty"
            && swOfCurr == "empty"
            && westOfCurr == "empty"
            && this.grid[row + 2][col] == "empty"
            && this.grid[row + 2][col - 1] == "floor") {
                return true;
        } else return false;
    };

    isInvertedNWCornerTop(row, col, seOfCurr, southOfCurr) {
        if (row + 2 < this.height - 1
            && southOfCurr == "empty"
            && seOfCurr == "floor"
            && this.grid[row + 2][col] == "floor"
            && this.grid[row + 2][col + 1] == "floor") {
                return true;
        } else return false;
    };

    isInvertedNECornerTop(row, col, swOfCurr, southOfCurr) {
        if (row + 2 < this.height - 1
            && southOfCurr == "empty"
            && swOfCurr == "floor"
            && this.grid[row + 2][col] == "floor"
            && this.grid[row + 2][col - 1] == "floor") {
                return true;
        } else return false;
    };

    isInvertedSWCornerTop(northOfCurr, southOfCurr, eastOfCurr, westOfCurr) {
        if (northOfCurr == "floor" 
            && southOfCurr == "empty"
            && westOfCurr == "empty"
            && eastOfCurr == "floor"){
            return true;
        } else return false;
    };

    isInvertedSECornerTop(eastOfCurr, northOfCurr, southOfCurr, westOfCurr) {
        if (northOfCurr == "floor" 
            && southOfCurr == "empty"
            && eastOfCurr == "empty" 
            && westOfCurr == "floor"){
            return true;
        } else return false;
    };

    isNWCorner(northOfCurr, eastOfCurr, seOfCurr, southOfCurr) {
        if (northOfCurr == "empty" 
            && eastOfCurr == "floor" 
            && seOfCurr == "floor" 
            && southOfCurr == "floor") {
            return true;
        } else return false;
    }

    isNECorner(northOfCurr, westOfCurr, swOfCurr, southOfCurr) {
        if (northOfCurr == "empty" 
            && westOfCurr == "floor" 
            && swOfCurr == "floor" 
            && southOfCurr == "floor") {
            return true;
        } else return false;
    }

    isWestWallTop(northOfCurr, neOfCurr, eastOfCurr, seOfCurr, southOfCurr) {
        if (northOfCurr == "empty" 
            && neOfCurr == "empty" 
            && eastOfCurr == "empty" 
            && southOfCurr == "empty" 
            && seOfCurr == "floor") {
            return true;
        } else return false;
    };

    isEastWallTop(northOfCurr, nwOfCurr, swOfCurr, southOfCurr) {
        if (northOfCurr == "empty" 
            && nwOfCurr == "empty" 
            && southOfCurr == "empty" 
            && swOfCurr == "floor") {
            return true;
        } else return false;
    };
   
    isNorthSouthWallTop(row, col, northOfCurr, southOfCurr, eastOfCurr, westOfCurr){
        if (row + 2 < this.height - 1
            && southOfCurr == "empty"
            && eastOfCurr == "empty"
            && westOfCurr == "empty"
            && northOfCurr == "floor"
            && this.grid[row + 2][col] == "floor") {
                return true;
        } else return false;
    };

    isEastWestWallTop(seOfCurr, swOfCurr, northOfCurr, southOfCurr, eastOfCurr, westOfCurr){
        if (southOfCurr == "empty"
            && northOfCurr == "empty"
            && (
                (eastOfCurr == "floor" && westOfCurr == "floor")
                || (eastOfCurr == "floor" && swOfCurr == "floor")
                || (westOfCurr == "floor" && seOfCurr == "floor")
                || (seOfCurr == "floor" && swOfCurr == "floor")
                )
            ) {
                return true;
        } else return false;
    };

    isEastNorthSouthWallTop(row, col, northOfCurr, westOfCurr, southOfCurr){
        if (row + 2 < this.height - 1
            && southOfCurr == "empty"
            && northOfCurr == "floor" 
            && westOfCurr == "floor" 
            && this.grid[row + 2][col] == "floor") {
            return true;
        } else return false;
    }

    isWestNorthSouthWallTop(row, col, southOfCurr, northOfCurr, eastOfCurr){
        if (row + 2 < this.height - 1
            && southOfCurr == "empty"
            && northOfCurr == "floor" 
            && eastOfCurr == "floor" 
            && this.grid[row + 2][col] == "floor") {
            return true;
        } else return false;
    }

    isSWallNWCorner(row, col, northOfCurr, eastOfCurr, westOfCurr, southOfCurr, seOfCurr) {
        if (row + 2 < this.height - 1 
            && westOfCurr == "empty"
            && eastOfCurr == "empty"
            && southOfCurr == "empty"
            && seOfCurr == "empty"
            && this.grid[row + 2][col] == "empty"
            && northOfCurr == "floor"
            && this.grid[row + 2][col + 1] == "floor"){
            return true;
        } else return false;
    }

    isSWallNECorner(row, col, northOfCurr, eastOfCurr, westOfCurr, southOfCurr, swOfCurr) {
        if (row + 2 < this.height - 1 
            && westOfCurr == "empty"
            && eastOfCurr == "empty"
            && southOfCurr == "empty"
            && swOfCurr == "empty"
            && this.grid[row + 2][col] == "empty"
            && northOfCurr == "floor"
            && this.grid[row + 2][col - 1] == "floor"){
            return true;
        } else return false;
    }

    isNWallSECorner(row, col, northOfCurr, nwOfCurr, westOfCurr, southOfCurr){
        if (row + 2 < this.height - 1
            && northOfCurr == "empty"
            && westOfCurr == "empty"
            && southOfCurr == "empty"
            && nwOfCurr == "floor"
            && this.grid[row + 2][col] == "floor") {
            return true;
        } else return false;
    }

    isNWallSWCorner(row, col, northOfCurr, eastOfCurr, southOfCurr, westOfCurr, neOfCurr){
        if (row + 2 < this.height - 1
            && northOfCurr == "empty"
            && eastOfCurr == "empty"
            && southOfCurr == "empty"
            && westOfCurr == "empty"
            && neOfCurr == "floor"
            && this.grid[row + 2][col] == "floor") {
            return true;
        } else return false;
    }

    isEWallSWCorner(northOfCurr, eastOfCurr, southOfCurr, neOfCurr, swOfCurr) {
        if (northOfCurr == "empty"
            && eastOfCurr == "empty"
            && southOfCurr == "empty"
            && neOfCurr == "floor"
            && swOfCurr == "floor") {
            return true;
        } else return false;
    }

    isWWallNECorner(row, col, southOfCurr, northOfCurr, westOfCurr, eastOfCurr) {
        if (row + 2 < this.height - 1
            && southOfCurr == "empty"
            && northOfCurr == "empty"
            && eastOfCurr == "floor"
            && westOfCurr == "empty"
            && this.grid[row + 2][col] == "empty"
            && this.grid[row + 2][col - 1] == "floor") {
            return true;
        } else return false;
    }

    isEWallNWCorner(row, col, southOfCurr, northOfCurr, eastOfCurr, westOfCurr) {
        if (row + 2 < this.height - 1
            && southOfCurr == "empty"
            && northOfCurr == "empty"
            && westOfCurr == "floor"
            && eastOfCurr == "empty"
            && this.grid[row + 2][col] == "empty"
            && this.grid[row + 2][col + 1] == "floor") {
            return true;
        } else return false;
    };

    isWWallSECorner(row, col, southOfCurr, northOfCurr, eastOfCurr, westOfCurr) {
        if (southOfCurr == "empty"
            && northOfCurr == "empty"
            && (eastOfCurr == "floor" || this.grid[row + 1][col + 1] == "floor") 
            && westOfCurr == "empty"
            && this.grid[row - 1][col - 1] == "floor") {
            return true;
        } else return false;
    };

    isNECornerSWInvertedCorner(row, col, southOfCurr, westOfCurr, swOfCurr, eastOfCurr, northOfCurr) {
        if (row + 2 < this.height - 1
            && southOfCurr == "empty"
            && westOfCurr == "empty"
            && swOfCurr == "empty"
            && eastOfCurr == "floor"
            && northOfCurr == "floor"
            && this.grid[row + 2][col] == "empty"
            && this.grid[row + 2][col -1] == "floor") {
            return true;
        } else return false;
    };

    isSECornerNWInvertedCorner(row, col, nwOfCurr, westOfCurr, northOfCurr, southOfCurr, swOfCurr, seOfCurr) {
        if (row + 2 < this.height - 1
            && nwOfCurr == "floor"
            && westOfCurr == "empty"
            && northOfCurr == "empty"
            && southOfCurr == "empty"
            && swOfCurr == "empty"
            && seOfCurr == "floor"
            && this.grid[row + 2][col] == "floor") {
            return true;
        } else return false;
    };

    isSWCornerNEInvertedCorner(row, col, northOfCurr, southOfCurr, eastOfCurr, swOfCurr, seOfCurr, neOfCurr) {
        if (row + 2 < this.height - 1
            && northOfCurr == "empty"
            && southOfCurr == "empty"
            && eastOfCurr == "empty"
            && seOfCurr == "empty"
            && swOfCurr == "floor"
            && this.grid[row + 2][col] == "floor"
            && neOfCurr == "floor") {
            return true;
        } else return false;
    };

    isNWCornerSEInvertedCorner(row, col, northOfCurr, nwOfCurr, westOfCurr, neOfCurr, southOfCurr, eastOfCurr, seOfCurr) {
        if (row + 2 < this.height - 1 
            && northOfCurr == "floor"
            && nwOfCurr == "floor"
            && westOfCurr == "floor"
            && neOfCurr == "floor"
            && southOfCurr == "empty"
            && eastOfCurr == "empty"
            && seOfCurr == "empty"
            && this.grid[row + 2][col] == "empty"
            && this.grid[row + 2][col + 1] == "floor") {
            return true;
        } else return false;
    };

    isSECornerNECorner(row, col, westOfCurr, southOfCurr, swOfCurr, northOfCurr, eastOfCurr, neOfCurr, seOfCurr, nwOfCurr) {
        if (row + 2 < this.height - 1
            && westOfCurr == "empty"
            && southOfCurr == "empty"
            && swOfCurr == "empty"
            && northOfCurr == "empty"
            && eastOfCurr == "empty"
            && neOfCurr == "empty"
            && seOfCurr == "empty"
            && nwOfCurr == "floor"
            && this.grid[row + 2][col] == "empty"
            && this.grid[row + 2][col - 1] == "floor") {
            return true;
        } else return false;
    };

    isSWCornerNWCorner(row, col, westOfCurr, southOfCurr, swOfCurr, northOfCurr, eastOfCurr, neOfCurr, seOfCurr, nwOfCurr) {
        if (row + 2 < this.height - 1
            && westOfCurr == "empty"
            && southOfCurr == "empty"
            && swOfCurr == "empty"
            && northOfCurr == "empty"
            && eastOfCurr == "empty"
            && neOfCurr == "floor"
            && seOfCurr == "empty"
            && nwOfCurr == "empty"
            && this.grid[row + 2][col] == "empty"
            && this.grid[row + 2][col + 1] == "floor") {
            return true;
        } else return false;
    };

    isSECornerNWCorner(row, col, westOfCurr, southOfCurr, swOfCurr, northOfCurr, eastOfCurr, neOfCurr, seOfCurr, nwOfCurr) {
        if (row + 2 < this.height - 1
            && northOfCurr == "empty"
            && eastOfCurr == "empty"
            && southOfCurr == "empty"
            && westOfCurr == "empty"
            && neOfCurr == "empty"
            && swOfCurr == "empty"
            && seOfCurr == "empty"
            && this.grid[row + 2][col] == "empty"
            && nwOfCurr == "floor"
            && this.grid[row + 2][col + 1] == "floor") {
            return true;
        } else return false;
    };

    randomGround(){
        var choice = floor(Math.random() * 100);
        if (choice < 75) return this.levelAssets.get("ground").get("plain");
        else if (choice < 83) return this.levelAssets.get("ground").get("cracked1");
        else if (choice < 91) return this.levelAssets.get("ground").get("cracked4");
        else if (choice < 99) return this.levelAssets.get("ground").get("cracked3");
        else if (choice == 99) return this.levelAssets.get("ground").get("cracked2");

    };

    randomNorthGround(){
        var choice = floor(Math.random() * 100);
        if (choice < 75) return this.levelAssets.get("ground").get("shadow").get("north").get("plain");
        else return this.levelAssets.get("ground").get("shadow").get("north").get("cracked")
    };

    randomWestGround() {
        var choice = floor(Math.random() * 100);
        if (choice < 75) return this.levelAssets.get("ground").get("shadow").get("west").get("plain");
        else return this.levelAssets.get("ground").get("shadow").get("west").get("cracked")
    };

    randomNorthWall(){
        var choice = floor(Math.random() * 100);
        if (choice < 35) return this.levelAssets.get("wall").get("nWall").get("plain1");
        else if (choice < 70) return this.levelAssets.get("wall").get("nWall").get("plain2");
        else if (choice < 98) return this.levelAssets.get("wall").get("nWall").get("plain3");
        else return this.levelAssets.get("wall").get("nWall").get("cracked1");
    };

    randomInvertedNWCornerTop() {
        var choice = floor(Math.random() * 100);
        if (choice < 95) return this.levelAssets.get("wall").get("invertedCorner").get("nw1");
        else return this.levelAssets.get("wall").get("invertedCorner").get("nw2");

    };

    randomInvertedNECornerTop() {
        var choice = floor(Math.random() * 100);
        if (choice < 95) return this.levelAssets.get("wall").get("invertedCorner").get("ne").get("plain"); 
        else return this.levelAssets.get("wall").get("invertedCorner").get("ne").get("cracked");
    }

    randomNorthWallTop() {
        var choice = floor(Math.random() * 100);
        if (choice < 90) return this.levelAssets.get("wall").get("wallTop").get("north").get("plain");
        else if (choice < 95) return this.levelAssets.get("wall").get("wallTop").get("north").get("cracked1");
        else return this.levelAssets.get("wall").get("wallTop").get("north").get("cracked2");
    }

    randomSouthWallTop(){
        var choice = floor(Math.random() * 100);
        if (choice < 90) return this.levelAssets.get("wall").get("wallTop").get("south").get("plain");
        else if (choice < 95) return this.levelAssets.get("wall").get("wallTop").get("south").get("cracked1");
        else return this.levelAssets.get("wall").get("wallTop").get("south").get("cracked2");
    };

    loadWalls() {
        this.levelAssets.set("wall", new Map);

        //Animator constructor(spritesheet, xStart, yStart, width, height, frameCount, frameDuration)
        this.levelAssets.get("wall").set("nWall", new Map);
        this.levelAssets.get("wall").get("nWall").set("plain1", new Animator(this.spritesheet, 112, 0, 16, 16, 1, 2));
        this.levelAssets.get("wall").get("nWall").set("plain2", new Animator(this.spritesheet, 16, 16, 16, 16, 1, 2));
        this.levelAssets.get("wall").get("nWall").set("plain3", new Animator(this.spritesheet, 32, 16, 16, 16, 1, 2));
        this.levelAssets.get("wall").get("nWall").set("cracked1", new Animator(this.spritesheet, 144, 16, 16, 16, 1, 2));
        
        this.levelAssets.get("wall").get("nWall").set("nwCorner", new Animator(this.spritesheet, 80, 48, 16, 16, 1, 2));
        this.levelAssets.get("wall").get("nWall").set("neCorner", new Animator(this.spritesheet, 128, 48, 16, 16, 1, 2));

        this.levelAssets.get("wall").set("corner", new Map);
        this.levelAssets.get("wall").get("corner").set("nw", new Animator(this.spritesheet, 0, 0, 16, 16, 1, 2));
        this.levelAssets.get("wall").get("corner").set("sw", new Animator(this.spritesheet, 0, 48, 16, 16, 1, 2));
        this.levelAssets.get("wall").get("corner").set("ne", new Animator(this.spritesheet, 48, 0, 16, 16, 1, 2));
        this.levelAssets.get("wall").get("corner").set("se", new Animator(this.spritesheet, 48, 48, 16, 16, 1, 2));

        this.levelAssets.get("wall").set("invertedCorner", new Map);
        this.levelAssets.get("wall").get("invertedCorner").set("nw1", new Animator(this.spritesheet, 80, 32, 16, 16, 1, 2));
        this.levelAssets.get("wall").get("invertedCorner").set("nw2", new Animator(this.spritesheet, 144, 0, 16, 16, 1, 2));
        this.levelAssets.get("wall").get("invertedCorner").set("sw", new Animator(this.spritesheet, 128, 16, 16, 16, 1, 2));
        this.levelAssets.get("wall").get("invertedCorner").set("se", new Animator(this.spritesheet, 128, 0, 16, 16, 1, 2));

        this.levelAssets.get("wall").get("invertedCorner").set("ne", new Map);
        this.levelAssets.get("wall").get("invertedCorner").get("ne").set("plain", new Animator(this.spritesheet, 128, 32, 16, 16, 1, 2));
        this.levelAssets.get("wall").get("invertedCorner").get("ne").set("cracked", new Animator(this.spritesheet, 160, 0, 16, 16, 1, 2));

        this.levelAssets.get("wall").set("wallTop", new Map);
        this.levelAssets.get("wall").get("wallTop").set("north", new Map);
        this.levelAssets.get("wall").get("wallTop").get("north").set("plain", new Animator(this.spritesheet, 64, 0, 16, 16, 1, 2));
        this.levelAssets.get("wall").get("wallTop").get("north").set("cracked1", new Animator(this.spritesheet, 16, 0, 16, 16, 1, 2));
        this.levelAssets.get("wall").get("wallTop").get("north").set("cracked2", new Animator(this.spritesheet, 32, 0, 16, 16, 1, 2));

        this.levelAssets.get("wall").get("wallTop").set("south", new Map);
        this.levelAssets.get("wall").get("wallTop").get("south").set("plain", new Animator(this.spritesheet, 80, 0, 16, 16, 1, 2));
        this.levelAssets.get("wall").get("wallTop").get("south").set("cracked1", new Animator(this.spritesheet, 16, 48, 16, 16, 1, 2));
        this.levelAssets.get("wall").get("wallTop").get("south").set("cracked2", new Animator(this.spritesheet, 32, 48, 16, 16, 1, 2));

        this.levelAssets.get("wall").get("wallTop").set("east", new Animator(this.spritesheet, 48, 16, 16, 16, 1, 2));
        this.levelAssets.get("wall").get("wallTop").set("west", new Animator(this.spritesheet, 0, 16, 16, 16, 1, 2));

        this.levelAssets.get("wall").get("wallTop").set("northSouth", new Animator(this.spritesheet, 160, 96, 16, 16, 1, 2));
        this.levelAssets.get("wall").get("wallTop").set("eastWest", new Animator(this.spritesheet, 192, 32, 16, 16, 1, 2));
        this.levelAssets.get("wall").get("wallTop").set("eastNorthSouth", new Animator(this.spritesheet, 176, 96, 16, 16, 1, 2));
        this.levelAssets.get("wall").get("wallTop").set("westNorthSouth", new Animator(this.spritesheet, 192, 96, 16, 16, 1, 2));

        this.levelAssets.get("wall").get("wallTop").set("sWallNWCorner", new Animator(this.spritesheet, 0, 80, 16, 16, 1, 2));
        this.levelAssets.get("wall").get("wallTop").set("eWallNWCorner", new Animator(this.spritesheet, 16, 80, 16, 16, 1, 2));
        this.levelAssets.get("wall").get("wallTop").set("wWallSECorner", new Animator(this.spritesheet, 16, 96, 16, 16, 1, 2));
        this.levelAssets.get("wall").get("wallTop").set("nwCornerSEInvertedCorner", new Animator(this.spritesheet, 32, 80, 16, 16, 1, 2));
        this.levelAssets.get("wall").get("wallTop").set("nWallSECorner", new Animator(this.spritesheet, 32, 96, 16, 16, 1, 2));
        this.levelAssets.get("wall").get("wallTop").set("seCornerNWInvertedCorner", new Animator(this.spritesheet, 48, 96, 16, 16, 1, 2));
        this.levelAssets.get("wall").get("wallTop").set("eWallSWCorner", new Animator(this.spritesheet, 64, 96, 16, 16, 1, 2));
        this.levelAssets.get("wall").get("wallTop").set("nWallSWCorner", new Animator(this.spritesheet, 80, 96, 16, 16, 1, 2));        
        this.levelAssets.get("wall").get("wallTop").set("swCornerNEInvertedCorner", new Animator(this.spritesheet, 96, 96, 16, 16, 1, 2));
        this.levelAssets.get("wall").get("wallTop").set("sWallNECorner", new Animator(this.spritesheet, 112, 96, 16, 16, 1, 2));
        this.levelAssets.get("wall").get("wallTop").set("wWallNECorner", new Animator(this.spritesheet, 128, 96, 16, 16, 1, 2));
        this.levelAssets.get("wall").get("wallTop").set("neCornerSWInvertedCorner", new Animator(this.spritesheet, 144, 96, 16, 16, 1, 2));
        this.levelAssets.get("wall").get("wallTop").set("seCornerNECorner", new Animator(this.spritesheet, 0, 64, 16, 16, 1, 2));
        this.levelAssets.get("wall").get("wallTop").set("swCornerNWCorner", new Animator(this.spritesheet, 32, 64, 16, 16, 1, 2));
        this.levelAssets.get("wall").get("wallTop").set("seCornerNWCorner", new Animator(this.spritesheet, 176, 32, 16, 16, 1, 2));
    };

    loadGround() {

        this.levelAssets.set("ground", new Map);
        this.levelAssets.get("ground").set("plain", new Animator(this.spritesheet, 64, 32, 16, 16, 1, 2));
        this.levelAssets.get("ground").set("cracked1", new Animator(this.spritesheet, 64, 16, 16, 16, 1, 2));
        this.levelAssets.get("ground").set("cracked2", new Animator(this.spritesheet, 80, 16, 16, 16, 1, 2));
        this.levelAssets.get("ground").set("cracked3", new Animator(this.spritesheet, 16, 32, 16, 16, 1, 2));
        this.levelAssets.get("ground").set("cracked4", new Animator(this.spritesheet, 32, 32, 16, 16, 1, 2));

        this.levelAssets.get("ground").set("shadow", new Map);

        this.levelAssets.get("ground").get("shadow").set("north", new Map);
        this.levelAssets.get("ground").get("shadow").get("north").set("plain", new Animator(this.spritesheet, 112, 16, 16, 16, 1, 2));
        this.levelAssets.get("ground").get("shadow").get("north").set("cracked", new Animator(this.spritesheet, 80, 64, 16, 16, 1, 2));
        this.levelAssets.get("ground").get("shadow").get("north").set("gradient", new Animator(this.spritesheet, 96, 80, 16, 16, 1, 2));

        this.levelAssets.get("ground").get("shadow").set("west", new Map);
        this.levelAssets.get("ground").get("shadow").get("west").set("plain", new Animator(this.spritesheet, 96, 48, 16, 16, 1, 2));
        this.levelAssets.get("ground").get("shadow").get("west").set("cracked", new Animator(this.spritesheet, 64, 64, 16, 16, 1, 2));
        this.levelAssets.get("ground").get("shadow").get("west").set("gradient", new Animator(this.spritesheet, 64, 80, 16, 16, 1, 2));

        this.levelAssets.get("ground").get("shadow").set("south", new Animator(this.spritesheet, 80, 80, 16, 16, 1, 2));

        this.levelAssets.get("ground").get("shadow").set("corner", new Animator(this.spritesheet, 96, 32, 16, 16, 1, 2));
        this.levelAssets.get("ground").get("shadow").set("invertedCorner", new Animator(this.spritesheet, 96, 64, 16, 16, 1, 2));

        this.levelAssets.get("ground").set("filler", new Animator(this.spritesheet, 0, 96, 16, 16, 1, 2));
    };

    update() {

    };

    addBoundingBoxes() {
        for (var row = 0; row < this.height; row++) {
            for (var col = 0; col < this.width; col++) {
                let curr = this.tileGrid[row][col];
                if (curr.type == "wall") {
                    curr.BB = new BoundingBox(Math.floor(col * this.tileSize), 
                    Math.floor(row * this.tileSize), 
                    this.tileSize, this.tileSize);
                } else if (curr.type == "north_wall") {
                    curr.BB = {
                        upper: new BoundingBox(Math.floor(col * this.tileSize), 
                            Math.floor(row * this.tileSize), 
                            this.tileSize, 5*Math.floor(this.tileSize / 6)),

                        lower: new BoundingBox(Math.floor(col * this.tileSize), 
                            Math.floor(row * this.tileSize + 5*Math.floor(this.tileSize / 6)), 
                            this.tileSize, Math.floor(this.tileSize / 6))
                    };
                } else if (curr.type == "south_wall") {
                    curr.BB = {
                        upper: new BoundingBox(Math.floor(col * this.tileSize), 
                            Math.floor(row * this.tileSize), 
                            this.tileSize, Math.floor(this.tileSize / 2)),

                        lower: new BoundingBox(Math.floor(col * this.tileSize), 
                            Math.floor(row * this.tileSize + Math.floor(this.tileSize / 2)), 
                            this.tileSize, Math.floor(this.tileSize / 2))
                    };
                }
            }
        }
    }

    draw(ctx) {
        for (var row = 0; row < this.height; row++) {
            for (var col = 0; col < this.width; col++) {
                var square = this.tileGrid[row][col].image;

                // only draw tiles within a specific radius of Goop
                if (this.game.goop && getDistance(col * this.tileSize, row * this.tileSize, this.game.goop.xMap, this.game.goop.yMap) < 800) {
                    square.drawFrame(this.game.clockTick, ctx, Math.floor((col * this.tileSize) - (this.game.camera.x)), Math.floor((row * this.tileSize) - (this.game.camera.y)), this.scale); 
                } else if (!this.game.goop) { // if goop isn't in the game, draw every tile
                    square.drawFrame(this.game.clockTick, ctx, Math.floor((col * this.tileSize) - (this.game.camera.x)), Math.floor((row * this.tileSize) - (this.game.camera.y)), this.scale); 
                }
                
                if (this.game.debug) {                
                    //drawing the bounding boxes
                    if (this.tileGrid[row][col].BB) {
                        if (this.tileGrid[row][col].type == "wall") {
                            let bb = this.tileGrid[row][col].BB;
                            ctx.strokeStyle = 'red';
                            ctx.strokeRect(Math.floor(bb.left - this.game.camera.x), Math.floor(bb.top - this.game.camera.y), this.tileSize, this.tileSize);
                
                        } else if (this.tileGrid[row][col].type == "north_wall"){
                            let bb = this.tileGrid[row][col].BB.lower;
                            let bb2 = this.tileGrid[row][col].BB.upper;
                            ctx.strokeStyle = 'red';
                            ctx.strokeRect(Math.floor(bb.left - this.game.camera.x), Math.floor(bb.top - this.game.camera.y), this.tileSize, this.tileSize);
                            ctx.strokeRect(Math.floor(bb2.left - this.game.camera.x), Math.floor(bb2.top - this.game.camera.y), this.tileSize, this.tileSize);
                        } else {
                            let bb = this.tileGrid[row][col].BB.lower;
                            ctx.strokeStyle = 'red';
                            ctx.strokeRect(Math.floor(bb.left - this.game.camera.x), Math.floor(bb.top - this.game.camera.y), this.tileSize, this.tileSize);
                
                        }
                    }
                }
            }
        }
    };

}