import { Rectangle } from "../objects/Rectangle.js";
import { Color } from "../engine/Color.js";

const baseWidth = 150;
const baseHeight = 210;
const borderWeight = 3

export class Card extends Rectangle {

    constructor(x, y, id, data) {

        super(x, y, baseWidth, baseHeight);

        this.draggable = true;

        this.hovered = false;

        this.inSlot = false;

        this.id = id;

        this.cardNumber = data.cardNumber ?? 0;

        this.name = data.name ?? "Unnamed Card";

        this.space = "world";

        this.rank = data.rank ?? "";

        this.description = data.description ?? "";

        this.image = data.image ?? null;

        this.color = data.color ?? new Color(
            0.86,
            0.78,
            0.62
        );

        this.titleBar = new Rectangle(0,0,60,24);
        this.numberBox = new Rectangle(0,0,32,24);
        this.rankBox = new Rectangle(0,0,32,24);

        this.imageBox = new Rectangle(0,0,134,90);

        this.descriptionBox = new Rectangle(0,0,134,55);

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

        this.titleBar.color =
            new Color(.95,.9,.8);

        this.numberBox.color =
            this.titleBar.color.clone();

        this.rankBox.color =
            this.titleBar.color.clone();


        this.imageBox.color =
            this.color.lighten(.2);


        this.descriptionBox.color =
            this.color.darken(.15);


        this.outline.color =
            new Color(1,1,1);

        this.outline.visible = false;
        this.outline.isOutline = true;

        this.preChildren.push(
            this.outline,
        )

        this.children.push(
            this.numberBox,
            this.titleBar,
            this.rankBox,
            this.imageBox,
            this.descriptionBox
        );

        this.textElements = [
            {
                text: () => String(this.cardNumber).padStart(3, "0"),
                x: 24,
                y: 20,
                size: 0.7,
                fontSize: 18
            },
            {
                text: () => this.name,
                x: 75,
                y: 20,
                size: 0.6,
                fontSize: 18
            },
            {
                text: () => this.rank,
                x: 127,
                y: 20,
                size: 0.7,
                fontSize: 18
            },
            {
                text: () => this.description,
                x: 75,
                y: 175,
                size: 1,
                fontSize: 26,
                bounds: {
                    width: 120,
                    height: 45
                },
                align: "left"
            }
        ];

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