import { Rectangle } from "../objects/Rectangle.js";
import { Color } from "../engine/Color.js";
import { BehaviorFactory } from "./behaviors/BehaviorFactory.js";
import { getAverageImageColor } from "./imageColor.js";

const baseWidth = 150;
const baseHeight = 210;
const borderWeight = 3;

export class Card extends Rectangle {

    constructor(x, y, id, data) {

        super(x, y, baseWidth, baseHeight);

        this.timer = 0;

        this.draggable = true;

        this.hovered = false;

        this.inSlot = false;

        this.id = id;

        this.name = data.name ?? "Unnamed Card";

        this.space = "world";

        this.rank = data.rank ?? "";

        this.description = data.description ?? "";

        this.image = data.image ?? null;

        this.behavior = BehaviorFactory.create(data.behavior);

        this.color = data.color ?? new Color(
            0.86,
            0.78,
            0.62
        );

        // Card sections

        this.titleBar =
            new Rectangle(0, 0, 120, 18);

        this.rankBox =
            new Rectangle(0, 0, 24, 22);

        this.imageBox =
            new Rectangle(0, 0, 126, 105);

        this.descriptionBox =
            new Rectangle(0, 0, 126, 60);


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

        this.titleBar.localX = 12;
        this.titleBar.localY = 15;

        this.rankBox.localX = 114;
        this.rankBox.localY = 13;

        this.imageBox.localX = 12;
        this.imageBox.localY = 32;

        this.descriptionBox.localX = 12;
        this.descriptionBox.localY = 135;

        this.cornerRadius = 0.05

        this.outline.cornerRadius = 0.055

        this.titleBar.cornerRadius = 0.2;

        this.rankBox.cornerRadius = 0.1;

        this.imageBox.cornerRadius = 0.02;

        this.descriptionBox.cornerRadius = 0.04;

        // Colors

        this.titleBar.color =
            this.color.clone();

        this.rankBox.color =
            this.color.lighten(.1);

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
                x: 16,
                y: 17,
                size: 0.6,
                fontSize: 16,
                align: "left",
                anchor: "top-left"
            },

            {
                text: () => this.rank,
                x: 116,
                y: 13,
                size: 1,
                fontSize: 14,
                align: "left",
                anchor: "top-left"
            },

            {
                text: () => this.description,
                x: 14,
                y: 135,
                size: 1,
                fontSize: 12,
                bounds: {
                    width: 126,
                    height: 45
                },
                align: "left",
                anchor: "top-left"
            },

            {
                text: () => this.stackText ?? "",
                x: 110,
                y: this.height - 30,
                size: 1,
                fontSize: 30,
                align: "left",
                anchor: "top-left"
            }

        ];


        for (const child of this.children) {
            child.parent = this;
        }

                if (this.image) {

            getAverageImageColor(this.image)
            .then(color => {

                this.color = new Color(
                    color.r,
                    color.g,
                    color.b
                );                

                this.updateCardColors();

                this.geometryDirty = true;
                
            });

        }

    }

    updateCardColors() {

        // Light tint, but more visible card color
        this.titleBar.color =
            this.color.clone().lighten(0.55);

        this.rankBox.color =
            this.color.clone().lighten(0.6);

        this.imageBox.color =
            this.color.clone().lighten(0.3);

        this.descriptionBox.color =
            this.color.clone().lighten(0.6);


        for (const child of this.children) {
            child.geometryDirty = true;
            child.colorDirty = true;
        }

    }

    clone() {

        const clone = new Card(
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


        clone.zIndex = this.zIndex;
        clone.space = this.space;
        clone.cornerRadius = this.cornerRadius;

        return clone;

    }

    setTransform(x, y, scale) {

        this.x = x;
        this.y = y;
        this.scale = scale;

    }

}