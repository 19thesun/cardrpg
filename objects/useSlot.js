import { Rectangle } from "./Rectangle.js";


export class UseSlot extends Rectangle {

    constructor(x, y) {

        super(x, y, 250, 350);

        this.draggable = false;

        this.space = "screen";

        this.card = null;

        this.color = {
            r: 0,
            g: 0,
            b: 0,
            a: 1
        };
    }


    accepts(card) {

        return true;

    }


    placeCard(card) {

        const oldCard = this.card

        this.card = card;

        card.scale = 1.67;
        card.inSlot = true;
        card.space = "screen";

        const width =
            card.width *
            card.scale *
            card.screenScale;

        const height =
            card.height *
            card.scale *
            card.screenScale;

        card.x =
            this.x +
            this.width * this.screenScale / 2 -
            width / 2;

        card.y =
            this.y +
            this.height * this.screenScale / 2 -
            height / 2;
        
        return oldCard;
        
    }


    clear() {
        if (!this.card) return;

        this.card.space = "world";
        this.card.scale = 1;
        this.card.inSlot = false;
        this.card = null;

    }

}