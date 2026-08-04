export function randomVisibleWorldPosition(canvas, camera) {

    const playableWidth =
        canvas.clientWidth * 0.7;


    const screenX =
        Math.random() * playableWidth;

    const screenY =
        Math.random() * canvas.clientHeight;


    return camera.screenToWorld(
        screenX,
        screenY
    );

}