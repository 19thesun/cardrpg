import { Effects } from "./effects/index.js";

export class ActionManager {

    static use(tool, target, context) {

        if (!tool) {
            return;
        }

        // Find an action that matches the selected target
        const action =
            tool.actions.find(action =>
                action.target === null
                    ? target === null
                    : target?.id === action.target
            );

        if (!action) {
            return;
        }

        const effect =
            Effects[action.effect];

        if (!effect) {

            console.warn(
                `Unknown effect: ${action.effect}`
            );

            return;

        }

        effect(
            target,
            action,
            context
        );

    }

}