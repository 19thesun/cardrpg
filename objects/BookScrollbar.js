import { Rectangle } from "./Rectangle.js";

export class BookScrollbar extends Rectangle {

    constructor(x, y, width, height, book) {

        super(x, y, width, height);

        this.book = book;

        this.space = "screen";

        this.draggable = false;

        this.color = {
            r: 0.3,
            g: 0.3,
            b: 0.3,
            a: 1
        };


        this.thumbHeight = 50;

        this.dragging = false;

        this.dragOffset = 0;

    this.thumb = new Rectangle(
        x,
        y,
        width,
        this.thumbHeight
    );

    this.thumb.space = "screen";

    this.thumb.color = {
        r: 0.8,
        g: 0.8,
        b: 0.8,
        a: 1
    };
    }


    update() {

        const s = this.book.layoutScale;

        const totalHeight =
            Math.ceil(
                this.book.slots.length / this.book.columns
            ) *
            (
                (this.book.slotHeight + this.book.verticalPadding) * s
            );


        const visibleRatio =
            (this.book.height * s) / totalHeight;


        this.thumbHeight =
            Math.max(
                30,
                this.height * visibleRatio
            );


        const scrollRatio =
            this.book.scrollOffset /
            Math.max(
                1,
                totalHeight - this.book.height
            );


        this.thumbY =
            this.y +
            scrollRatio *
            (
                this.height -
                this.thumbHeight
            );


        this.thumb.x = this.x;
        this.thumb.y = this.thumbY;
        this.thumb.width = this.width;
        this.thumb.height = this.thumbHeight;

    }


    containsThumb(x,y) {

        return (
            x >= this.x &&
            x <= this.x + this.width &&
            y >= this.thumbY &&
            y <= this.thumbY + this.thumbHeight
        );

    }

    startDrag(mouseY) {

        this.dragging = true;

        this.dragOffset =
            mouseY - this.thumbY;

    }

    drag(y) {

        const trackRange =
            this.height -
            this.thumbHeight;


        let thumbY =
            y - this.dragOffset;


        let percent =
            (thumbY - this.y)
            /
            trackRange;


        percent =
            Math.max(
                0,
                Math.min(
                    1,
                    percent
                )
            );


        const s = this.book.layoutScale;

        const totalHeight =
            Math.ceil(
                this.book.slots.length /
                this.book.columns
            ) *
            (
                (this.book.slotHeight + this.book.verticalPadding) * s
            );


        this.book.scrollOffset =
            percent *
            (
                totalHeight -
                this.book.height
            );


        this.book.updateSlots();

    }

}