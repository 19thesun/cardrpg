export class Shape {

    constructor(x, y) {

        this.zIndex = 0;

        this.x = x;
        this.y = y;

        this.selected = false;

        this.space = "world";

        this.scale = 1;
        this.screenScale = 1;
        this.visible = true;

        this.children = [];
        this.parent = null;

    }

    getVertices() {
        return [];
    }

    containsPoint(x, y) {
        return false;
    }

    draw(renderer) {
        // implemented in actual shapes
    }

}