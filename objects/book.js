import { BookSlot } from "./Bookslot.js";
import { BookScrollbar } from "./BookScrollbar.js";

export class Book {

    constructor(x, y, width, height) {

        this.x = x;
        this.y = y;

        this.width = width;
        this.height = height;

        this.space = "screen";

        this.visible = false;

        this.columns = 3;
        this.rows = 20;

        this.slotWidth = 135;
        this.slotHeight = 180;

        this.topPadding = 30;

        this.layoutScale = 1;

        this.horizontalPadding = 10;
        this.verticalPadding = 15;

        this.scrollOffset = 0;

        this.scrollSpeed = 40;

        this.viewportHeight = height;

        this.scrollbarWidth = 12;
        this.scrollbarHeight = 100;

        this.scrollbarDragging = false;

        this.scrollbar =
            new BookScrollbar(
                this.x + this.width - 20,
                this.y + 100,
                15,
                this.height - 120,
                this
            );

        this.slots = [];

        this.preChildren = [];
        this.postChildren = [];


        for (
            let i = 0;
            i < this.columns * this.rows;
            i++
        ) {

            const slot = new BookSlot(
                0,
                0,
                this.slotWidth,
                this.slotHeight
            );

            slot.space = "screen";
            slot.visible = true;

            this.slots.push(slot);

            this.postChildren.push(slot);

        }


        this.updateSlots();

    }


    containsPoint(x, y) {

        return (
            x >= this.x &&
            x <= this.x + this.width &&

            y >= this.y &&
            y <= this.y + this.height
        );

    }

    updateSlots() {

        const s = this.layoutScale;

        this.scrollbar.x =
            this.x + this.width - (10 * s);

        this.scrollbar.y =
            this.y + (100 * s);

        this.scrollbar.width =
            12 * s;

        this.scrollbar.height =
            this.height - (120 * s);

        this.scrollbar.update();

        for (let i = 0; i < this.slots.length; i++) {

            const column = i % this.columns;
            const row = Math.floor(i / this.columns);

            const slot = this.slots[i];


            slot.x =
                this.x +
                this.horizontalPadding * s +
                column *
                (
                    this.slotWidth * s +
                    this.horizontalPadding * s
                );


            slot.y =
                this.y +
                this.topPadding * s +
                row *
                (
                    this.slotHeight * s +
                    this.verticalPadding * s
                )
                -
                this.scrollOffset;
            
            // Hide cards that are outside the book viewport
            slot.visible =
                !slot.card &&
                slot.y + slot.height > this.y &&
                slot.y < this.y + this.height;

            slot.updateCardPosition();

            if (slot.card) {

                const cardBounds = slot.card.getBounds();

                slot.card.visible =
                    cardBounds.y + cardBounds.height > this.y &&
                    cardBounds.y < this.y + this.height;

            }
        }

    }

    getSlotAt(mouseX, mouseY) {

        for (const slot of this.slots) {

            if (slot.containsPoint(mouseX, mouseY)) {
                return slot;
            }

        }

        return null;

    }

    placeCard(slot, card) {

        const oldCard = slot.card;

        slot.card = card;

        card.inSlot = true;
        card.space = "screen";
        card.scale = this.scale * 0.8;


        card.x =
            slot.x +
            slot.width / 2 -
            (card.width * card.scale) / 2;


        card.y =
            slot.y +
            slot.height / 2 -
            (card.height * card.scale) / 2;


        return oldCard;

    }

    removeCard(slot) {

        const card = slot.card;

        if (!card)
            return null;


        slot.card = null;

        card.inSlot = false;

        return card;

    }

    scroll(amount) {

        this.scrollOffset =
            Math.max(
                0,
                Math.min(
                    this.getMaxScroll(),
                    this.scrollOffset + amount
                )
            );


        this.updateSlots();

    }

    getMaxScroll() {

        const s = this.layoutScale;

        const totalHeight =
            Math.ceil(this.slots.length / this.columns) *
            (
                (this.slotHeight + this.verticalPadding) * s
            );


        return Math.max(
            0,
            totalHeight - this.viewportHeight
        );

    }

    addToScene(scene) {

        scene.add(this.scrollbar);
        scene.add(this.scrollbar.thumb);
        this.updateSlots();

        for (const slot of this.slots) {

            if (!scene.shapes.includes(slot)) {
                scene.add(slot);
            }
            if (
                slot.card &&
                !scene.shapes.includes(slot.card)
            ) {
                scene.add(slot.card);
            }

        }

    }


    removeFromScene(scene) {

        for (const slot of this.slots) {

            scene.remove(slot);

        }

    }

}