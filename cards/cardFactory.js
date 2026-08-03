import { Card } from "./Card.js";
import { getCardData } from "./data/index.js";


export function createCardById(x, y, id) {

    const data = getCardData(id);


    if (!data) {
        throw new Error(
            `Unknown card: ${id}`
        );
    }


    const card =
        new Card(
            x,
            y,
            id,
            data
        );

    console.log(card.name, card.actions);
    return card;

}