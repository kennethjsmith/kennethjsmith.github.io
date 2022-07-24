class BoundingBox {
    constructor(x, y, width, height) {
        Object.assign(this, { x, y, width, height });

        this.left = x;
        this.top = y;
        this.right = this.left + this.width;
        this.bottom = this.top + this.height;
        this.midpoint = { 
            x: (this.left + (this.width / 2)), 
            y: (this.top + (this.height / 2)) 
        };
    };

    getXProjectedBB(xVelocity) {
        return new BoundingBox(this.x+xVelocity, this.y, this.width, this.height);
    };

    getYProjectedBB(yVelocity) {
        return new BoundingBox(this.x, this.y+yVelocity, this.width, this.height);
    };

    // this makes sure the next tile is drawn on top of the gun
    getProjectedBigBB() {
        return new BoundingBox(this.x-35, this.y, this.width+70, this.height);
    };
    
    isInFront(otherBoundingBox) {
        return (this.top >= otherBoundingBox.bottom);
    };

    containsPoint(x, y) {
        return (x >= this.left && x <= this.right && y >= this.top && y <= this.bottom);
    };

    // returns true if there is a collision between this and oth
    collide(oth) {
    
        if (
            this.right > oth.left &&
            this.left < oth.right &&
            this.top < oth.bottom &&
            this.bottom > oth.top
        ) 
            return true;
        return false;
    };
};
