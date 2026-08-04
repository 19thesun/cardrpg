import { Effects } from "./effects/index.js";

export class ActionManager {

    static use(tool, target, context) {

        if (!tool) {
            return false;
        }

        // Find an action that matches the selected target
        const action =
            tool.actions.find(action =>
                action.target === null
                    ? target === null
                    : target?.id === action.target
            );

        if (!action) {

            context.message(
                `You used ${tool.name} on ${target?.name ?? "nothing"}, nothing happened.`
            );

            return false;
        }

        const effect =
            Effects[action.effect];

        if (!effect) {

            console.warn(
                `Unknown effect: ${action.effect}`
            );

            context.message(
                `You used ${tool.name} on ${target?.name ?? "nothing"}, nothing happened.`
            );

            return false;

        }

        effect(
            target,
            action,
            context
        );

        return true;
    }

}