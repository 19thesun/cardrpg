import { Rectangle } from "../objects/Rectangle.js";


const baseWidth = 150;
const baseHeight = 210;
const borderWeight = 6

export class Card extends Rectangle {

    constructor(x, y, data) {

        super(x, y, baseWidth, baseHeight);

        this.draggable = true;

        this.inSlot = false;

        this.name = data.name ?? "Unnamed Card";

        this.space = "world";

        this.color = data.color ?? {
            r: 0.2,
            g: 0.4,
            b: 0.8,
            a: 1
        };

        this.actions = data.actions ?? [];

        this.outline = new Rectangle(
            0,
            0,
            this.width,
            this.height
        );

        this.outline.color = {
            r: 1,
            g: 1,
            b: 1
        };

        this.outline.parent = this;
        this.children.push(this.outline);
    }

    updateChildren() {

        this.outline.x = this.x - borderWeight;
        this.outline.y = this.y - borderWeight;

        this.outline.width =
            this.width + borderWeight * 2;

        this.outline.height =
            this.height + borderWeight * 2;

    }

}