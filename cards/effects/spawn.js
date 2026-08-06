import { randomVisibleWorldPosition } from "./helpers.js";

export function spawn(target, action, context) {

    if (action.spawn) {

        const pos =
            randomVisibleWorldPosition(
                context.canvas,
                context.camera
            );

        const card =
            context.spawner.spawn(
                pos.x,
                pos.y,
                action.spawn
            );

        context.scene.add(card);

    }


    if (action.message) {
        context.message(action.message);
    }

}