import { CardActions } from "./CardActions.js";

export class ActionManager {

    static use(card, target, scene, spawner, canvas, camera) {
        const action =
            card.actions.find(a =>
                a.target === (target ? target.id : null)
            );

        console.log(action)

        if (!action) {
            return;
        }

        CardActions[action.action](
            target,
            scene,
            spawner,
            canvas,
            camera
        );

    }

}