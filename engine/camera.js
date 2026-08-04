export class Camera {

    constructor() {

        this.x = 0;
        this.y = 0;

        this.zoom = 1;

        this.minZoom = 0.25;
        this.maxZoom = 3;

    }


    screenDeltaToWorld(dx, dy) {
        return {
            x: dx / this.zoom,
            y: dy / this.zoom
        };
    }

    screenToWorld(x, y) {

        return {
            x: (x - this.x) / this.zoom,
            y: (y - this.y) / this.zoom
        };

    }


    worldToScreen(x, y) {

        return {
            x: x * this.zoom + this.x,
            y: y * this.zoom + this.y
        };

    }


    zoomAt(mouseX, mouseY, amount) {

        const before =
            this.screenToWorld(mouseX, mouseY);


        this.zoom += amount;

        this.zoom = Math.max(
            this.minZoom,
            Math.min(
                this.maxZoom,
                this.zoom
            )
        );


        const after =
            this.screenToWorld(mouseX, mouseY);


        // Keep mouse position fixed while zooming
        this.x +=
            (after.x - before.x) * this.zoom;

        this.y +=
            (after.y - before.y) * this.zoom;

    }

}