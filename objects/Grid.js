import { Shape } from "./Shape.js";

export class Grid extends Shape {

    constructor(size = 100, spacing = 50) {

        super(0, 0);

        this.size = size;
        this.spacing = spacing;

        this.topology = "line-list";

        this.space = "world";
        this.draggable = false;

        this.color = {
            r: 0.25,
            g: 0.25,
            b: 0.3
        };

    }


    getVertices() {

        const vertices = [];

        const half = this.size / 2;


        // Vertical lines
        for (
            let x = -half;
            x <= half;
            x += this.spacing
        ) {

            vertices.push(
                x, -half,
                x, half
            );

        }


        // Horizontal lines
        for (
            let y = -half;
            y <= half;
            y += this.spacing
        ) {

            vertices.push(
                -half, y,
                half, y
            );

        }


        return vertices;

    }


    containsPoint() {
        return false;
    }

}