export class Scene {

    constructor() {
        this.shapes = [];
    }

    add(shape) {
        shape.zIndex = this.shapes.length;
        this.shapes.push(shape);
    }

    addCard(card) {
        this.add(card);
        return card;
    }

    remove(shape) {
        this.shapes = this.shapes.filter(s => s !== shape);
    }

    getShapes() {
        return this.shapes;
    }

    getShapeAt(screenX, screenY, camera) {

        const shapes =
            [...this.shapes]
            .sort((a,b)=>b.zIndex-a.zIndex);

        for (const shape of shapes) {

            if (shape.space === "world") {

                const world =
                    camera.screenToWorld(
                        screenX,
                        screenY
                    );
                if (shape.containsPoint(world.x, world.y)) {
                    return shape;
                }

            }
            else if (shape.containsPoint(screenX, screenY)) {

                return shape;

            }

        }

        return null;
    }

    bringToFront(shape) {

        const highest =
            Math.max(
                ...this.shapes.map(s => s.zIndex)
            );

        shape.zIndex = highest + 1;

        const index = this.shapes.indexOf(shape);

        if (index === -1) {
            return;
        }

        this.shapes.splice(index, 1);

        this.shapes.push(shape);

    }

    render(renderer) {

        for (const shape of this.shapes) {
            renderer.drawShape(shape);
        }

    }

}