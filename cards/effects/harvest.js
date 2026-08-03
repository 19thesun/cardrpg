export function harvest(target, action, context) {

    context.scene.remove(target);

    context.scene.add(
        context.spawner.spawn(
            target.x,
            target.y,
            action.drop
        )
    );

}