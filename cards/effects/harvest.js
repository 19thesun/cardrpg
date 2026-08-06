export function harvest(target, action, context) {

    // Create drop if one exists
    if (action.drop) {

        const card =
            context.spawner.spawn(
                target.x,
                target.y,
                action.drop
            );

        context.scene.add(card);

    }


    // Always destroy harvested card
    context.scene.remove(target);


    if (action.message) {
        context.message(action.message);
    }

}