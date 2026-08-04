export class Color {

    constructor(r, g, b, a = 1) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }


    lighten(amount) {

        return new Color(
            Math.min(this.r + amount, 1),
            Math.min(this.g + amount, 1),
            Math.min(this.b + amount, 1),
            this.a
        );

    }


    darken(amount) {

        return new Color(
            Math.max(this.r - amount, 0),
            Math.max(this.g - amount, 0),
            Math.max(this.b - amount, 0),
            this.a
        );

    }


    multiply(amount) {

        return new Color(
            Math.min(this.r * amount, 1),
            Math.min(this.g * amount, 1),
            Math.min(this.b * amount, 1),
            this.a
        );

    }


    clone() {
        return new Color(
            this.r,
            this.g,
            this.b,
            this.a
        );
    }

}