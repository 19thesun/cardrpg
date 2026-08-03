import { randomVisibleWorldPosition } from "../engine/worldUtils.js";


export const CardActions = {

    spawn_rocks(target, scene, spawner, canvas, camera) {

        const pos =
            randomVisibleWorldPosition(
                canvas,
                camera
            );


        const rock =
            spawner.spawn(
                pos.x,
                pos.y,
                "rock"
            );


        scene.add(rock);
    

    },


    punch_tree(tree, scene, spawner) {

        scene.remove(tree);

        const wood =
            spawner.spawn(
                tree.x,
                tree.y,
                "wood"
            );

        scene.add(wood);

    }

};