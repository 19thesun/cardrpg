import { Rectangle } from "../objects/Rectangle.js";
import { Color } from "../engine/Color.js";

const baseWidth = 150;
const baseHeight = 210;
const borderWeight = 3;

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

        this.color = data.color ?? new Color(
            0.86,
            0.78,
            0.62
        );


        // Card sections

        this.titleBar = 
            new Rectangle(0, 0, 134, 18);

        this.rankBox = 
            new Rectangle(0,0,24,18);

        this.imageBox =
            new Rectangle(0, 0, 134, 105);

        this.descriptionBox =
            new Rectangle(0, 0, 134, 60);


        this.actions = data.actions ?? [];


        // Outline

        this.outline = new Rectangle(
            -borderWeight,
            -borderWeight,
            this.width + borderWeight * 2,
            this.height + borderWeight * 2
        );

        this.outline.localX = -borderWeight;
        this.outline.localY = -borderWeight;


        // Position boxes

        this.titleBar.localX = 8;
        this.titleBar.localY = 8;

        this.rankBox.localX = 118;
        this.rankBox.localY = 8;

        this.imageBox.localX = 8;
        this.imageBox.localY = 32;

        this.descriptionBox.localX = 8;
        this.descriptionBox.localY = 142;


        // Colors

        this.titleBar.color =
            new Color(.95, .9, .8);

        this.rankBox.color =
            this.titleBar.color.clone();

        this.imageBox.color =
            this.color.lighten(.2);

        this.descriptionBox.color =
            this.color.darken(.15);


        this.outline.color =
            new Color(1, 1, 1);


        this.outline.visible = false;
        this.outline.isOutline = true;


        // Render ordering

        this.preChildren.push(
            this.outline
        );


        this.children.push(
            this.titleBar,
            this.rankBox,
            this.imageBox,
            this.descriptionBox
        );


        // Text

        this.textElements = [

            {
                text: () => this.name,
                x: 12,
                y: 10,
                size: 0.6,
                fontSize: 16,
                align: "left",
                anchor: "top-left"
            },

            {
                text: () => this.rank,
                x: 120,
                y: 6,
                size: 1,
                fontSize: 14,
                align: "left",
                anchor: "top-left"
            },

            {
                text: () => this.description,
                x: 10,
                y: 143,
                size: 1,
                fontSize: 12,
                bounds: {
                    width: 134,
                    height: 45
                },
                align: "left",
                anchor: "top-left"
            },

            {
                text: () => this.stackText ?? "",
                x: 130,
                y: -20,
                size: 1,
                fontSize: 30,
                align: "left",
                anchor: "top-left"
            }

        ];


        for (const child of this.children) {
            child.parent = this;
        }

    }


    clone() {

        return new Card(
            this.x,
            this.y,
            this.id,
            {
                name: this.name,
                rank: this.rank,
                description: this.description,
                image: this.image,
                color: this.color,
                actions: this.actions
            }
        );

    }

    setTransform(x, y, scale) {

        this.x = x;
        this.y = y;
        this.scale = scale;

    }

}