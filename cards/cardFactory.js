import { Card } from "./Card.js";
import { getCardData } from "./cardDatabase.js";


export function createCardById(x, y, id) {

    const data = getCardData(id);

    if (!data) {
        throw new Error(
            `Unknown card: ${id}`
        );
    }


    const card = new Card(x, y, data);

    card.id = id;


    return card;

}