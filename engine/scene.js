export class Scene {

    constructor() {
        this.shapes = [];
    }

    add(shape) {
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

        for (const shape of this.shapes) {

            if (shape.visible === false) {
                continue;
            }

            if (shape.space === "world") {

                const world = camera.screenToWorld(
                    screenX,
                    screenY
                );

                if (shape.containsPoint(world.x, world.y)) {
                    return shape;
                }

                continue;
            }

            if (shape.containsPoint(screenX, screenY)) {
                return shape;
            }

        }


        return null;
    }

    bringToFront(shape) {

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