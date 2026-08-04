import { Rectangle } from "../objects/Rectangle.js";


const baseWidth = 150;
const baseHeight = 210;
const borderWeight = 6

export class Card extends Rectangle {

    constructor(x, y, id, data) {

        super(x, y, baseWidth, baseHeight);

        this.draggable = true;

        this.hovered = false;

        this.inSlot = false;

        this.id = id;

        this.name = data.name ?? "Unnamed Card";

        this.space = "world";

        this.rank = data.rank ?? "";

        this.description = data.description ?? "";

        this.image = data.image ?? null;

        this.color = data.color ?? {
            r: 0.2,
            g: 0.4,
            b: 0.8,
            a: 1
        };

        this.titleBar = new Rectangle(0, 0, 58, 24);
        this.numberBox = new Rectangle(0, 0, 32, 24);
        this.rankBox = new Rectangle(0, 0, 30, 24);
        this.imageBox = new Rectangle(0, 0, 134, 92);
        this.descriptionBox = new Rectangle(0, 0, 134, 50);

        this.actions = data.actions ?? [];

        this.outline = new Rectangle(
            -borderWeight,
            -borderWeight,
            this.width + borderWeight * 2,
            this.height + borderWeight * 2
        );

        this.outline.localX = -borderWeight;
        this.outline.localY = -borderWeight;

        this.numberBox.localX = 8;
        this.numberBox.localY = 8;

        this.titleBar.localX = 46;
        this.titleBar.localY = 8;

        this.rankBox.localX = 112;
        this.rankBox.localY = 8;

        this.imageBox.localX = 8;
        this.imageBox.localY = 42;

        this.descriptionBox.localX = 8;
        this.descriptionBox.localY = 150;

        this.titleBar.color = { r: .9, g: .9, b: .9 };
        this.numberBox.color = { r: .9, g: .9, b: .9 };
        this.rankBox.color = { r: .9, g: .9, b: .9 };

        this.imageBox.color = { r: .8, g: .8, b: .8 };

        this.descriptionBox.color = {
            r: this.color.r * .9,
            g: this.color.g * .9,
            b: this.color.b * .9
        };

        this.outline.color = {
            r: 1,
            g: 1,
            b: 1
        };

                this.children.push(
            this.outline,
            this.numberBox,
            this.titleBar,
            this.rankBox,
            this.imageBox,
            this.descriptionBox
        );

        // Ensure border is rendered first (at index 0)
        this.children.sort((a, b) => (a === this.outline ? -1 : 1));

        for (const child of this.children) {
            child.parent = this;
        }
    }

    setTransform(x, y, scale) {

        this.x = x;
        this.y = y;
        this.scale = scale;

    }

}