export function getVisibleWorldBounds(canvas, camera) {

    const topLeft =
        camera.screenToWorld(
            0,
            0
        );

    const bottomRight =
        camera.screenToWorld(
            canvas.clientWidth,
            canvas.clientHeight
        );


    return {
        minX: topLeft.x,
        minY: topLeft.y,
        maxX: bottomRight.x,
        maxY: bottomRight.y
    };

}


export function randomVisibleWorldPosition(canvas, camera) {

    const bounds =
        getVisibleWorldBounds(
            canvas,
            camera
        );


    return {
        x:
            bounds.minX +
            Math.random() *
            (bounds.maxX - bounds.minX),

        y:
            bounds.minY +
            Math.random() *
            (bounds.maxY - bounds.minY)
    };

}