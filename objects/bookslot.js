import { Rectangle } from "./Rectangle.js";

export class BookSlot extends Rectangle {

    constructor(x, y, width, height) {

        super(x, y, width, height);

        this.space = "screen";

        this.draggable = false;

        this.card = null;

        this.amount = 0;

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

        if (this.card) {

            if (this.card.id === card.id) {

                this.amount++;

                this.updateCardPosition();

                return "stacked";
            }

        }


        this.card = card;
        this.amount = 1;

        card.inBook = true;
        card.space = "screen";

        this.visible = false;

        this.updateCardPosition();

        return null;

    }

    removeCard() {

        if (!this.card)
            return null;


        this.amount--;
        if (this.amount == 0){
            this.visible = true;
        }
        
        this.updateCardPosition();
        const card = this.card;


        if (this.amount <= 0) {

            this.card = null;
            this.amount = 0;

            return card;

        }
        else {

            const newCard = card.clone();

            newCard.stackText = null;

            return newCard;

        }

    }

    updateCardPosition() {

        if (!this.card) return;


        if (this.amount > 1) {
            this.card.stackText = "x" + this.amount;
        }
        else {
            this.card.stackText = null;
        }

        const scale =
            window.innerWidth / 1440;


        const card = this.card;


        // Scale card to fit inside slot height
        const cardScale =
            (this.height * scale) /
            (card.height * scale);


        card.scale = cardScale;


        const width =
            card.width *
            card.scale *
            scale;

        const height =
            card.height *
            card.scale *
            scale;


        card.x =
            this.x +
            (this.width * scale - width) / 2;


        card.y =
            this.y +
            (this.height * scale - height) / 2;

    }

    clear() {

        if (!this.card) {
            return;
        }

        this.visible = true;

        this.card.space = "world";
        this.card.scale = 1;
        this.card.inSlot = false;

        this.card = null;

    }

}