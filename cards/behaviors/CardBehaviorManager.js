import { Card } from "../card.js";

export class CardBehaviorManager {

    static update(scene, deltaTime, context) {
        
        for (const card of scene.getShapes()) {

            if (!card.behavior)
                continue;


            if (
                card.inBook ||
                card.inSlot ||
                card.dragging
            )
                continue;

            card.behavior.update(
                card,
                deltaTime,
                context
            );
            
        }

    }

}