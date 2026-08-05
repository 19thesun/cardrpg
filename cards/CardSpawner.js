import { createCardById } from "./cardFactory.js";


export class CardSpawner {

    constructor(scene, renderer) {

        this.scene = scene;
        this.renderer = renderer;

    }


    spawn(x, y, id) {

        return createCardById(
            x,
            y,
            id,
        );

    }


    spawnMany(cards) {

        return cards.map(card => {

            const created =
                this.spawn(
                    card.x,
                    card.y,
                    card.id
                );

            this.scene.add(created);

            return created;

        });

    }

}