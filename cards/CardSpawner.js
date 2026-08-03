import { createCardById } from "./cardFactory.js";

export class CardSpawner {

    constructor(scene) {
        this.scene = scene;
    }

    spawn(x, y, id) {
        const card = createCardById(x, y, id);
        this.scene.addCard(card);
        return card;
    }

    spawnMany(definitions) {
        return definitions.map(({ x, y, id }) => {
            return this.spawn(x, y, id);
        });
    }

}
