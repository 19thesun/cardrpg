import { Card } from "./card.js";
import { getCardData } from "./data/index.js";


export function createCardById(x, y, id) {

    const data = getCardData(id);


    if (!data) {
        throw new Error(
            `Unknown card: ${id}`
        );
    }


    return new Card(
        x,
        y,
        id,
        data
    );

}