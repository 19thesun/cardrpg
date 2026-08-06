import { Shape } from "./shape.js";

export class Rectangle extends Shape {

    constructor(x, y, width, height) {

        super(x, y);

        this.width = width;
        this.height = height;

        this.color = {
            r: 0.8,
            g: 0.2,
            b: 0.2,
            a: 1
        };

        this.colorDirty = true;

        this.zIndex = 0;
    }

    getVertices() {

        const { x, y, width, height } = this.getBounds();

        return [

            x,     y,
            x + width,   y,
            x,     y + height,

            x,     y + height,
            x + width,   y,
            x + width,   y + height

        ];

    }

    getBounds() {

        const width =
            this.width *
            this.scale *
            this.screenScale;

        const height =
            this.height *
            this.scale *
            this.screenScale;

        return {
            x: this.x,
            y: this.y,
            width,
            height
        };

    }

    containsPoint(px, py) {

        const { x, y, width, height } = this.getBounds();

        return (
            px >= x &&
            px <= x + width &&
            py >= y &&
            py <= y + height
        );

    }

}