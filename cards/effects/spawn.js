import { randomVisibleWorldPosition } from "./helpers.js";

export function spawn(target, action, context) {

    const pos =
        randomVisibleWorldPosition(
            context.canvas,
            context.camera
        );

    context.scene.add(
        context.spawner.spawn(
            pos.x,
            pos.y,
            action.spawn
        )
    );
    
    if (action.message) {
        context.message(action.message);
    }

}