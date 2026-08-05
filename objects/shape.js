export class Shape {

    constructor(x, y) {

        this.zIndex = 0;

        this.x = x;
        this.y = y;

        this.selected = false;
        this.space = "world";

        this.colorMultiplier = 1;

        this.scale = 1;
        this.screenScale = 1;
        this.visible = true;

        this.children = [];
        this.preChildren = [];
        this.parent = null;

        this.vertexBuffer = null
        this.geometryDirty = true;
        this.lastGeometry = null;
        this.vertexCount = 0;
        this.lastTransform = null;

        this.lastCameraX = null;
        this.lastCameraY = null;
        this.lastZoom = null;
    }

    addChild(child) {

        child.parent = this;

        this.children.push(child);

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

    setSpace(space) {

        this.space = space;

        if (this.children) {
            for (const child of this.children) {
                child.setSpace(space);
            }
        }

    }

}