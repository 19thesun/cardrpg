import { Rectangle } from "./Rectangle.js";

export class BookSlot extends Rectangle {

    constructor(x, y, width, height) {

        super(x, y, width, height);

        this.space = "screen";

        this.draggable = false;

        this.card = null;

        this.amount = 0;

        this.color = {
            r: 0.2,
            g: 0.2,
            b: 0.2,
            a: 1
        };

    }


    accepts(card) {

        return true;

    }


    placeCard(card) {
        if (card.stackOwner === this) {

            this.amount++;

            card.stackOwner = null;

            this.updateCardPosition();

            return "stacked";
        }


        // Card came from a stack
        if (card.stackOwner) {

            const oldSlot = card.stackOwner;

            if (this.card && this.card.id === card.id) {

                // Merge stacks
                this.amount += oldSlot.amount;

                oldSlot.amount = 0;
                oldSlot.card = null;
                oldSlot.visible = true;

                card.stackOwner = null;

                this.updateCardPosition();
                return "merged";
            }


            // Moving entire stack to empty slot
            this.card = card;
            this.amount = oldSlot.amount;

            oldSlot.amount = 0;
            oldSlot.card = null;
            oldSlot.visible = true;

            card.stackOwner = null;

            this.visible = false;
            this.updateCardPosition();

            return null;
        }


        // Normal single card placement
        if (this.card) {

            if (this.card.id === card.id) {

                this.amount++;

                card.stackOwner = null;

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
            console.log(newCard);

            newCard.stackText = null;
            newCard.stackOwner = this;
            return newCard;

        }

    }

    clearStack() {

        this.card = null;
        this.amount = 0;
        this.visible = true;

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